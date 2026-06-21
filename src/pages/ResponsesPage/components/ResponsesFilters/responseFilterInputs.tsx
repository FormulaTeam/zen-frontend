import React from "react";
import {
  Box,
  Checkbox,
  FormControl,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
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

const getSelectMenuProps = (
  setPaperNode: React.Dispatch<React.SetStateAction<HTMLElement | null>>,
) => ({
  PaperProps: {
    ref: setPaperNode,
    style: {
      marginTop: 4,
      borderRadius: 10,
      border: "1px solid #d7e4f2",
      backgroundColor: "#ffffff",
      boxShadow: "0 10px 28px rgba(15, 23, 42, 0.1)",
      maxHeight: 320,
      overflowY: "auto" as const,
      direction: "rtl" as const,
    },
  },
  MenuListProps: {
    style: {
      padding: 4,
    },
  },
});

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
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [paperNode, setPaperNode] = React.useState<HTMLElement | null>(null);
  const [sentinelNode, setSentinelNode] = React.useState<HTMLElement | null>(null);

  useLoadMoreOnVisible(paperNode, sentinelNode, onLoadMore, menuOpen);

  const selectedOption = options.find((option) => String(option.id) === String(item.value));

  return (
    <HeaderFilterInputShell headerFilterMenu={headerFilterMenu} clearButton={clearButton}>
      <FormControl size="small" variant="standard" fullWidth>
        <Select
          displayEmpty
          disableUnderline
          value={item.value ?? ""}
          onChange={(event) => applyFilterValue(item, applyValue, event.target.value)}
          open={menuOpen}
          onOpen={() => setMenuOpen(true)}
          onClose={() => setMenuOpen(false)}
          MenuProps={getSelectMenuProps(setPaperNode)}
          renderValue={() => selectedOption?.text || "ערך"}>
          {loading && <MenuItem disabled>טוען...</MenuItem>}

          {options.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.text}
            </MenuItem>
          ))}

          <MenuItem
            disabled
            aria-hidden
            ref={setSentinelNode}
            style={{ minHeight: 1, height: 1, padding: 0, opacity: 0 }}
          />
        </Select>
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
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [paperNode, setPaperNode] = React.useState<HTMLElement | null>(null);
  const [sentinelNode, setSentinelNode] = React.useState<HTMLElement | null>(null);

  useLoadMoreOnVisible(paperNode, sentinelNode, onLoadMore, menuOpen);

  return (
    <HeaderFilterInputShell headerFilterMenu={headerFilterMenu} clearButton={clearButton}>
      <FormControl size="small" variant="standard" fullWidth>
        <Select
          multiple
          displayEmpty
          disableUnderline
          value={selectedValues}
          onChange={(event) => {
            const rawValue = event.target.value;

            applyFilterValue(
              item,
              applyValue,
              typeof rawValue === "string" ? rawValue.split(",") : rawValue,
            );
          }}
          open={menuOpen}
          onOpen={() => setMenuOpen(true)}
          onClose={() => setMenuOpen(false)}
          MenuProps={getSelectMenuProps(setPaperNode)}
          renderValue={(selected) => {
            const selectedLabels = options
              .filter((option) => (selected as string[]).includes(String(option.id)))
              .map((option) => option.text);

            return selectedLabels.length > 0 ? selectedLabels.join(", ") : "ערכים";
          }}>
          {loading && <MenuItem disabled>טוען...</MenuItem>}

          {options.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              <Checkbox checked={selectedValues.includes(String(option.id))} size="small" />
              <ListItemText primary={option.text} />
            </MenuItem>
          ))}

          <MenuItem
            disabled
            aria-hidden
            ref={setSentinelNode}
            style={{ minHeight: 1, height: 1, padding: 0, opacity: 0 }}
          />
        </Select>
      </FormControl>
    </HeaderFilterInputShell>
  );
};
