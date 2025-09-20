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
          sx: {
            right: 0,
            left: "unset",
            transformOrigin: "top right",
          },
        },
      }}
      variant={props.variant || "standard"}
      sx={{
        ...props.sx,
        "& .MuiInputBase-root": {},
        "& .MuiFormHelperText-root": {
          direction: "rtl",
          textAlign: "right",
          ml: 0,
        },
      }}
      FormHelperTextProps={{
        sx: {
          direction: "rtl",
          textAlign: "right",
          ml: 0,
        },
      }}
    />
  );
};

export default BaseFormInput;
