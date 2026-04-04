import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import classes from "./CustomDateTime.module.scss";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";
import { Chrome90RTLFixContainer } from "../Chrome90RTLFix/Chrome90RTLFix";
import "dayjs/locale/he";

dayjs.extend(utc);
dayjs.extend(timezone);

const ISRAEL_TZ = "Asia/Jerusalem";

interface CustomDateTimeProps {
  value: string | null;
  defaultValue?: number;
  dateAndTime?: boolean;
  isTabularEdit?: boolean;
  label: string;
  isRequired: boolean;
  isDisabled?: boolean;
  onChangeHandler: (value: string) => void;
  validationMessage?: string | null;
}

const isCurrentDateDefault = (defaultValue?: number) =>
  defaultValue === 2;

const toIsraelDayjs = (value: string): Dayjs | null => {
  if (!value) return null;

  const parsed = dayjs.utc(value);
  if (!parsed.isValid()) return null;

  return parsed.tz(ISRAEL_TZ);
};

const toStoredUtcIso = (value: Dayjs, dateAndTime: boolean): string => {
  if (dateAndTime) {
    return value.tz(ISRAEL_TZ, true).utc().format("YYYY-MM-DD[T]HH:mm:ss.000[Z]");
  }

  return value.tz(ISRAEL_TZ, true).startOf("day").utc().format("YYYY-MM-DD[T]HH:mm:ss.000[Z]");
};

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
  const [dateValue, setDateValue] = useState<Dayjs | null>(null);

  useEffect(() => {
    if (value) {
      const parsed = toIsraelDayjs(value);
      setDateValue(parsed);
      return;
    }

    if (isCurrentDateDefault(defaultValue)) {
      const initDate = dayjs().tz(ISRAEL_TZ);
      const normalized = dateAndTime ? initDate : initDate.startOf("day");

      setDateValue(normalized);
      onChangeHandler(toStoredUtcIso(normalized, dateAndTime));
      return;
    }

    setDateValue(null);
  }, [value, defaultValue, dateAndTime, onChangeHandler]);

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
              const nextValue = dateAndTime ? newValue : newValue.startOf("day");

              setDateValue(nextValue);
              onChangeHandler(toStoredUtcIso(nextValue, dateAndTime));
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
                const nextValue = newValue;
                setDateValue(nextValue);
                onChangeHandler(toStoredUtcIso(nextValue, true));
              } else {
                const resetTime = dateValue?.startOf("day") ?? null;
                setDateValue(resetTime);
                onChangeHandler(resetTime ? toStoredUtcIso(resetTime, true) : "");
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
