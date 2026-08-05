import React from "react";
import {
  Autocomplete,
  Box,
  Checkbox,
  FormControl,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import { DatePicker, DateTimePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/he";
import { PaginatedAutocompleteListbox } from "@src/components/PaginatedAutocompleteListbox";
import { OptionResponseValue } from "@src/utils/optionResponseValue";

dayjs.extend(utc);
dayjs.extend(timezone);

const ISRAEL_TZ = "Asia/Jerusalem";

export type FilterInputProps = {
  item: any;
  applyValue: (item: any) => void;
  focusElementRef?: React.Ref<any>;
  inputRef?: React.Ref<any>;
  headerFilterMenu?: React.ReactNode;
  clearButton?: React.ReactNode;
  options?: OptionResponseValue[];
  loading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  slotProps?: {
    root?: {
      label?: React.ReactNode;
    };
  };
};

type RangeValue = {
  from?: unknown;
  to?: unknown;
};

const getInputRef = (props: FilterInputProps) => props.focusElementRef ?? props.inputRef;

const applyFilterValue = (item: any, applyValue: (item: any) => void, value: unknown) => {
  applyValue({
    ...item,
    value,
  });
};

const HeaderFilterInputShell: React.FC<{
  headerFilterMenu?: React.ReactNode;
  clearButton?: React.ReactNode;
  children: React.ReactNode;
  noValue?: boolean;
  filterProps: FilterInputProps;
}> = ({ headerFilterMenu, clearButton, children, filterProps, noValue = false }) => {
  const operatorMenuRef = React.useRef<HTMLDivElement>(null);
  const initialOperatorRef = React.useRef(filterProps.item?.operator);
  const [hasChosenOperator, setHasChosenOperator] = React.useState(false);
  const [operatorTooltipOpen, setOperatorTooltipOpen] = React.useState(false);
  const filterValue = filterProps.item?.value;
  const hasFilterValue = Array.isArray(filterValue)
    ? filterValue.length > 0
    : filterValue !== undefined && filterValue !== null && filterValue !== "";
  const operatorLabel =
    hasFilterValue || hasChosenOperator ? filterProps.slotProps?.root?.label : undefined;

  React.useEffect(() => {
    if (filterProps.item?.operator !== initialOperatorRef.current) {
      setHasChosenOperator(true);
    }
  }, [filterProps.item?.operator]);

  React.useLayoutEffect(() => {
    const operatorButton = operatorMenuRef.current?.querySelector("button");

    if (!operatorButton) return;

    const showTooltip = () => setOperatorTooltipOpen(true);
    const hideTooltip = () => setOperatorTooltipOpen(false);
    const markOperatorAsChosen = () => setHasChosenOperator(true);

    operatorButton.removeAttribute("title");

    if (typeof operatorLabel === "string") {
      operatorButton.setAttribute("aria-label", operatorLabel);
    }

    operatorButton.addEventListener("mouseenter", showTooltip);
    operatorButton.addEventListener("mouseleave", hideTooltip);
    operatorButton.addEventListener("click", markOperatorAsChosen);

    return () => {
      operatorButton.removeEventListener("mouseenter", showTooltip);
      operatorButton.removeEventListener("mouseleave", hideTooltip);
      operatorButton.removeEventListener("click", markOperatorAsChosen);
    };
  }, [operatorLabel]);

  return (
    <Stack
      direction="row"
      alignItems="center"
      className={[
        "responses-header-filter-shell",
        noValue ? "responses-header-filter-shell--no-value" : "",
        hasFilterValue ? "responses-header-filter-shell--active" : "",
      ]
        .filter(Boolean)
        .join(" ")}>
      {headerFilterMenu && (
        <Tooltip
          title={operatorLabel ?? ""}
          open={Boolean(operatorLabel) && operatorTooltipOpen}
          disableFocusListener
          disableHoverListener
          disableTouchListener
          arrow>
          <Box ref={operatorMenuRef} className="responses-header-filter-menu">
            {headerFilterMenu}
          </Box>
        </Tooltip>
      )}

      {!noValue && <Box className="responses-header-filter-value">{children}</Box>}

      {clearButton && <Box className="responses-header-filter-clear">{clearButton}</Box>}
    </Stack>
  );
};

const HeaderFilterPickerContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Box className="responses-header-filter-picker">{children}</Box>;
};

type DateTimeRangeContainerProps = React.ComponentProps<typeof Stack>;

const DateTimeRangeContainer: React.FC<DateTimeRangeContainerProps> = ({ className, ...props }) => {
  return (
    <Stack
      {...props}
      className={
        className ? `responses-header-filter-range ${className}` : "responses-header-filter-range"
      }
    />
  );
};

const optionAutocompleteSlotProps = {
  clearIndicator: {
    title: "",
    sx: {
      display: "none",
    },
  },
  popupIndicator: {
    title: "",
    sx: {
      width: 20,
      height: 20,
      padding: 0,
      margin: 0,
      color: "#64748b",

      "& .MuiSvgIcon-root": {
        fontSize: 18,
      },

      "&:hover": {
        backgroundColor: "#f1f5f9",
        color: "#334155",
      },
    },
  },
  popper: {
    placement: "bottom-start" as const,
    sx: {
      minWidth: 190,
      maxWidth: "calc(100vw - 32px)",

      "& .MuiAutocomplete-paper": {
        mt: "4px",
        borderRadius: "10px",
        border: "1px solid #d7e4f2",
        boxShadow: "0 10px 28px rgba(15, 23, 42, 0.1)",
        overflow: "hidden",
        direction: "ltr",
        maxHeight: "300px",
      },

      "& .MuiAutocomplete-listbox": {
        p: "4px",
        maxHeight: "280px",
        overflowY: "auto",
        overflowX: "hidden",
        overscrollBehavior: "contain",
        scrollbarGutter: "stable",
        scrollbarWidth: "thin",
        scrollbarColor: "#94a3b8 #f1f5f9",
        direction: "ltr",
        textAlign: "left",

        "&::-webkit-scrollbar": {
          width: "7px",
        },

        "&::-webkit-scrollbar-track": {
          backgroundColor: "#f1f5f9",
          borderRadius: "999px",
        },

        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#94a3b8",
          borderRadius: "999px",
          border: "2px solid #f1f5f9",
        },

        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#64748b",
        },
      },

      "& .MuiAutocomplete-option": {
        minHeight: "34px",
        borderRadius: "7px",
        mx: 0,
        my: "1px",
        px: "9px",
        py: "6px",
        fontSize: "0.95rem",
        direction: "ltr",
        textAlign: "left",

        "&[aria-selected='true']": {
          backgroundColor: "#eef4ff",
          fontWeight: 600,
        },

        "&.Mui-focused": {
          backgroundColor: "#f8fafc",
        },
      },
    },
  },
} as const;

