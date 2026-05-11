import React, { useEffect, useState } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Box, styled } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/he";
import { TimePickerComponent } from "./TimePickerComponent";

dayjs.extend(utc);

const DateTimeContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  width: "100%",
});

const StyledDatePicker = styled(DatePicker<Dayjs>)({
  width: "100%",
  "& .MuiInputBase-root": {
    fontSize: "1.2rem",
    padding: "8px 12px",
    minHeight: "40px",
  },
});

const CompactDatePicker = styled(DatePicker<Dayjs>)({
  "& .MuiInputBase-root": {
    fontSize: "1.2rem",
    padding: "4px 8px",
    minHeight: "32px",
  },
});

const commonSlotProps = {
  textField: {
    variant: "standard" as const,
    fullWidth: true,
    autoFocus: true,
    InputProps: {
      disableUnderline: true,
    },
  },
  popper: {
    placement: "bottom-start" as const,
  },
};

interface DateCellEditorProps {
  value: string | null;
  onChange: (value: string, isValid?: boolean) => void;
  dateAndTime?: boolean;
  isRequired?: boolean;
  errorMessage?: string;
}

export const DateCellEditor: React.FC<DateCellEditorProps> = ({
  value,
  onChange,
  dateAndTime = false,
  isRequired = false,
  errorMessage,
}) => {
  const [localValue, setLocalValue] = useState<Dayjs | null>(
    value && dayjs(value).isValid() ? dayjs(value) : null,
  );

  useEffect(() => {
    setLocalValue(value && dayjs(value).isValid() ? dayjs(value) : null);
  }, [value]);

  const emitValue = (nextValue: Dayjs | null) => {
    setLocalValue(nextValue);

    if (nextValue && nextValue.isValid()) {
      onChange(nextValue.utc().toISOString(), true);
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
      dateAndTime && localValue && localValue.isValid()
        ? newValue.hour(localValue.hour()).minute(localValue.minute()).second(localValue.second())
        : newValue.startOf("day");

    emitValue(nextValue);
  };

  const handleTimeChange = (newValue: Dayjs | null) => {
    if (!newValue || !newValue.isValid()) {
      return;
    }

    const baseDate = localValue && localValue.isValid() ? localValue : dayjs();

    const updatedValue = baseDate
      .hour(newValue.hour())
      .minute(newValue.minute())
      .second(newValue.second());

    emitValue(updatedValue);
  };

  if (dateAndTime) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
        <DateTimeContainer>
          <CompactDatePicker
            value={localValue}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
            slotProps={{
              ...commonSlotProps,
              textField: {
                ...commonSlotProps.textField,
                error: !!errorMessage,
                helperText: undefined,
              },
            }}
          />

          <TimePickerComponent value={localValue} onChange={handleTimeChange} compact />
        </DateTimeContainer>
      </LocalizationProvider>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
      <StyledDatePicker
        value={localValue}
        onChange={handleDateChange}
        format="DD/MM/YYYY"
        slotProps={{
          ...commonSlotProps,
          textField: {
            ...commonSlotProps.textField,
            error: !!errorMessage,
            helperText: undefined,
          },
        }}
      />
    </LocalizationProvider>
  );
};
