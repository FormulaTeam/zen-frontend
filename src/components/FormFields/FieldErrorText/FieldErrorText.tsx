import React from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Tooltip } from "@mui/material";

type FieldErrorTextProps = {
  message?: string | null;
  detail?: string | null;
  emptyText?: React.ReactNode;
};

const FieldErrorText: React.FC<FieldErrorTextProps> = ({ message, detail, emptyText = " " }) => {
  if (!message) {
    return <>{emptyText}</>;
  }

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        maxWidth: "100%",
      }}>
      <Box
        component="span"
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
        {message}
      </Box>

      {detail && (
        <Tooltip title={detail} arrow placement="top">
          <InfoOutlinedIcon
            tabIndex={0}
            sx={{
              fontSize: 14,
              color: "text.secondary",
              cursor: "help",
              flexShrink: 0,
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
};

export default FieldErrorText;