const parseDateFilterValue = (value: unknown): Dayjs | null => {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const parsedValue = dayjs()
    .year(year)
    .month(month - 1)
    .date(day)
    .startOf("day");

  return parsedValue.isValid() ? parsedValue : null;
};

const parseDateTimeFilterValue = (value: unknown): Dayjs | null => {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsedValue = dayjs.utc(value);

  return parsedValue.isValid() ? parsedValue.tz(ISRAEL_TZ) : null;
};

const parseTimeFilterValue = (value: unknown): Dayjs | null => {
  if (typeof value !== "string" || value.trim() === "" || !value.includes(":")) {
    return null;
  }

  const [hours, minutes, seconds] = value.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    (seconds !== undefined && (Number.isNaN(seconds) || seconds < 0 || seconds > 59))
  ) {
    return null;
  }

  return dayjs()
    .hour(hours)
    .minute(minutes)
    .second(seconds ?? 0)
    .millisecond(0);
};

const formatDateFilterValue = (value: Dayjs | null): string => {
  return value?.isValid() ? value.format("YYYY-MM-DD") : "";
};

const formatDateTimeFilterValue = (value: Dayjs | null): string => {
  return value?.isValid()
    ? value.tz(ISRAEL_TZ, true).utc().format("YYYY-MM-DD[T]HH:mm:ss.000[Z]")
    : "";
};

const formatTimeFilterValue = (value: Dayjs | null, timePrecision = "minutes"): string => {
  const includeSeconds = timePrecision === "seconds";
  return value?.isValid() ? value.format(includeSeconds ? "HH:mm:ss" : "HH:mm") : "";
};

const commonPickerSlotProps = (props: FilterInputProps, placeholder?: string) => ({
  textField: {
    inputRef: getInputRef(props),
    variant: "standard" as const,
    fullWidth: true,
    placeholder,
    InputProps: {
      disableUnderline: true,
    },
  },
  popper: {
    placement: "bottom-start" as const,
  },
  openPickerButton: {
    style: {
      width: 24,
      height: 24,
      padding: 0,
    },
  },
});

