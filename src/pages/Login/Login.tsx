import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Box, Typography } from "@mui/material";
import { loginSSO } from "../../api";
import "./Login.scss";

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
      return;
    }
  }, []);

  const handleLogin = async () => {
    const authUrl = await loginSSO();
    window.location.href = authUrl; // Redirect to the SSO login page
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
        {error && (
          <Typography variant="body2" color="error" gutterBottom>
            {error}
          </Typography>
        )}
        <Button
          onClick={handleLogin}
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            padding: "10px",
            borderRadius: "10px",
            textTransform: "none",
            backgroundColor: "#4f6a4e",
            color: "white",
            "&:hover": { backgroundColor: "#3a4b39" },
            "&:disabled": { backgroundColor: "#c7dac9" },
          }}>
          {loading ? "מתחבר..." : "התחבר"}
        </Button>
      </Box>
    </Box>
  );
};

export default Login;
