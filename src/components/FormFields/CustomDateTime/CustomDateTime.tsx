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
const APP_PRIMARY_SOFT_BORDER = "rgba(30, 136, 229, 0.2)";
const APP_PRIMARY_SHADOW = "0px 4px 20.4px 0px rgba(25, 118, 210, 0.1)";

const DATE_TIME_PICKER_WIDTH = "500px";
const DATE_ONLY_PICKER_WIDTH = "340px";
const DATE_PANEL_WIDTH = "340px";
const TIME_PANEL_WIDTH = "160px";
const TIME_COLUMN_WIDTH = "56px";
const TIME_ITEM_WIDTH = "46px";

type DateOnlyView = "day" | "month" | "year";
type DateTimeView = "day" | "month" | "year" | "hours" | "minutes" | "seconds";

interface CustomDateTimeProps {
  value: string | null;
  defaultValue?: number;
  dateAndTime?: boolean;
  isTabularEdit?: boolean;
  label: string;
  isRequired: boolean;
  isDisabled?: boolean;
  onChangeHandler: (value: string) => void;
  onBlurHandler?: () => void;
  validationMessage?: string | null;
  validationDetail?: string | null;
}

const isCurrentDateDefault = (defaultValue?: number) => defaultValue === 2;

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
      minWidth: "58px",
      height: "28px",
      px: 1.25,
      borderRadius: "7px",
      fontWeight: 700,
      fontSize: "0.82rem",
      textTransform: "none",
      boxShadow: "none",
      color: active ? "#fff" : "#475569",
      backgroundColor: active ? APP_PRIMARY : "transparent",
      border: active ? "none" : `1px solid ${APP_PRIMARY_SOFT_BORDER}`,
      "&:hover": {
        boxShadow: "none",
        backgroundColor: active ? APP_PRIMARY_HOVER : APP_PRIMARY_SOFT,
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
        px: 1.5,
        pt: 1,
        pb: 0.75,
        borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
      }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 1,
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
            gap: 0.5,
            fontWeight: 700,
            fontSize: "0.98rem",
            color: "#0f172a",
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
              width: 30,
              height: 30,
              borderRadius: "8px",
              color: "#334155",
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: "rgba(15, 23, 42, 0.06)",
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
              width: 30,
              height: 30,
              borderRadius: "8px",
              color: "#334155",
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: "rgba(15, 23, 42, 0.06)",
              },
            }}>
            <ChevronRightRounded fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

