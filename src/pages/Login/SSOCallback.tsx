import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, User } from "../../contexts/AuthContext";
import { jwtDecode } from "jwt-decode";
import { UserPayLoad } from "../../contexts/AppContext/utils";

const SSOCallback: React.FC = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Assuming the SSO provider redirects back with a token in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("accessToken");
        const refreshToken = urlParams.get("refreshToken");
        if (token && refreshToken) {
          const decodedToken = jwtDecode<UserPayLoad>(token);
          const user2: User = {
            upn: decodedToken.UPN || decodedToken.upn || "",
            gender: decodedToken.gender ?? undefined,
            firstName: decodedToken.FirstName || decodedToken.given_name,
            lastName: decodedToken.LastName || decodedToken.family_name,
            displayName: decodedToken.name,
          };

          login(user2, token, refreshToken);
        } else {
          console.error("No token found in URL");
        }
      } catch (error) {
        console.error("Error in SSO callback:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      const lastVisitedPath: any = localStorage.getItem("lastVisitedPath");
      if (lastVisitedPath) {
        navigate(lastVisitedPath);
      } else {
        navigate("/");
      }
    }
  }, [user]);

  return <div>Loading...</div>;
};

export default SSOCallback;
