import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { useEffect, useState } from "react";
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
}

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
}) => {
  const [timeValue, setTimeValue] = useState<Dayjs | null>(() => {
    if (value instanceof Date) {
      return dayjs(value);
    }
    if (typeof value === "string" && value.includes(":")) {
      const [hours, minutes, seconds] = value.split(":").map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      if (seconds !== undefined) {
        date.setSeconds(seconds);
      }
      return dayjs(date);
    }
    if (defaultValue === "currentTime") return dayjs();
    return null;
  });

  useEffect(() => {
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
      onChangeHandler("", !isRequired);
    }
  }, [timeValue, isRequired]);

  return (
    <Chrome90RTLFixContainer>
      <LocalizationProvider
        localeText={{
          okButtonLabel: "אישור",
        }}
        dateAdapter={AdapterDayjs}
        adapterLocale="he">
        <TimePicker
          label={isTabularEdit ? "" : label}
          disabled={isDisabled}
          value={timeValue}
          onChange={(newValue) => {
            if (newValue?.isValid()) {
              setTimeValue(newValue);
            } else {
              setTimeValue(null);
            }
          }}
          // Using the component directly prevents recreation each render and keeps a stable anchor element
          slots={{ textField: BaseFieldInput }}
          slotProps={{
            // Cast to any so we can pass custom prop isTabularEdit to our wrapped component
            textField: {
              isTabularEdit,
              required: isRequired,
              error: !isValid,
              helperText: !isValid ? isRequired && "שדה זה הינו חובה" :"יש להזין שעה בפורמט תקין",
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