const CustomDateTime: React.FC<CustomDateTimeProps> = ({
  value,
  isDisabled = false,
  onChangeHandler,
  onBlurHandler,
  isRequired,
  label,
  defaultValue,
  dateAndTime = false,
  isTabularEdit = false,
  validationMessage,
  validationDetail,
}) => {
  const [dateValue, setDateValue] = useState<Dayjs | null>(null);
  const [datePickerView, setDatePickerView] = useState<DateOnlyView>("day");
  const [dateTimePickerView, setDateTimePickerView] = useState<DateTimeView>("day");
  const didApplyDefaultRef = useRef(false);

  useEffect(() => {
    if (value) {
      setDateValue(toIsraelDayjs(value));
      return;
    }

    if (!didApplyDefaultRef.current && isCurrentDateDefault(defaultValue)) {
      const now = dayjs().tz(ISRAEL_TZ);
      const initialValue = dateAndTime ? now : now.startOf("day");

      didApplyDefaultRef.current = true;
      setDateValue(initialValue);
      onChangeHandler(toStoredUtcIso(initialValue, dateAndTime));
      return;
    }

    setDateValue(null);
  }, [value, defaultValue, dateAndTime, onChangeHandler]);

  const handlePickerChange = (newValue: Dayjs | null, shouldKeepTime: boolean) => {
    if (newValue === null) {
      setDateValue(null);
      onChangeHandler("");
      return;
    }

    if (!newValue.isValid()) return;

    const nextValue = shouldKeepTime ? newValue : newValue.startOf("day");

    setDateValue(nextValue);
    onChangeHandler(toStoredUtcIso(nextValue, shouldKeepTime));
  };

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
      fontSize: isTabularEdit ? "0.98rem" : "1.12rem",
      fontWeight: 500,
      color: "#0f172a",
    },

    "& .MuiPickersSectionList-root": {
      direction: "ltr !important",
      textAlign: "left !important",
      unicodeBidi: "plaintext",
      display: "flex !important",
      flexDirection: "row !important",
      justifyContent: "flex-start !important",
      fontSize: isTabularEdit ? "0.98rem" : "1.12rem",
    },

    "& .MuiPickersInputBase-sectionsContainer": {
      direction: "ltr !important",
      fontSize: isTabularEdit ? "0.98rem" : "1.12rem",
    },

    "& .MuiPickersSectionList-section": {
      direction: "ltr !important",
    },

    "& .MuiPickersSectionList-sectionContent": {
      direction: "ltr !important",
      unicodeBidi: "plaintext",
    },

    "& .MuiPickersSectionList-sectionSeparator": {
      direction: "ltr !important",
      unicodeBidi: "plaintext",
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

  const selectionButtonSx: SxProps<Theme> = {
    borderRadius: "9px",
    fontSize: "0.93rem",
    fontWeight: 600,
    color: "#334155",
    border: `1px solid ${APP_PRIMARY_SOFT_BORDER}`,
    backgroundColor: "#fff",
    transition: "all 140ms ease",

    "&:hover": {
      backgroundColor: APP_PRIMARY_SOFT,
      borderColor: APP_PRIMARY_SOFT_BORDER,
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
      backgroundColor: "transparent",
    },

    "& .MuiMonthCalendar-root": {
      paddingInline: "12px",
      paddingTop: "6px",
      paddingBottom: "10px",
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "8px 7px",
    },

    "& .MuiYearCalendar-root": {
      paddingInline: "12px",
      paddingTop: "6px",
      paddingBottom: "8px",
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
      fontSize: "0.84rem",
      fontWeight: 700,
      width: "36px",
      marginLeft: "4px",
      marginRight: "4px",
    },

    "& .MuiPickersDay-root": {
      width: "38px",
      height: "38px",
      marginLeft: "4px",
      marginRight: "4px",
      borderRadius: "10px",
      fontSize: "0.94rem",
      color: "#0f172a",
      transition: "background-color 140ms ease, transform 140ms ease",
    },

    "& .MuiPickersDay-root:hover": {
      backgroundColor: APP_PRIMARY_SOFT,
      transform: "translateY(-1px)",
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
      border: `1px solid ${APP_PRIMARY_SOFT_BORDER} !important`,
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
        overflow: "visible !important",
        borderRadius: "18px",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        background: "#ffffff",
        boxShadow: APP_PRIMARY_SHADOW,
      },

      "& .MuiPickersLayout-root": {
        direction: "ltr !important",
        width: `${DATE_TIME_PICKER_WIDTH} !important`,
        minWidth: `${DATE_TIME_PICKER_WIDTH} !important`,
        maxWidth: `${DATE_TIME_PICKER_WIDTH} !important`,
        backgroundColor: "transparent",
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
      },

      ...modernCalendarSx,

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
        padding: "8px 10px",
        borderLeft: "1px solid rgba(148, 163, 184, 0.22)",
        borderRight: "none",
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

  const dateTimeLayoutSlotProps = {
    sx: {
      "& .MuiPickersLayout-contentWrapper": {
        direction: "ltr !important",
        display: "flex !important",
        flexDirection: "row-reverse !important",
        width: `${DATE_TIME_PICKER_WIDTH} !important`,
        minWidth: `${DATE_TIME_PICKER_WIDTH} !important`,
        maxWidth: `${DATE_TIME_PICKER_WIDTH} !important`,
      },

      ...modernCalendarSx,

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

  const dateOnlyPopperSlotProps = {
    sx: {
      "& .MuiPaper-root": {
        width: `${DATE_ONLY_PICKER_WIDTH} !important`,
        minWidth: `${DATE_ONLY_PICKER_WIDTH} !important`,
        maxWidth: `${DATE_ONLY_PICKER_WIDTH} !important`,
        overflow: "visible !important",
        borderRadius: "18px",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        background: "#ffffff",
        boxShadow: APP_PRIMARY_SHADOW,
      },

      "& .MuiPickersLayout-root": {
        width: `${DATE_ONLY_PICKER_WIDTH} !important`,
        minWidth: `${DATE_ONLY_PICKER_WIDTH} !important`,
        maxWidth: `${DATE_ONLY_PICKER_WIDTH} !important`,
        backgroundColor: "transparent",
      },

      "& .MuiDateCalendar-root": {
        width: `${DATE_ONLY_PICKER_WIDTH} !important`,
        minWidth: `${DATE_ONLY_PICKER_WIDTH} !important`,
        maxWidth: `${DATE_ONLY_PICKER_WIDTH} !important`,
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
          {dateAndTime ? (
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
