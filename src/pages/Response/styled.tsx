import Box, { BoxProps } from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper, { PaperProps } from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

export const FieldsWrapper = styled(Paper)<PaperProps>(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  width: "100%",
}));

interface SectionContainerProps extends PaperProps {
  hidden?: boolean;
}

export const SectionContainer = styled(Paper)<SectionContainerProps>(({ theme, hidden }) => ({
  display: hidden ? "none" : "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
}));

export const FormSectionsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(4),
  width: "100%",
  marginTop: "40px"
}));

export const LoadingContainer = styled(Box)<BoxProps>(({ theme }) => ({
  display: "flex",
  width: "100%",
  height: "100%",
  justifyContent: "center",
  padding: theme.spacing(2),
}));

interface LoadingBtnBoxProps {
  bgcolor: string;
}

export const LoadingBtnBox = styled(Box)<LoadingBtnBoxProps>`
  background-color: ${({ bgcolor }) => bgcolor};
  width: 95px;
  height: 39px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const PageContainer = styled(Container)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  paddingBottom: theme.spacing(3),
  gap: theme.spacing(3),
  width: "90% !important",
  maxWidth: "none !important",
  margin: "0 auto",
  [theme.breakpoints.down("md")]: {
    width: "98% !important",
  },
}));

export const Header = styled(Box)(({ theme }) => ({
  position: "sticky",
  top: 0,
  zIndex: 1100,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "90%",
  backgroundColor: "#f1f5f9",
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  margin: "0 auto",
  boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.05)",
  [theme.breakpoints.down("md")]: {
    width: "98%",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

export const HeaderSection = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  alignItems: "center",
}));

export const HeaderButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#ffffff !important",
  color: "#1a1a24 !important",
  border: "none !important",
  borderRadius: "10px !important",
  fontWeight: "600 !important",
  textTransform: "none !important",
  height: "42px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important",
  display: "flex",
  alignItems: "center",
  transition: "all 0.2s ease-in-out !important",
  padding: "0 16px !important",

  "&:hover": {
    backgroundColor: "#ffffff !important",
  },

  "&.Mui-disabled": {
    backgroundColor: "#f8fafc !important",
    color: "#94a3b8 !important",
    boxShadow: "none !important",
  },

  "& .MuiButton-startIcon": {
    marginRight: "8px",
  },
}));
