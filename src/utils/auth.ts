const getKeycloakUrl = (): string =>
  (window as any).RUNTIME_ENV?.REACT_APP_KEYCLOAK_URL ??
  process.env.REACT_APP_KEYCLOAK_URL ??
  "";

export const buildKeycloakRedirectUrl = (): string => {
  const baseUrl = getKeycloakUrl();
  const redirectUri = encodeURIComponent(`${window.location.origin}/comeback`);
  return `${baseUrl}&redirect_uri=${redirectUri}`;
};

export const triggerSSORedirect = () => {
  const currentPath = window.location.pathname + window.location.search;

  // Don't save the callback path or error page as the destination
  if (!window.location.pathname.startsWith("/comeback") && !window.location.pathname.startsWith("/error")) {
    const existingPath = sessionStorage.getItem("formula-last-visited-path");

    // Only save if no path exists, or if current path is NOT just root
    // This prevents overwriting a deep link (like /form/123) with '/'
    // if triggerSSORedirect is called twice during initialization.
    if (!existingPath || currentPath !== "/") {
      sessionStorage.setItem("formula-last-visited-path", currentPath);
    }
  }
  
  const keycloakUrl = getKeycloakUrl();
  if (!keycloakUrl) {
    console.error("REACT_APP_KEYCLOAK_URL is not set");
    window.location.href = "/error";
    return;
  }
  
  window.location.href = buildKeycloakRedirectUrl();
};

export const logoutAction = () => {
  localStorage.removeItem("formula-user");
  if (!window.location.pathname.includes("/comeback")) {
    triggerSSORedirect();
  }
};