const timePickerSlotProps = (props: FilterInputProps, placeholder?: string) => {
  const slotProps = commonPickerSlotProps(props, placeholder);

  return {
    ...slotProps,
    popper: {
      ...slotProps.popper,
      sx: {
        "& .MuiMultiSectionDigitalClock-root": {
          direction: "rtl",
        },
        "& .MuiMultiSectionDigitalClockSection-item, & .MuiClockNumber-root": {
          fontSize: "13.5px",
        },
      },
    },
  };
};

const dateTimePickerSlotProps = (props: FilterInputProps, placeholder?: string) => {
  const slotProps = commonPickerSlotProps(props, placeholder);
  const compactDateTimeLayout = {
    direction: "ltr !important",
    width: "476px !important",
    minWidth: "476px !important",
    maxWidth: "476px !important",
    boxSizing: "border-box",

    "& .MuiPickersLayout-contentWrapper": {
      direction: "ltr !important",
      display: "flex !important",
      flexDirection: "row-reverse !important",
      alignItems: "stretch",
      width: "476px !important",
      minWidth: "476px !important",
      maxWidth: "476px !important",
    },

    "& .MuiDateCalendar-root": {
      width: "320px !important",
      minWidth: "320px !important",
      maxWidth: "320px !important",
      flex: "0 0 320px !important",
      margin: "0 auto",
    },

    "& .MuiMultiSectionDigitalClock-root": {
      direction: "ltr !important",
      display: "flex !important",
      flexDirection: "row-reverse !important",
      justifyContent: "center !important",
      gap: "8px",
      width: "156px !important",
      minWidth: "156px !important",
      maxWidth: "156px !important",
      flex: "0 0 156px !important",
      boxSizing: "border-box",
      padding: "8px 6px",
    },

    "& .MuiMultiSectionDigitalClockSection-root": {
      width: "48px !important",
      minWidth: "48px !important",
      maxWidth: "48px !important",
      flex: "0 0 48px !important",
      padding: "3px 0 !important",
      margin: "0 !important",
      scrollbarWidth: "none",
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
    },

    "& .MuiMultiSectionDigitalClockSection-item": {
      width: "42px !important",
      minWidth: "42px !important",
      maxWidth: "42px !important",
      height: "30px",
      marginLeft: "auto !important",
      marginRight: "auto !important",
      borderRadius: "8px",
      justifyContent: "center !important",
      fontSize: "13.5px",
    },

    "& .MuiClockNumber-root": {
      fontSize: "13.5px",
    },
  } as const;

  return {
    ...slotProps,
    popper: {
      ...slotProps.popper,
      sx: {
        "& .MuiPaper-root": {
          width: "476px !important",
          minWidth: "476px !important",
          maxWidth: "476px !important",
          overflow: "hidden !important",
        },
        "& .MuiPickersLayout-root": compactDateTimeLayout,
      },
    },
    layout: {
      sx: compactDateTimeLayout,
    },
  };
};

const PickerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LocalizationProvider
      localeText={{
        okButtonLabel: "אישור",
        clearButtonLabel: "ניקוי",
        todayButtonLabel: "היום",
      }}
      dateAdapter={AdapterDayjs}
      adapterLocale="he">
      {children}
    </LocalizationProvider>
  );
};

export const NoValueFilterInput: React.FC<FilterInputProps> = (props) => {
  const { headerFilterMenu, clearButton } = props;

  return (
    <HeaderFilterInputShell
      headerFilterMenu={headerFilterMenu}
      clearButton={clearButton}
      filterProps={props}
      noValue>
      <span />
    </HeaderFilterInputShell>
  );
};

export const TextFilterInput: React.FC<FilterInputProps> = (props) => {
  const { item, applyValue, headerFilterMenu, clearButton } = props;

  return (
    <HeaderFilterInputShell
      headerFilterMenu={headerFilterMenu}
      clearButton={clearButton}
      filterProps={props}>
      <TextField
        inputRef={getInputRef(props)}
        value={item.value ?? ""}
        onChange={(event) => applyFilterValue(item, applyValue, event.target.value)}
        size="small"
        variant="standard"
        placeholder="ערך"
        fullWidth
        InputProps={{ disableUnderline: true }}
      />
    </HeaderFilterInputShell>
  );
};

