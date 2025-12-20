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
        padding: "4px !important",
      },
      "& .MuiTableRow-root:hover": {
        backgroundColor: "#f5f5f5 !important",
      },
      "& .cell-error": {
        backgroundColor: "#ffebee !important",
        borderColor: "#f44336 !important",
      },
      "& .cell-edited": {
        backgroundColor: "#e8f5e8 !important",
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
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#e3f2fd"
  },
  "& .MuiDataGrid-columnHeader": {
    textAlign: "right",
    backgroundColor: "#e3f2fd",
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
    outline: "none !important",
    boxShadow: "none !important",
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
    outline: "none !important",
    boxShadow: "none !important",
  },
  "& .MuiDataGrid-cell--editing:focus, & .MuiDataGrid-cell--editing:focus-within": {
    outline: "none",
    boxShadow: "none",
  },
  "& .MuiDataGrid-scrollbar--vertical": {
    right: "auto",
    left: "0",
  },
  "&:has(.MuiDataGrid-row--editing) .MuiDataGrid-row:not(.MuiDataGrid-row--editing)": {
    opacity: 0.6,
    pointerEvents: "none",
  },
  "& .MuiDataGrid-row.Mui-selected": {
    backgroundColor: "#e0e0e0 !important",
    "&:hover": {
      backgroundColor: "#d5d5d5 !important",
    },
  },
  "& .MuiDataGrid-row--editing": {
    outline: "2px solid #373737ff",
    outlineOffset: "0px",
    backgroundColor: "#ffffff !important",
    opacity: 1,
    "&:hover": {
      backgroundColor: "#ffffff !important",
    },
    "& .MuiDataGrid-cell": {
      backgroundColor: "transparent",
    },
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