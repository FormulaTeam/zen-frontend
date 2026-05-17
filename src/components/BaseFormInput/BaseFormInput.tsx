import React from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";

const BaseFormInput: React.FC<TextFieldProps> = (props) => {
  return (
    <TextField
      {...props}
      slotProps={{
        ...props.slotProps,
        inputLabel: {
          ...props.slotProps?.inputLabel,
        },
      }}
      variant={props.variant || "standard"}
      sx={{
        ...props.sx,
        "& .MuiInputBase-root": {},
        "& .MuiFormHelperText-root": {
          textAlign: "right",
          ml: 0,
        },
      }}
      FormHelperTextProps={{
        sx: {
          textAlign: "right",
          ml: 0,
        },
      }}
    />
  );
};

export default BaseFormInput;
