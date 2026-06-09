import React from "react";
import { Typography, Box, Grid, Tab } from "@mui/material";
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
  backgroundColor: theme.palette.primary.light + "20",
  border: `1px solid ${theme.palette.primary.light}`,
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

