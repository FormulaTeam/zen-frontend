import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Box, Typography } from "@mui/material";
import { useGetLoginSSOUrl } from "../../api";
import "./Login.scss";

const Login = () => {
  const [clickedLogin, setClickedLogin] = useState(false);
  const navigate = useNavigate();

  const { user } = useAuth();
  const {
    data: ssoAuthUrl,
    isLoading: getLoginSSOUrlLoading,
    isSuccess: getLoginSSOUrlSuccess,
    error: getLoginSSOUrlError,
    refetch,
  } = useGetLoginSSOUrl({ queryOptions: { enabled: !!user && clickedLogin } });

  useEffect(() => {
    if (user) {
      navigate("/");
      return;
    }
  }, [user]);

  useEffect(() => {
    if (getLoginSSOUrlSuccess) {
      window.location.href = ssoAuthUrl;
      return;
    }

    if (clickedLogin) {
      refetch();
    }
  }, [getLoginSSOUrlSuccess, clickedLogin]);

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
        {getLoginSSOUrlError && (
          <Typography variant="body2" color="error" gutterBottom>
            {getLoginSSOUrlError.message}
          </Typography>
        )}
        <Button
          onClick={() => setClickedLogin(true)}
          variant="contained"
          fullWidth
          disabled={getLoginSSOUrlLoading}
          sx={{
            padding: "10px",
            borderRadius: "10px",
            textTransform: "none",
            backgroundColor: "#4f6a4e",
            color: "white",
            "&:hover": { backgroundColor: "#3a4b39" },
            "&:disabled": { backgroundColor: "#c7dac9" },
          }}>
          {getLoginSSOUrlLoading ? "מתחבר..." : "התחבר"}
        </Button>
      </Box>
    </Box>
  );
};

export default Login;
