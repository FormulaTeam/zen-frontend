import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { useEffect, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import classes from "./CustomDateTime.module.scss";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";
import FieldErrorText from "../FieldErrorText/FieldErrorText";
import { Chrome90RTLFixContainer } from "../Chrome90RTLFix/Chrome90RTLFix";
import "dayjs/locale/he";

dayjs.extend(utc);
dayjs.extend(timezone);

const ISRAEL_TZ = "Asia/Jerusalem";

interface CustomDateTimeProps {
  value: string | null;
  defaultValue?: string;
  dateType?: "date" | "datetime";
  isTabularEdit?: boolean;
  label: string;
  isRequired: boolean;
  isDisabled?: boolean;
  onChangeHandler: (value: string) => void;
  onBlurHandler?: () => void;
  validationMessage?: string | null;
  validationDetail?: string | null;
}

const isCurrentDateDefault = (defaultValue?: string) =>
  defaultValue === "currentDate" || defaultValue === "currentDateTime";

const toIsraelDayjs = (value: string): Dayjs | null => {
  if (!value) return null;

  const parsed = dayjs.utc(value);
  if (!parsed.isValid()) return null;

  return parsed.tz(ISRAEL_TZ);
};

const toStoredUtcIso = (value: Dayjs, dateType?: string): string => {
  const isDateTime = dateType === "datetime";
  if (isDateTime) {
    return value.tz(ISRAEL_TZ, true).utc().format("YYYY-MM-DD[T]HH:mm:ss.000[Z]");
  }

  return value.tz(ISRAEL_TZ, true).startOf("day").utc().format("YYYY-MM-DD[T]HH:mm:ss.000[Z]");
};

const CustomDateTime: React.FC<CustomDateTimeProps> = ({
  value,
  isDisabled = false,
  onChangeHandler,
  onBlurHandler,
  isRequired,
  label,
  defaultValue,
  dateType = "date",
  isTabularEdit = false,
  validationMessage,
  validationDetail,
}) => {
  const [dateValue, setDateValue] = useState<Dayjs | null>(null);
  const didApplyDefaultRef = useRef(false);

  useEffect(() => {
    if (value) {
      setDateValue(toIsraelDayjs(value));
      return;
    }

    if (!didApplyDefaultRef.current && isCurrentDateDefault(defaultValue)) {
      const now = dayjs().tz(ISRAEL_TZ);
      const isDateTime = dateType === "datetime";
      const initialValue = isDateTime ? now : now.startOf("day");

      didApplyDefaultRef.current = true;
      setDateValue(initialValue);
      onChangeHandler(toStoredUtcIso(initialValue, dateType));
      return;
    }

    setDateValue(null);
  }, [value, defaultValue, dateType, onChangeHandler]);

  const isDateTime = dateType === "datetime";

  return (
    <Chrome90RTLFixContainer className={classes["custom-date-time-container"]}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
        <DatePicker
          label={isTabularEdit ? "" : label}
          key={label}
          disabled={isDisabled}
          value={dateValue}
          onChange={(newValue) => {
            if (newValue === null) {
              setDateValue(null);
              onChangeHandler("");
              return;
            }

            if (newValue.isValid()) {
              const nextValue = isDateTime ? newValue : newValue.startOf("day");
              setDateValue(nextValue);
              onChangeHandler(toStoredUtcIso(nextValue, dateType));
            }
          }}
          onClose={onBlurHandler}
          format="DD/MM/YYYY"
          slots={{
            textField: BaseFieldInput,
          }}
          slotProps={{
            textField: {
              isTabularEdit,
              required: isRequired,
              error: Boolean(validationMessage),
              helperText: <FieldErrorText message={validationMessage} detail={validationDetail} />,
              size: isTabularEdit ? "medium" : undefined,
              onBlur: onBlurHandler,
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

      {isDateTime && (
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
              if (newValue === null) {
                setDateValue(null);
                onChangeHandler("");
                return;
              }

              if (newValue.isValid()) {
                setDateValue(newValue);
                onChangeHandler(toStoredUtcIso(newValue, "datetime"));
              }
            }}
            onClose={onBlurHandler}
            slotProps={{
              textField: {
                required: isRequired,
                error: Boolean(validationMessage),
                helperText: (
                  <FieldErrorText message={validationMessage} detail={validationDetail} />
                ),
                size: isTabularEdit ? "medium" : undefined,
                onBlur: onBlurHandler,
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
