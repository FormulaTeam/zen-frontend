import Box, { BoxProps } from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { DataGridPro } from "@mui/x-data-grid-pro";
import {
  TableContainer as MuiTableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from "@mui/material";

export const DetailsContainer = styled(Box)<BoxProps>(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "start",
  overflowY: "auto",
  width: "100%",
  gap: theme.spacing(1),
  padding: theme.spacing(2, 4),
  backgroundColor: "#f1f5f9",
  borderTop: "1px solid #e2e8f0",
  borderBottom: "1px solid #e2e8f0",
  boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
}));

export const FormActionsContainer = styled(Box)<BoxProps>(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  marginTop: theme.spacing(4),
  marginRight: theme.spacing(5),
  alignItems: "flex-start",
}));

export const EditButtonWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  marginBottom: theme.spacing(2),
  alignItems: "center",
}));

export const ActionsRow = styled(Box)(() => ({
  display: "flex",
  gap: "12px",
  alignItems: "center",
}));

export const LineRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  padding: theme.spacing(1, 0),
  gap: theme.spacing(2),
}));

export const MetadataLine = styled(LineRow)(({ theme }) => ({
  paddingBottom: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
}));

export const ActionLine = styled(LineRow)(({ theme }) => ({
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}));

export const UnifiedButton = styled(Button)<{ $isPrimary?: boolean }>(({ theme, $isPrimary }) => ({
  height: "40px",
  borderRadius: "10px",
  padding: "6px 16px",
  fontSize: "0.95rem",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: "10px",
  textTransform: "none",
  whiteSpace: "nowrap",
  transition: "all 0.2s ease",

  backgroundColor: $isPrimary ? "#1E88E5" : "rgba(30, 136, 229, 0.08)",
  color: $isPrimary ? "#ffffff" : "#020618",
  border: $isPrimary ? "none" : "1px solid rgba(30, 136, 229, 0.15)",

  "&:hover": {
    backgroundColor: $isPrimary ? "#1976D2" : "rgba(30, 136, 229, 0.12)",
    boxShadow: $isPrimary ? "0 4px 12px rgba(30, 136, 229, 0.25)" : "none",
  },

  "& .MuiButton-startIcon, & .MuiButton-endIcon": {
    margin: 0,
    fontSize: "18px",
  },

  "&.Mui-disabled": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    color: "rgba(0, 0, 0, 0.26)",
    border: "1px solid rgba(0, 0, 0, 0.08)",
  },
}));

export const IconOnlyButton = styled(IconButton)(({ theme }) => ({
  color: "#020618",
  backgroundColor: "transparent",
  padding: "8px",
  borderRadius: "10px",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(2, 6, 24, 0.04)",
  },
  "& svg": {
    fontSize: "24px",
  },
}));

export const MainContentWrapper = styled(Box)<BoxProps>(() => ({
  padding: "16px 24px",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  overflow: "hidden",
  position: "relative",
  zIndex: 1,
}));

export const TopSection = styled(Box)<BoxProps>(() => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: "24px 24px 12px",
  flexShrink: 0,
  gap: "16px",
}));

export const CenteredBox = styled(Box)<BoxProps>(() => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
}));

export const TitleWrapper = styled(Box)<BoxProps>(() => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
}));

export const FormIconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "40px",
  borderRadius: "8px",
  backgroundColor: "rgba(25, 118, 210, 0.08)",
  flexShrink: 0,
  "& img": {
    width: "24px",
    height: "24px",
    objectFit: "contain",
  },
  "& svg": {
    fontSize: "24px",
  },
}));

export const QuickEditTableContainer = styled(MuiTableContainer)<{ isQuickEditMode?: boolean }>(
  ({ theme, isQuickEditMode }) => ({
    ...(isQuickEditMode && {
      "& .MuiTableRow-root:hover": {
        backgroundColor: "#f5f5f5",
      },
      "& .cell-error": {
        backgroundColor: "#ffebee",
        borderColor: "#f44336",
      },
      "& .cell-edited": {
        backgroundColor: "#e8f5e8",
      },
    }),
  }),
);

export const ContentContainer = styled(Box)<BoxProps>(() => ({
  display: "flex",
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  overflow: "hidden",
}));

interface MainContentProps extends BoxProps {
  $sidePanelOpen?: boolean;
}

export const MainContent = styled(Box)<MainContentProps>(() => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  overflow: "hidden",
}));

export const TableContainer = styled(Box)<BoxProps>(() => ({
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  padding: "0 24px",
}));

export const PageWrapper = styled(Box)<BoxProps>(() => ({
  width: "100vw",
  height: "100%",
  display: "flex",
  flexDirection: "row",
  overflow: "hidden",
  color: "#020618",
}));

interface LoadingBtnBoxProps extends BoxProps {
  $bgColor: string;
}

