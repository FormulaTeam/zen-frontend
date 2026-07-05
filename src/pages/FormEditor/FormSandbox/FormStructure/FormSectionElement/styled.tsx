import { styled, Typography, Accordion, AccordionSummary, InputBase } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Check as CheckIcon,
  ChevronDown,
  ChevronsRight,
  Pencil,
  Trash2,
  X as XIcon,
} from "lucide-react";
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

export const SectionTitleInput = styled(InputBase)(({ theme }) => ({
  ...theme.typography.body1,
  padding: "2px 8px",
  borderRadius: "4px",
  width: "100%",
  maxWidth: "50vw",
  backgroundColor: "rgba(0, 0, 0, 0.02)",
  transition: "background-color 0.2s, box-shadow 0.2s",
  "&.Mui-focused": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

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

const LucideIconWrapper = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const SaveButtonIcon = (props: any) => (
  <LucideIconWrapper>
    <CheckIcon size={20} strokeWidth={2.4} color="#308e63" {...props} />
  </LucideIconWrapper>
);

export const CancelButtonIcon = (props: any) => (
  <LucideIconWrapper>
    <XIcon size={20} strokeWidth={2.4} color="#a54160" {...props} />
  </LucideIconWrapper>
);

export const EditButtonIcon = (props: any) => (
  <LucideIconWrapper>
    <Pencil size={20} strokeWidth={2.4} color="#506f9e" {...props} />
  </LucideIconWrapper>
);

export const ExpandIcon = styled(({ expanded, ...props }: any) => (
  <ChevronDown size={25} strokeWidth={2.4} {...props} />
))(({ expanded }) => ({
  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
  transition: "transform 0.3s ease",
}));

export const DeleteIcon = styled(({ ownerState, ...props }: any) => (
  <Trash2 size={28} strokeWidth={2.4} {...props} />
))(({ ownerState }) => ({
  transition: "color 0.2s",
  color: ownerState?.isLastSection ? "#85878D" : "#b53442",
}));

export const CatalogArrowIcon = styled((props: any) => (
  <ChevronsRight size={35} strokeWidth={2.4} {...props} />
))({
  marginTop: 4,
  marginInlineEnd: 8,
  color: "#A3A6AE",
});
