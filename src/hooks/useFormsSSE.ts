import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Form } from "../utils/interfaces";

interface FormEventPayload {
  type: "form-created" | "form-updated" | "form-deleted" | string;
  formId?: string;
  form?: Form;
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
      const es = new EventSource(url, { withCredentials: true });
      esRef.current = es;

      es.onopen = () => {
        backoffRef.current = 1000;
      };

      es.onmessage = (ev) => {
        try {
          const data: FormEventPayload = JSON.parse(ev.data);

          if (data.affectedUsers && !data.affectedUsers.includes(currentUserUpn)) return;

          queryClient.setQueryData(["forms"], (old: any) => {
            if (!Array.isArray(old)) return old ?? [];

            switch (data.type) {
              case "form-created":
                if (!data.form) return old;
                return [data.form, ...old.filter((f) => f.id !== data.form?.id)];

              case "form-updated":
                if (!data.form) return old;
                return old.map((f) => (f.id === data.form!.id ? data.form! : f));

              case "form-deleted":
                if (!data.formId) return old;
                return old.filter((f) => f.id !== data.formId);

              case "form-restored":
                if (!data.form) return old;
                return [data.form, ...old.filter((f) => f.id !== data.form?.id)];

              case "form-shared":
                if (!data.form) return old;
                return old.map((f) => (f.id === data.form!.id ? data.form! : f));

              default:
                return old;
            }
          });
        } catch (err) {
          console.error("❌ SSE parse error:", err);
        }
      };

      es.onerror = (err) => {
        console.error("SSE error", err);
        if (closedByMeRef.current) return;

        if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
        const backoff = Math.min(backoffRef.current * 1.5, 30_000);
        backoffRef.current = backoff;
        reconnectTimerRef.current = window.setTimeout(() => {
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
      esRef.current?.close?.();
    };
  }, [currentUserUpn, queryClient]);
}
