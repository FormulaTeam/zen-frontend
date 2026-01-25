import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { CustomInputFormFieldProps } from "../../../utils/interfaces";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";
import { Chrome90RTLFixContainer } from "../Chrome90RTLFix/Chrome90RTLFix";
import "dayjs/locale/he";

dayjs.extend(utc);

interface CustomTimePickerProps extends CustomInputFormFieldProps {
  value: any;
  defaultValue?: string;
  showSeconds?: boolean;
  isTabularEdit?: boolean;
  touched?: boolean;
  onBlur?: () => void;
  errorMessage?: string;
}

const toDayjs = (value: any, defaultValue?: string): Dayjs | null => {
  if (value instanceof Date) return dayjs(value);

  if (typeof value === "string" && value.includes(":")) {
    const [hours, minutes, seconds] = value.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    if (seconds !== undefined) date.setSeconds(seconds);
    return dayjs(date);
  }

  if (defaultValue === "currentTime") return dayjs();
  return null;
};

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  isDisabled = false,
  isValid,
  onChangeHandler,
  isRequired,
  label,
  defaultValue,
  showSeconds = false,
  isTabularEdit = false,
  touched,
  onBlur,
  errorMessage,
}) => {
  const [timeValue, setTimeValue] = useState<Dayjs | null>(() => toDayjs(value, defaultValue));

  useEffect(() => {
    setTimeValue(toDayjs(value, defaultValue));
  }, [value, defaultValue]);

  const isOk = isValid === true;

  const showError =
    !!touched && ((isRequired && timeValue === null) || (timeValue !== null && !isOk));

  const helperText = useMemo(() => {
    if (!showError) return " ";
    return errorMessage || "שדה זה הינו חובה";
  }, [showError, errorMessage]);

  const commit = (e?: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.();

    const raw = e?.target?.value?.trim?.() ?? "";
    if (raw === "") {
      setTimeValue(null);
      onChangeHandler("", true);
      return;
    }

    if (timeValue && timeValue.isValid()) {
      const hours = timeValue.hour().toString().padStart(2, "0");
      const minutes = timeValue.minute().toString().padStart(2, "0");
      let timeString = `${hours}:${minutes}`;

      if (showSeconds) {
        const seconds = timeValue.second().toString().padStart(2, "0");
        timeString = `${timeString}:${seconds}`;
      }

      onChangeHandler(timeString, true);
    } else {
      onChangeHandler("", true);
    }
  };

  return (
    <Chrome90RTLFixContainer>
      <LocalizationProvider
        localeText={{ okButtonLabel: "אישור" }}
        dateAdapter={AdapterDayjs}
        adapterLocale="he">
        <TimePicker
          label={isTabularEdit ? "" : label}
          disabled={isDisabled}
          value={timeValue}
          onChange={(newValue) => {
            setTimeValue(newValue);
          }}
          onAccept={(newValue) => {
            setTimeValue(newValue ?? null);
            commit();
          }}
          slots={{ textField: BaseFieldInput }}
          slotProps={{
            textField: {
              isTabularEdit,
              required: isRequired,
              error: showError,
              helperText,
              size: isTabularEdit ? "medium" : undefined,
              onBlur: (e: any) => commit(e),
            } as any,
            inputAdornment: {
              sx: { ".MuiIconButton-root": { p: 0 } },
            },
          }}
          views={showSeconds ? ["hours", "minutes", "seconds"] : ["hours", "minutes"]}
          ampm={false}
        />
      </LocalizationProvider>
    </Chrome90RTLFixContainer>
  );
};

export default CustomTimePicker;