export const NumberFilterInput: React.FC<FilterInputProps> = (props) => {
  const { item, applyValue, headerFilterMenu, clearButton } = props;

  return (
    <HeaderFilterInputShell
      headerFilterMenu={headerFilterMenu}
      clearButton={clearButton}
      filterProps={props}>
      <TextField
        inputRef={getInputRef(props)}
        type="number"
        value={item.value ?? ""}
        onChange={(event) => applyFilterValue(item, applyValue, event.target.value)}
        size="small"
        variant="standard"
        placeholder="מספר"
        fullWidth
        InputProps={{ disableUnderline: true }}
      />
    </HeaderFilterInputShell>
  );
};

export const DateFilterInput: React.FC<FilterInputProps & { dateType?: string }> = (props) => {
  const { item, applyValue, headerFilterMenu, clearButton } = props;
  const isDateTime = props.dateType === "datetime";

  return (
    <HeaderFilterInputShell
      headerFilterMenu={headerFilterMenu}
      clearButton={clearButton}
      filterProps={props}>
      <HeaderFilterPickerContainer>
        <PickerProvider>
          {isDateTime ? (
            <DateTimePicker
              value={parseDateTimeFilterValue(item.value)}
              onChange={(newValue) =>
                applyFilterValue(item, applyValue, formatDateTimeFilterValue(newValue))
              }
              format="DD/MM/YYYY HH:mm"
              views={["year", "month", "day", "hours", "minutes"]}
              ampm={false}
              closeOnSelect={false}
              slotProps={dateTimePickerSlotProps(props, "תאריך ושעה")}
            />
          ) : (
            <DatePicker
              value={parseDateFilterValue(item.value)}
              onChange={(newValue) =>
                applyFilterValue(item, applyValue, formatDateFilterValue(newValue))
              }
              format="DD/MM/YYYY"
              slotProps={commonPickerSlotProps(props, "תאריך")}
            />
          )}
        </PickerProvider>
      </HeaderFilterPickerContainer>
    </HeaderFilterInputShell>
  );
};

export const TimeFilterInput: React.FC<FilterInputProps & { timePrecision?: string }> = (props) => {
  const { item, applyValue, headerFilterMenu, clearButton, timePrecision = "minutes" } = props;
  const showSeconds = timePrecision === "seconds";

  return (
    <HeaderFilterInputShell
      headerFilterMenu={headerFilterMenu}
      clearButton={clearButton}
      filterProps={props}>
      <HeaderFilterPickerContainer>
        <PickerProvider>
          <TimePicker
            value={parseTimeFilterValue(item.value)}
            onChange={(newValue) =>
              applyFilterValue(item, applyValue, formatTimeFilterValue(newValue, timePrecision))
            }
            views={showSeconds ? ["hours", "minutes", "seconds"] : ["hours", "minutes"]}
            format={showSeconds ? "HH:mm:ss" : "HH:mm"}
            ampm={false}
            slotProps={timePickerSlotProps(props, "שעה")}
          />
        </PickerProvider>
      </HeaderFilterPickerContainer>
    </HeaderFilterInputShell>
  );
};

type RangeFilterInputProps = FilterInputProps & {
  inputType: "number" | "date" | "time";
};

const RangeFilterInput: React.FC<RangeFilterInputProps> = (props) => {
  const { item, applyValue, inputType, headerFilterMenu, clearButton } = props;
  const range = (item.value ?? {}) as RangeValue;

  return (
    <HeaderFilterInputShell
      headerFilterMenu={headerFilterMenu}
      clearButton={clearButton}
      filterProps={props}>
      <Stack direction="row" className="responses-header-filter-range">
        <TextField
          inputRef={getInputRef(props)}
          type={inputType}
          value={range.from ?? ""}
          onChange={(event) =>
            applyFilterValue(item, applyValue, {
              ...range,
              from: event.target.value,
            })
          }
          size="small"
          variant="standard"
          placeholder="מ"
          fullWidth
          InputProps={{ disableUnderline: true }}
        />

        <TextField
          type={inputType}
          value={range.to ?? ""}
          onChange={(event) =>
            applyFilterValue(item, applyValue, {
              ...range,
              to: event.target.value,
            })
          }
          size="small"
          variant="standard"
          placeholder="עד"
          fullWidth
          InputProps={{ disableUnderline: true }}
        />
      </Stack>
    </HeaderFilterInputShell>
  );
};

