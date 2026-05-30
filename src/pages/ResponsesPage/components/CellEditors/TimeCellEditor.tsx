import React, { useEffect, useState } from "react";
import { Box, IconButton } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/he";

interface TimeCellEditorProps {
  value: string | null;
  onChange: (value: string, isValid?: boolean) => void;
  showSeconds?: boolean;
  isRequired?: boolean;
  errorMessage?: string;
}

const parseTimeToDayjs = (time: string | null): Dayjs | null => {
  if (!time) return null;

  const [hours, minutes, seconds = 0] = time.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    Number.isNaN(seconds) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  ) {
    return null;
  }

  return dayjs().hour(hours).minute(minutes).second(seconds).millisecond(0);
};

const getTimeInputSx = (hasError: boolean) => ({
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

const getTimePickerSlotProps = (hasError: boolean) => ({
  textField: {
    variant: "standard" as const,
    fullWidth: true,
    autoFocus: true,
    error: hasError,
    helperText: undefined,
    InputProps: {
      disableUnderline: true,
    },
    sx: getTimeInputSx(hasError),
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
  showSeconds = false,
  isRequired = false,
  errorMessage,
}) => {
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(() => parseTimeToDayjs(value));
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  useEffect(() => {
    setSelectedTime(parseTimeToDayjs(value));
  }, [value]);

  const handleTimeChange = (newTime: Dayjs | null) => {
    setSelectedTime(newTime);

    if (newTime && newTime.isValid()) {
      const timeFormat = showSeconds ? "HH:mm:ss" : "HH:mm";
      onChange(newTime.format(timeFormat), true);
      return;
    }

    onChange("", !isRequired);
  };

  const handleTimeMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleTimeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsTimePickerOpen(true);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateRows: "auto",
          gap: "8px",
          padding: "6px 8px",
          boxSizing: "border-box",
          alignItems: "center",
        }}>
        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: "4px",
            direction: "ltr",
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
              onMouseDown={handleTimeMouseDown}
              onClick={handleTimeClick}
              sx={iconButtonSx}>
              <AccessTimeIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TimePicker
              open={isTimePickerOpen}
              onOpen={() => setIsTimePickerOpen(true)}
              onClose={() => setIsTimePickerOpen(false)}
              value={selectedTime}
              onChange={handleTimeChange}
              format={showSeconds ? "HH:mm:ss" : "HH:mm"}
              ampm={false}
              views={showSeconds ? ["hours", "minutes", "seconds"] : ["hours", "minutes"]}
              slotProps={getTimePickerSlotProps(!!errorMessage)}
            />
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};
