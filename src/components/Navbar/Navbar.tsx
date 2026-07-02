import { useEffect, useState } from "react";
import { useTheme, Box, IconButton, Tooltip } from "@mui/material";
import { PersonOutline as PersonIcon } from "@mui/icons-material";
import { CircleQuestionMark, Trash2 } from "lucide-react";
import logo from "../../images/zen_logo.png";
import { IPath } from "../../types/enums/global.enums";
import { useNavigate } from "react-router-dom";
import { NavAppBar, NavToolbar, LogoContainer, ButtonsContainer } from "./styled";
import { useAuth } from "../../contexts/AuthContext";
import SupportPopup from "./SupportPopup";

const Navbar = () => {
  const [isEasterEggActive, setIsEasterEggActive] = useState(false);
  const [isSupportPopupOpen, setIsSupportPopupOpen] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

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
    setIsSupportPopupOpen(true);
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
    <>
      <NavAppBar
        $bgColor={theme.palette.primary.main}
        $isPink={isEasterEggActive}
        position="static">
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
                    <CircleQuestionMark size={22} strokeWidth={2.2} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="שחזור מחיקות" arrow placement="bottom">
                  <IconButton onClick={handleRestoreClick} sx={navbarIconButtonSx}>
                    <Trash2 size={22} strokeWidth={2.2} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </ButtonsContainer>
        </NavToolbar>
      </NavAppBar>

      <SupportPopup
        isOpen={isSupportPopupOpen}
        onClose={() => setIsSupportPopupOpen(false)}
        onContactUs={() => {
          // TODO: open contact flow
        }}
        onOpenTicket={() => {
          // TODO: open ticket flow
        }}
        onOpenGuide={() => {
          // TODO: open guide page
        }}
      />
    </>
  );
};

export default Navbar;
