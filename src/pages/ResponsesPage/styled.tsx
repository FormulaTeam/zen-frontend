import Box, { BoxProps } from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { TableContainer as MuiTableContainer } from "@mui/material";

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
  flexDirection: "column",
  gap: theme.spacing(1),
  alignItems: "flex-start"
}));

export const MainContentWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  padding: "24px",
  maxWidth: "100%",
  maxHeight: "100%",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
}));

export const TopSection = styled(Box)<BoxProps>(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "40px",
}));

export const CenteredBox = styled(Box)<BoxProps>(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
}));

export const TitleWrapper = styled(Box)<BoxProps>(({ theme }) => ({
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

export const ContentContainer = styled(Box)<BoxProps>(({ theme }) => ({
  display: "flex",
  height: "calc(100vh - 400px)",
  maxHeight: "calc(100vh - 400px)",
  gap: 0,
}));

interface MainContentProps extends BoxProps {
  $sidePanelOpen?: boolean;
}

export const MainContent = styled(Box)<MainContentProps>(({ theme, $sidePanelOpen }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  transition: "margin-right 0.3s ease",
  minWidth: 0,
  overflow: "hidden",
}));

export const TableContainer = styled(Box)<BoxProps>(({ theme }) => ({
  flex: 1,
  overflow: "hidden",
}));

export const PageWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: "100vw",
  display: "flex",
  overflow: "hidden",
}));

interface LoadingBtnBoxProps extends BoxProps {
  $bgColor: string;
}

export const LoadingBtnBox = styled(Box)<LoadingBtnBoxProps>(({ theme, $bgColor }) => ({
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
      backgroundColor: "#e3f2fd !important",
    },
  },
  "& .MuiDataGrid-row--odd": {
    backgroundColor: "#ffffff",
    "&:hover": {
      backgroundColor: "#e3f2fd !important",
    },
  },
  "& .MuiDataGrid-cell": {
    textAlign: "right",
    fontSize: "21px",
  },
  "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
    outline: "none !important",
    boxShadow: "none",
  },
  "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": {
    outline: "none !important",
    boxShadow: "none",
  },
  "& .MuiDataGrid-cell.Mui-focusVisible, & .MuiDataGrid-columnHeader.Mui-focusVisible": {
    outline: "none !important",
    boxShadow: "none",
  },
  "& .MuiDataGrid-scrollbar--vertical": {
    right: "auto",
    left: "0",
  },
}));