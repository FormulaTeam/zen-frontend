import styled from "styled-components";
import Box, { BoxProps } from "@mui/material/Box";
import { styled as MuiStyled } from "@mui/material/styles";
import { Button, TableContainer as MuiTableContainer } from "@mui/material";

export const DetailsContainer = MuiStyled(Box)<BoxProps>(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "start",
  overflowY: "auto",
  width: "100%",
  gap: theme.spacing(1),
  padding: theme.spacing(2),
}));

export const MainContentWrapper = styled.div`
  padding: 24px;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

export const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

export const CenteredBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export const QuickEditTableContainer = MuiStyled(MuiTableContainer)<{ isQuickEditMode?: boolean }>(
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

export const ContentContainer = styled.div`
  display: flex;
  height: calc(100vh - 200px);
  gap: 0;
`;

export const MainContent = styled.div<{ $sidePanelOpen: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-right 0.3s ease;
  min-width: 0;
`;

export const TableContainer = styled.div`
  flex: 1;
  overflow: hidden;
`;

export const PageWrapper = MuiStyled(Box)<BoxProps>(({ theme }) => ({
  width: "100vw",
  display: "flex",
  overflow: "hidden",
}));
