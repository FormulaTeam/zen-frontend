import { Box, Button, IconButton, type SxProps, type Theme } from "@mui/material";
import { ChevronLeftRounded, ChevronRightRounded } from "@mui/icons-material";
import { DatePicker, DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
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

const APP_PRIMARY = "#1E88E5";
const APP_PRIMARY_HOVER = "#1976D2";
const APP_PRIMARY_SOFT = "rgba(30, 136, 229, 0.08)";
const APP_BORDER = "rgba(148, 163, 184, 0.35)";
const APP_BORDER_SOFT = "rgba(148, 163, 184, 0.22)";
const APP_TEXT = "#0f172a";
const APP_MUTED_TEXT = "#475569";
const APP_PANEL = "#fbfdff";
const APP_SHADOW = "0 10px 28px rgba(15, 23, 42, 0.1)";

const DATE_TIME_PICKER_WIDTH = "476px";
const DATE_ONLY_PICKER_WIDTH = "326px";
const DATE_PANEL_WIDTH = "320px";
const TIME_PANEL_WIDTH = "156px";
const TIME_COLUMN_WIDTH = "48px";
const TIME_ITEM_WIDTH = "42px";

type DateOnlyView = "day" | "month" | "year";
type DateTimeView = "day" | "month" | "year" | "hours" | "minutes" | "seconds";

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

const toStoredUtcIso = (value: Dayjs, dateType?: "date" | "datetime"): string => {
  const isDateTime = dateType === "datetime";

  if (isDateTime) {
    return value.tz(ISRAEL_TZ, true).utc().format("YYYY-MM-DD[T]HH:mm:ss.000[Z]");
  }

  return value.tz(ISRAEL_TZ, true).startOf("day").utc().format("YYYY-MM-DD[T]HH:mm:ss.000[Z]");
};

const HeaderModeButton = ({
  active,
  disabled,
  children,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    size="small"
    variant={active ? "contained" : "text"}
    sx={{
      minWidth: "50px",
      height: "28px",
      px: 1,
      borderRadius: "8px",
      fontWeight: 700,
      fontSize: "0.78rem",
      textTransform: "none",
      boxShadow: "none",
      color: active ? "#fff" : APP_MUTED_TEXT,
      backgroundColor: active ? APP_PRIMARY : "#fff",
      border: active ? `1px solid ${APP_PRIMARY}` : `1px solid ${APP_BORDER_SOFT}`,
      transition: "background-color 140ms ease, border-color 140ms ease, color 140ms ease",

      "&:hover": {
        boxShadow: "none",
        backgroundColor: active ? APP_PRIMARY_HOVER : APP_PRIMARY_SOFT,
        borderColor: active ? APP_PRIMARY_HOVER : "rgba(30, 136, 229, 0.24)",
      },
    }}>
    {children}
  </Button>
);

const CompactCalendarHeader = (props: any) => {
  const { currentMonth, month, onMonthChange, disabled, forcedView, setForcedView } = props ?? {};
  const activeDate: Dayjs = currentMonth ?? month ?? dayjs();
  const isYearMode = forcedView === "year";

  const monthLabel = activeDate.locale("he").format("MMMM");
  const yearLabel = activeDate.locale("he").format("YYYY");

  return (
    <Box
      sx={{
        px: 1,
        pt: 1,
        pb: 0.75,
        backgroundColor: "#fff",
        borderBottom: `1px solid ${APP_BORDER_SOFT}`,
      }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 0.75,
        }}>
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            justifySelf: "start",
          }}>
          <HeaderModeButton
            active={!isYearMode}
            disabled={disabled}
            onClick={() => setForcedView?.("month")}>
            חודש
          </HeaderModeButton>

          <HeaderModeButton
            active={isYearMode}
            disabled={disabled}
            onClick={() => setForcedView?.("year")}>
            שנה
          </HeaderModeButton>
        </Box>

        <Box
          sx={{
            justifySelf: "center",
            display: "flex",
            alignItems: "center",
            gap: 0.4,
            fontWeight: 700,
            fontSize: "0.9rem",
            color: APP_TEXT,
            userSelect: "none",
            whiteSpace: "nowrap",
          }}>
          <Box component="span">{monthLabel}</Box>
          <Box component="span" sx={{ color: "#94a3b8" }}>
            /
          </Box>
          <Box component="span">{yearLabel}</Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 0.25,
            justifySelf: "end",
          }}>
          <IconButton
            onClick={() => {
              if (disabled) return;
              onMonthChange?.(activeDate.add(1, "month"), "left");
            }}
            disabled={disabled}
            size="small"
            sx={{
              width: 28,
              height: 28,
              borderRadius: "8px",
              color: "#334155",
              backgroundColor: "#fff",
              border: `1px solid ${APP_BORDER_SOFT}`,

              "&:hover": {
                backgroundColor: APP_PRIMARY_SOFT,
                borderColor: "rgba(30, 136, 229, 0.24)",
              },
            }}>
            <ChevronLeftRounded fontSize="small" />
          </IconButton>

          <IconButton
            onClick={() => {
              if (disabled) return;
              onMonthChange?.(activeDate.subtract(1, "month"), "right");
            }}
            disabled={disabled}
            size="small"
            sx={{
              width: 28,
              height: 28,
              borderRadius: "8px",
              color: "#334155",
              backgroundColor: "#fff",
              border: `1px solid ${APP_BORDER_SOFT}`,

              "&:hover": {
                backgroundColor: APP_PRIMARY_SOFT,
                borderColor: "rgba(30, 136, 229, 0.24)",
              },
            }}>
            <ChevronRightRounded fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

