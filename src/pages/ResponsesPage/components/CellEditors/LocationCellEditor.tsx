import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

import { LocationValue } from "@utils/interfaces";

const LocationEditorRoot = styled(Box)({
  width: "100%",
  height: "100%",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 6,
  padding: "4px 6px",
  boxSizing: "border-box",
  alignItems: "center",
});

const locationInputSx = {
  "& .MuiInputBase-root": {
    minHeight: 34,
    borderRadius: "8px",
    border: "1px solid #d7deea",
    backgroundColor: "#ffffff",
    padding: "0 8px",
    fontSize: "0.9rem",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",

    "&:hover": {
      borderColor: "#b8c4d6",
      backgroundColor: "#fbfcfe",
    },

    "&.Mui-focused": {
      borderColor: "#7c9cc9",
      boxShadow: "0 0 0 2px rgba(124, 156, 201, 0.14)",
    },

    "&::before, &::after": {
      display: "none",
    },
  },

  "& .MuiInputBase-input": {
    padding: "6px 0 !important",
    fontSize: "0.9rem",
  },
};

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

  const handleXChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextX = event.target.value;

    setX(nextX);

    onChange({
      x: nextX,
      y,
    });
  };

  const handleYChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextY = event.target.value;

    setY(nextY);

    onChange({
      x,
      y: nextY,
    });
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
      return axis === "x" ? "X (דוגמה: 200000)" : "Y (דוגמה: 500000)";
    }

    return axis === "x" ? "X (דוגמה: 34.8)" : "Y (דוגמה: 31.5)";
  };

  return (
    <LocationEditorRoot>
      <TextField
        fullWidth
        placeholder={getPlaceholder("x")}
        value={x}
        onChange={handleXChange}
        onKeyDown={handleXKeyDown}
        inputRef={xInputRef}
        error={!!errorMessage}
        variant="standard"
        slotProps={{
          input: {
            disableUnderline: true,
          },
        }}
        sx={locationInputSx}
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
        sx={locationInputSx}
      />
    </LocationEditorRoot>
  );
};
