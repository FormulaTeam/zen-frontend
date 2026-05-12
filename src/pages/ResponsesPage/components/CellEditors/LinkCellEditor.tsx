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

const linkInputSx = {
  "& .MuiInputBase-root": {
    minHeight: 38,
    borderRadius: "8px",
    border: "1px solid #d7deea",
    backgroundColor: "#ffffff",
    padding: "2px 10px",
    fontSize: "0.95rem",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",

    "&:hover": {
      borderColor: "#b8c4d6",
      backgroundColor: "#fbfcfe",
    },

    "&.Mui-focused": {
      borderColor: "#7c9cc9",
      boxShadow: "0 0 0 3px rgba(124, 156, 201, 0.14)",
    },

    "&::before, &::after": {
      display: "none",
    },
  },

  "& .MuiInputBase-input": {
    padding: "6px 0 !important",
  },
};

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
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
        padding: "6px 8px",
        boxSizing: "border-box",
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
        slotProps={{
          input: {
            disableUnderline: true,
          },
        }}
        sx={linkInputSx}
      />

      <TextField
        fullWidth
        placeholder="טקסט להיפר-קישור"
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
        sx={linkInputSx}
      />
    </Box>
  );
};