const getClosedInputTextSx = (isTabularEdit: boolean) => ({
  fontFamily: "inherit",
  fontSize: isTabularEdit ? "0.95rem" : "1rem",
  fontWeight: 400,
  lineHeight: 1.5,
  letterSpacing: 0,
});

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
  const [datePickerView, setDatePickerView] = useState<DateOnlyView>("day");
  const [dateTimePickerView, setDateTimePickerView] = useState<DateTimeView>("day");
  const didApplyDefaultRef = useRef(false);

  const isDateTime = dateType === "datetime";

  useEffect(() => {
    if (value) {
      setDateValue(toIsraelDayjs(value));
      return;
    }

    if (!didApplyDefaultRef.current && isCurrentDateDefault(defaultValue)) {
      const now = dayjs().tz(ISRAEL_TZ);
      const initialValue = isDateTime ? now : now.startOf("day");

      didApplyDefaultRef.current = true;
      setDateValue(initialValue);
      onChangeHandler(toStoredUtcIso(initialValue, dateType));
      return;
    }

    setDateValue(null);
  }, [value, defaultValue, dateType, isDateTime, onChangeHandler]);

  const handlePickerChange = (newValue: Dayjs | null, shouldKeepTime: boolean) => {
    if (newValue === null) {
      setDateValue(null);
      onChangeHandler("");
      return;
    }

    if (!newValue.isValid()) return;

    const nextValue = shouldKeepTime ? newValue : newValue.startOf("day");

    setDateValue(nextValue);
    onChangeHandler(toStoredUtcIso(nextValue, shouldKeepTime ? "datetime" : "date"));
  };

  const inputTextSx = getClosedInputTextSx(isTabularEdit);

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
      textAlign: "left !important",
      unicodeBidi: "plaintext",
      color: APP_TEXT,
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
      textAlign: "right",
    },
  };

  const selectionButtonSx: SxProps<Theme> = {
    borderRadius: "8px",
    fontSize: "0.86rem",
    fontWeight: 700,
    color: "#334155",
    border: `1px solid ${APP_BORDER_SOFT}`,
    backgroundColor: "#fff",
    transition: "background-color 140ms ease, border-color 140ms ease, color 140ms ease",

    "&:hover": {
      backgroundColor: APP_PRIMARY_SOFT,
      borderColor: "rgba(30, 136, 229, 0.24)",
    },

    "&.Mui-selected": {
      backgroundColor: `${APP_PRIMARY} !important`,
      color: "#fff !important",
      borderColor: `${APP_PRIMARY} !important`,
      boxShadow: "none",
    },

    "&.Mui-selected:hover": {
      backgroundColor: `${APP_PRIMARY_HOVER} !important`,
    },
  };

  const modernCalendarSx: SxProps<Theme> = {
    "& .MuiDateCalendar-root": {
      direction: "rtl !important",
      width: `${DATE_PANEL_WIDTH} !important`,
      minWidth: `${DATE_PANEL_WIDTH} !important`,
      maxWidth: `${DATE_PANEL_WIDTH} !important`,
      flex: `0 0 ${DATE_PANEL_WIDTH} !important`,
      flexShrink: 0,
      margin: "0 auto",
      backgroundColor: APP_PANEL,
    },

    "& .MuiMonthCalendar-root": {
      paddingInline: "10px",
      paddingTop: "8px",
      paddingBottom: "10px",
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "7px",
      backgroundColor: APP_PANEL,
    },

    "& .MuiYearCalendar-root": {
      paddingInline: "10px",
      paddingTop: "8px",
      paddingBottom: "10px",
      backgroundColor: APP_PANEL,
    },

    "& .MuiDayCalendar-header": {
      direction: "rtl !important",
      justifyContent: "center",
      marginTop: "4px",
    },

    "& .MuiDayCalendar-weekContainer": {
      direction: "rtl !important",
      justifyContent: "center",
    },

    "& .MuiDayCalendar-weekDayLabel": {
      color: "#64748b",
      fontSize: "0.78rem",
      fontWeight: 700,
      width: "34px",
      marginLeft: "3px",
      marginRight: "3px",
    },

    "& .MuiPickersDay-root": {
      width: "34px",
      height: "34px",
      marginLeft: "3px",
      marginRight: "3px",
      borderRadius: "8px",
      fontSize: "0.86rem",
      fontWeight: 600,
      color: APP_TEXT,
      transition: "background-color 140ms ease, color 140ms ease",
    },

    "& .MuiPickersDay-root:hover": {
      backgroundColor: APP_PRIMARY_SOFT,
    },

    "& .MuiPickersDay-root.Mui-selected": {
      backgroundColor: `${APP_PRIMARY} !important`,
      color: "#fff",
      fontWeight: 700,
      boxShadow: "none",
    },

    "& .MuiPickersDay-root.Mui-selected:hover": {
      backgroundColor: `${APP_PRIMARY_HOVER} !important`,
    },

    "& .MuiPickersDay-today": {
      border: `1px solid rgba(30, 136, 229, 0.24) !important`,
      backgroundColor: APP_PRIMARY_SOFT,
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

  const timePanelSx: SxProps<Theme> = {
    "& .MuiMultiSectionDigitalClock-root": {
      direction: "ltr !important",
      display: "flex !important",
      flexDirection: "row-reverse !important",
      justifyContent: "center !important",
      alignItems: "stretch",
      gap: "8px",
      width: `${TIME_PANEL_WIDTH} !important`,
      minWidth: `${TIME_PANEL_WIDTH} !important`,
      maxWidth: `${TIME_PANEL_WIDTH} !important`,
      flex: `0 0 ${TIME_PANEL_WIDTH} !important`,
      flexShrink: 0,
      boxSizing: "border-box",
      padding: "8px 6px",
      borderLeft: `1px solid ${APP_BORDER_SOFT}`,
      borderRight: "none",
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
      boxShadow: "none",
    },

    "& .MuiMultiSectionDigitalClockSection-item.Mui-selected:hover": {
      backgroundColor: `${APP_PRIMARY_HOVER} !important`,
    },
  };

  const textFieldSlotProps = {
    isTabularEdit,
    required: isRequired,
    error: Boolean(validationMessage),
    helperText: <FieldErrorText message={validationMessage} detail={validationDetail} />,
    size: isTabularEdit ? "medium" : undefined,
    onBlur: onBlurHandler,
  } as any;

  const fieldSlotProps = {
    sx: inputWrapperSx,
  } as any;

  const commonActionBarSlotProps = {
    actions: ["clear", "today", "accept"],
  } as any;

  const dateTimePopperSlotProps = {
    sx: {
      "& .MuiPaper-root": {
        width: `${DATE_TIME_PICKER_WIDTH} !important`,
        minWidth: `${DATE_TIME_PICKER_WIDTH} !important`,
        maxWidth: `${DATE_TIME_PICKER_WIDTH} !important`,
        overflow: "hidden !important",
        borderRadius: "10px",
        border: `1px solid ${APP_BORDER}`,
        backgroundColor: "#fff",
        boxShadow: APP_SHADOW,
        boxSizing: "border-box",
      },

      "& .MuiPickersLayout-root": {
        direction: "ltr !important",
        width: `${DATE_TIME_PICKER_WIDTH} !important`,
        minWidth: `${DATE_TIME_PICKER_WIDTH} !important`,
        maxWidth: `${DATE_TIME_PICKER_WIDTH} !important`,
        backgroundColor: "transparent",
        boxSizing: "border-box",
      },

      "& .MuiPickersLayout-contentWrapper": {
        direction: "ltr !important",
        display: "flex !important",
        flexDirection: "row-reverse !important",
        alignItems: "stretch",
        justifyContent: "flex-start",
        width: `${DATE_TIME_PICKER_WIDTH} !important`,
        minWidth: `${DATE_TIME_PICKER_WIDTH} !important`,
        maxWidth: `${DATE_TIME_PICKER_WIDTH} !important`,
        backgroundColor: APP_PANEL,
      },

      ...modernCalendarSx,
      ...timePanelSx,

      "& .MuiPickersLayout-actionBar": {
        display: "flex !important",
        width: "100% !important",
      },

      "& .MuiPickersActionBar-root, & .MuiDialogActions-root": {
        ...actionBarSx,
      },
    },
  };

  const dateTimeLayoutSlotProps = {
    sx: {
      "& .MuiPickersLayout-contentWrapper": {
        direction: "ltr !important",
        display: "flex !important",
        flexDirection: "row-reverse !important",
        width: `${DATE_TIME_PICKER_WIDTH} !important`,
        minWidth: `${DATE_TIME_PICKER_WIDTH} !important`,
        maxWidth: `${DATE_TIME_PICKER_WIDTH} !important`,
        backgroundColor: APP_PANEL,
      },

      ...modernCalendarSx,
      ...timePanelSx,

      "& .MuiPickersLayout-actionBar": {
        display: "flex !important",
        width: "100% !important",
      },

      "& .MuiPickersActionBar-root, & .MuiDialogActions-root": {
        ...actionBarSx,
      },
    },
  };

  const dateOnlyPopperSlotProps = {
    sx: {
      "& .MuiPaper-root": {
        width: `${DATE_ONLY_PICKER_WIDTH} !important`,
        minWidth: `${DATE_ONLY_PICKER_WIDTH} !important`,
        maxWidth: `${DATE_ONLY_PICKER_WIDTH} !important`,
        overflow: "hidden !important",
        borderRadius: "10px",
        border: `1px solid ${APP_BORDER}`,
        backgroundColor: "#fff",
        boxShadow: APP_SHADOW,
        boxSizing: "border-box",
      },

      "& .MuiPickersLayout-root": {
        width: `${DATE_ONLY_PICKER_WIDTH} !important`,
        minWidth: `${DATE_ONLY_PICKER_WIDTH} !important`,
        maxWidth: `${DATE_ONLY_PICKER_WIDTH} !important`,
        backgroundColor: "transparent",
        boxSizing: "border-box",
      },

      "& .MuiPickersLayout-contentWrapper": {
        backgroundColor: APP_PANEL,
      },

      "& .MuiDateCalendar-root": {
        width: `${DATE_PANEL_WIDTH} !important`,
        minWidth: `${DATE_PANEL_WIDTH} !important`,
        maxWidth: `${DATE_PANEL_WIDTH} !important`,
        direction: "rtl !important",
      },

      ...modernCalendarSx,

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
    <Chrome90RTLFixContainer className={classes["custom-date-time-container"]}>
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale="he"
        localeText={{
          okButtonLabel: "אישור",
          cancelButtonLabel: "ביטול",
          clearButtonLabel: "ניקוי",
          todayButtonLabel: "היום",
        }}>
        <Box sx={inputWrapperSx}>
          {isDateTime ? (
            <DateTimePicker
              label={isTabularEdit ? "" : label}
              disabled={isDisabled}
              value={dateValue}
              onChange={(newValue) => handlePickerChange(newValue, true)}
              onClose={onBlurHandler}
              format="DD/MM/YYYY HH:mm"
              ampm={false}
              closeOnSelect={false}
              view={dateTimePickerView}
              onViewChange={(newView) => setDateTimePickerView(newView as DateTimeView)}
              timeSteps={{
                hours: 1,
                minutes: 1,
              }}
              views={["year", "month", "day", "hours", "minutes"]}
              slots={{
                textField: BaseFieldInput,
                calendarHeader: CompactCalendarHeader,
              }}
              slotProps={
                {
                  textField: textFieldSlotProps,
                  field: fieldSlotProps,
                  popper: dateTimePopperSlotProps,
                  layout: dateTimeLayoutSlotProps,
                  actionBar: commonActionBarSlotProps,
                  calendarHeader: {
                    forcedView: dateTimePickerView,
                    setForcedView: setDateTimePickerView,
                  },
                  monthButton: {
                    sx: selectionButtonSx,
                  },
                  yearButton: {
                    sx: selectionButtonSx,
                  },
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
                } as any
              }
            />
          ) : (
            <DatePicker
              label={isTabularEdit ? "" : label}
              disabled={isDisabled}
              value={dateValue}
              onChange={(newValue) => handlePickerChange(newValue, false)}
              onClose={onBlurHandler}
              format="DD/MM/YYYY"
              views={["year", "month", "day"]}
              closeOnSelect={false}
              view={datePickerView}
              onViewChange={(newView) => setDatePickerView(newView)}
              slots={{
                textField: BaseFieldInput,
                calendarHeader: CompactCalendarHeader,
              }}
              slotProps={
                {
                  textField: textFieldSlotProps,
                  field: fieldSlotProps,
                  popper: dateOnlyPopperSlotProps,
                  actionBar: commonActionBarSlotProps,
                  calendarHeader: {
                    forcedView: datePickerView,
                    setForcedView: setDatePickerView,
                  },
                  monthButton: {
                    sx: selectionButtonSx,
                  },
                  yearButton: {
                    sx: selectionButtonSx,
                  },
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
                } as any
              }
            />
          )}
        </Box>
      </LocalizationProvider>
    </Chrome90RTLFixContainer>
  );
};

export default CustomDateTime;
