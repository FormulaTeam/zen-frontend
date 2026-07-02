import { useEffect, useState } from "react";
import { useTheme, Avatar, Box, IconButton, Tooltip } from "@mui/material";
import { PersonOutline as PersonIcon } from "@mui/icons-material";
import { CircleQuestionMark, Trash2 } from "lucide-react";
import logo from "../../images/zen_logo.png";
import { IPath } from "../../types/enums/global.enums";
import { useNavigate } from "react-router-dom";
import { NavAppBar, NavToolbar, LogoContainer, ButtonsContainer } from "./styled";
import { useGetMyPersonal } from "../../api/usersApi";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const [isEasterEggActive, setIsEasterEggActive] = useState(false);
  const navigate = useNavigate();
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

    const logoClickEvent = new CustomEvent("logo-click", {
      cancelable: true,
      detail: {
        navigate: () => navigate(IPath.HOME, { replace: true }),
      },
    });

    window.dispatchEvent(logoClickEvent);

    if (!logoClickEvent.defaultPrevented) {
      (window as any).hasUnsavedChanges = false;
      navigate(IPath.HOME, { replace: true });
    }
  };

  const handleQuestionsClick = () => {
    window.dispatchEvent(new CustomEvent("open-questions-popup"));
  };

  const handleRestoreClick = () => {
    navigate(IPath.DELETED_FORMS);
  };

  const navbarIconButtonSx = {
    width: 36,
    height: 36,
    color: "#fff",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: 0,
    padding: 0,
    transition: "color 0.2s ease, transform 0.2s ease, opacity 0.2s ease",

    "&:hover": {
      backgroundColor: "transparent",
      transform: "translateY(-1px)",
      opacity: 0.85,
    },
  };

  return (
    <NavAppBar $bgColor={theme.palette.primary.main} $isPink={isEasterEggActive} position="static">
      <NavToolbar>
        <LogoContainer
          href={IPath.HOME}
          onClick={navigateToHome}
          disabled={false}
          data-testid="navbar-logo">
          <img src={logo} height={40} draggable={false} />
        </LogoContainer>

        <ButtonsContainer>
          {user && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row-reverse",
                alignItems: "center",
                gap: 1,
              }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}>
                <PersonIcon sx={{ fontSize: "24px", color: "#fff" }} />
              </Box>

              <Tooltip title="שאלות ותשובות" arrow placement="bottom">
                <IconButton onClick={handleQuestionsClick} sx={navbarIconButtonSx}>
                  <CircleQuestionMark size={20} strokeWidth={2.2} />
                </IconButton>
              </Tooltip>

              <Tooltip title="שחזור מחיקות" arrow placement="bottom">
                <IconButton onClick={handleRestoreClick} sx={navbarIconButtonSx}>
                  <Trash2 size={20} strokeWidth={2.2} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </ButtonsContainer>
      </NavToolbar>
    </NavAppBar>
  );
};

export default Navbar;
