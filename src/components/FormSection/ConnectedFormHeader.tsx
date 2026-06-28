import React from "react";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
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
        {formsLength > 1 ? `#תגובה ${index + 1}` : ""}
      </Typography>
      {!viewMode && (
        <Tooltip title="מחיקה" arrow placement="top">
          <IconButton
            onClick={onDelete}
            sx={{
              color: "#d32f2f",
              background: "#fff5f5",
              border: "1px solid #ffcdd2",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "0.8125rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              "&:hover": {
                background: "#ffebee",
              },
            }}>
            <DeleteIcon fontSize="small" />
            מחיקה
          </IconButton>
        </Tooltip>
      )}
    </CardHeaderContainer>
  );
};

export default ConnectedFormHeader;