export const LoadingBtnBox = styled(Box)<LoadingBtnBoxProps>(({ $bgColor }) => ({
  backgroundColor: $bgColor,
  width: "39px",
  height: "39px",
  borderRadius: "8px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

export const StyledDataGrid = styled(DataGridPro)(({ theme }) => ({
  "&.MuiDataGrid-root": {
    "& .MuiDataGrid-filler--pinnedLeft": {
      display: "none !important",
    },
    width: "100%",
    maxWidth: "100%",
    fontSize: "18px",
    border: "none",
    overflow: "hidden",
    direction: "rtl /* @noflip */",
    "& .MuiDataGrid-cell": {
      borderBottom: "none",
      borderRight: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      color: "#020618",
    },
    "& .MuiDataGrid-columnHeader": {
      borderBottom: "none",
      borderRight: "none",
      "&--last": {
        borderRight: `none`,
      },
    },
    "& .MuiDataGrid-row--even": {
      backgroundColor: "#ffffff",
    },
    "& .MuiDataGrid-row--odd": {
      backgroundColor: "#f5f5f5",
    },
    "& .pending-deletion-row": {
      backgroundColor: "rgba(211, 47, 47, 0.08) !important",
      color: "rgba(0, 0, 0, 0.4) !important",
      textDecoration: "line-through",
      opacity: 0.7,
      "& .MuiDataGrid-cell": {
        color: "inherit",
      },
    },
    "& .MuiDataGrid-columnHeaderCheckbox": {
      "& .MuiDataGrid-columnHeaderTitleContainer": {
        justifyContent: "flex-start !important",
      },
    },
    "& .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-cell--pinnedRight": {
      backgroundColor: "inherit",
      justifyContent: "flex-start !important",
    },
    "& .MuiDataGrid-columnHeader--pinnedLeft, & .MuiDataGrid-columnHeader--pinnedRight": {
      "& .MuiDataGrid-columnHeaderTitleContainer": {
        justifyContent: "flex-start !important",
        flexDirection: "row !important",
      },
      "&[data-field='__detail_panel_toggle__'] .MuiDataGrid-columnHeaderTitleContainer": {
        justifyContent: "center !important",
      },
    },
    "& .MuiDataGrid-row": {
      borderBottom: "none",
      "&:hover": {
        backgroundColor: "#f0f7ff !important",
        "& .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-cell--pinnedRight": {
          backgroundColor: "#f0f7ff !important",
        },
      },
    },
    "& .active-editing-row": {
      backgroundColor: "rgba(25, 118, 210, 0.08) !important",
      boxShadow: "inset 4px 0 0 #1976d2",
    },
  },
  "&.MuiDataGrid-root--edit-mode": {
    border: "none",
    boxShadow: "none",
    overflow: "visible",
    "& .MuiDataGrid-cell, & .MuiDataGrid-columnHeader": {
      borderRight: "none",
      backgroundImage: "none",
    },
    "& .MuiDataGrid-row": {
      borderBottom: "none",
      backgroundImage: "none",
    },
    "& .MuiDataGrid-cell": {
      borderBottom: "none",
      backgroundImage: "none",
    },
    "& .MuiDataGrid-columnHeaders": {
      borderBottom: "none",
      backgroundImage: "none",
      backgroundColor: "#e1f0ff",
    },
    "& .MuiDataGrid-columnHeaderRow": {
      borderBottom: "none",
      backgroundImage: "none",
    },
    "& .cell--has-error": {
      outline: "2px solid #d32f2f !important",
      outlineOffset: "-2px",
    },
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#e1f0ff",
    borderBottom: "none",
    "& .MuiDataGrid-filler": {
      backgroundColor: "#e1f0ff",
      borderBottom: "none",
    },
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-columnHeaders": {
    backgroundColor: "#e1f0ff",
    color: "#020618",
    "& .MuiDataGrid-columnHeaderTitle": {
      color: "#020618",
      fontWeight: 700,
    },
    "& .MuiSvgIcon-root": {
      color: "#020618",
    },
  },
  "& .MuiDataGrid-columnHeader": {
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    width: "100%",
    fontSize: "1.2rem",
    fontWeight: 700,
    textAlign: "right",
    color: "#020618",
  },
  "& .MuiDataGrid-iconButtonContainer": {
    marginLeft: "4px",
  },
  "& .MuiDataGrid-columnHeaderTitleContainer": {
    justifyContent: "flex-start",
  },
  "& .MuiDataGrid-columnHeaderDraggableContainer": {
    justifyContent: "flex-start",
  },
  "& .MuiDataGrid-cell": {
    fontSize: "1.2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  "& .MuiDataGrid-cellContent": {
    width: "100%",
    textAlign: "right",
  },
  "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
    outline: "none",
    boxShadow: "none",
  },
  "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": {
    outline: "none",
    boxShadow: "none",
  },
  "& .MuiDataGrid-cell.Mui-focusVisible, & .MuiDataGrid-columnHeader.Mui-focusVisible": {
    outline: "none",
    boxShadow: "none",
  },
  "& .MuiDataGrid-cell--editing": {
    outline: "none",
    boxShadow: "inset 0 0 0 1px #1976d2",
    backgroundColor: "transparent",
  },
  "& .MuiDataGrid-cell--editing:focus, & .MuiDataGrid-cell--editing:focus-within": {
    outline: "none",
    boxShadow: "inset 0 0 0 1px #1976d2",
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cell.MuiDataGrid-cell--editable:focus, &.MuiDataGrid-root--edit-mode .MuiDataGrid-cell.MuiDataGrid-cell--editable:focus-within":
    {
      backgroundImage: "none",
      boxShadow: "inset 0 0 0 1px #1976d2",
      borderRadius: "2px",
      outline: "none",
      borderColor: "transparent",
    },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cell--editing": {
    backgroundImage: "none",
    boxShadow: "inset 0 0 0 1px #1976d2",
    borderRadius: "2px",
    outline: "none",
    borderColor: "transparent",
  },

  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cell:focus::after, &.MuiDataGrid-root--edit-mode .MuiDataGrid-cell:focus-within::after":
    {
      display: "none",
    },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cell.MuiDataGrid-cell--has-error": {
    backgroundColor: "#ffebee",
    border: `1px solid ${theme.palette.error.main}`,
    color: theme.palette.text.primary,
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cell--editable": {
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "2px",
    cursor: "text",
    boxShadow: "inset 0 0 0 1px #e0e0e0",
    transition: "box-shadow 0.2s ease, background-color 0.2s ease", // More specific transition
    "&:hover": {
      boxShadow: "inset 0 0 0 1px #bdbdbd",
    },
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cell--non-editable-in-edit-mode": {
    backgroundColor: "transparent",
    color: "rgba(2, 6, 24, 0.38)",
    cursor: "not-allowed",
    opacity: 1,
    userSelect: "none",
    pointerEvents: "none",
    "& *": {
      pointerEvents: "none",
    },
  },
  "& .MuiDataGrid-scrollbar--vertical": {
    display: "none",
  },
  "& .MuiDataGrid-row.Mui-selected": {
    backgroundColor: "rgba(25, 118, 210, 0.04)",
    "&:hover": {
      backgroundColor: "rgba(25, 118, 210, 0.08)",
    },
  },

  "& .MuiDataGrid-row.Mui-selected > .MuiDataGrid-cell": {
    backgroundColor: "transparent",
  },
  "& .MuiDataGrid-row.Mui-selected:hover > .MuiDataGrid-cell": {
    backgroundColor: "transparent",
  },
  "& .MuiDataGrid-footerContainer": {
    flexDirection: "row",
    borderTop: "none",
    justifyContent: "flex-start",
  },
  "& .MuiDataGrid-columnHeaderDraggableContainer:focus-within": {
    outline: "none !important",
  },
  "& .MuiDataGrid-virtualScroller": {
    overflowX: "auto !important",
    "&::-webkit-scrollbar": {
      height: "16px",
      width: "0px",
      display: "block",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "#f1f1f1",
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#cbd5e0",
      borderRadius: "10px",
      border: "3px solid #f1f1f1",
      "&:hover": {
        backgroundColor: "#a0aec0",
      },
    },
  },
  "& .MuiDataGrid-scrollbar--horizontal": {
    display: "block",
    height: "16px",
  },

  "& .MuiDataGrid-overlayWrapper": {
    minHeight: "320px",
  },

  "& .MuiDataGrid-skeletonLoadingOverlay": {
    backgroundColor: "#ffffff",
  },

  "& .MuiDataGrid-skeletonLoadingOverlay .MuiSkeleton-root": {
    borderRadius: "8px",
  },
}));

export const StyledCancelDialog = styled(Dialog)(() => ({
  "& .MuiDialog-paper": {
    padding: "30px",
    minWidth: "550px",
  },
}));

export const StyledDialogTitle = styled(DialogTitle)(() => ({
  padding: 0,
  paddingBottom: "20px",
  "& .MuiTypography-root": {
    fontSize: "2rem",
    fontWeight: 600,
    color: "#020618",
  },
}));

export const StyledDialogContent = styled(DialogContent)(() => ({
  textAlign: "center",
  padding: 0,
  paddingBottom: "32px",
  "& .MuiTypography-root": {
    fontSize: "1.3rem",
    lineHeight: 1.6,
    color: "#020618",
  },
}));

export const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  justifyContent: "center",
  gap: theme.spacing(2),
  padding: 0,
  "& .MuiButton-root": {
    fontSize: "1rem",
    padding: "8px 28px",
  },
}));

