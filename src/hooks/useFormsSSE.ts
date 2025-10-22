import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface FormEventPayload {
  type: "form-created" | "form-updated" | "form-deleted" | string;
  formId?: string;
  form?: string; // the full form object on create/update
  affectedUsers?: string[];
}

export function useFormsSSE(currentUserUpn: string) {
  const queryClient = useQueryClient();
  const esRef = useRef<EventSource | null>(null);
  const backoffRef = useRef(1000);
  const reconnectTimerRef = useRef<number | null>(null);
  const closedByMeRef = useRef(false);

  useEffect(() => {
    if (!currentUserUpn) return;

    const backendUrl = "http://localhost:3000";
    const url = `${backendUrl}/api/forms/stream`;

    const connect = () => {
      closedByMeRef.current = false;
      // remove withCredentials if you're not using cookies
      const es = new EventSource(url, { withCredentials: true });
      esRef.current = es;

      es.onopen = () => {
        // reset backoff on successful connect
        backoffRef.current = 1000;
        console.log("SSE connected");
      };

      es.onmessage = (ev) => {
        try {
          const data: FormEventPayload = JSON.parse(ev.data);
          console.log("SSE:", data);

          // If the event isn't relevant to this user -> ignore
          if (data.affectedUsers && !data.affectedUsers.includes(currentUserUpn)) {
            return;
          }

          // Targeted cache update: prefer setQueryData to avoid full refetch
          if (data.type === "form-created" && data.form) {
            queryClient.setQueryData(["forms"], (old: any) => {
              if (!old) return [data.form];
              // assuming old is an array - adapt to your data shape
              return [data.form, ...old];
            });
            return;
          }

          if (data.type === "form-deleted" && data.formId) {
            queryClient.invalidateQueries({ queryKey: ["forms"] });
            queryClient.setQueryData(["forms"], (old: any) => {
              if (!Array.isArray(old)) return old;
              return old.filter((f) => f.id !== data.formId);
            });
            return;
          }

          // fallback: invalidate the query if we can't handle it locally
          queryClient.invalidateQueries({ queryKey: ["forms"] });
        } catch (err) {
          console.error("SSE parse error", err);
        }
      };

      es.onerror = (err) => {
        console.error("SSE error", err);
        // If closed intentionally, don't try to reconnect
        if (closedByMeRef.current) return;

        // Exponential backoff reconnect
        if (reconnectTimerRef.current) {
          window.clearTimeout(reconnectTimerRef.current);
        }
        const backoff = Math.min(backoffRef.current * 1.5, 30_000);
        backoffRef.current = backoff;
        reconnectTimerRef.current = window.setTimeout(() => {
          // close existing connection if any
          try {
            es.close();
          } catch {}
          connect();
        }, backoff);
      };
    };

    connect();

    return () => {
      closedByMeRef.current = true;
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
      if (esRef.current) {
        try {
          esRef.current.close();
        } catch {}
      }
    };
  }, [currentUserUpn, queryClient]);
}
