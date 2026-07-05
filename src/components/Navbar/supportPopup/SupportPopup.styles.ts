import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ChevronDown } from "lucide-react";

export const StyledDialog = styled(Dialog)(() => ({
  "& .MuiPaper-root": {
    width: "920px",
    maxWidth: "calc(100vw - 48px)",
    maxHeight: "min(760px, calc(100vh - 48px))",
    borderRadius: "24px",
    backgroundColor: "#F1F5F9",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.14)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    direction: "ltr",
  },
}));

export const StyledDialogTitle = styled(DialogTitle)(() => ({
  position: "relative",
  padding: "34px 36px 18px",
  textAlign: "center",
}));

export const CloseButton = styled(IconButton)(() => ({
  position: "absolute",
  right: "24px",
  left: "auto",
  top: "24px",
  width: "36px",
  height: "36px",
  padding: 0,
  color: "#111827",
  backgroundColor: "transparent",
  borderRadius: 0,

  "&:hover": {
    backgroundColor: "transparent",
    color: "#475569",
  },

  "& svg": {
    fontSize: "30px",
  },
}));

export const TitleText = styled("h2")(() => ({
  margin: 0,
  fontWeight: 700,
  fontSize: "34px",
  lineHeight: "48px",
  color: "#020617",
  letterSpacing: "-0.02em",
}));

export const SubtitleText = styled(Typography)(() => ({
  marginTop: "8px",
  color: "#62748E",
  fontWeight: 400,
  fontSize: "20px",
  lineHeight: "30px",
  textAlign: "left",
  direction: "ltr",
}));

export const Content = styled(DialogContent)(() => ({
  padding: "14px 36px 0",
  flex: 1,
  minHeight: 0,
  overflow: "hidden",
}));

export const ScrollShell = styled(Box)(() => ({
  position: "relative",
  height: "420px",
  maxHeight: "calc(100vh - 300px)",
  paddingLeft: "18px",
  paddingRight: 0,
  boxSizing: "border-box",
}));

export const ScrollArea = styled(Box)(() => ({
  height: "100%",
  overflowY: "auto",
  overflowX: "hidden",

  scrollbarWidth: "none",
  msOverflowStyle: "none",

  "&::-webkit-scrollbar": {
    display: "none",
  },
}));

export const ScrollShadow = styled(Box, {
  shouldForwardProp: (prop) => prop !== "$position" && prop !== "$isVisible",
})<{
  $position: "top" | "bottom";
  $isVisible: boolean;
}>(({ $position, $isVisible }) => ({
  position: "absolute",
  left: "18px",
  right: 0,
  zIndex: 2,
  height: "26px",
  pointerEvents: "none",
  opacity: $isVisible ? 1 : 0,
  transition: "opacity 140ms ease",
  top: $position === "top" ? 0 : "auto",
  bottom: $position === "bottom" ? 0 : "auto",
  background:
    $position === "top"
      ? "linear-gradient(to bottom, rgba(15, 23, 42, 0.14), rgba(15, 23, 42, 0))"
      : "linear-gradient(to top, rgba(15, 23, 42, 0.14), rgba(15, 23, 42, 0))",
}));

export const VisibleScrollbar = styled(Box)(() => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: "auto",
  width: "10px",
  height: "100%",
  borderRadius: "999px",
  overflow: "hidden",
  cursor: "pointer",
}));

export const VisibleScrollbarThumb = styled(Box)(() => ({
  width: "100%",
  borderRadius: "999px",
  backgroundColor: "#E2E8F0",
  transition: "height 120ms ease, opacity 120ms ease, background-color 120ms ease",
  cursor: "grab",
  userSelect: "none",
  touchAction: "none",

  "&:hover": {
    backgroundColor: "#CBD5E1",
  },

  "&:active": {
    cursor: "grabbing",
    backgroundColor: "#B8C4D4",
  },
}));

export const QuestionsCard = styled(Box)(() => ({
  width: "100%",
  borderRadius: "8px",
  backgroundColor: "#F1F5F9",
  overflow: "hidden",
}));

export const QuestionItemWrapper = styled(Box)(() => ({
  borderBottom: "1px solid #D8E2EF",

  "&:last-of-type": {
    borderBottom: "none",
  },
}));

export const QuestionRow = styled("button")<{ $isOpen?: boolean }>(() => ({
  width: "100%",
  minHeight: "74px",
  border: "none",
  backgroundColor: "#F1F5F9",
  display: "flex",
  flexDirection: "row-reverse",
  alignItems: "center",
  gap: "14px",
  padding: "0 22px",
  cursor: "pointer",
  direction: "ltr",
  textAlign: "right",
  color: "#020617",

  "&:hover": {
    backgroundColor: "#F1F5F9",
  },

  "&:active": {
    backgroundColor: "#F1F5F9",
  },

  "&:focus": {
    outline: "none",
  },

  "&:focus-visible": {
    outline: "2px solid rgba(148, 163, 184, 0.55)",
    outlineOffset: "-2px",
  },
}));

export const ChevronIcon = styled(ChevronDown)<{ $isOpen?: boolean }>(({ $isOpen }) => ({
  width: "22px",
  height: "22px",
  minWidth: "22px",
  color: "#020617",
  transform: $isOpen ? "rotate(180deg)" : "rotate(0deg)",
  transition: "transform 160ms ease",
}));

export const QuestionTitle = styled(Typography)(() => ({
  flex: 1,
  fontSize: "22px",
  lineHeight: "32px",
  fontWeight: 500,
  color: "#020617",
  direction: "ltr",
  textAlign: "left",
}));

export const AnswerBox = styled(Box)(() => ({
  padding: "0 22px 24px 22px",
  backgroundColor: "#F1F5F9",
  textAlign: "right",
  direction: "ltr",
}));

export const AnswerText = styled(Typography)(() => ({
  color: "#020617",
  fontSize: "12px",
  lineHeight: "30px",
  fontWeight: 400,
  direction: "ltr",
  textAlign: "left",
  whiteSpace: "pre-line",
}));

export const FooterRow = styled(DialogActions)(() => ({
  padding: "18px 36px 34px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "18px",
  direction: "ltr",
}));

export const NeedMoreHelp = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: "#020617",
  fontSize: "18px",
  lineHeight: "26px",
  fontWeight: 800,
  whiteSpace: "nowrap",

  "& svg": {
    width: "22px",
    height: "22px",
  },
}));

export const Actions = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  direction: "rtl",
}));

export const ActionButton = styled(Button)(() => ({
  minWidth: "156px",
  height: "42px",
  padding: "0 16px",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: 700,
  textTransform: "none",
  color: "#020617",
  borderColor: "#d8e2ef",
  backgroundColor: "#ffffff",
  boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
  gap: "8px",

  "& svg": {
    width: "21px",
    height: "21px",
  },

  "&:hover": {
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 10px rgba(15, 23, 42, 0.1)",
  },
}));

export const PrimaryActionButton = styled(Button)(({ theme }) => ({
  minWidth: "120px",
  height: "42px",
  padding: "0 18px",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: 700,
  textTransform: "none",
  backgroundColor: theme.palette.primary.main,
  color: "#ffffff",
  boxShadow: "none",
  gap: "8px",

  "& svg": {
    width: "21px",
    height: "21px",
  },

  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: "none",
  },
}));
