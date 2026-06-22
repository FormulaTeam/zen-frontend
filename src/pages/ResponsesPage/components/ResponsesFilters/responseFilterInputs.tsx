import React from "react";
import { Autocomplete, Box, Checkbox, FormControl, Stack, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/he";
import { OptionResponseValue } from "@src/utils/optionResponseValue";
import { useLoadMoreOnVisible } from "../../hooks/useLoadMoreOnVisible";

export type FilterInputProps = {
  item: any;
  applyValue: (item: any) => void;
  focusElementRef?: React.Ref<any>;
  inputRef?: React.Ref<any>;
  headerFilterMenu?: React.ReactNode;
  clearButton?: React.ReactNode;
  options?: OptionResponseValue[];
  loading?: boolean;
  onLoadMore?: () => void;
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
}> = ({ headerFilterMenu, clearButton, children, noValue = false }) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      className={
        noValue
          ? "responses-header-filter-shell responses-header-filter-shell--no-value"
          : "responses-header-filter-shell"
      }>
      {headerFilterMenu && <Box className="responses-header-filter-menu">{headerFilterMenu}</Box>}

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

const PaginatedAutocompleteListbox = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement> & { onLoadMore?: () => void }
>(function PaginatedAutocompleteListbox({ children, onLoadMore, ...props }, ref) {
  const listRef = React.useRef<HTMLUListElement>(null);
  const sentinelRef = React.useRef<HTMLLIElement>(null);

  React.useImperativeHandle(ref, () => listRef.current as HTMLUListElement);
  useLoadMoreOnVisible(listRef, sentinelRef, onLoadMore);

  return (
    <ul ref={listRef} {...props}>
      {children}
      <li
        aria-hidden
        ref={sentinelRef}
        style={{ height: 1, padding: 0, margin: 0, listStyle: "none" }}
      />
    </ul>
  );
});

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
        direction: "rtl",
      },

      "& .MuiAutocomplete-listbox": {
        p: "4px",
        direction: "rtl",
        textAlign: "right",
      },

      "& .MuiAutocomplete-option": {
        minHeight: "34px",
        borderRadius: "7px",
        mx: 0,
        my: "1px",
        px: "9px",
        py: "6px",
        fontSize: "0.95rem",
        direction: "rtl",
        textAlign: "right",

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
    <HeaderFilterInputShell headerFilterMenu={headerFilterMenu} clearButton={clearButton} noValue>
      <span />
    </HeaderFilterInputShell>
  );
};

export const TextFilterInput: React.FC<FilterInputProps> = (props) => {
  const { item, applyValue, headerFilterMenu, clearButton } = props;

  return (
    <HeaderFilterInputShell headerFilterMenu={headerFilterMenu} clearButton={clearButton}>
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
    <HeaderFilterInputShell headerFilterMenu={headerFilterMenu} clearButton={clearButton}>
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

export const DateFilterInput: React.FC<FilterInputProps> = (props) => {
  const { item, applyValue, headerFilterMenu, clearButton } = props;

  return (
    <HeaderFilterInputShell headerFilterMenu={headerFilterMenu} clearButton={clearButton}>
      <HeaderFilterPickerContainer>
        <PickerProvider>
          <DatePicker
            value={parseDateFilterValue(item.value)}
            onChange={(newValue) =>
              applyFilterValue(item, applyValue, formatDateFilterValue(newValue))
            }
            format="DD/MM/YYYY"
            slotProps={commonPickerSlotProps(props, "תאריך")}
          />
        </PickerProvider>
      </HeaderFilterPickerContainer>
    </HeaderFilterInputShell>
  );
};

export const TimeFilterInput: React.FC<FilterInputProps & { timePrecision?: string }> = (props) => {
  const { item, applyValue, headerFilterMenu, clearButton, timePrecision = "minutes" } = props;
  const showSeconds = timePrecision === "seconds";

  return (
    <HeaderFilterInputShell headerFilterMenu={headerFilterMenu} clearButton={clearButton}>
      <HeaderFilterPickerContainer>
        <PickerProvider>
          <TimePicker
            value={parseTimeFilterValue(item.value)}
            onChange={(newValue) =>
              applyFilterValue(item, applyValue, formatTimeFilterValue(newValue, timePrecision))
            }
            views={showSeconds ? ["hours", "minutes", "seconds"] : ["hours", "minutes"]}
            ampm={false}
            slotProps={commonPickerSlotProps(props, "שעה")}
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
    <HeaderFilterInputShell headerFilterMenu={headerFilterMenu} clearButton={clearButton}>
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

export const DateRangeFilterInput: React.FC<FilterInputProps> = (props) => {
  const { item, applyValue, headerFilterMenu, clearButton } = props;
  const range = (item.value ?? {}) as RangeValue;

  return (
    <HeaderFilterInputShell headerFilterMenu={headerFilterMenu} clearButton={clearButton}>
      <HeaderFilterPickerContainer>
        <PickerProvider>
          <DateTimeRangeContainer direction="row">
            <DatePicker
              value={parseDateFilterValue(range.from)}
              onChange={(newValue) =>
                applyFilterValue(item, applyValue, {
                  ...range,
                  from: formatDateFilterValue(newValue),
                })
              }
              format="DD/MM/YYYY"
              slotProps={commonPickerSlotProps(props, "מ")}
            />

            <DatePicker
              value={parseDateFilterValue(range.to)}
              onChange={(newValue) =>
                applyFilterValue(item, applyValue, {
                  ...range,
                  to: formatDateFilterValue(newValue),
                })
              }
              format="DD/MM/YYYY"
              slotProps={commonPickerSlotProps(props, "עד")}
            />
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
    <HeaderFilterInputShell headerFilterMenu={headerFilterMenu} clearButton={clearButton}>
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
              ampm={false}
              slotProps={commonPickerSlotProps(props, "מ")}
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
              ampm={false}
              slotProps={commonPickerSlotProps(props, "עד")}
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
    onLoadMore,
  } = props;

  const selectedOption = options.find((option) => String(option.id) === String(item.value)) ?? null;

  return (
    <HeaderFilterInputShell headerFilterMenu={headerFilterMenu} clearButton={clearButton}>
      <FormControl size="small" variant="standard" fullWidth>
        <Autocomplete<OptionResponseValue, false, false, false>
          fullWidth
          options={options}
          value={selectedOption}
          loading={loading}
          loadingText="טוען..."
          noOptionsText="אין אפשרויות"
          getOptionLabel={(option) => option.text ?? ""}
          isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
          onChange={(_, newValue) => {
            applyFilterValue(item, applyValue, newValue?.id ?? "");
          }}
          slotProps={optionAutocompleteSlotProps}
          ListboxComponent={PaginatedAutocompleteListbox}
          ListboxProps={{ onLoadMore } as any}
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
    onLoadMore,
  } = props;

  const selectedValues = Array.isArray(item.value) ? item.value.map(String) : [];

  const selectedOptions = options.filter((option) => selectedValues.includes(String(option.id)));

  return (
    <HeaderFilterInputShell headerFilterMenu={headerFilterMenu} clearButton={clearButton}>
      <FormControl size="small" variant="standard" fullWidth>
        <Autocomplete<OptionResponseValue, true, false, false>
          fullWidth
          multiple
          disableCloseOnSelect
          options={options}
          value={selectedOptions}
          loading={loading}
          loadingText="טוען..."
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
          ListboxProps={{ onLoadMore } as any}
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
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  direction: "rtl",
                  textAlign: "right",
                }}>
                {labels.length > 0 ? labels.join(", ") : ""}
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
