import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Box, Typography } from "@mui/material";
import "./Login.scss";

const getKeycloakUrl = (): string =>
  (window as any).RUNTIME_ENV?.REACT_APP_KEYCLOAK_URL ??
  process.env.REACT_APP_KEYCLOAK_URL ??
  "";

const buildKeycloakRedirectUrl = (): string => {
  const baseUrl = getKeycloakUrl();
  const redirectUri = encodeURIComponent(`${window.location.origin}/comeback`);
  return `${baseUrl}&redirect_uri=${redirectUri}`;
};

const Login = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = () => {
    const keycloakUrl = getKeycloakUrl();
    if (!keycloakUrl) {
      console.error("REACT_APP_KEYCLOAK_URL is not set in the env values");
      return;
    }
    window.location.href = buildKeycloakRedirectUrl();
  };

  return (
    <Box
      sx={{
        backgroundColor: "#e9f2ed",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
      <Box
        sx={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "15px",
          boxShadow: "0px 4px 20px rgba(58, 75, 57, 0.2)",
          textAlign: "center",
          width: "350px",
        }}>
        <Typography variant="h4" gutterBottom sx={{ color: "#3a4b39" }}>
          התחברות למערכת
        </Typography>
        <Button
          onClick={handleLogin}
          variant="contained"
          fullWidth
          sx={{
            padding: "10px",
            borderRadius: "10px",
            textTransform: "none",
            backgroundColor: "#4f6a4e",
            color: "white",
            "&:hover": { backgroundColor: "#3a4b39" },
          }}>
          התחבר
        </Button>
      </Box>
    </Box>
  );
};

export default Login;

