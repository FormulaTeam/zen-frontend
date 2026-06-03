import React, { useEffect, useState } from "react";
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Box, IconButton } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/he";

dayjs.extend(utc);
dayjs.extend(timezone);

const ISRAEL_TZ = "Asia/Jerusalem";

const toPickerValue = (value: string | null): Dayjs | null => {
  if (!value) return null;

  const parsedValue = dayjs.utc(value);

  return parsedValue.isValid() ? parsedValue.tz(ISRAEL_TZ) : null;
};

const toStoredUtcIso = (value: Dayjs, isDateTime: boolean): string => {
  const israelValue = value.tz(ISRAEL_TZ, true);
  const normalizedValue = isDateTime ? israelValue : israelValue.startOf("day");

  return normalizedValue.utc().format("YYYY-MM-DD[T]HH:mm:ss.000[Z]");
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

const PickerRow = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
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
      {icon}
    </Box>

    <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
  </Box>
);

interface DateCellEditorProps {
  value: string | null;
  onChange: (value: string, isValid?: boolean) => void;
  dateType?: "date" | "datetime";
  isRequired?: boolean;
  errorMessage?: string;
}

export const DateCellEditor: React.FC<DateCellEditorProps> = ({
  value,
  onChange,
  dateType = "date",
  isRequired = false,
  errorMessage,
}) => {
  const [localValue, setLocalValue] = useState<Dayjs | null>(() => toPickerValue(value));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  const isDateTime = dateType === "datetime";

  useEffect(() => {
    setLocalValue(toPickerValue(value));
  }, [value]);

  const emitValue = (nextValue: Dayjs | null) => {
    setLocalValue(nextValue);

    if (nextValue && nextValue.isValid()) {
      onChange(toStoredUtcIso(nextValue, isDateTime), true);
      return;
    }

    onChange("", !isRequired);
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    if (!newValue || !newValue.isValid()) {
      emitValue(null);
      return;
    }

    const nextValue =
      isDateTime && localValue && localValue.isValid()
        ? newValue.hour(localValue.hour()).minute(localValue.minute()).second(localValue.second())
        : newValue.startOf("day");

    emitValue(nextValue);
  };

  const handleTimeChange = (newValue: Dayjs | null) => {
    if (!newValue || !newValue.isValid()) {
      return;
    }

    const baseDate = localValue && localValue.isValid() ? localValue : dayjs().tz(ISRAEL_TZ);

    const updatedValue = baseDate
      .hour(newValue.hour())
      .minute(newValue.minute())
      .second(newValue.second())
      .millisecond(0);

    emitValue(updatedValue);
  };

  const handleIconMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDateIconClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDatePickerOpen(true);
  };

  const handleTimeIconClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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
          gridTemplateRows: isDateTime ? "auto auto" : "auto",
          gap: "8px",
          padding: "6px 8px",
          boxSizing: "border-box",
          alignItems: "center",
        }}>
        <PickerRow
          icon={
            <IconButton
              size="small"
              onMouseDown={handleIconMouseDown}
              onClick={handleDateIconClick}
              sx={iconButtonSx}>
              <CalendarMonthIcon fontSize="small" />
            </IconButton>
          }>
          <DatePicker
            open={isDatePickerOpen}
            onOpen={() => setIsDatePickerOpen(true)}
            onClose={() => setIsDatePickerOpen(false)}
            value={localValue}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
            slotProps={getPickerSlotProps(!!errorMessage, true)}
          />
        </PickerRow>

        {isDateTime && (
          <PickerRow
            icon={
              <IconButton
                size="small"
                onMouseDown={handleIconMouseDown}
                onClick={handleTimeIconClick}
                sx={iconButtonSx}>
                <AccessTimeIcon fontSize="small" />
              </IconButton>
            }>
            <TimePicker
              open={isTimePickerOpen}
              onOpen={() => setIsTimePickerOpen(true)}
              onClose={() => setIsTimePickerOpen(false)}
              value={localValue}
              onChange={handleTimeChange}
              format="HH:mm"
              ampm={false}
              views={["hours", "minutes"]}
              slotProps={getPickerSlotProps(!!errorMessage)}
            />
          </PickerRow>
        )}
      </Box>
    </LocalizationProvider>
  );
};

