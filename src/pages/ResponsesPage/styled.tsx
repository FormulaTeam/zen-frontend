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
  alignItems: "baseline",
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
    fontSize: "21px",
    transition: "all 0.3s ease",
    border: `1px solid ${theme.palette.grid?.border}`,
    "& [data-field='__detail_panel_toggle__']": {
      display: "none",
    },
    "& .MuiDataGrid-cell": {
      borderRight: `1px solid ${theme.palette.grid?.border}`,
      "&:nth-last-of-type(2)": {
        borderRight: "none",
      },
    },
    "& .MuiDataGrid-columnHeader": {
      borderRight: `1px solid ${theme.palette.grid?.border}`,
      borderBottom: `1px solid ${theme.palette.grid?.border}`,
      "&--last": {
        borderRight: `none`,
      },
    },
    "& .MuiDataGrid-row": {
      borderBottom: `1px solid ${theme.palette.grid?.border}`,
    },
  },
  "&.MuiDataGrid-root--edit-mode": {
    border: `3px solid ${theme.palette.grid?.editModeBorder}`,
    boxShadow: `0 0 0 2px ${theme.palette.grid?.editModeShadow}, 0 0 20px rgba(0, 0, 0, 0.12)`,
    overflow: "visible",
    "& .MuiDataGrid-cell, & .MuiDataGrid-columnHeader": {
      borderRight: "none",
      backgroundImage: `repeating-linear-gradient(to bottom, ${theme.palette.grid?.border} 0 2px, transparent 2px 10px)`,
      backgroundRepeat: "repeat-y",
      backgroundSize: "1px 100%",
      backgroundPosition: "left top",
    },
    "& .MuiDataGrid-row": {
      borderBottom: "none",
      backgroundImage: `repeating-linear-gradient(to right, ${theme.palette.grid?.border} 0 2px, transparent 2px 10px)`,
      backgroundRepeat: "repeat-x",
      backgroundSize: "100% 1px",
      backgroundPosition: "left bottom",
    },
    "& .MuiDataGrid-cell": {
      borderBottom: "none",
      backgroundImage: `repeating-linear-gradient(to bottom, ${theme.palette.grid?.border} 0 2px, transparent 2px 10px), repeating-linear-gradient(to right, ${theme.palette.grid?.border} 0 2px, transparent 2px 10px)`,
      backgroundRepeat: "repeat-y, repeat-x",
      backgroundSize: "1px 100%, 100% 1px",
      backgroundPosition: "left top, left bottom",
    },
    "& .MuiDataGrid-columnHeaders": {
      borderBottom: "none",
      backgroundImage: `repeating-linear-gradient(to right, ${theme.palette.grid?.border} 0 2px, transparent 2px 10px)`,
      backgroundRepeat: "repeat-x",
      backgroundSize: "100% 1px",
      backgroundPosition: "left bottom",
    },
    "& .MuiDataGrid-columnHeaderRow": {
      borderBottom: "none",
      backgroundImage: `repeating-linear-gradient(to right, ${theme.palette.grid?.border} 0 2px, transparent 2px 10px)`,
      backgroundRepeat: "repeat-x",
      backgroundSize: "100% 1px",
      backgroundPosition: "left bottom",
    },
    "& .MuiDataGrid-row--even:hover": {
      backgroundColor: theme.palette.grid?.rowEven,
    },
    "& .MuiDataGrid-row--odd:hover": {
      backgroundColor: theme.palette.grid?.rowOdd,
    },
    "& .cell--has-error": {
      outline: "2px solid #d32f2f !important",
      outlineOffset: "-2px",
    },
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: theme.palette.grid?.headerBackground,
    "& .MuiDataGrid-filler": {
      backgroundColor: theme.palette.grid?.headerBackground,
      borderBottom: `1px solid ${theme.palette.grid?.border}`,
    },
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-columnHeaders": {
    backgroundColor: theme.palette.grid?.headerBackground,
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
    backgroundColor: theme.palette.grid?.headerBackground,
    "&:hover": {
      backgroundColor: theme.palette.grid?.headerHover,
    },
  },
  "& .MuiDataGrid-columnSeparator": {
    left: "auto",
    opacity: 0,
  },
  "& .MuiDataGrid-columnHeader:hover .MuiDataGrid-columnSeparator": {
    opacity: 1,
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    width: "100%",
    fontSize: "1.2rem",
    fontWeight: 600,
  },
  "& .MuiDataGrid-columnHeaderTitleContainer": {
    justifyContent: "flex-start",
  },
  "& .MuiDataGrid-columnHeaderDraggableContainer": {
    justifyContent: "flex-start",
  },
  "& .MuiDataGrid-row--even": {
    backgroundColor: theme.palette.grid?.rowEven,
    "&:hover": {
      backgroundColor: theme.palette.grid?.rowHover,
    },
  },
  "& .MuiDataGrid-row--odd": {
    backgroundColor: theme.palette.grid?.rowOdd,
    "&:hover": {
      backgroundColor: theme.palette.grid?.rowHover,
    },
  },
  "& .MuiDataGrid-cell": {
    fontSize: "1.2rem",
    display: "flex",
    alignItems: "center",
  },
  "& .MuiDataGrid-cellContent": {
    width: "100%",
    textAlign: "start",
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
    boxShadow: `0 0 0 2px ${theme.palette.grid?.editModeBorder}`,
    backgroundColor: theme.palette.grid?.cellEditable,
  },
  "& .MuiDataGrid-cell--editing:focus, & .MuiDataGrid-cell--editing:focus-within": {
    outline: "none",
    boxShadow: `0 0 0 2px ${theme.palette.grid?.editModeBorder}`,
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cell.MuiDataGrid-cell--editable:focus, &.MuiDataGrid-root--edit-mode .MuiDataGrid-cell.MuiDataGrid-cell--editable:focus-within":
  {
    backgroundImage: "none",
    boxShadow: `inset 0 0 0 2px ${theme.palette.grid?.editModeBorder}`,
    borderRadius: "4px",
    outline: "none",
    borderColor: "transparent",
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cell--editing": {
    backgroundImage: "none",
    boxShadow: `inset 0 0 0 2px ${theme.palette.grid?.editModeBorder}`,
    borderRadius: "4px",
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
    backgroundColor: theme.palette.grid?.cellEditable,
    border: "none",
    borderRadius: "4px",
    cursor: "text",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: theme.palette.grid?.cellEditable,
      boxShadow: "inset 0 1px 3px rgba(0,0,0,0.15)",
    },
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cell--non-editable-in-edit-mode": {
    backgroundColor: "transparent",
    color: theme.palette.grid?.cellNonEditable,
    cursor: "not-allowed",
    opacity: 1,
    userSelect: "none",
    pointerEvents: "none",
    "& *": {
      pointerEvents: "none",
    },
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cellCheckbox.MuiDataGrid-cell--non-editable-in-edit-mode":
  {
    pointerEvents: "auto",
    cursor: "pointer",
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cellCheckbox.MuiDataGrid-cell--non-editable-in-edit-mode *":
  {
    pointerEvents: "auto",
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cell[data-field='expand'].MuiDataGrid-cell--non-editable-in-edit-mode":
  {
    pointerEvents: "auto",
    cursor: "pointer",
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cell[data-field='expand'].MuiDataGrid-cell--non-editable-in-edit-mode *":
  {
    pointerEvents: "auto",
  },
  "& .MuiDataGrid-scrollbar--vertical": {
    right: "0",
    left: "auto",
  },
  "& .MuiDataGrid-row.Mui-selected": {
    backgroundColor: theme.palette.grid?.rowSelected,
    "&:hover": {
      backgroundColor: theme.palette.grid?.rowSelectedHover,
    },
  },

  "& .MuiDataGrid-row.Mui-selected > .MuiDataGrid-cell": {
    backgroundColor: theme.palette.grid?.rowSelected,
  },
  "& .MuiDataGrid-row.Mui-selected:hover > .MuiDataGrid-cell": {
    backgroundColor: theme.palette.grid?.rowSelectedHover,
  },
  "& .MuiDataGrid-footerContainer": {
    flexDirection: "row-reverse",
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
  marginLeft: "8px",
  alignSelf: "flex-end",
  marginBottom: "6px",
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

export const CellErrorText = styled("span")({
  color: "#d32f2f",
  fontSize: "1rem",
  fontWeight: 500,
  lineHeight: 1.2,
  padding: "2px 8px 0",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  flexShrink: 0,
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
  gap: theme.spacing(1),
  backgroundColor: "#f5f7fa",
  padding: "4px 8px",
  borderRadius: "12px",
  border: "1px solid #e0e4e8",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
}));

export const FooterInfoContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  backgroundColor: "#f5f7fa",
  padding: "6px 12px",
  borderRadius: "12px",
  border: "1px solid #e0e4e8",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
}));

export const PaginationButton = styled(IconButton)(({ theme }) => ({
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  backgroundColor: "#ffffff",
  border: "1px solid #d1d9e0",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#edf2f7",
    borderColor: "#cbd5e0",
    transform: "translateY(-1px)",
  },
  "&.Mui-disabled": {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    opacity: 0.6,
  },
  "& svg": {
    fontSize: "1.25rem",
    color: "#4a5568",
  },
}));
