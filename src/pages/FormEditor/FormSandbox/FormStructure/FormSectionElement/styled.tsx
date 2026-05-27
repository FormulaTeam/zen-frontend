import { styled, Typography, Accordion, AccordionSummary } from "@mui/material";
import { Check, Close, DeleteOutlined, DriveFileRenameOutline, ExpandMore, KeyboardDoubleArrowRight } from "@mui/icons-material";
import { Resizable } from "re-resizable";

export const SectionTitleText = styled(Typography)({
  display: "inline-block",
  maxWidth: "50vw",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  cursor: "pointer",
  padding: "2px 8px",
  borderRadius: "4px",
  transition: "background-color 0.2s",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
});

export const StyledAccordion = styled(Accordion)({
  backgroundColor: "transparent",
  boxShadow: "none",
});

export const StyledAccordionSummary = styled(AccordionSummary)({
  minHeight: 0,
  "&.Mui-focusVisible": {
    backgroundColor: "transparent",
  },
  "&.MuiAccordionSummary-root": {
    padding: 0,
  },
  "& .MuiAccordionSummary-content": {
    "&.Mui-expanded": {
      margin: 0,
    },
    cursor: "grab",
    margin: 0,
    padding: "14px 20px",
    alignItems: "center",
  },
});

export const ResizeHandleWrapper = styled("div")({
  position: "absolute",
  bottom: 4,
  width: "100%",
  height: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#FAFAFA",
  cursor: "s-resize",
});

export const ResizeHandleBar = styled("div")({
  width: 48,
  height: 4,
  background: "#a3a7ae",
  borderRadius: 4,
});

export const EmptyPlaceholderText = styled(Typography)({
  userSelect: "none",
});

export const StyledResizable = styled(Resizable)({
  display: "flex",
  position: "relative",
  paddingBottom: 20,
});

export const SaveButtonIcon = styled(Check)({
  fontSize: 20,
  color: "#308e63",
});

export const CancelButtonIcon = styled(Close)({
  fontSize: 20,
  color: "#a54160",
});

export const EditButtonIcon = styled(DriveFileRenameOutline)({
  fontSize: 20,
  color: "#506f9e",
});

export const ExpandIcon = styled(ExpandMore)<{ expanded?: number }>(({ expanded }) => ({
  fontSize: 25,
  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
  transition: "transform 0.3s ease",
}));

export const DeleteIcon = styled(DeleteOutlined, {
  shouldForwardProp: (prop) => prop !== 'ownerState',
})<{
  ownerState?: { isLastSection?: boolean }
}>(({ ownerState }) => ({
  fontSize: 28,
  transition: "color 0.2s",
  color: ownerState?.isLastSection ? "#85878D" : "#b53442",
}));
export const CatalogArrowIcon = styled(KeyboardDoubleArrowRight)({
  fontSize: 35,
  marginTop: 4,
  marginInlineEnd: 8,
  color: "#A3A6AE",
});
