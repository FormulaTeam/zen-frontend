import React, { useEffect, useState } from "react";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Box, IconButton } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/he";

import { timePrecision } from "formula-gear";

interface TimeCellEditorProps {
  value: string | null;
  onChange: (value: string, isValid?: boolean) => void;
  timePrecision?: "minutes" | "seconds";
  isRequired?: boolean;
  errorMessage?: string;
}

const parseTimeStringToDayjs = (value: unknown): Dayjs | null => {
  if (typeof value !== "string" || !value.includes(":")) {
    return null;
  }

  const [hours, minutes, seconds] = value.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    (seconds !== undefined && Number.isNaN(seconds))
  ) {
    return null;
  }

  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(seconds ?? 0);
  date.setMilliseconds(0);

  return dayjs(date);
};

const formatDayjsToTimeString = (value: Dayjs, precision: string): string => {
  const showSeconds = precision === timePrecision.Seconds;
  const hours = value.hour().toString().padStart(2, "0");
  const minutes = value.minute().toString().padStart(2, "0");

  if (!showSeconds) {
    return `${hours}:${minutes}`;
  }

  const seconds = value.second().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const getPickerInputSx = (hasError: boolean) => ({
  width: "100%",

  "& .MuiInputBase-root": {
    width: "100%",
    minHeight: 40,
    borderRadius: "10px",
    border: "1px solid",
    borderColor: hasError ? "#d32f2f" : "#d7deea",
    backgroundColor: "#ffffff",
    padding: "0 8px !important",
    fontSize: "1rem",
    color: "#0f172a",
    boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
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
    width: "100%",
    minWidth: 0,
    padding: "7px 0 !important",
    fontSize: "1rem",
    lineHeight: 1.3,
    fontWeight: 400,
    direction: "ltr",
    textAlign: "center",
    color: "#0f172a",
    letterSpacing: "-0.2px",
    overflow: "hidden",
    textOverflow: "clip",
  },

  "& .MuiInputAdornment-root": {
    display: "none",
  },
});

const getPickerSlotProps = (hasError: boolean, autoFocus = false) => ({
  textField: {
    variant: "standard" as const,
    fullWidth: true,
    autoFocus,
    error: hasError,
    helperText: undefined,
    InputProps: {
      disableUnderline: true,
    },
    sx: getPickerInputSx(hasError),
  },
  popper: {
    placement: "bottom-start" as const,
    sx: {
      "& .MuiPaper-root": {
        borderRadius: "12px",
        boxShadow: "0 12px 32px rgba(15, 23, 42, 0.12)",
      },
    },
  },
  openPickerButton: {
    sx: {
      display: "none",
    },
  },
});

const iconButtonSx = {
  width: 28,
  height: 28,
  color: "#64748b",
  borderRadius: "8px",
  padding: 0,

  "&:hover": {
    backgroundColor: "#eef4ff",
    color: "#334155",
  },

  "& .MuiSvgIcon-root": {
    fontSize: 18,
  },
};

export const TimeCellEditor: React.FC<TimeCellEditorProps> = ({
  value,
  onChange,
  timePrecision: precision = timePrecision.Minutes,
  isRequired = false,
  errorMessage,
}) => {
  const [localValue, setLocalValue] = useState<Dayjs | null>(() => parseTimeStringToDayjs(value));
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setLocalValue(parseTimeStringToDayjs(value));
  }, [value]);

  const emitValue = (nextValue: Dayjs | null) => {
    setLocalValue(nextValue);

    if (nextValue && nextValue.isValid()) {
      onChange(formatDayjsToTimeString(nextValue, precision), true);
      return;
    }

    onChange("", !isRequired);
  };

  const handleIconMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleIconClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen(true);
  };

  const showSeconds = precision === timePrecision.Seconds;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          direction: "ltr",
          padding: "6px 8px",
          boxSizing: "border-box",
        }}>
        <Box
          sx={{
            width: 30,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}>
          <IconButton
            size="small"
            onMouseDown={handleIconMouseDown}
            onClick={handleIconClick}
            sx={iconButtonSx}>
            <AccessTimeIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TimePicker
            open={isOpen}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            value={localValue}
            onChange={emitValue}
            format={showSeconds ? "HH:mm:ss" : "HH:mm"}
            ampm={false}
            views={showSeconds ? ["hours", "minutes", "seconds"] : ["hours", "minutes"]}
            slotProps={getPickerSlotProps(!!errorMessage, true)}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  );
};
