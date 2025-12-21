import Box, { BoxProps } from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { DataGridPro } from "@mui/x-data-grid-pro";
import {
  TableContainer as MuiTableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  gap: theme.spacing(1),
  alignItems: "center"
}));

export const MainContentWrapper = styled(Box)<BoxProps>(() => ({
  padding: "24px",
  maxWidth: "100%",
  maxHeight: "100%",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
}));

export const TopSection = styled(Box)<BoxProps>(() => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "40px",
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
  gap: '12px'
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
  height: "calc(100vh - 400px)",
  maxHeight: "calc(100vh - 400px)",
  gap: 0,
}));

interface MainContentProps extends BoxProps {
  $sidePanelOpen?: boolean;
}

export const MainContent = styled(Box)<MainContentProps>(() => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  transition: "margin-right 0.3s ease",
  minWidth: 0,
  overflow: "hidden",
}));

export const TableContainer = styled(Box)<BoxProps>(() => ({
  flex: 1,
  overflow: "hidden",
}));

export const PageWrapper = styled(Box)<BoxProps>(() => ({
  width: "100vw",
  display: "flex",
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

export const StyledDataGrid = styled(DataGridPro)(() => ({
  "&.MuiDataGrid-root": {
    fontSize: "21px",
    transition: "all 0.3s ease",
  },
  "&.MuiDataGrid-root--edit-mode": {
    border: "3px solid #9e9e9e",
    boxShadow: "0 0 0 2px rgba(158, 158, 158, 0.35), 0 0 20px rgba(0, 0, 0, 0.12)",
    overflow: "visible",
    "& .MuiDataGrid-cell, & .MuiDataGrid-columnHeader": {
      borderRight: "none",
      backgroundImage:
        "repeating-linear-gradient(to bottom, rgba(189,189,189,0.9) 0 2px, transparent 2px 10px)",
      backgroundRepeat: "repeat-y",
      backgroundSize: "1px 100%",
      backgroundPosition: "left top",
    },
    "& .MuiDataGrid-row": {
      borderBottom: "none",
      backgroundImage:
        "repeating-linear-gradient(to right, rgba(189,189,189,0.9) 0 2px, transparent 2px 10px)",
      backgroundRepeat: "repeat-x",
      backgroundSize: "100% 1px",
      backgroundPosition: "left bottom",
    },
    "& .MuiDataGrid-cell": {
      borderBottom: "none",
      backgroundImage:
        "repeating-linear-gradient(to bottom, rgba(189,189,189,0.9) 0 2px, transparent 2px 10px), repeating-linear-gradient(to right, rgba(189,189,189,0.9) 0 2px, transparent 2px 10px)",
      backgroundRepeat: "repeat-y, repeat-x",
      backgroundSize: "1px 100%, 100% 1px",
      backgroundPosition: "left top, left bottom",
    },
    "& .MuiDataGrid-columnHeaders": {
      borderBottom: "none",
      backgroundImage:
        "repeating-linear-gradient(to right, rgba(189,189,189,0.9) 0 2px, transparent 2px 10px)",
      backgroundRepeat: "repeat-x",
      backgroundSize: "100% 1px",
      backgroundPosition: "left bottom",
    },
    "& .MuiDataGrid-columnHeaderRow": {
      borderBottom: "none",
      backgroundImage:
        "repeating-linear-gradient(to right, rgba(189,189,189,0.9) 0 2px, transparent 2px 10px)",
      backgroundRepeat: "repeat-x",
      backgroundSize: "100% 1px",
      backgroundPosition: "left bottom",
    },
    "& .MuiDataGrid-row--even:hover": {
      backgroundColor: "#fafafa",
    },
    "& .MuiDataGrid-row--odd:hover": {
      backgroundColor: "#ffffff",
    },
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#D5E6F6"
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-columnHeaders": {
    backgroundColor: "#D5E6F6",
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
    textAlign: "right",
    backgroundColor: "#D5E6F6",
    "&:hover": {
      backgroundColor: "#bbdefb",
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
    textAlign: "right",
    width: "100%",
    fontSize: "21px",
    fontWeight: 600,
  },
  "& .MuiDataGrid-row--even": {
    backgroundColor: "#fafafa",
    "&:hover": {
      backgroundColor: "#e3f2fd",
    },
  },
  "& .MuiDataGrid-row--odd": {
    backgroundColor: "#ffffff",
    "&:hover": {
      backgroundColor: "#e3f2fd",
    },
  },
  "& .MuiDataGrid-cell": {
    textAlign: "right",
    fontSize: "21px",
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
    boxShadow: "0 0 0 2px #9e9e9e",
    backgroundColor: "#ffffff",
  },
  "& .MuiDataGrid-cell--editing:focus, & .MuiDataGrid-cell--editing:focus-within": {
    outline: "none",
    boxShadow: "0 0 0 2px #9e9e9e",
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cell.MuiDataGrid-cell--editable:focus, &.MuiDataGrid-root--edit-mode .MuiDataGrid-cell.MuiDataGrid-cell--editable:focus-within": {
    backgroundImage: "none",
    boxShadow: "inset 0 0 0 2px #9e9e9e",
    borderRadius: "4px",
    outline: "none",
    borderColor: "transparent",
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cell--editing": {
    backgroundImage: "none",
    boxShadow: "inset 0 0 0 2px #9e9e9e",
    borderRadius: "4px",
    outline: "none",
    borderColor: "transparent",
  },

  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cell:focus::after, &.MuiDataGrid-root--edit-mode .MuiDataGrid-cell:focus-within::after": {
    display: "none",
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cell--editable": {
    backgroundColor: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "text",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#ffffff",
      boxShadow: "inset 0 1px 3px rgba(0,0,0,0.15)",
    },
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cell:not(.MuiDataGrid-cell--editable)": {
    cursor: "not-allowed",
    userSelect: "none",
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cell:not(.MuiDataGrid-cell--editable) *": {
    pointerEvents: "none",
    userSelect: "none",
  },
  "&.MuiDataGrid-root--edit-mode .MuiDataGrid-cell--non-editable-in-edit-mode": {
    backgroundColor: "transparent",
    color: "#d0d0d0",
    cursor: "not-allowed",
    opacity: 1,
    userSelect: "none",
  },
  "& .MuiDataGrid-scrollbar--vertical": {
    right: "auto",
    left: "0",
  },
  "& .MuiDataGrid-row.Mui-selected": {
    backgroundColor: "#e0e0e0",
    "&:hover": {
      backgroundColor: "#d5d5d5",
    },
  },

  "& .MuiDataGrid-row.Mui-selected > .MuiDataGrid-cell": {
    backgroundColor: "#e0e0e0",
  },
  "& .MuiDataGrid-row.Mui-selected:hover > .MuiDataGrid-cell": {
    backgroundColor: "#d5d5d5",
  },
}));

export const StyledCancelDialog = styled(Dialog)(() => ({
  "& .MuiDialog-paper": {
    padding: "30px",
    minWidth: "650px",
  },
}));

export const StyledDialogTitle = styled(DialogTitle)(() => ({
  padding: 0,
  paddingBottom: "20px",
  "& .MuiTypography-root": {
    fontSize: "2.2rem",
    fontWeight: 620,
  },
}));

export const StyledDialogContent = styled(DialogContent)(() => ({
  textAlign: "center",
  padding: 0,
  paddingBottom: "32px",
  "& .MuiTypography-root": {
    fontSize: "1.7rem",
    lineHeight: 1.6,
  },
}));

export const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  justifyContent: "center",
  gap: theme.spacing(2),
  padding: 0,
  "& .MuiButton-root": {
    fontSize: "1.3rem",
    padding: "12px 32px"
  },
}));

export const DialogTitleBox = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));