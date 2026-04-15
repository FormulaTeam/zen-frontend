import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { loginWithCode } from "../../api/authApi";
import apiClient from "../../api/config";

export const SSOComeback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (user) {
      const lastVisitedPath = localStorage.getItem("lastVisitedPath");
      navigate(lastVisitedPath ?? "/", { replace: true });
      return;
    }

    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");

    if (!code) {
      navigate("/error", { replace: true });
      return;
    }

    const redirectUri = `${window.location.origin}/comeback`;

    loginWithCode(code, redirectUri)
      .then(() =>
        Promise.all([
          apiClient.get<{ userId: number }>("/users/me/type").catch(() => ({ data: { userId: 0 } })),
          apiClient.get<{ name: string; upn: string }>("/users/me/personal").catch(() => ({ data: { name: "משתמש", upn: "unknown" } })),
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
        
        login({ user: userData });
        const lastVisitedPath = localStorage.getItem("lastVisitedPath");
        navigate(lastVisitedPath ?? "/", { replace: true });
      })
      .catch((err) => {
        console.error("Login failed:", err);
        navigate("/error", { replace: true });
      });
  }, [location.search, loading, user, navigate, login]);

  return null;
};

