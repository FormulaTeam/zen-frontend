import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { useEffect, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { type SxProps, type Theme } from "@mui/material";
import { Chrome90RTLFixContainer } from "../Chrome90RTLFix/Chrome90RTLFix";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";
import FieldErrorText from "../FieldErrorText/FieldErrorText";
import "dayjs/locale/he";

dayjs.extend(utc);

const APP_PRIMARY = "#1E88E5";
const APP_PRIMARY_HOVER = "#1976D2";
const APP_PRIMARY_SOFT = "rgba(30, 136, 229, 0.08)";
const APP_BORDER = "rgba(148, 163, 184, 0.35)";
const APP_BORDER_SOFT = "rgba(148, 163, 184, 0.22)";
const APP_TEXT = "#0f172a";
const APP_MUTED_TEXT = "#475569";
const APP_PANEL = "#fbfdff";
const APP_SHADOW = "0 10px 28px rgba(15, 23, 42, 0.1)";

const TIME_PICKER_WIDTH = "236px";
const TIME_PICKER_SECONDS_WIDTH = "292px";
const TWO_SECTION_CLOCK_WIDTH = "124px";
const THREE_SECTION_CLOCK_WIDTH = "184px";
const TIME_COLUMN_WIDTH = "48px";
const TIME_ITEM_WIDTH = "42px";

interface CustomTimePickerProps {
  value: any;
  defaultValue?: string;
  timePrecision?: "minutes" | "seconds";
  isTabularEdit?: boolean;
  label: string;
  isRequired: boolean;
  isDisabled?: boolean;
  onChangeHandler: (value: string) => void;
  onBlurHandler?: () => void;
  validationMessage?: string | null;
  validationDetail?: string | null;
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

const formatDayjsToTimeString = (value: Dayjs, timePrecision?: string): string => {
  const showSeconds = timePrecision === "seconds";
  const hours = value.hour().toString().padStart(2, "0");
  const minutes = value.minute().toString().padStart(2, "0");

  if (!showSeconds) {
    return `${hours}:${minutes}`;
  }

  const seconds = value.second().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const getClosedInputTextSx = (isTabularEdit: boolean) => ({
  fontFamily: "inherit",
  fontSize: isTabularEdit ? "0.95rem" : "1rem",
  fontWeight: 400,
  lineHeight: 1.5,
  letterSpacing: 0,
});

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  isDisabled = false,
  onChangeHandler,
  onBlurHandler,
  isRequired,
  label,
  defaultValue,
  timePrecision = "minutes",
  isTabularEdit = false,
  validationMessage,
  validationDetail,
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

    if (!didApplyDefaultRef.current && !value && defaultValue === "currentTime") {
      const now = dayjs();

      didApplyDefaultRef.current = true;
      setTimeValue(now);
      onChangeHandler(formatDayjsToTimeString(now, timePrecision));
      return;
    }

    if (!value) {
      setTimeValue((prev) => (prev === null ? prev : null));
    }
  }, [value, defaultValue, timePrecision, onChangeHandler]);

  const showSeconds = timePrecision === "seconds";
  const pickerWidth = showSeconds ? TIME_PICKER_SECONDS_WIDTH : TIME_PICKER_WIDTH;
  const clockWidth = showSeconds ? THREE_SECTION_CLOCK_WIDTH : TWO_SECTION_CLOCK_WIDTH;
  const inputTextSx = getClosedInputTextSx(isTabularEdit);

  const triggerValidationOnce = () => {
    if (!didTriggerValidationRef.current) {
      didTriggerValidationRef.current = true;
      onBlurHandler?.();
    }
  };

  const inputWrapperSx: SxProps<Theme> = {
    width: "100%",

    "& .MuiInputBase-root": {
      borderRadius: "8px",
      backgroundColor: "#fff",
      paddingInline: "0.25rem",
      transition: "box-shadow 140ms ease",

      "::before": {
        border: "1px solid",
        borderColor: "input.border",
        borderRadius: "8px",
        top: 0,
      },

      "&.Mui-error::before": {
        borderColor: "error.main",
      },

      ":hover:not(.Mui-disabled, .Mui-error)::before": {
        borderRadius: "8px",
        borderBottom: `1px solid ${APP_PRIMARY}`,
      },

      "::after": {
        top: 0,
        borderRadius: "8px",
        borderBottom: `1px solid ${APP_PRIMARY}`,
      },
    },

    "& .MuiInputBase-root.Mui-focused": {
      boxShadow: "0 0 0 3px rgba(30, 136, 229, 0.08)",
    },

    "& .MuiInputBase-input": {
      direction: "ltr !important",
      textAlign: "right !important",
      unicodeBidi: "plaintext",
      ...inputTextSx,
      color: APP_TEXT,
    },

    "& .MuiPickersInputBase-root": {
      alignItems: "center !important",
    },

    "& .MuiPickersSectionList-root": {
      direction: "ltr !important",
      textAlign: "right !important",
      unicodeBidi: "plaintext",
      display: "flex !important",
      flexDirection: "row !important",
      justifyContent: "flex-end !important",
      alignItems: "center !important",
      width: "100%",
      height: "100%",
      ...inputTextSx,
    },

    "& .MuiPickersInputBase-sectionsContainer": {
      direction: "ltr !important",
      display: "flex !important",
      alignItems: "center !important",
      justifyContent: "flex-end !important",
      width: "100%",
      height: "100%",
      paddingBlock: "0 !important",
      ...inputTextSx,
    },

    "& .MuiPickersSectionList-section": {
      direction: "ltr !important",
      display: "inline-flex !important",
      alignItems: "center !important",
    },

    "& .MuiPickersSectionList-sectionContent": {
      direction: "ltr !important",
      unicodeBidi: "plaintext",
      display: "inline-flex !important",
      alignItems: "center !important",
      ...inputTextSx,
    },

    "& .MuiPickersSectionList-sectionSeparator": {
      direction: "ltr !important",
      unicodeBidi: "plaintext",
      display: "inline-flex !important",
      alignItems: "center !important",
      ...inputTextSx,
    },

    "& .MuiIconButton-root": {
      color: APP_MUTED_TEXT,
      borderRadius: "8px",
      transition: "background-color 140ms ease, color 140ms ease",
    },

    "& .MuiIconButton-root:hover": {
      backgroundColor: APP_PRIMARY_SOFT,
      color: APP_PRIMARY_HOVER,
    },

    "& .MuiFormHelperText-root": {
      marginRight: 0,
      marginTop: "8px",
      textAlign: "right !important",
    },
  };

  const actionBarSx: SxProps<Theme> = {
    width: "100%",
    display: "flex !important",
    direction: "ltr !important",
    flexDirection: "row !important",
    justifyContent: "center !important",
    alignItems: "center",
    gap: "8px",
    padding: "9px 10px !important",
    borderTop: `1px solid ${APP_BORDER_SOFT}`,
    backgroundColor: "#fff",
    boxSizing: "border-box",

    "& .MuiButton-root": {
      minWidth: "58px",
      height: "32px",
      borderRadius: "8px",
      padding: "0 11px",
      fontSize: "0.86rem",
      fontWeight: 700,
      textTransform: "none",
      border: `1px solid ${APP_BORDER_SOFT}`,
      backgroundColor: "#fff",
      color: "#334155",
      boxShadow: "none",
      transition: "background-color 140ms ease, border-color 140ms ease, color 140ms ease",
    },

    "& .MuiButton-root:hover": {
      backgroundColor: APP_PRIMARY_SOFT,
      borderColor: "rgba(30, 136, 229, 0.24)",
      boxShadow: "none",
    },

    "& .MuiButton-root:last-of-type": {
      backgroundColor: APP_PRIMARY,
      color: "#fff",
      borderColor: APP_PRIMARY,
    },

    "& .MuiButton-root:last-of-type:hover": {
      backgroundColor: APP_PRIMARY_HOVER,
      borderColor: APP_PRIMARY_HOVER,
    },
  };

  const timePopperSlotProps = {
    placement: "bottom-start" as const,
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 6],
        },
      },
      {
        name: "flip",
        enabled: false,
      },
    ],
    sx: {
      direction: "ltr !important",

      "& .MuiPaper-root": {
        width: `${pickerWidth} !important`,
        minWidth: `${pickerWidth} !important`,
        maxWidth: `${pickerWidth} !important`,
        overflow: "hidden !important",
        borderRadius: "10px",
        border: `1px solid ${APP_BORDER}`,
        backgroundColor: "#fff",
        boxShadow: APP_SHADOW,
        boxSizing: "border-box",
      },

      "& .MuiPickersLayout-root": {
        width: `${pickerWidth} !important`,
        minWidth: `${pickerWidth} !important`,
        maxWidth: `${pickerWidth} !important`,
        backgroundColor: "transparent",
        boxSizing: "border-box",
      },

      "& .MuiPickersLayout-contentWrapper": {
        backgroundColor: APP_PANEL,
      },

      "& .MuiMultiSectionDigitalClock-root": {
        direction: "ltr !important",
        display: "flex !important",
        flexDirection: "row-reverse !important",
        justifyContent: "center !important",
        alignItems: "stretch",
        gap: "8px",
        width: `${clockWidth} !important`,
        minWidth: `${clockWidth} !important`,
        maxWidth: `${clockWidth} !important`,
        margin: "0 auto",
        boxSizing: "border-box",
        padding: "8px 6px",
        backgroundColor: APP_PANEL,
      },

      "& .MuiMultiSectionDigitalClockSection-root": {
        width: `${TIME_COLUMN_WIDTH} !important`,
        minWidth: `${TIME_COLUMN_WIDTH} !important`,
        maxWidth: `${TIME_COLUMN_WIDTH} !important`,
        flex: `0 0 ${TIME_COLUMN_WIDTH} !important`,
        padding: "3px 0 !important",
        margin: "0 !important",
        borderLeft: "none !important",
        borderRight: "none !important",
        scrollbarWidth: "none",
        scrollPaddingBlock: "0 !important",
        overscrollBehavior: "contain",
      },

      "& .MuiMultiSectionDigitalClockSection-root::-webkit-scrollbar": {
        display: "none",
      },

      "& .MuiMultiSectionDigitalClockSection-root::before, & .MuiMultiSectionDigitalClockSection-root::after":
        {
          display: "none !important",
          height: "0 !important",
          minHeight: "0 !important",
          maxHeight: "0 !important",
          content: '""" !important"',
        },

      "& .MuiMultiSectionDigitalClockSection-item": {
        width: `${TIME_ITEM_WIDTH} !important`,
        minWidth: `${TIME_ITEM_WIDTH} !important`,
        maxWidth: `${TIME_ITEM_WIDTH} !important`,
        height: "30px",
        marginLeft: "auto !important",
        marginRight: "auto !important",
        borderRadius: "8px",
        justifyContent: "center !important",
        fontSize: "0.92rem",
        fontWeight: 700,
        color: APP_TEXT,
        transition: "background-color 140ms ease, color 140ms ease",
      },

      "& .MuiMultiSectionDigitalClockSection-item:hover": {
        backgroundColor: APP_PRIMARY_SOFT,
      },

      "& .MuiMultiSectionDigitalClockSection-item.Mui-selected": {
        backgroundColor: `${APP_PRIMARY} !important`,
        color: "#fff",
        fontWeight: 800,
      },

      "& .MuiMultiSectionDigitalClockSection-item.Mui-selected:hover": {
        backgroundColor: `${APP_PRIMARY_HOVER} !important`,
      },

      "& .MuiPickersLayout-actionBar": {
        display: "flex !important",
        width: "100% !important",
      },

      "& .MuiPickersActionBar-root, & .MuiDialogActions-root": {
        ...actionBarSx,
      },
    },
  };

  return (
    <Chrome90RTLFixContainer>
      <LocalizationProvider
        localeText={{
          okButtonLabel: "אישור",
          clearButtonLabel: "ניקוי",
          todayButtonLabel: "עכשיו",
        }}
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
              onChangeHandler(formatDayjsToTimeString(newValue, timePrecision));
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
          closeOnSelect={false}
          slots={{ textField: BaseFieldInput }}
          slotProps={{
            textField: {
              isTabularEdit,
              required: isRequired,
              error: Boolean(validationMessage),
              helperText: <FieldErrorText message={validationMessage} detail={validationDetail} />,
              size: isTabularEdit ? "medium" : undefined,
              sx: inputWrapperSx,
            } as any,
            popper: timePopperSlotProps,
            actionBar: {
              actions: ["clear", "today", "accept"],
            } as any,
            openPickerButton: {
              sx: {
                p: 0.25,
              },
            },
            inputAdornment: {
              sx: {
                ".MuiIconButton-root": {
                  p: 0.25,
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
