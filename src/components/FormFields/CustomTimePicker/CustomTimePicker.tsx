import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { useEffect, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { Chrome90RTLFixContainer } from "../Chrome90RTLFix/Chrome90RTLFix";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";
import "dayjs/locale/he";

dayjs.extend(utc);

interface CustomTimePickerProps {
  value: any;
  defaultValue?: number;
  includeSeconds?: boolean;
  isTabularEdit?: boolean;
  label: string;
  isRequired: boolean;
  isDisabled?: boolean;
  onChangeHandler: (value: string) => void;
  onBlurHandler?: () => void;
  validationMessage?: string | null;
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

const formatDayjsToTimeString = (value: Dayjs, showSeconds: boolean): string => {
  const hours = value.hour().toString().padStart(2, "0");
  const minutes = value.minute().toString().padStart(2, "0");

  if (!showSeconds) {
    return `${hours}:${minutes}`;
  }

  const seconds = value.second().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  isDisabled = false,
  onChangeHandler,
  onBlurHandler,
  isRequired,
  label,
  defaultValue,
  includeSeconds: showSeconds = false,
  isTabularEdit = false,
  validationMessage,
}) => {
  const [timeValue, setTimeValue] = useState<Dayjs | null>(null);
  const didApplyDefaultRef = useRef(false);
  const didTriggerValidationRef = useRef(false);

  useEffect(() => {
    const parsedValue = parseTimeStringToDayjs(value);

    if (parsedValue) {
      setTimeValue((prev) => {
        if (prev && prev.isValid() && prev.isSame(parsedValue, "second")) {
          return prev;
        }
        return parsedValue;
      });
      return;
    }

    if (!didApplyDefaultRef.current && !value && defaultValue === 2) {
      const now = dayjs();
      didApplyDefaultRef.current = true;
      setTimeValue(now);
      onChangeHandler(formatDayjsToTimeString(now, showSeconds));
      return;
    }

    if (!value) {
      setTimeValue((prev) => (prev === null ? prev : null));
    }
  }, [value, defaultValue, showSeconds, onChangeHandler]);

  const triggerValidationOnce = () => {
    if (!didTriggerValidationRef.current) {
      didTriggerValidationRef.current = true;
      onBlurHandler?.();
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
            didTriggerValidationRef.current = false;

            if (newValue?.isValid()) {
              setTimeValue(newValue);
              onChangeHandler(formatDayjsToTimeString(newValue, showSeconds));
              return;
            }

            if (newValue === null) {
              setTimeValue(null);
              onChangeHandler("");
            }
          }}
          onAccept={(acceptedValue) => {
            if (acceptedValue?.isValid() || acceptedValue === null) {
              triggerValidationOnce();
            }
          }}
          onClose={() => {
            triggerValidationOnce();
          }}
          slots={{ textField: BaseFieldInput }}
          slotProps={{
            textField: {
              isTabularEdit,
              required: isRequired,
              error: Boolean(validationMessage),
              helperText: validationMessage || " ",
              size: isTabularEdit ? "medium" : undefined,
            } as any,
            inputAdornment: {
              sx: {
                ".MuiIconButton-root": {
                  p: 0,
                },
              },
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
