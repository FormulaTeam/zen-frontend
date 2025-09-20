import React from "react";
import { Box, Button } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

interface ConnectedFormHeaderProps {
  formsLength: number;
  index: number;
  onDelete: () => void;
  viewMode?: boolean;
}

const HeaderContainer = styled(Box)`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ResponseLabel = styled(Box)`
  font-weight: 500;
`;

const DeleteButton = styled(Button)<{ $color: string; $hoverColor: string }>`
  border-color: ${({ $color }) => $color};
  color: ${({ $color }) => $color};
  align-self: center;

  &:hover {
    border-color: ${({ $hoverColor }) => $hoverColor};
    color: ${({ $hoverColor }) => $hoverColor};
  }
`;

const ConnectedFormHeader: React.FC<ConnectedFormHeaderProps> = ({
  formsLength,
  index,
  onDelete,
  viewMode,
}) => {
  const theme = useTheme();

  return (
    <HeaderContainer>
      <ResponseLabel>{formsLength > 1 ? `#תגובה ${index + 1}` : ""}</ResponseLabel>
      {!viewMode && (
        <DeleteButton
          $hoverColor={theme.palette.error.dark}
          $color={theme.palette.error.main}
          variant="outlined"
          size="small"
          onClick={onDelete}>
          מחיקה
        </DeleteButton>
      )}
    </HeaderContainer>
  );
};

export default ConnectedFormHeader;
