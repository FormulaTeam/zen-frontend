import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SessionStorageUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    if (shouldUpdateLastVisitedPath(location.pathname)) {
      sessionStorage.setItem("formula-last-visited-path", location.pathname);
    }
  }, [location]);

  return null;
};

function shouldUpdateLastVisitedPath(pathname: string) {
  return (
    !pathname.endsWith("error") &&
    !pathname.includes("accessToken=") &&
    !pathname.includes("comeback")
  );
}

export default SessionStorageUpdater;