export const NumberRangeFilterInput: React.FC<FilterInputProps> = (props) => (
  <RangeFilterInput {...props} inputType="number" />
);

export const DateRangeFilterInput: React.FC<FilterInputProps & { dateType?: string }> = (props) => {
  const { item, applyValue, headerFilterMenu, clearButton } = props;
  const range = (item.value ?? {}) as RangeValue;
  const isDateTime = props.dateType === "datetime";

  const renderPicker = (rangeKey: "from" | "to", placeholder: string) =>
    isDateTime ? (
      <DateTimePicker
        value={parseDateTimeFilterValue(range[rangeKey])}
        onChange={(newValue) =>
          applyFilterValue(item, applyValue, {
            ...range,
            [rangeKey]: formatDateTimeFilterValue(newValue),
          })
        }
        format="DD/MM/YYYY HH:mm"
        views={["year", "month", "day", "hours", "minutes"]}
        ampm={false}
        closeOnSelect={false}
        slotProps={dateTimePickerSlotProps(props, placeholder)}
      />
    ) : (
      <DatePicker
        value={parseDateFilterValue(range[rangeKey])}
        onChange={(newValue) =>
          applyFilterValue(item, applyValue, {
            ...range,
            [rangeKey]: formatDateFilterValue(newValue),
          })
        }
        format="DD/MM/YYYY"
        slotProps={commonPickerSlotProps(props, placeholder)}
      />
    );

  return (
    <HeaderFilterInputShell
      headerFilterMenu={headerFilterMenu}
      clearButton={clearButton}
      filterProps={props}>
      <HeaderFilterPickerContainer>
        <PickerProvider>
          <DateTimeRangeContainer direction="row">
            {renderPicker("from", "מ")}
            {renderPicker("to", "עד")}
          </DateTimeRangeContainer>
        </PickerProvider>
      </HeaderFilterPickerContainer>
    </HeaderFilterInputShell>
  );
};

export const TimeRangeFilterInput: React.FC<FilterInputProps & { timePrecision?: string }> = (
  props,
) => {
  const { item, applyValue, headerFilterMenu, clearButton, timePrecision = "minutes" } = props;
  const range = (item.value ?? {}) as RangeValue;
  const showSeconds = timePrecision === "seconds";

  return (
    <HeaderFilterInputShell
      headerFilterMenu={headerFilterMenu}
      clearButton={clearButton}
      filterProps={props}>
      <HeaderFilterPickerContainer>
        <PickerProvider>
          <DateTimeRangeContainer direction="row">
            <TimePicker
              value={parseTimeFilterValue(range.from)}
              onChange={(newValue) =>
                applyFilterValue(item, applyValue, {
                  ...range,
                  from: formatTimeFilterValue(newValue, timePrecision),
                })
              }
              views={showSeconds ? ["hours", "minutes", "seconds"] : ["hours", "minutes"]}
              format={showSeconds ? "HH:mm:ss" : "HH:mm"}
              ampm={false}
              slotProps={timePickerSlotProps(props, "מ")}
            />

            <TimePicker
              value={parseTimeFilterValue(range.to)}
              onChange={(newValue) =>
                applyFilterValue(item, applyValue, {
                  ...range,
                  to: formatTimeFilterValue(newValue, timePrecision),
                })
              }
              views={showSeconds ? ["hours", "minutes", "seconds"] : ["hours", "minutes"]}
              format={showSeconds ? "HH:mm:ss" : "HH:mm"}
              ampm={false}
              slotProps={timePickerSlotProps(props, "עד")}
            />
          </DateTimeRangeContainer>
        </PickerProvider>
      </HeaderFilterPickerContainer>
    </HeaderFilterInputShell>
  );
};

