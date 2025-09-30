import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth, User } from "../../contexts/AuthContext";
import { UserPayLoad } from "../../contexts/AppContext/utils";

export const SSOCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    const handleTokensFromUrl = () => {
      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get("accessToken");
      const refreshToken = urlParams.get("refreshToken");

      if (token && refreshToken) {
        console.log("[TOKEN HANDLER] Tokens found in URL:", {
          accessToken: `Found (length: ${token.length})`,
          refreshToken: `Found (length: ${refreshToken.length})`,
          currentPath: location.pathname,
        });

        try {
          const decodedToken = jwtDecode<UserPayLoad>(token);
          const decodedRefreshToken = jwtDecode<UserPayLoad>(refreshToken);
          console.log("[TOKEN HANDLER] Decoded token:", decodedToken);
          console.log("[TOKEN HANDLER] Decoded refresh token:", decodedRefreshToken);

          const userObj: User = {
            upn: decodedToken.UPN || decodedToken.upn || decodedToken.email || "",
            gender: decodedToken.gender ?? undefined,
            firstName: decodedToken.FirstName || decodedToken.given_name,
            lastName: decodedToken.LastName || decodedToken.family_name,
            displayName: decodedToken.name,
          };

          console.log("[TOKEN HANDLER] Created user object:", userObj);
          login({ user: userObj });

          const cleanUrl = window.location.pathname;
          console.log("[TOKEN HANDLER] Cleaning URL and redirecting to:", cleanUrl);

          navigate(cleanUrl, { replace: true });
        } catch (error) {
          console.error("[TOKEN HANDLER] Error processing tokens:", error);
        }
      }
    };
    if (!user && location.search.includes("accessToken")) {
      handleTokensFromUrl();
    }
  }, [location.search, login, user]);

  useEffect(() => {
    if (user) {
      const lastVisitedPath = localStorage.getItem("lastVisitedPath");
      if (lastVisitedPath) {
        navigate(lastVisitedPath);
      } else {
        navigate("/");
      }
    }
  }, [user]);

  return null; // This component doesn't render anything
};
