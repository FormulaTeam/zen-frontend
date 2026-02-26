import styled from "styled-components";
import { Box } from "@mui/material";

interface OpenProps {
  $isOpen: boolean;
}

export const SidePanelContainer = styled(Box) <OpenProps>`
  width: ${({ $isOpen }) => ($isOpen ? "450px" : "0")};
  min-width: ${({ $isOpen }) => ($isOpen ? "350px" : "0")};
  max-width: 90vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-left: ${({ $isOpen }) => ($isOpen ? "1px solid #e0e0e0" : "none")};
  background-color: #ffffff;
  box-shadow: ${({ $isOpen }) => ($isOpen ? "-2px 0 8px rgba(0, 0, 0, 0.1)" : "none")};
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.3s ease, min-width 0.3s ease, box-shadow 0.3s ease;
`;

export const SidePanelHeader = styled(Box) <OpenProps>`
  display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  min-height: 60px;
`;

export const SidePanelContent = styled(Box) <OpenProps>`
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
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