export const SingleOptionFilterInput: React.FC<FilterInputProps> = (props) => {
  const {
    item,
    applyValue,
    options = [],
    headerFilterMenu,
    clearButton,
    loading,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
  } = props;

  const selectedOption = options.find((option) => String(option.id) === String(item.value)) ?? null;

  return (
    <HeaderFilterInputShell
      headerFilterMenu={headerFilterMenu}
      clearButton={clearButton}
      filterProps={props}>
      <FormControl size="small" variant="standard" fullWidth>
        <Autocomplete<OptionResponseValue, false, false, false>
          fullWidth
          options={options}
          value={selectedOption}
          loading={loading}
          loadingText="בטעינה..."
          noOptionsText="אין אפשרויות"
          getOptionLabel={(option) => option.text ?? ""}
          isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
          onChange={(_, newValue) => {
            applyFilterValue(item, applyValue, newValue?.id ?? "");
          }}
          slotProps={optionAutocompleteSlotProps}
          ListboxComponent={PaginatedAutocompleteListbox}
          slots={{
            listbox: PaginatedAutocompleteListbox,
          }}
          ListboxProps={
            {
              onLoadMore,
              hasNextPage,
              isFetchingNextPage,
            } as any
          }
          renderInput={(params) => (
            <TextField
              {...params}
              inputRef={getInputRef(props)}
              size="small"
              variant="standard"
              placeholder="ערך"
              fullWidth
              InputProps={{
                ...params.InputProps,
                disableUnderline: true,
              }}
              inputProps={{
                ...params.inputProps,
                readOnly: true,
                style: {
                  ...params.inputProps.style,
                  textAlign: "right",
                  direction: "rtl",
                },
              }}
            />
          )}
        />
      </FormControl>
    </HeaderFilterInputShell>
  );
};

export const MultiOptionFilterInput: React.FC<FilterInputProps> = (props) => {
  const {
    item,
    applyValue,
    options = [],
    headerFilterMenu,
    clearButton,
    loading,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
  } = props;

  const selectedValues = Array.isArray(item.value) ? item.value.map(String) : [];

  const selectedOptions = options.filter((option) => selectedValues.includes(String(option.id)));

  return (
    <HeaderFilterInputShell
      headerFilterMenu={headerFilterMenu}
      clearButton={clearButton}
      filterProps={props}>
      <FormControl size="small" variant="standard" fullWidth>
        <Autocomplete<OptionResponseValue, true, false, false>
          fullWidth
          multiple
          disableCloseOnSelect
          sx={{
            "& .MuiAutocomplete-inputRoot": {
              flexWrap: "nowrap",
              alignItems: "center",
              overflow: "hidden",
              paddingInlineStart: "8px !important",
              paddingInlineEnd: "28px !important",
            },
            "& .MuiAutocomplete-input": {
              flex: selectedValues.length > 0 ? "0 0 0" : "1 1 auto",
              width: selectedValues.length > 0 ? "0 !important" : "auto !important",
              minWidth: selectedValues.length > 0 ? "0 !important" : "42px !important",
            },
          }}
          options={options}
          value={selectedOptions}
          loading={loading}
          loadingText="בטעינה..."
          noOptionsText="אין אפשרויות"
          getOptionLabel={(option) => option.text ?? ""}
          isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
          onChange={(_, newValue) => {
            applyFilterValue(
              item,
              applyValue,
              newValue.map((option) => option.id),
            );
          }}
          slotProps={optionAutocompleteSlotProps}
          ListboxComponent={PaginatedAutocompleteListbox}
          slots={{
            listbox: PaginatedAutocompleteListbox,
          }}
          ListboxProps={
            {
              onLoadMore,
              hasNextPage,
              isFetchingNextPage,
            } as any
          }
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;

            return (
              <li key={key} {...optionProps}>
                <Checkbox checked={selected} size="small" />
                <Box component="span" sx={{ minWidth: 0 }}>
                  {option.text}
                </Box>
              </li>
            );
          }}
          renderTags={(tagValue) => {
            const labels = tagValue.map((option) => option.text).filter(Boolean);

            return (
              <Box
                component="span"
                sx={{
                  minWidth: 0,
                  maxWidth: "100%",
                  flex: "1 1 auto",
                  alignSelf: "center",
                  lineHeight: 1.4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  direction: "ltr",
                  textAlign: "left",
                }}>
                {labels.join(", ")}
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              inputRef={getInputRef(props)}
              size="small"
              variant="standard"
              placeholder="ערכים"
              fullWidth
              InputProps={{
                ...params.InputProps,
                disableUnderline: true,
              }}
              inputProps={{
                ...params.inputProps,
                readOnly: true,
                style: {
                  ...params.inputProps.style,
                  textAlign: "right",
                  direction: "rtl",
                },
              }}
            />
          )}
        />
      </FormControl>
    </HeaderFilterInputShell>
  );
};
