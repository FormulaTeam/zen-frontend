import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, TextField } from "@mui/material";

import { LinkValue } from "../../../../utils/interfaces";

interface LinkCellEditorProps {
  value: LinkValue | string | null;
  onChange: (value: LinkValue, isValid?: boolean) => void;
  isRequired?: boolean;
  errorMessage?: string;
}

const toLinkValue = (value: LinkValue | string | null): LinkValue => {
  if (!value) {
    return {
      link: "",
      linkTxt: "",
    };
  }

  if (typeof value === "string") {
    return {
      link: value,
      linkTxt: "",
    };
  }

  return {
    link: value.link || "",
    linkTxt: value.linkTxt || "",
  };
};

const getInputSx = ({
  hasError,
  direction = "rtl",
}: {
  hasError: boolean;
  direction?: "rtl" | "ltr";
}) => ({
  "& .MuiInputBase-root": {
    minHeight: 40,
    borderRadius: "10px",
    border: "1px solid",
    borderColor: hasError ? "#d32f2f" : "#d7deea",
    backgroundColor: "#ffffff",
    padding: "0 10px",
    fontSize: "1rem",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",

    "&:hover": {
      borderColor: hasError ? "#d32f2f" : "#b8c4d6",
      backgroundColor: "#fbfcfe",
    },

    "&.Mui-focused": {
      borderColor: hasError ? "#d32f2f" : "#7c9cc9",
      boxShadow: hasError
        ? "0 0 0 3px rgba(211, 47, 47, 0.14)"
        : "0 0 0 3px rgba(124, 156, 201, 0.16)",
    },

    "&::before, &::after": {
      display: "none",
    },
  },

  "& .MuiInputBase-input": {
    padding: "7px 0 !important",
    fontSize: "1rem",
    direction,
    textAlign: direction === "rtl" ? "right" : "left",
  },
});

export const LinkCellEditor: React.FC<LinkCellEditorProps> = ({
  value,
  onChange,
  errorMessage,
}) => {
  const initialValue = useMemo(() => toLinkValue(value), [value]);

  const [url, setUrl] = useState(initialValue.link);
  const [linkText, setLinkText] = useState(initialValue.linkTxt);

  const urlInputRef = useRef<HTMLInputElement>(null);
  const linkTextInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const nextValue = toLinkValue(value);

    setUrl(nextValue.link);
    setLinkText(nextValue.linkTxt);
  }, [value]);

  const emitChange = (nextUrl: string, nextLinkText: string) => {
    onChange({
      link: nextUrl,
      linkTxt: nextLinkText,
    });
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = event.target.value;

    setUrl(newUrl);
    emitChange(newUrl, linkText);
  };

  const handleLinkTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLinkText = event.target.value;

    setLinkText(newLinkText);
    emitChange(url, newLinkText);
  };

  const handleUrlKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Tab" && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      linkTextInputRef.current?.focus();
    }
  };

  const handleLinkTextKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Tab" && event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      urlInputRef.current?.focus();
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto auto",
        gap: "8px",
        padding: "6px 8px",
        boxSizing: "border-box",
        direction: "rtl",
      }}>
      <TextField
        fullWidth
        placeholder="https://example.co.il"
        value={url}
        onChange={handleUrlChange}
        onKeyDown={handleUrlKeyDown}
        inputRef={urlInputRef}
        error={!!errorMessage}
        variant="standard"
        autoFocus
        slotProps={{
          input: {
            disableUnderline: true,
          },
        }}
        sx={getInputSx({
          hasError: !!errorMessage,
          direction: "ltr",
        })}
      />

      <TextField
        fullWidth
        placeholder="טקסט תצוגה"
        value={linkText}
        onChange={handleLinkTextChange}
        onKeyDown={handleLinkTextKeyDown}
        inputRef={linkTextInputRef}
        error={!!errorMessage}
        variant="standard"
        slotProps={{
          input: {
            disableUnderline: true,
          },
        }}
        sx={getInputSx({
          hasError: !!errorMessage,
          direction: "rtl",
        })}
      />
    </Box>
  );
};
