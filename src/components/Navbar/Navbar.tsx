import { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import logo from "../../images/zen_logo.png";
import { IOperationEndpoint, IPath } from "../../types/enums/global.enums";
import { useLocation, useNavigate } from "react-router-dom";
import { NavAppBar, NavToolbar, LogoContainer, ButtonsContainer } from "./styled";

const Navbar = () => {
  const [showMainStuff, setShowMainStuff] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

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

  return (
    <NavAppBar $bgColor={theme.palette.primary.main}>
      <NavToolbar>
        <LogoContainer onClick={navigateToHome} disabled={isLogoDisabled} data-testid="navbar-logo">
          <img src={logo} height={40} />
        </LogoContainer>

        <ButtonsContainer />
      </NavToolbar>
    </NavAppBar>
  );
};

export default Navbar;
