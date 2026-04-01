import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import classes from "./CustomDateTime.module.scss";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";
import { Chrome90RTLFixContainer } from "../Chrome90RTLFix/Chrome90RTLFix";
import "dayjs/locale/he";

dayjs.extend(utc);

interface CustomDateTimeProps {
  value: string | null;
  defaultValue?: string;
  dateAndTime?: boolean;
  isTabularEdit?: boolean;
  label: string;
  isRequired: boolean;
  isDisabled?: boolean;
  onChangeHandler: (value: string) => void;
  validationMessage?: string | null;
}

const CustomDateTime: React.FC<CustomDateTimeProps> = ({
  value,
  isDisabled = false,
  onChangeHandler,
  isRequired,
  label,
  defaultValue,
  dateAndTime = false,
  isTabularEdit = false,
  validationMessage,
}) => {
  const [dateValue, setDateValue] = useState<Dayjs | null>(value ? dayjs(value) : null);

  useEffect(() => {
    if (value && dayjs(value).isValid()) {
      setDateValue(dayjs(value));
      return;
    }

    if (defaultValue === "currentTime" && value !== "") {
      let initDate = dayjs();
      if (!dateAndTime) {
        initDate = initDate.startOf("day");
      }
      setDateValue(initDate);
      onChangeHandler(initDate.format("YYYY-MM-DD[T]HH:mm:ss.000"));
      return;
    }

    setDateValue(null);
  }, [value, defaultValue, dateAndTime, onChangeHandler]);

  useEffect(() => {
    if (!dateValue?.isValid()) {
      return;
    }

    if (dateAndTime) {
      onChangeHandler(dateValue.format("YYYY-MM-DD[T]HH:mm:ss.000"));
      return;
    }

    onChangeHandler(dateValue.startOf("day").format("YYYY-MM-DD[T]00:00:00.000"));
  }, [dateValue, dateAndTime, onChangeHandler]);

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
                const newDateTime = newValue
                  .hour(newValue.hour())
                  .minute(newValue.minute())
                  .second(newValue.second());
                setDateValue(newDateTime);
                onChangeHandler(newDateTime.format("YYYY-MM-DD[T]HH:mm:ss.000"));
              } else {
                setDateValue(newValue);
                onChangeHandler(newValue.startOf("day").format("YYYY-MM-DD[T]00:00:00.000"));
              }
            } else {
              setDateValue(null);
              onChangeHandler("");
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
                const newDateTime = newValue
                  .hour(newValue.hour())
                  .minute(newValue.minute())
                  .second(newValue.second());
                setDateValue(newDateTime);
                onChangeHandler(newDateTime.format("YYYY-MM-DD[T]HH:mm:ss.000"));
              } else {
                const resetTime = dateValue?.startOf("day") ?? null;
                setDateValue(resetTime);
                onChangeHandler(resetTime ? resetTime.format("YYYY-MM-DD[T]00:00:00.000") : "");
              }
            }}
            slotProps={{
              textField: {
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
            ampm={false}
          />
        </LocalizationProvider>
      )}
    </Chrome90RTLFixContainer>
  );
};

export default CustomDateTime;
