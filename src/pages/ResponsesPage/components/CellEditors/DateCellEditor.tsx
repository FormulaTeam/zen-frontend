import React, { useEffect, useState } from "react";
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Box, Button, IconButton } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { ChevronLeftRounded, ChevronRightRounded } from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/he";

import { dateType } from "formula-gear";

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

const DATE_ONLY_PICKER_WIDTH = "326px";
const DATE_PANEL_WIDTH = "320px";
const TIME_PICKER_WIDTH = "236px";
const TWO_SECTION_CLOCK_WIDTH = "124px";
const TIME_COLUMN_WIDTH = "48px";
const TIME_ITEM_WIDTH = "42px";

type DateOnlyView = "day" | "month" | "year";

interface DateCellEditorProps {
  value: string | null;
  onChange: (value: string, isValid?: boolean) => void;
  dateType?: "date" | "datetime";
  isRequired?: boolean;
  errorMessage?: string;
}

const toPickerValue = (value: string | null): Dayjs | null => {
  if (!value) return null;

  const parsedValue = dayjs.utc(value);

  return parsedValue.isValid() ? parsedValue.tz(ISRAEL_TZ) : null;
};

const toStoredUtcIso = (value: Dayjs, isDateTime: boolean): string => {
  const israelValue = value.tz(ISRAEL_TZ, true);
  const normalizedValue = isDateTime ? israelValue : israelValue.startOf("day");

  return normalizedValue.utc().format("YYYY-MM-DD[T]HH:mm:ss.000[Z]");
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

const getPickerInputSx = (hasError: boolean, textAlign: "left" | "right" | "center") => ({
  width: "100%",

  "& .MuiInputBase-root": {
    width: "100%",
    minHeight: "36px",
    height: "36px",
    borderRadius: "8px",
    border: "1px solid",
    borderColor: hasError ? "#d32f2f" : APP_BORDER,
    backgroundColor: "#fff",
    padding: "0 8px !important",
    fontSize: "0.95rem",
    color: APP_TEXT,
    boxShadow: "none",
    transition: "border-color 140ms ease, box-shadow 140ms ease, background-color 140ms ease",

    "&:hover": {
      borderColor: hasError ? "#d32f2f" : APP_PRIMARY,
      backgroundColor: "#fff",
    },

    "&.Mui-focused": {
      borderColor: hasError ? "#d32f2f" : APP_PRIMARY,
      boxShadow: hasError
        ? "0 0 0 2px rgba(211, 47, 47, 0.12)"
        : "0 0 0 3px rgba(30, 136, 229, 0.08)",
    },

    "&::before, &::after": {
      display: "none",
    },
  },

  "& .MuiInputBase-input": {
    width: "100%",
    minWidth: 0,
    padding: "6px 0 !important",
    fontSize: "0.95rem",
    lineHeight: 1.35,
    fontWeight: 400,
    direction: "ltr",
    textAlign,
    color: APP_TEXT,
    letterSpacing: 0,
    overflow: "hidden",
    textOverflow: "clip",
  },

  "& .MuiInputAdornment-root": {
    display: "none",
  },
});

const actionBarSx = {
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

const calendarSx = {
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

const timeClockSx = {
  "& .MuiMultiSectionDigitalClock-root": {
    direction: "ltr !important",
    display: "flex !important",
    flexDirection: "row-reverse !important",
    justifyContent: "center !important",
    alignItems: "stretch",
    gap: "8px",
    width: `${TWO_SECTION_CLOCK_WIDTH} !important`,
    minWidth: `${TWO_SECTION_CLOCK_WIDTH} !important`,
    maxWidth: `${TWO_SECTION_CLOCK_WIDTH} !important`,
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
    boxShadow: "none",
  },

  "& .MuiMultiSectionDigitalClockSection-item.Mui-selected:hover": {
    backgroundColor: `${APP_PRIMARY_HOVER} !important`,
  },
};

const getDatePickerSlotProps = (
  hasError: boolean,
  autoFocus: boolean,
  datePickerView: DateOnlyView,
  setDatePickerView: React.Dispatch<React.SetStateAction<DateOnlyView>>,
) =>
  ({
    textField: {
      variant: "standard" as const,
      fullWidth: true,
      autoFocus,
      error: hasError,
      helperText: undefined,
      InputProps: {
        disableUnderline: true,
      },
      sx: getPickerInputSx(hasError, "right"),
    },
    popper: {
      placement: "bottom-start" as const,
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

        ...calendarSx,

        "& .MuiPickersLayout-actionBar": {
          display: "flex !important",
          width: "100% !important",
        },

        "& .MuiPickersActionBar-root, & .MuiDialogActions-root": {
          ...actionBarSx,
        },
      },
    },
    actionBar: {
      actions: ["clear", "today", "accept"],
    },
    calendarHeader: {
      forcedView: datePickerView,
      setForcedView: setDatePickerView,
    },
    openPickerButton: {
      sx: {
        display: "none",
      },
    },
  }) as any;

const getTimePickerSlotProps = (hasError: boolean) =>
  ({
    textField: {
      variant: "standard" as const,
      fullWidth: true,
      autoFocus: false,
      error: hasError,
      helperText: undefined,
      InputProps: {
        disableUnderline: true,
      },
      sx: getPickerInputSx(hasError, "right"),
    },
    popper: {
      placement: "bottom-start" as const,
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, 6],
          },
        },
      ],
      sx: {
        direction: "ltr !important",

        "& .MuiPaper-root": {
          width: `${TIME_PICKER_WIDTH} !important`,
          minWidth: `${TIME_PICKER_WIDTH} !important`,
          maxWidth: `${TIME_PICKER_WIDTH} !important`,
          overflow: "hidden !important",
          borderRadius: "10px",
          border: `1px solid ${APP_BORDER}`,
          backgroundColor: "#fff",
          boxShadow: APP_SHADOW,
          boxSizing: "border-box",
        },

        "& .MuiPickersLayout-root": {
          width: `${TIME_PICKER_WIDTH} !important`,
          minWidth: `${TIME_PICKER_WIDTH} !important`,
          maxWidth: `${TIME_PICKER_WIDTH} !important`,
          backgroundColor: "transparent",
          boxSizing: "border-box",
        },

        "& .MuiPickersLayout-contentWrapper": {
          backgroundColor: APP_PANEL,
        },

        ...timeClockSx,

        "& .MuiPickersLayout-actionBar": {
          display: "flex !important",
          width: "100% !important",
        },

        "& .MuiPickersActionBar-root, & .MuiDialogActions-root": {
          ...actionBarSx,
        },
      },
    },
    actionBar: {
      actions: ["clear", "today", "accept"],
    },
    openPickerButton: {
      sx: {
        display: "none",
      },
    },
  }) as any;

