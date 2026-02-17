import { Box, Button, FormControl, Select, Typography } from "@mui/material";
import styled from "styled-components";

export const Container = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
`;

export const ActionGroup = styled(Box)`
  display: flex;
  align-items: center;
`;

export const RightActions = styled(Box)`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const SmallRoundButton = styled(Button)<{ backgroundcolor?: string }>`
  padding: 8px;
  min-width: 0;
  height: 39px;
  width: 39px;
  cursor: pointer;
  &:not(:disabled) {
    ${({ backgroundcolor }) =>
      backgroundcolor ? `background-color: ${backgroundcolor} !important` : ""};
  }
  &:hover {
    ${({ backgroundcolor }) =>
      backgroundcolor ? `background-color: ${backgroundcolor}; filter: brightness(90%);` : ""}
  }
`;

export const StyledAddButton = styled(Button)`
  font-weight: 600;
`;

interface LoadingBtnBoxProps {
  bgcolor: string;
}

export const LoadingBtnBox = styled(Box)<LoadingBtnBoxProps>`
  background-color: ${({ bgcolor }) => bgcolor};
  width: 64px;
  height: 39px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// View Management Styled Components
export const ViewControlsContainer = styled(Box)`
  display: flex;
  justify-content: end;
  align-items: center;
  gap: 16px;
`;

export const StyledViewFormControl = styled(FormControl)`
  min-width: 350px;
`;

export const ViewDefaultBadge = styled(Box)`
  font-size: 0.75rem;
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
`;

export const ViewMenuItem = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ViewManageButton = styled(SmallRoundButton)`
  display: inline-flex;
  align-items: center;
  gap: 8px;

  width: auto;
  margin: 5px 0;
  padding: 6px 14px;

  font-size: 1rem;
  font-weight: 500;

  .MuiSvgIcon-root {
    font-size: 1.6rem;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const EmptyViewsState = styled(Box)`
  padding: 20px 18px;
  display: flex;
  margin: 0 auto;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

export const EmptyViewsTitle = styled(Box)`
  font-size: 1.6rem;
  font-weight: 700;
  color: #111827;
`;

export const EmptyViewsSubtitle = styled(Box)`
  font-size: 1.15rem;
  color: #6b7280;
  line-height: 1.5;
`;

export const CreateFirstViewButton = styled(Button)`
  margin-top: 10px;
  font-size: 1rem;
  font-weight: 800;
  border-radius: 999px;
  padding: 6px 18px;

  .MuiButton-endIcon,
  .MuiButton-startIcon {
    margin-inline-start: 8px;
    margin-inline-end: 8px;
  }

  &:hover {
    box-shadow: 0 10px 20px rgba(25, 118, 210, 0.45);
  }

  &:active {
    box-shadow: 0 4px 10px rgba(25, 118, 210, 0.3);
  }
`;
