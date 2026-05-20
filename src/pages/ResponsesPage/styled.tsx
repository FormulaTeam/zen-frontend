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
  padding: theme.spacing(2),
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
  gap: "16px",
  alignItems: "center",
}));

export const MainContentWrapper = styled(Box)<BoxProps>(() => ({
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  overflow: "hidden",
}));

export const TopSection = styled(Box)<BoxProps>(() => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "5px",
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

export const QuickEditTableContainer = styled(MuiTableContainer)<{ isQuickEditMode?: boolean }>(
  ({ theme, isQuickEditMode }) => ({
    ...(isQuickEditMode && {
      "& .MuiTableCell-root": {
        padding: "4px",
      },
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
  overflow: "hidden",
}));

export const PageWrapper = styled(Box)<BoxProps>(() => ({
  width: "100vw",
  height: "100%",
  display: "flex",
  flexDirection: "row",
  overflow: "hidden",
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
    fontSize: "18px",
    transition: "all 0.3s ease",
    border: "none",
    "& [data-field='__detail_panel_toggle__']": {
      display: "none",
    },
    "& .MuiDataGrid-cell": {
      borderBottom: "none",
      borderRight: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    "& .MuiDataGrid-columnHeader": {
      borderBottom: "none",
      borderRight: "none",
      "&--last": {
        borderRight: `none`,
      },
    },
    "& .MuiDataGrid-columnSeparator": {
      display: "none",
    },
    "& .MuiDataGrid-row--even": {
      backgroundColor: "transparent",
    },
    "& .MuiDataGrid-row--odd": {
      backgroundColor: "#f0f7ff",
    },
    "& .MuiDataGrid-row": {
      borderBottom: "none",
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04) !important",
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
    backgroundColor: "transparent",
    borderBottom: "none",
    "& .MuiDataGrid-filler": {
      backgroundColor: "transparent",
      borderBottom: "none",
    },
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-columnHeaders": {
    backgroundColor: "transparent",
    color: "#000000",
    "& .MuiDataGrid-columnHeaderTitle": {
      color: "#000000",
      fontWeight: 700,
    },
    "& .MuiSvgIcon-root": {
      color: "#000000",
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
    fontSize: "1.1rem",
    fontWeight: 600,
    textAlign: "center",
  },
  "& .MuiDataGrid-iconButtonContainer": {
    marginLeft: "4px",
  },
  "& .MuiDataGrid-columnHeaderTitleContainer": {
    justifyContent: "center",
  },
  "& .MuiDataGrid-columnHeaderDraggableContainer": {
    justifyContent: "center",
  },
  "& .MuiDataGrid-row--even": {
    backgroundColor: "transparent",
  },
  "& .MuiDataGrid-row--odd": {
    backgroundColor: "transparent",
  },
  "& .MuiDataGrid-cell": {
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
  },
  "& .MuiDataGrid-cellContent": {
    width: "100%",
    textAlign: "center",
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
    transition: "all 0.2s ease",
    "&:hover": {
      boxShadow: "inset 0 0 0 1px #bdbdbd",
    },
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cell--non-editable-in-edit-mode": {
    backgroundColor: "transparent",
    color: "rgba(0, 0, 0, 0.38)",
    cursor: "not-allowed",
    opacity: 1,
    userSelect: "none",
    pointerEvents: "none",
    "& *": {
      pointerEvents: "none",
    },
  },
  "& .MuiDataGrid-scrollbar--vertical": {
    right: "0",
    left: "auto",
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
  "& .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-cell:focus-within": {
    outline: "none !important",
  },
  "& .MuiDataGrid-columnHeaderDraggableContainer:focus-within": {
    outline: "none !important",
  },
  "& .MuiDataGrid-sortIcon": {
    display: "none !important",
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
  },
}));

export const StyledDialogContent = styled(DialogContent)(() => ({
  textAlign: "center",
  padding: 0,
  paddingBottom: "32px",
  "& .MuiTypography-root": {
    fontSize: "1.3rem",
    lineHeight: 1.6,
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
  color: "#000000",
  fontSize: "1.2rem !important",
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
  color: "#666666",
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
  height: "100%",
}));

export const FormInfoContentBox = styled(Box)(() => ({
  maxWidth: "28vw",
  maxHeight: "15vh",
  overflowY: "auto",
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
}));

export const FormNameTypography = styled(Typography)(() => ({
  maxWidth: "400px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontWeight: 600,
}));

export const FormIdTypography = styled(Typography)(() => ({
  fontSize: "1.6rem !important",
}));

export const InfoIconButton = styled(IconButton)(() => ({
  marginLeft: "0px",
  marginRight: "8px",
  alignSelf: "center",
}));

export const FormNameInTooltipTypography = styled(Typography)(() => ({
  fontWeight: 600,
  marginBottom: "4px",
}));

export const FormDescriptionTypography = styled(Typography)(() => ({
  fontWeight: 300,
}));

export const formInfoTooltipSlotProps = {
  tooltip: {
    sx: {
      backgroundColor: "#ffffff",
      color: "#000000",
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
  color: "#d32f2f",
  fontWeight: 700,
}));

export const HeaderFlex = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: 6,
  position: "relative",
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
  color: "#d32f2f",
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
  color: "#6b7280",
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
});

export const PaginationContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
}));

export const FooterInfoContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  color: "#4a5568",
  fontSize: "0.875rem",
}));

export const PaginationButton = styled(IconButton)(({ theme }) => ({
  padding: "4px",
  backgroundColor: "transparent",
  border: "none",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  "&.Mui-disabled": {
    opacity: 0.3,
  },
  "& svg": {
    fontSize: "1.2rem",
    color: "#4a5568",
  },
}));

export const HighlightedText = styled("mark")({
  backgroundColor: "#fff59d",
  color: "inherit",
  padding: 0,
  borderRadius: "2px",
});