export const DialogTitleBox = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

export const StyledEditButton = styled(Button)(() => ({
  backgroundColor: "#DBE7F4",
  color: "#020618",
  fontSize: "1rem !important",
  fontWeight: 400,
  padding: "4px 16px",
  "&:hover": {
    backgroundColor: "#bbdefb",
  },
  "& .MuiButton-startIcon": {
    marginRight: "8px",
    height: "2vh",
    width: "2vh",
  },
}));

export const StyledAddButton = styled(StyledEditButton)(() => ({
  backgroundColor: "#4976CB",
  color: "#ffffff",
  "&:hover": {
    backgroundColor: "#3f69b3",
  },
}));

export const ResponsesAmountText = styled(Typography)(() => ({
  color: "#020618",
  fontSize: "1.4rem !important",
}));

export const ResponsesAmountBox = styled(Box)(() => ({
  padding: "8px 36px",
  display: "flex",
  alignItems: "center",
}));

export const ExpandIconBox = styled(Box)(() => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "100%",
}));

export const SyncStatusIconBox = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  height: "100%",
  width: "100%",
  paddingRight: "12px",
}));

export const FormInfoContentBox = styled(Box)(() => ({
  maxWidth: "28vw",
  maxHeight: "none",
  overflowY: "visible",
  direction: "ltr",
  padding: "4px",
}));

