import { useEffect, useState } from "react";
import { useTheme, Typography, Avatar, Box } from "@mui/material";
import { PersonOutline as PersonIcon } from "@mui/icons-material";
import logo from "../../images/zen_logo.png";
import { IOperationEndpoint, IPath } from "../../types/enums/global.enums";
import { useLocation, useNavigate } from "react-router-dom";
import { NavAppBar, NavToolbar, LogoContainer, ButtonsContainer } from "./styled";
import { useGetMyPersonal } from "../../api/usersApi";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const [showMainStuff, setShowMainStuff] = useState(true);
  const [isEasterEggActive, setIsEasterEggActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useAuth();
  const { data: myPersonal } = useGetMyPersonal({ enabled: !!user });

  useEffect(() => {
    const handleEasterEgg = (e: any) => {
      setIsEasterEggActive(!!e.detail?.active);
    };

    window.addEventListener("toggle-easter-egg", handleEasterEgg);
    return () => window.removeEventListener("toggle-easter-egg", handleEasterEgg);
  }, []);

  const navigateToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(IPath.HOME, { replace: true });
  };

  const greeting = myPersonal?.name ? `היי ${myPersonal.name.split(" ")[0]}` : "היי";

  return (
    <NavAppBar $bgColor={theme.palette.primary.main} $isPink={isEasterEggActive} position="static">
      <NavToolbar>
        <LogoContainer href={IPath.HOME} onClick={navigateToHome} disabled={false} data-testid="navbar-logo">
          <img src={logo} height={40} draggable={false} />
        </LogoContainer>

        <ButtonsContainer>
          {user && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                alt={myPersonal?.name || "User"}
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  fontSize: "14px",
                  fontWeight: 700,
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                }}>
                <PersonIcon sx={{ fontSize: "20px", color: "#fff" }} />
              </Avatar>
              <Typography
                sx={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "18px",
                }}>
                {greeting}
              </Typography>
            </Box>
          )}
        </ButtonsContainer>
      </NavToolbar>
    </NavAppBar>
  );
};

export default Navbar;
