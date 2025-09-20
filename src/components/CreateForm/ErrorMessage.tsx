import Typography from "@mui/material/Typography";
import React from "react";

interface ErrorMessageProps {
  msg: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ msg }) => {
  return (
    <Typography
      variant="caption"
      color="error"
      sx={{ mt: 0.5, display: "block", fontSize: "14px" }}>
      {msg}
    </Typography>
  );
};

export default ErrorMessage;
