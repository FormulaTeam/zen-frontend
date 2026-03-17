import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { IPath } from "../../types/enums/global.enums";

/**
 * ProtectedRoute: Ensures a user is authenticated before rendering nested routes.
 * If no user is in context, redirects to /login so the user can initiate the Keycloak flow.
 */
const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      localStorage.setItem("lastVisitedPath", window.location.pathname);
      navigate(IPath.LOGIN, { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return null;
  }

  return <Outlet />;
};

export default ProtectedRoute;