const iconButtonSx = {
  width: 24,
  height: 24,
  color: APP_MUTED_TEXT,
  borderRadius: "8px",
  padding: 0,
  transition: "background-color 140ms ease, color 140ms ease",

  "&:hover": {
    backgroundColor: APP_PRIMARY_SOFT,
    color: APP_PRIMARY_HOVER,
  },

  "& .MuiSvgIcon-root": {
    fontSize: 17,
  },
};

const PickerRow = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <Box
    sx={{
      width: "100%",
      minWidth: 0,
      display: "flex",
      alignItems: "center",
      gap: "4px",
      direction: "ltr",
    }}>
    <Box
      sx={{
        width: 26,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
      {icon}
    </Box>

    <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
  </Box>
);

export const DateCellEditor: React.FC<DateCellEditorProps> = ({
  value,
  onChange,
  dateType: type = dateType.Date,
  isRequired = false,
  errorMessage,
}) => {
  const [localValue, setLocalValue] = useState<Dayjs | null>(() => toPickerValue(value));
  const [datePickerView, setDatePickerView] = useState<DateOnlyView>("day");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  const isDateTime = type === dateType.Datetime;

  useEffect(() => {
    setLocalValue(toPickerValue(value));
  }, [value]);

  const emitValue = (nextValue: Dayjs | null) => {
    setLocalValue(nextValue);

    if (nextValue && nextValue.isValid()) {
      onChange(toStoredUtcIso(nextValue, isDateTime), true);
      return;
    }

    onChange("", !isRequired);
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    if (!newValue || !newValue.isValid()) {
      emitValue(null);
      return;
    }

    const nextValue =
      isDateTime && localValue && localValue.isValid()
        ? newValue.hour(localValue.hour()).minute(localValue.minute()).second(localValue.second())
        : newValue.startOf("day");

    emitValue(nextValue);
  };

  const handleTimeChange = (newValue: Dayjs | null) => {
    if (!newValue || !newValue.isValid()) {
      return;
    }

    const baseDate = localValue && localValue.isValid() ? localValue : dayjs().tz(ISRAEL_TZ);

    const updatedValue = baseDate
      .hour(newValue.hour())
      .minute(newValue.minute())
      .second(newValue.second())
      .millisecond(0);

    emitValue(updatedValue);
  };

  const handleIconMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDateIconClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDatePickerOpen(true);
  };

  const handleTimeIconClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsTimePickerOpen(true);
  };

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="he"
      localeText={{
        okButtonLabel: "אישור",
        cancelButtonLabel: "ביטול",
        clearButtonLabel: "ניקוי",
        todayButtonLabel: "היום",
      }}>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateRows: isDateTime ? "auto auto" : "auto",
          gap: "6px",
          padding: "4px 6px",
          boxSizing: "border-box",
          alignItems: "center",
          position: "relative",
          zIndex: 5,
        }}>
        <PickerRow
          icon={
            <IconButton
              size="small"
              onMouseDown={handleIconMouseDown}
              onClick={handleDateIconClick}
              sx={iconButtonSx}>
              <CalendarMonthIcon fontSize="small" />
            </IconButton>
          }>
          <DatePicker
            open={isDatePickerOpen}
            onOpen={() => setIsDatePickerOpen(true)}
            onClose={() => setIsDatePickerOpen(false)}
            closeOnSelect={false}
            value={localValue}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
            views={["year", "month", "day"]}
            view={datePickerView}
            onViewChange={(newView) => setDatePickerView(newView as DateOnlyView)}
            slots={{
              calendarHeader: CompactCalendarHeader,
            }}
            slotProps={getDatePickerSlotProps(
              !!errorMessage,
              true,
              datePickerView,
              setDatePickerView,
            )}
          />
        </PickerRow>

        {isDateTime && (
          <PickerRow
            icon={
              <IconButton
                size="small"
                onMouseDown={handleIconMouseDown}
                onClick={handleTimeIconClick}
                sx={iconButtonSx}>
                <AccessTimeIcon fontSize="small" />
              </IconButton>
            }>
            <TimePicker
              open={isTimePickerOpen}
              onOpen={() => setIsTimePickerOpen(true)}
              onClose={() => setIsTimePickerOpen(false)}
              closeOnSelect={false}
              value={localValue}
              onChange={handleTimeChange}
              format="HH:mm"
              ampm={false}
              views={["hours", "minutes"]}
              slotProps={getTimePickerSlotProps(!!errorMessage)}
            />
          </PickerRow>
        )}
      </Box>
    </LocalizationProvider>
  );
};