export const FormInfoSectionBox = styled(Box)(() => ({
  marginBottom: "12px",
}));

export const CreatorInfoBox = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: 400,
  color: "#020618",
}));

export const FormNameTypography = styled(Typography)(() => ({
  maxWidth: "400px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontWeight: 600,
  color: "#020618",
}));

export const FormIdTypography = styled(Typography)(() => ({
  fontSize: "1.6rem !important",
  color: "#020618",
}));

export const InfoIconButton = styled(IconButton)(() => ({
  marginLeft: "0px",
  marginRight: "8px",
  alignSelf: "center",
  color: "#020618",
}));

export const FormNameInTooltipTypography = styled(Typography)(() => ({
  fontWeight: 600,
  marginBottom: "4px",
  color: "#020618",
}));

export const FormDescriptionTypography = styled(Typography)(() => ({
  fontWeight: 300,
  color: "#020618",
}));

export const formInfoTooltipSlotProps = {
  tooltip: {
    sx: {
      backgroundColor: "#ffffff",
      color: "#020618",
      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
      border: "1px solid #e0e0e0",
      "& .MuiTooltip-arrow": {
        color: "#ffffff",
        "&::before": {
          border: "1px solid #e0e0e0",
        },
      },
    },
  },
};

export const HeaderAsterisk = styled("span")(({ theme }) => ({
  color: "#DB0004",
  fontWeight: 700,
  minWidth: "8px",
  display: "inline-block",
}));

export const HeaderFlex = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: 6,
  position: "relative",
  fontWeight: 700,
  minHeight: "24px",
  color: "#020618",
});

export const CellErrorWrapper = styled("div")({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  overflow: "hidden",
});

export const CellErrorHeader = styled("div")({
  display: "flex",
  alignItems: "center",
  width: "100%",
  minWidth: 0,
  padding: "2px 8px 0",
  gap: "12px",
  flexShrink: 0,
});

export const CellErrorText = styled("span")({
  color: "#DB0004",
  fontSize: "1rem",
  fontWeight: 600,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  minWidth: 0,
  flex: 1,
  textAlign: "start",
  unicodeBidi: "plaintext",
});

export const CellErrorInfoIcon = styled("span")({
  color: "#020618",
  fontSize: "0.95rem",
  fontWeight: 700,
  lineHeight: 1,
  cursor: "help",
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
});

export const CellValueFlex = styled("div")({
  flex: 1,
  minHeight: 0,
  display: "flex",
  alignItems: "center",
  overflow: "hidden",
  color: "#020618",
});

export const PaginationContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  "& .MuiTypography-root": {
    minWidth: "24px",
    textAlign: "center",
    color: "#020618",
  },
}));

export const FooterInfoContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  color: "#020618",
  fontSize: "0.875rem",
  direction: "rtl",
}));

export const PaginationButton = styled(IconButton)(({ theme }) => ({
  padding: "4px",
  backgroundColor: "transparent",
  border: "none",
  width: "32px",
  height: "32px",
  color: "#020618",
  "&:hover": {
    backgroundColor: "rgba(2, 6, 24, 0.04)",
  },
  "&.Mui-disabled": {
    opacity: 0.3,
  },
  "& svg": {
    fontSize: "1.2rem",
    color: "inherit",
  },
}));

export const HighlightedText = styled("mark")({
  backgroundColor: "#fff59d",
  color: "inherit",
  padding: 0,
  borderRadius: "2px",
});
