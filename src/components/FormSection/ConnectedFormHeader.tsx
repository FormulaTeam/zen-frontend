import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { Delete as DeleteIcon } from "@mui/icons-material";

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
        <Tooltip title="מחיקה" arrow placement="top">
          <IconButton
            color="error"
            size="small"
            onClick={onDelete}
            sx={{
              alignSelf: "center",
              border: `1px solid ${theme.palette.error.main}`,
              borderRadius: "8px",
              padding: "6px",
              color: theme.palette.error.main,
              "&:hover": {
                borderColor: theme.palette.error.dark,
                color: theme.palette.error.dark,
                backgroundColor: "rgba(211, 47, 47, 0.04)",
              },
            }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </HeaderContainer>
  );
};

export default ConnectedFormHeader;
