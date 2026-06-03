import { useEffect, useState } from "react";
import { useTheme, Typography } from "@mui/material";
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

  const isLogoDisabled =
    location?.pathname.includes(IOperationEndpoint.CREATE) ||
    location?.pathname.includes(IOperationEndpoint.EDIT);

  useEffect(() => {
    const inMainPage = location?.pathname === IPath.HOME;
    const inLoginPage = location?.pathname === IPath.LOGIN;
    setShowMainStuff(inMainPage || inLoginPage);
  }, [location]);

  const navigateToHome = () => {
    if (isLogoDisabled) return;
    navigate(IPath.HOME, { replace: true });
  };

  const greeting = myPersonal?.name ? `היי ${myPersonal.name.split(" ")[0]}` : "היי";

  return (
    <NavAppBar $bgColor={theme.palette.primary.main} $isPink={isEasterEggActive} position="static">
      <NavToolbar>
        <LogoContainer onClick={navigateToHome} disabled={isLogoDisabled} data-testid="navbar-logo">
          <img src={logo} height={40} />
        </LogoContainer>

        <ButtonsContainer>
          {user && (
            <Typography
              sx={{
                color: "#fff",
                fontWeight: 600,
                fontSize: "18px",
              }}>
              {greeting}
            </Typography>
          )}
        </ButtonsContainer>
      </NavToolbar>
    </NavAppBar>
  );
};

export default Navbar;
