import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { triggerSSORedirect } from "../../utils/auth";

/**
 * ProtectedRoute: Ensures a user is authenticated before rendering nested routes.
 * If no user is in context, redirects directly to the SSO flow.
 */
const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      triggerSSORedirect();
    }
  }, [user, loading]);

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return null;
  }

  return <Outlet />;
};

export default ProtectedRoute;


