import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "@mui/material/styles";
import { loginSSO } from "../../api";
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
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const loginUser = async () => {
    console.log("Checking user authentication status...");
    // If user is not authenticated, redirect to SSO login
    console.log("Current user:", user);
    if (!user) {
      try {
        const authUrl = await loginSSO();
        console.log("Redirecting to SSO login:", authUrl);
        window.location.href = authUrl;
      } catch (error) {
        console.error("Login redirect failed", error);
        navigate(IPath.ERROR);
      }
    }
  };

  useEffect(() => {
    if (!user && !loading) {
      loginUser();
    }
  }, [user, loading, loginUser]);

  if (loading) return <LoadingScreen message="מאמת את המשתמש..." />;
  if (user) return <Outlet />;

  // While redirecting to SSO, show a loading state
  return <LoadingScreen message="מתחבר למערכת..." />;
};

export default ProtectedRoute;
