import styled from "styled-components";

export const ListboxContainer = styled.div`
  position: relative;
  width: 100%;
  max-height: 280px;
  overflow: hidden;
`;

export const ScrollableListbox = styled.ul`
  max-height: 280px;
  overflow-y: scroll !important;
  overflow-x: hidden;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none !important;
  }
`;

export const ScrollbarTrack = styled.div`
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 0;
  width: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  box-sizing: border-box;
  background-color: #ffffff;
  cursor: default;
`;

export const ScrollbarThumb = styled.div<{
  $top: number;
  $height: number;
  $hovered: boolean;
  $dragging: boolean;
}>`
  position: absolute;
  top: ${({ $top }) => `${$top}px`};
  left: 2px;
  width: 8px;
  height: ${({ $height }) => `${$height}px`};
  border-radius: 999px;
  background-color: ${({ $dragging, $hovered }) =>
    $dragging ? "#64748b" : $hovered ? "#94a3b8" : "#cbd5e1"};
  cursor: default;
  touch-action: none;
`;
