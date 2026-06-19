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

const APP_PRIMARY = "#1E88E5";
const APP_PRIMARY_HOVER = "#1976D2";
const APP_PRIMARY_SOFT = "rgba(30, 136, 229, 0.08)";
const APP_BORDER = "rgba(148, 163, 184, 0.35)";
const APP_BORDER_SOFT = "rgba(148, 163, 184, 0.22)";
const APP_TEXT = "#0f172a";
const APP_MUTED_TEXT = "#475569";
const APP_PANEL = "#fbfdff";
const APP_SHADOW = "0 10px 28px rgba(15, 23, 42, 0.1)";

const TIME_PICKER_WIDTH = "236px";
const TIME_PICKER_SECONDS_WIDTH = "292px";
const TWO_SECTION_CLOCK_WIDTH = "124px";
const THREE_SECTION_CLOCK_WIDTH = "184px";
const TIME_COLUMN_WIDTH = "48px";
const TIME_ITEM_WIDTH = "42px";

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
    minHeight: "36px",
    height: "36px",
    borderRadius: "8px",
    border: "1px solid",
    borderColor: hasError ? "#d32f2f" : APP_BORDER,
    backgroundColor: "#fff",
    padding: "0 8px !important",
    fontSize: "0.95rem",
    color: APP_TEXT,
    boxShadow: "none",
    transition: "border-color 140ms ease, box-shadow 140ms ease, background-color 140ms ease",

    "&:hover": {
      borderColor: hasError ? "#d32f2f" : APP_PRIMARY,
      backgroundColor: "#fff",
    },

    "&.Mui-focused": {
      borderColor: hasError ? "#d32f2f" : APP_PRIMARY,
      boxShadow: hasError
        ? "0 0 0 2px rgba(211, 47, 47, 0.12)"
        : "0 0 0 3px rgba(30, 136, 229, 0.08)",
    },

    "&::before, &::after": {
      display: "none",
    },
  },

  "& .MuiInputBase-input": {
    width: "100%",
    minWidth: 0,
    padding: "6px 0 !important",
    fontSize: "0.95rem",
    lineHeight: 1.35,
    fontWeight: 400,
    direction: "ltr",
    textAlign: "right",
    color: APP_TEXT,
    letterSpacing: 0,
    overflow: "hidden",
    textOverflow: "clip",
  },

  "& .MuiInputAdornment-root": {
    display: "none",
  },
});

const actionBarSx = {
  width: "100%",
  display: "flex !important",
  direction: "ltr !important",
  flexDirection: "row !important",
  justifyContent: "center !important",
  alignItems: "center",
  gap: "8px",
  padding: "9px 10px !important",
  borderTop: `1px solid ${APP_BORDER_SOFT}`,
  backgroundColor: "#fff",
  boxSizing: "border-box",

  "& .MuiButton-root": {
    minWidth: "58px",
    height: "32px",
    borderRadius: "8px",
    padding: "0 11px",
    fontSize: "0.86rem",
    fontWeight: 700,
    textTransform: "none",
    border: `1px solid ${APP_BORDER_SOFT}`,
    backgroundColor: "#fff",
    color: "#334155",
    boxShadow: "none",
    transition: "background-color 140ms ease, border-color 140ms ease, color 140ms ease",
  },

  "& .MuiButton-root:hover": {
    backgroundColor: APP_PRIMARY_SOFT,
    borderColor: "rgba(30, 136, 229, 0.24)",
    boxShadow: "none",
  },

  "& .MuiButton-root:last-of-type": {
    backgroundColor: APP_PRIMARY,
    color: "#fff",
    borderColor: APP_PRIMARY,
  },

  "& .MuiButton-root:last-of-type:hover": {
    backgroundColor: APP_PRIMARY_HOVER,
    borderColor: APP_PRIMARY_HOVER,
  },
};

