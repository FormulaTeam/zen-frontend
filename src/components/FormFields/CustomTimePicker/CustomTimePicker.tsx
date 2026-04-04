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
  validationMessage?: string | null;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  isDisabled = false,
  onChangeHandler,
  isRequired,
  label,
  defaultValue,
  includeSeconds: showSeconds = false,
  isTabularEdit = false,
  validationMessage,
}) => {
  const [timeValue, setTimeValue] = useState<Dayjs | null>(null);
  const didApplyDefaultRef = useRef(false);

  useEffect(() => {
    if (typeof value === "string" && value.includes(":")) {
      const [hours, minutes, seconds] = value.split(":").map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      date.setSeconds(seconds ?? 0);
      setTimeValue(dayjs(date));
      return;
    }

    if (!didApplyDefaultRef.current && !value && defaultValue === 2) {
      const now = dayjs();
      didApplyDefaultRef.current = true;
      setTimeValue(now);
      return;
    }

    if (!value) {
      setTimeValue(null);
    }
  }, [value, defaultValue]);

  useEffect(() => {
    if (timeValue && timeValue.isValid()) {
      const hours = timeValue.hour().toString().padStart(2, "0");
      const minutes = timeValue.minute().toString().padStart(2, "0");
      let timeString = `${hours}:${minutes}`;

      if (showSeconds) {
        const seconds = timeValue.second().toString().padStart(2, "0");
        timeString = `${timeString}:${seconds}`;
      }

      onChangeHandler(timeString);
    } else if (!isRequired) {
      onChangeHandler("");
    }
  }, [timeValue, isRequired, showSeconds, onChangeHandler]);

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
            if (newValue?.isValid()) {
              setTimeValue(newValue);
            } else if (newValue === null) {
              setTimeValue(null);
              onChangeHandler("");
            }
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
