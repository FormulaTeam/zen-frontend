import { useEffect, useState } from "react";
import { Box, IconButton, Tooltip, useTheme } from "@mui/material";
import { PersonOutline as PersonIcon } from "@mui/icons-material";
import { CircleQuestionMark, Trash2 } from "lucide-react";
import logo from "../../images/zen_logo.png";
import { IPath } from "../../types/enums/global.enums";
import { Environment } from "../../types/enums/environment.enum";
import { useNavigate } from "react-router-dom";
import { NavAppBar, NavToolbar, LogoContainer, ButtonsContainer, EnvironmentBadge } from "./styled";
import { useAuth } from "../../contexts/AuthContext";
import SupportPopup from "./supportPopup/SupportPopup";

const SUPPORT_CONTACT_URL = window.RUNTIME_ENV?.REACT_APP_SUPPORT_CONTACT_URL;
const SUPPORT_TICKET_URL = window.RUNTIME_ENV?.REACT_APP_SUPPORT_TICKET_URL;
const isEnvironment = (value: unknown): value is Environment => {
  return Object.values(Environment).includes(value as Environment);
};

const runtimeEnvironment =
  window.RUNTIME_ENV?.REACT_APP_ENVIRONMENT || process.env.REACT_APP_ENVIRONMENT;
const ACTIVE_ENVIRONMENT: Environment = isEnvironment(runtimeEnvironment)
  ? runtimeEnvironment
  : Environment.Development;

const ENVIRONMENT_STYLES: Record<
  Environment,
  { label: string; bgColor?: string; stripeOpacity: number }
> = {
  [Environment.Development]: {
    label: "DEVELOPMENT",
    bgColor: "#6653a3",
    stripeOpacity: 0.14,
  },
  [Environment.Test]: { label: "EREZINIO", bgColor: "#0d7f56", stripeOpacity: 0.2 },
  [Environment.PreProduction]: {
    label: "PRE-PRODUCTION",
    bgColor: "#1f5fa0",
    stripeOpacity: 0.24,
  },
  [Environment.Production]: {
    label: "PRODUCTION",
    stripeOpacity: 0,
  },
};

const Navbar = () => {
  const [isEasterEggActive, setIsEasterEggActive] = useState(false);
  const [isSupportPopupOpen, setIsSupportPopupOpen] = useState(false);

  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isProductionEnvironment = ACTIVE_ENVIRONMENT === Environment.Production;
  const environmentStyle = ENVIRONMENT_STYLES[ACTIVE_ENVIRONMENT];
  const navbarBackgroundColor = isProductionEnvironment
    ? theme.palette.primary.main
    : environmentStyle.bgColor || theme.palette.primary.main;

  useEffect(() => {
    const handleEasterEgg = (e: Event) => {
      const customEvent = e as CustomEvent<{ active?: boolean }>;
      setIsEasterEggActive(!!customEvent.detail?.active);
    };

    window.addEventListener("toggle-easter-egg", handleEasterEgg);
    return () => window.removeEventListener("toggle-easter-egg", handleEasterEgg);
  }, []);

  const navigateToHome = (e: React.MouseEvent) => {
    e.preventDefault();

    const event = new CustomEvent("before-navigate", {
      cancelable: true,
      detail: {
        navigate: () => navigate(IPath.HOME, { replace: true }),
      },
    });

    window.dispatchEvent(event);

    if (!event.defaultPrevented) {
      window.hasUnsavedChanges = false;
      navigate(IPath.HOME, { replace: true });
    }
  };

  const openExternalUrl = (url?: string) => {
    if (!url) {
      console.warn("Support URL is missing from the runtime environment");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleQuestionsClick = () => {
    setIsSupportPopupOpen(true);
  };

  const handleRestoreClick = () => {
    const event = new CustomEvent("before-navigate", {
      cancelable: true,
      detail: {
        navigate: () => navigate(IPath.RECYCLE_BIN),
      },
    });

    window.dispatchEvent(event);

    if (!event.defaultPrevented) {
      navigate(IPath.RECYCLE_BIN);
    }
  };

  const resolvedFirstName =
    user?.firstName?.trim() ||
    user?.displayName?.trim()?.split(" ")[0] ||
    user?.upn?.split("@")[0] ||
    "משתמש";

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
        $bgColor={navbarBackgroundColor}
        $stripeOpacity={environmentStyle.stripeOpacity}
        $isPink={isEasterEggActive}
        position="static">
        <NavToolbar>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <LogoContainer
              href={IPath.HOME}
              onClick={navigateToHome}
              disabled={false}
              data-testid="navbar-logo">
              <img src={logo} height={40} draggable={false} />
            </LogoContainer>

            {!isProductionEnvironment && (
              <EnvironmentBadge data-testid="navbar-environment-badge">
                {environmentStyle.label}
              </EnvironmentBadge>
            )}
          </Box>

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
                  <Tooltip title={`היי, ${resolvedFirstName}`} arrow placement="bottom">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <PersonIcon sx={{ fontSize: "24px", color: "#fff" }} />
                    </Box>
                  </Tooltip>
                </Box>

                <Tooltip title="תמיכה" arrow placement="bottom">
                  <IconButton onClick={handleQuestionsClick} sx={navbarIconButtonSx}>
                    <CircleQuestionMark size={22} strokeWidth={2.2} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="סל מחזור" arrow placement="bottom">
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
        onContactUs={() => openExternalUrl(SUPPORT_CONTACT_URL)}
        onOpenTicket={() => openExternalUrl(SUPPORT_TICKET_URL)}
        onOpenGuide={() => {
          // TODO: connect guide URL later if needed
        }}
      />
    </>
  );
};

export default Navbar;
