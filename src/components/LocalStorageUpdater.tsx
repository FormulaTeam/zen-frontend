import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const LocalStorageUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    if (shouldUpdateLastVisitedPath(location.pathname)) {
      localStorage.setItem("lastVisitedPath", location.pathname);
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

export default LocalStorageUpdater;
