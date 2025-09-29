import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "@mui/material/styles";
import { loginSSO, useGetLoginSSOUrl } from "../../api";
import { IPath } from "../../types/enums/global.enums";

/**
 * Full-screen loading fallback with message and spinner.
 */
const LoadingScreen: React.FC<{ message: string }> = ({ message }) => {
  const theme = useTheme();
  return (
    <div className="main-page-loading">
      <label>{message}</label>
      <ReactLoading type="spinningBubbles" color={theme.palette.primary.main} />
    </div>
  );
};

/**
 * ProtectedRoute: Ensures a user is authenticated before rendering nested routes.
 */
const ProtectedRoute: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    data: ssoAuthUrl,
    isLoading: getLoginSSOUrlLoading,
    isSuccess: getLoginSSOUrlSuccess,
    error: getLoginSSOUrlError,
  } = useGetLoginSSOUrl({});

  useEffect(() => {
    if (user && getLoginSSOUrlSuccess) {
      console.log("User is authenticated:", user);
      return;
    }
    if (!user && getLoginSSOUrlSuccess) {
      console.log("User not authenticated, redirecting to SSO:", ssoAuthUrl);
      window.location.href = ssoAuthUrl;
      return;
    }
    if (getLoginSSOUrlError) {
      console.error("Failed to get SSO URL:", getLoginSSOUrlError);
      navigate(IPath.ERROR);
    }
  }, [user, getLoginSSOUrlSuccess]);

  if (getLoginSSOUrlLoading) return <LoadingScreen message="מאמת את המשתמש..." />;
  if (user) return <Outlet />;

  // While redirecting to SSO, show a loading state
  return <LoadingScreen message="מתחבר למערכת..." />;
};

export default ProtectedRoute;
