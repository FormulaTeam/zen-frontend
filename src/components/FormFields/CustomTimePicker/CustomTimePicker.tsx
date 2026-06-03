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
const APP_PRIMARY_SOFT_BORDER = "rgba(30, 136, 229, 0.2)";
const APP_PRIMARY_SHADOW = "0px 4px 20.4px 0px rgba(25, 118, 210, 0.1)";

const TWO_SECTION_WIDTH = "160px";
const THREE_SECTION_WIDTH = "208px";
const TIME_COLUMN_WIDTH = "56px";
const TIME_ITEM_WIDTH = "46px";

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
  fontSize: isTabularEdit ? "0.98rem" : "1rem",
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

  const triggerValidationOnce = () => {
    if (!didTriggerValidationRef.current) {
      didTriggerValidationRef.current = true;
      onBlurHandler?.();
    }
  };

  const pickerWidth = showSeconds ? THREE_SECTION_WIDTH : TWO_SECTION_WIDTH;
  const inputTextSx = getClosedInputTextSx(isTabularEdit);

  const inputWrapperSx: SxProps<Theme> = {
    width: "100%",

    "& .MuiInputBase-root": {
      borderRadius: "12px",
      backgroundColor: "#fff",
      border: "1px solid rgba(148, 163, 184, 0.18)",
      boxShadow: "0 4px 10px rgba(15, 23, 42, 0.04)",
      transition: "border-color 140ms ease, box-shadow 140ms ease",
    },

    "& .MuiInputBase-root:hover": {
      borderColor: APP_PRIMARY_SOFT_BORDER,
      boxShadow: APP_PRIMARY_SHADOW,
    },

    "& .MuiInputBase-root.Mui-focused": {
      borderColor: "rgba(30, 136, 229, 0.34)",
      boxShadow: "0 0 0 3px rgba(30, 136, 229, 0.08)",
      backgroundColor: "#fff",
    },

    "& .MuiInputBase-input": {
      direction: "ltr !important",
      textAlign: "left !important",
      unicodeBidi: "plaintext",
      ...inputTextSx,
      color: "#0f172a",
    },

    "& .MuiPickersInputBase-root": {
      alignItems: "center !important",
    },

    "& .MuiPickersSectionList-root": {
      direction: "ltr !important",
      textAlign: "left !important",
      unicodeBidi: "plaintext",
      display: "flex !important",
      flexDirection: "row !important",
      justifyContent: "flex-start !important",
      alignItems: "center !important",
      height: "100%",
      ...inputTextSx,
    },

    "& .MuiPickersInputBase-sectionsContainer": {
      direction: "ltr !important",
      display: "flex !important",
      alignItems: "center !important",
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
      color: "#475569",
      borderRadius: "10px",
      transition: "background-color 140ms ease, color 140ms ease",
    },

    "& .MuiIconButton-root:hover": {
      backgroundColor: APP_PRIMARY_SOFT,
      color: APP_PRIMARY_HOVER,
    },

    "& .MuiFormHelperText-root": {
      marginRight: 0,
      marginTop: "8px",
      textAlign: "right",
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
    padding: "10px 16px !important",
    borderTop: "1px solid rgba(148, 163, 184, 0.16)",
    backgroundColor: "#fff",
    boxSizing: "border-box",

    "& .MuiButton-root": {
      minWidth: "68px",
      borderRadius: "8px",
      padding: "6px 13px",
      fontSize: "0.9rem",
      fontWeight: 600,
      textTransform: "none",
      border: "1px solid rgba(148, 163, 184, 0.2)",
      backgroundColor: "#fff",
      color: "#334155",
      boxShadow: "none",
      transition: "background-color 140ms ease, border-color 140ms ease",
    },

    "& .MuiButton-root:hover": {
      backgroundColor: APP_PRIMARY_SOFT,
      borderColor: APP_PRIMARY_SOFT_BORDER,
    },

    "& .MuiButton-root:last-of-type": {
      background: APP_PRIMARY,
      color: "#fff",
      border: "none",
      boxShadow: "none",
    },

    "& .MuiButton-root:last-of-type:hover": {
      background: APP_PRIMARY_HOVER,
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
        overflow: "visible !important",
        borderRadius: "18px",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        background: "#ffffff",
        boxShadow: APP_PRIMARY_SHADOW,
      },

      "& .MuiPickersLayout-root": {
        width: `${pickerWidth} !important`,
        minWidth: `${pickerWidth} !important`,
        maxWidth: `${pickerWidth} !important`,
        backgroundColor: "transparent",
      },

      "& .MuiMultiSectionDigitalClock-root": {
        direction: "ltr !important",
        display: "flex !important",
        flexDirection: "row-reverse !important",
        justifyContent: "center !important",
        alignItems: "stretch",
        gap: "8px",
        width: `${pickerWidth} !important`,
        minWidth: `${pickerWidth} !important`,
        maxWidth: `${pickerWidth} !important`,
        boxSizing: "border-box",
        padding: "8px 10px",
        background: "#f8fbff",
      },

      "& .MuiMultiSectionDigitalClockSection-root": {
        width: `${TIME_COLUMN_WIDTH} !important`,
        minWidth: `${TIME_COLUMN_WIDTH} !important`,
        maxWidth: `${TIME_COLUMN_WIDTH} !important`,
        flex: `0 0 ${TIME_COLUMN_WIDTH} !important`,
        padding: "4px 0 !important",
        margin: "0 !important",
        borderLeft: "none !important",
        borderRight: "none !important",
        scrollbarWidth: "none",
      },

      "& .MuiMultiSectionDigitalClockSection-root::-webkit-scrollbar": {
        display: "none",
      },

      "& .MuiMultiSectionDigitalClockSection-item": {
        width: `${TIME_ITEM_WIDTH} !important`,
        minWidth: `${TIME_ITEM_WIDTH} !important`,
        maxWidth: `${TIME_ITEM_WIDTH} !important`,
        height: "34px",
        marginLeft: "auto !important",
        marginRight: "auto !important",
        borderRadius: "9px",
        justifyContent: "center !important",
        fontSize: "0.98rem",
        fontWeight: 600,
        color: "#0f172a",
        transition: "background-color 140ms ease, transform 140ms ease",
      },

      "& .MuiMultiSectionDigitalClockSection-item:hover": {
        backgroundColor: APP_PRIMARY_SOFT,
        transform: "translateY(-1px)",
      },

      "& .MuiMultiSectionDigitalClockSection-item.Mui-selected": {
        backgroundColor: `${APP_PRIMARY} !important`,
        color: "#fff",
        fontWeight: 700,
        boxShadow: "none",
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
            } as any,
            field: {
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