const getPickerSlotProps = (hasError: boolean, showSeconds: boolean) =>
  ({
    textField: {
      variant: "standard" as const,
      fullWidth: true,
      autoFocus: true,
      error: hasError,
      helperText: undefined,
      InputProps: {
        disableUnderline: true,
      },
      sx: getPickerInputSx(hasError),
    },
    popper: {
      placement: "bottom-start" as const,
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, 6],
          },
        },
      ],
      sx: {
        direction: "ltr !important",

        "& .MuiPaper-root": {
          width: `${showSeconds ? TIME_PICKER_SECONDS_WIDTH : TIME_PICKER_WIDTH} !important`,
          minWidth: `${showSeconds ? TIME_PICKER_SECONDS_WIDTH : TIME_PICKER_WIDTH} !important`,
          maxWidth: `${showSeconds ? TIME_PICKER_SECONDS_WIDTH : TIME_PICKER_WIDTH} !important`,
          overflow: "hidden !important",
          borderRadius: "10px",
          border: `1px solid ${APP_BORDER}`,
          backgroundColor: "#fff",
          boxShadow: APP_SHADOW,
          boxSizing: "border-box",
        },

        "& .MuiPickersLayout-root": {
          width: `${showSeconds ? TIME_PICKER_SECONDS_WIDTH : TIME_PICKER_WIDTH} !important`,
          minWidth: `${showSeconds ? TIME_PICKER_SECONDS_WIDTH : TIME_PICKER_WIDTH} !important`,
          maxWidth: `${showSeconds ? TIME_PICKER_SECONDS_WIDTH : TIME_PICKER_WIDTH} !important`,
          backgroundColor: "transparent",
          boxSizing: "border-box",
        },

        "& .MuiPickersLayout-contentWrapper": {
          backgroundColor: APP_PANEL,
        },

        "& .MuiMultiSectionDigitalClock-root": {
          direction: "ltr !important",
          display: "flex !important",
          flexDirection: "row-reverse !important",
          justifyContent: "center !important",
          alignItems: "stretch",
          gap: "8px",
          width: `${showSeconds ? THREE_SECTION_CLOCK_WIDTH : TWO_SECTION_CLOCK_WIDTH} !important`,
          minWidth: `${showSeconds ? THREE_SECTION_CLOCK_WIDTH : TWO_SECTION_CLOCK_WIDTH} !important`,
          maxWidth: `${showSeconds ? THREE_SECTION_CLOCK_WIDTH : TWO_SECTION_CLOCK_WIDTH} !important`,
          margin: "0 auto",
          boxSizing: "border-box",
          padding: "8px 6px",
          backgroundColor: APP_PANEL,
        },

        "& .MuiMultiSectionDigitalClockSection-root": {
          width: `${TIME_COLUMN_WIDTH} !important`,
          minWidth: `${TIME_COLUMN_WIDTH} !important`,
          maxWidth: `${TIME_COLUMN_WIDTH} !important`,
          flex: `0 0 ${TIME_COLUMN_WIDTH} !important`,
          padding: "3px 0 !important",
          margin: "0 !important",
          borderLeft: "none !important",
          borderRight: "none !important",
          scrollbarWidth: "none",
          scrollPaddingBlock: "0 !important",
          overscrollBehavior: "contain",
        },

        "& .MuiMultiSectionDigitalClockSection-root::-webkit-scrollbar": {
          display: "none",
        },

        "& .MuiMultiSectionDigitalClockSection-root::before, & .MuiMultiSectionDigitalClockSection-root::after":
          {
            display: "none !important",
            height: "0 !important",
            minHeight: "0 !important",
            maxHeight: "0 !important",
            content: '""" !important"',
          },

        "& .MuiMultiSectionDigitalClockSection-item": {
          width: `${TIME_ITEM_WIDTH} !important`,
          minWidth: `${TIME_ITEM_WIDTH} !important`,
          maxWidth: `${TIME_ITEM_WIDTH} !important`,
          height: "30px",
          marginLeft: "auto !important",
          marginRight: "auto !important",
          borderRadius: "8px",
          justifyContent: "center !important",
          fontSize: "0.92rem",
          fontWeight: 700,
          color: APP_TEXT,
          transition: "background-color 140ms ease, color 140ms ease",
        },

        "& .MuiMultiSectionDigitalClockSection-item:hover": {
          backgroundColor: APP_PRIMARY_SOFT,
        },

        "& .MuiMultiSectionDigitalClockSection-item.Mui-selected": {
          backgroundColor: `${APP_PRIMARY} !important`,
          color: "#fff",
          fontWeight: 800,
          boxShadow: "none",
        },

        "& .MuiMultiSectionDigitalClockSection-item.Mui-selected:hover": {
          backgroundColor: `${APP_PRIMARY_HOVER} !important`,
        },

        "& .MuiPickersLayout-actionBar": {
          display: "flex !important",
          width: "100% !important",
        },

        "& .MuiPickersActionBar-root, & .MuiDialogActions-root": {
          ...actionBarSx,
        },
      },
    },
    actionBar: {
      actions: ["clear", "today", "accept"],
    },
    openPickerButton: {
      sx: {
        display: "none",
      },
    },
  }) as any;

const iconButtonSx = {
  width: 24,
  height: 24,
  color: APP_MUTED_TEXT,
  borderRadius: "8px",
  padding: 0,
  transition: "background-color 140ms ease, color 140ms ease",

  "&:hover": {
    backgroundColor: APP_PRIMARY_SOFT,
    color: APP_PRIMARY_HOVER,
  },

  "& .MuiSvgIcon-root": {
    fontSize: 17,
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

  const showSeconds = precision === timePrecision.Seconds;

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

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="he"
      localeText={{
        okButtonLabel: "אישור",
        clearButtonLabel: "ניקוי",
        todayButtonLabel: "עכשיו",
      }}>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          direction: "ltr",
          padding: "4px 6px",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 5,
        }}>
        <Box
          sx={{
            width: 26,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
            closeOnSelect={false}
            value={localValue}
            onChange={emitValue}
            format={showSeconds ? "HH:mm:ss" : "HH:mm"}
            ampm={false}
            views={showSeconds ? ["hours", "minutes", "seconds"] : ["hours", "minutes"]}
            slotProps={getPickerSlotProps(!!errorMessage, showSeconds)}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  );
};
