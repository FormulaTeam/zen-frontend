import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { loginWithCode } from "../../api/authApi";
import apiClient from "../../api/config";

export const SSOComeback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();
  const didRunRef = useRef(false);

  useEffect(() => {
    if (loading || didRunRef.current) {
      return;
    }

    // Immediately handle already authenticated users
    if (user) {
      const lastVisitedPath = sessionStorage.getItem("lastVisitedPath");
      sessionStorage.removeItem("lastVisitedPath");
      navigate(lastVisitedPath ?? "/", { replace: true });
      return;
    }

    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");

    if (!code) {
      navigate("/error", { replace: true });
      return;
    }

    // Mark as running to prevent double processing in React 18 strict mode
    didRunRef.current = true;

    const redirectUri = `${window.location.origin}/comeback`;
    const lastPath = sessionStorage.getItem("lastVisitedPath") ?? "/";

    loginWithCode(code, redirectUri)
      .then(() =>
        Promise.all([
          apiClient.get<{ userId: number }>("/users/me/type").catch(() => ({ data: { userId: 0 } })),
          apiClient
            .get<{ name: string; upn: string }>("/users/me/personal")
            .catch(() => ({ data: { name: "משתמש", upn: "unknown" } })),
        ]),
      )
      .then(([typeRes, personalRes]) => {
        const name = personalRes.data?.name || "משתמש";
        const upn = personalRes.data?.upn || "unknown";

        const userData = {
          displayName: name,
          upn: upn,
          firstName: name.split(" ")[0] || "",
          lastName: name.split(" ").slice(1).join(" ") || "",
        };

        // Clear storage before triggering state updates that might cause re-renders
        sessionStorage.removeItem("lastVisitedPath");

        login({ user: userData });
        navigate(lastPath, { replace: true });
      })
      .catch((err) => {
        console.error("Login failed:", err);
        navigate("/error", { replace: true });
      });
  }, [location.search, loading, user, navigate, login]);

  return null;
};
