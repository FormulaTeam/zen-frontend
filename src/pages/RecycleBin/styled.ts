import React from "react";
import { Typography, Box, Grid, Tab, Button } from "@mui/material";
import styled from "styled-components";
import { styled as muiStyled } from "@mui/material/styles";

export const Header = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 16px;
`;

export const LoadingBox = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export const EmptyMessage = styled(Typography)`
  text-align: center;
  margin-top: 16px;
`;

export const PageContainer = styled(Box) <{ $bgColor?: string }>`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 2%;
  background-color: ${(props) => props.$bgColor || "white"};
`;

export const FormsGrid = styled(Grid)`
  width: 100%;
  overflow-x: hidden;
  margin: 0 !important;
  height: 98%;
  max-height: calc(100vh - 250px);
  padding: 20px !important;
  padding-bottom: 10vh !important;
  overflow-y: scroll !important;
  position: relative;
  align-content: start;
`;

export const TopBar = muiStyled(Box)(({ theme }) => ({
  padding: "12px 24px",
  borderRadius: "12px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  backgroundColor: theme.palette.secondary.main,
  border: `1px solid ${theme.palette.divider}`,
}));

export const TopBarWrapper = styled(Box)`
  min-height: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
`;

export const FullWidthBox = styled.div`
  width: 100%;
`;

export const CustomTab = muiStyled(Tab)(() => ({
  fontSize: "20px",
}));

export const StyledToolbarInput = styled.input`
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 16px;
  font-weight: 500;
  font-family: "Heebo", sans-serif;
  color: #020618;
  padding: 0;
  direction: rtl;
  &::placeholder {
    color: #94a3b8;
  }
`;

export const ToolbarSearchContainer = muiStyled(Box)(({ theme }) => ({
  height: "36px",
  width: "192px",
  backgroundColor: theme.palette.background.paper,
  border: "1px solid #e2e8f0",
  borderRadius: "4px",
  display: "flex",
  alignItems: "center",
  padding: "0 12px",
  gap: "10px",
  boxSizing: "border-box",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    borderColor: "#cbd5e1",
    backgroundColor: theme.palette.action.hover,
  },
  "&:focus-within": {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
  },
}));

export const FilterButton = muiStyled(Button)(({ theme }) => ({
  height: "36px",
  backgroundColor: theme.palette.background.paper,
  border: "1px solid #e2e8f0",
  color: theme.palette.text.primary,
  textTransform: "none",
  borderRadius: "4px",
  fontSize: "9px",
  fontWeight: 500,
  fontFamily: "Heebo, sans-serif",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    borderColor: "#cbd5e1",
    boxShadow: "none",
  },
}));

