import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { IPath } from "../../types/enums/global.enums";

/**
 * ProtectedRoute: Ensures a user is authenticated before rendering nested routes.
 * If no user is in context, redirects to /login so the user can initiate the Keycloak flow.
 */
const ProtectedRoute: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      localStorage.setItem("lastVisitedPath", window.location.pathname);
      navigate(IPath.LOGIN, { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return <Outlet />;
};

export default ProtectedRoute;

