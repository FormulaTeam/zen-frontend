import React from "react";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { CardHeaderContainer } from "./ConnectedFormSection.styled";

interface ConnectedFormHeaderProps {
  formsLength: number;
  index: number;
  onDelete: () => void;
  viewMode?: boolean;
}

const ConnectedFormHeader: React.FC<ConnectedFormHeaderProps> = ({
  formsLength,
  index,
  onDelete,
  viewMode,
}) => {
  return (
    <CardHeaderContainer>
      <Typography sx={{ fontWeight: 700, color: "#333", fontSize: "1rem" }}>
        {formsLength > 1 ? `תגובה ${index + 1}` : ""}
      </Typography>
      {!viewMode && (
        <Tooltip title="מחיקה" arrow placement="top">
          <IconButton
            onClick={onDelete}
            size="small"
            sx={{
              color: "#666",
              background: "#f5f5f5",
              borderRadius: "6px",
              width: "32px",
              height: "32px",
              transition: "all 0.2s",
              "&:hover": {
                color: "#d32f2f",
                background: "#fff5f5",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </CardHeaderContainer>
  );
};

export default ConnectedFormHeader;
