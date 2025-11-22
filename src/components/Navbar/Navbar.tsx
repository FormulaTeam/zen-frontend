import { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BarChartIcon from "@mui/icons-material/BarChart";
import logo from "../../images/zen_logo.png";
import SearchAndFilter from "../SearchAndFilter/SearchAndFilter";
import { IOperationEndpoint, IPath } from "../../types/enums/global.enums";
import { useLocation, useNavigate } from "react-router-dom";
import { useSuperAdmin } from "../../contexts/SuperAdminContext";
import { NavAppBar, NavToolbar, LogoContainer, ButtonsContainer } from "./styled";
import NavbarButton from "./NavbarButton";

const Navbar = ({ handleSearch, searchValue }) => {
  // const { isSuperAdmin } = useSuperAdmin();
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
        <LogoContainer onClick={navigateToHome} disabled={isLogoDisabled}>
          <img src={logo} height={40} />
        </LogoContainer>

        {showMainStuff && (
          <SearchAndFilter
            searchValue={searchValue}
            handleSearch={handleSearch}
            placeholder="חיפוש טופס"
          />
        )}

        <ButtonsContainer>
          {showMainStuff && (
            <NavbarButton
              onClick={() => navigate(IPath.FORM_CREATE)}
              bgColor={theme.palette.background.paper}
              hoverColor={theme.palette.background.paper}
              icon={<AddIcon />}
              title="יצירת טופס חדש"
            />
          )}

          {showMainStuff && true && (
            <NavbarButton
              onClick={() => navigate(IPath.DASHBOARD)}
              bgColor={theme.palette.background.paper}
              hoverColor={theme.palette.background.paper}
              icon={<BarChartIcon />}
              title="לוח בקרה"
            />
          )}
        </ButtonsContainer>
      </NavToolbar>
    </NavAppBar>
  );
};

export default Navbar;
