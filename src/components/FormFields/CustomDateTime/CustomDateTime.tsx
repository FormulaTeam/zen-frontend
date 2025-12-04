import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import classes from "./CustomDateTime.module.scss";
import { CustomInputFormFieldProps } from "../../../utils/interfaces";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";
import { Chrome90RTLFixContainer } from "../Chrome90RTLFix/Chrome90RTLFix";
import "dayjs/locale/he";

dayjs.extend(utc);

interface CustomDateTimeProps extends CustomInputFormFieldProps {
  value: string | null;
  defaultValue?: string;
  dateAndTime?: boolean;
  isTabularEdit?: boolean;
}

const CustomDateTime: React.FC<CustomDateTimeProps> = ({
  value,
  isDisabled = false,
  isValid,
  onChangeHandler,
  isRequired,
  label,
  defaultValue,
  dateAndTime = false,
  isTabularEdit = false,
}) => {
  const [dateValue, setDateValue] = useState<Dayjs | null>(value ? dayjs(value) : null);
  useEffect(() => {
    if (value && dayjs(value).isValid()) {
      setDateValue(dayjs(value));
    } else if (defaultValue === "currentTime") {
      // If the value is an empty string, it means the field has been edited before
      // Can occur on edit the value like deleting it or when editing an empty value
      if (value === "") {
        setDateValue(null);
      } else {
        let initDate = dayjs();
        if (!dateAndTime) initDate = initDate.startOf("day");
        setDateValue(initDate);
        onChangeHandler(initDate.format("YYYY-MM-DD[T]HH:mm:ss.000"), true);
      }
    } else {
      setDateValue(null);
    }
  }, []);

  useEffect(() => {
    if (value && dayjs(value).isValid()) {
      setDateValue(dayjs(value));
    } else if (defaultValue === "currentTime") {
      // If the value is an empty string, it means the field has been edited before
      // Can occur on edit the value like deleting it or when editing an empty value
      if (value === "") {
        setDateValue(null);
      } else {
        let initDate = dayjs();
        if (!dateAndTime) initDate = initDate.startOf("day");
        setDateValue(initDate);
        onChangeHandler(initDate.format("YYYY-MM-DD[T]HH:mm:ss.000"), true);
      }
    } else {
      setDateValue(null);
    }
  }, [value, defaultValue]); // Watch for changes in `value` or `defaultValue`

  useEffect(() => {
    // Ensure both date and time are valid before merging

    if (dateAndTime) {
      if (dateValue?.isValid()) {
        onChangeHandler(dateValue.format("YYYY-MM-DD[T]HH:mm:ss.000"), true);
      }
    } else if (dateValue?.isValid()) {
      onChangeHandler(dateValue.startOf("day").format("YYYY-MM-DD[T]00:00:00.000"), true);
    }
  }, [dateValue]);

  return (
    <Chrome90RTLFixContainer className={classes["custom-date-time-container"]}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
        <DatePicker
          label={isTabularEdit ? "" : label}
          key={label}
          disabled={isDisabled}
          value={dateValue}
          onChange={(newValue) => {
            if (newValue?.isValid()) {
              if (dateAndTime) {
                const newTime = newValue
                  .hour(newValue.hour())
                  .minute(newValue.minute())
                  .second(newValue.second());
                setDateValue(newTime);

                onChangeHandler(newValue.format("YYYY-MM-DD[T]HH:mm:ss.000"), true);
              } else {
                setDateValue(newValue);
                onChangeHandler(newValue.format("YYYY-MM-DD[T]HH:mm:ss.000"), true);
              }
            } else {
              setDateValue(null);
              onChangeHandler("", !isRequired);
            }
          }}
          format="DD/MM/YYYY"
          slots={{
            textField: BaseFieldInput,
          }}
          slotProps={{
            textField: {
              isTabularEdit,
              required: isRequired,
              error: !isValid, // Show error style if there's an error
              helperText:
                !isValid && isRequired && dateValue !== null
                  ? "שדה זה הינו חובה"
                  : "יש להזין שעה בפורמט תקין", // Display error message
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
        />
      </LocalizationProvider>

      {dateAndTime && (
        <LocalizationProvider
          localeText={{
            okButtonLabel: "אישור",
          }}
          dateAdapter={AdapterDayjs}
          adapterLocale="he">
          <TimePicker
            label={"בחירת שעה"}
            slots={{
              textField: BaseFieldInput,
            }}
            key={"time"}
            disabled={isDisabled}
            value={dateValue}
            onChange={(newValue) => {
              if (newValue?.isValid()) {
                const newTime = newValue
                  .hour(newValue.hour())
                  .minute(newValue.minute())
                  .second(newValue.second());
                setDateValue(newTime);
                onChangeHandler(newTime.format("YYYY-MM-DD[T]HH:mm:ss.000"), true);
              } else {
                const resetTime = dateValue?.startOf("day");
                setDateValue(resetTime || null);
                onChangeHandler(resetTime || "", !isRequired);
              }
            }}
            slotProps={{
              textField: {
                required: isRequired,
                error: !isValid, // Show error style if there's an error
                helperText: !isValid
                  ? isRequired && "שדה זה הינו חובה"
                  : "יש להזין שעה בפורמט תקין",
                size: isTabularEdit ? "medium" : undefined,
              },
              inputAdornment: {
                sx: {
                  ".MuiIconButton-root": {
                    p: 0,
                  },
                },
              },
            }}
            ampm={false}
          />
        </LocalizationProvider>
      )}
    </Chrome90RTLFixContainer>
  );
};

export default CustomDateTime;
