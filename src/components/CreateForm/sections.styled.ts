import Box from "@mui/material/Box";
import styled from "styled-components";

export const SectionContainer = styled.div<{
  empty: boolean;
  theme: any;
  $isDraggingOver: boolean;
  expanded: boolean;
  height?: number;
}>`
  height: ${({ height, expanded, $isDraggingOver }) =>
    height ? `${height}px` : expanded ? "60vh" : $isDraggingOver ? "40vh" : "30vh"};
  min-height: 200px;
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
  display: ${({ empty }) => (empty ? "grid" : "flex")};
  flex-direction: column;
  align-items: center;
  padding: 16px ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(2)};
  transition: height 0.2s ease, background-color 0.2s ease, border 0.2s ease;
  position: relative;
  scroll-behavior: smooth;

  /* Custom scrollbar styling for better UX */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  background-color: ${({ $isDraggingOver }) => ($isDraggingOver ? "#f0f0f0" : "transparent")};
  border: ${({ $isDraggingOver }) => ($isDraggingOver ? "2px dashed #1976d2" : "none")};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  gap: 16px;
`;

export const EmptyMessageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  height: 25vh;
`;

export const ResizeHandle = styled.div`
  position: sticky;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ns-resize;
  padding: 4px 0;
  z-index: 2;
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ActionsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const FieldsColumn = styled(Box)`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
