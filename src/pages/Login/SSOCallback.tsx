import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { loginWithCode } from "../../api/authApi";
import apiClient from "../../api/config";

export const SSOComeback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
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
      .then(() => apiClient.get<{ userId: number }>("/users/me/type"))
      .then(() => {
        login({ user: {} });
        const lastVisitedPath = localStorage.getItem("lastVisitedPath");
        navigate(lastVisitedPath ?? "/", { replace: true });
      })
      .catch(() => {
        navigate("/error", { replace: true });
      });
  }, [location.search]);

  return null;
};
