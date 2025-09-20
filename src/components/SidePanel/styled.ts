import styled from "styled-components";
import { Box } from "@mui/material";

export const SidePanelContainer = styled(Box)`
  width: 450px;
  min-width: 350px;
  max-width: 90vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e0e0e0;
  background-color: #ffffff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
`;

export const SidePanelHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  min-height: 60px;
`;

export const SidePanelContent = styled(Box)`
  flex: 1;
  overflow-y: auto;
  padding: 0;
`;

export const SidePanelOverlay = styled(Box)`
  display: none;

  @media (max-width: 768px) {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1200;
  }
`;
