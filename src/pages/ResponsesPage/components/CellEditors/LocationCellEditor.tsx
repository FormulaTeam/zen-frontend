import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, TextField } from "@mui/material";

import { LocationValue } from "@utils/interfaces";

interface LocationCellEditorProps {
  value: LocationValue | string | null | undefined;
  onChange: (value: LocationValue, isValid?: boolean) => void;
  locationFormat?: string;
  isRequired?: boolean;
  errorMessage?: string;
}

const toLocationValue = (value: LocationCellEditorProps["value"]): LocationValue => {
  if (!value) {
    return {
      x: "",
      y: "",
    };
  }

  if (typeof value === "string") {
    const parts = value.split(",").map((part) => part.trim());

    if (parts.length === 2) {
      return {
        x: parts[0] ?? "",
        y: parts[1] ?? "",
      };
    }

    return {
      x: "",
      y: "",
    };
  }

  return {
    x: value.x === undefined || value.x === null ? "" : String(value.x),
    y: value.y === undefined || value.y === null ? "" : String(value.y),
  };
};

const getInputSx = ({
  hasError,
  direction = "ltr",
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
    color: "#0f172a",
  },
});

export const LocationCellEditor: React.FC<LocationCellEditorProps> = ({
  value,
  onChange,
  locationFormat = "WKT",
  errorMessage,
}) => {
  const normalizedValue = useMemo(() => toLocationValue(value), [value]);

  const [x, setX] = useState(normalizedValue.x || "");
  const [y, setY] = useState(normalizedValue.y || "");

  const xInputRef = useRef<HTMLInputElement>(null);
  const yInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const nextValue = toLocationValue(value);

    setX(nextValue.x || "");
    setY(nextValue.y || "");
  }, [value]);

  const emitChange = (nextX: string, nextY: string) => {
    onChange({
      x: nextX,
      y: nextY,
    });
  };

  const handleXChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextX = event.target.value;

    setX(nextX);
    emitChange(nextX, y);
  };

  const handleYChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextY = event.target.value;

    setY(nextY);
    emitChange(x, nextY);
  };

  const handleXKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Tab" && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      yInputRef.current?.focus();
    }
  };

  const handleYKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Tab" && event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      xInputRef.current?.focus();
    }
  };

  const getPlaceholder = (axis: "x" | "y") => {
    if (locationFormat === "UTM") {
      return axis === "x" ? "X (לדוגמה: 200000)" : "Y (לדוגמה: 500000)";
    }

    return axis === "x" ? "X (לדוגמה: 34.8)" : "Y (לדוגמה: 31.5)";
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
        placeholder={getPlaceholder("x")}
        value={x}
        onChange={handleXChange}
        onKeyDown={handleXKeyDown}
        inputRef={xInputRef}
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
        placeholder={getPlaceholder("y")}
        value={y}
        onChange={handleYChange}
        onKeyDown={handleYKeyDown}
        inputRef={yInputRef}
        error={!!errorMessage}
        variant="standard"
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
    </Box>
  );
};
