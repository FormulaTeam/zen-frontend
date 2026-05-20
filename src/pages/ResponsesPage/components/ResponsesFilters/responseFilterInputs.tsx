import React from "react";
import {
  Box,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  styled,
} from "@mui/material";
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/he";
import { OptionResponseValue } from "@src/utils/optionResponseValue";

type FilterInputProps = {
  item: any;
  applyValue: (item: any) => void;
  focusElementRef?: React.Ref<any>;
  inputRef?: React.Ref<any>;
  headerFilterMenu?: React.ReactNode;
  clearButton?: React.ReactNode;
  options?: OptionResponseValue[];
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
}> = ({ headerFilterMenu, clearButton, children }) => {
  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      sx={{
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        overflow: "hidden",
      }}>
      {headerFilterMenu && (
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
          }}>
          {headerFilterMenu}
        </Box>
      )}

      <Box
        sx={{
          minWidth: 0,
          flex: "1 1 0",
          maxWidth: "100%",
          overflow: "hidden",
          "& .MuiFormControl-root": {
            minWidth: 0,
            width: "100%",
          },
          "& .MuiInputBase-root": {
            minWidth: 0,
            width: "100%",
          },
        }}>
        {children}
      </Box>

      {clearButton && (
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
          }}>
          {clearButton}
        </Box>
      )}
    </Stack>
  );
};

const HeaderFilterPickerContainer = styled(Box)({
  width: "100%",
  minWidth: 0,
  "& .MuiInputBase-root": {
    fontSize: "1.2rem",
    padding: "4px 8px",
    minHeight: "32px",
  },
  "& .MuiInputBase-input": {
    textAlign: "right",
    direction: "rtl",
    padding: 0,
    minWidth: 0,
  },
  "& .MuiInputAdornment-root": {
    marginLeft: 0,
  },
  "& .MuiIconButton-root": {
    padding: 0,
  },
});

const DateTimeRangeContainer = styled(Stack)({
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  overflow: "hidden",
  "& .MuiFormControl-root": {
    minWidth: 0,
    flex: 1,
  },
});

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

const formatTimeFilterValue = (value: Dayjs | null, includeSeconds = false): string => {
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
  inputAdornment: {
    sx: {
      ".MuiIconButton-root": {
        p: 0,
      },
    },
  },
});

const PickerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LocalizationProvider
      localeText={{ okButtonLabel: "אישור" }}
      dateAdapter={AdapterDayjs}
      adapterLocale="he">
      {children}
    </LocalizationProvider>
  );
};

export const NoValueFilterInput: React.FC<FilterInputProps> = (props) => {
  const { headerFilterMenu, clearButton } = props;

  return (
    <HeaderFilterInputShell headerFilterMenu={headerFilterMenu} clearButton={clearButton}>
      <Box
        sx={{
          width: 0,
          minWidth: 0,
          maxWidth: 0,
          flex: "0 1 0",
          overflow: "hidden",
          height: 32,
        }}
      />
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
        fullWidth
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
        fullWidth
        sx={{
          "& input": {
            textAlign: "right",
            direction: "rtl",
          },
        }}
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
            slotProps={commonPickerSlotProps(props)}
          />
        </PickerProvider>
      </HeaderFilterPickerContainer>
    </HeaderFilterInputShell>
  );
};

export const TimeFilterInput: React.FC<FilterInputProps> = (props) => {
  const { item, applyValue, headerFilterMenu, clearButton } = props;

  return (
    <HeaderFilterInputShell headerFilterMenu={headerFilterMenu} clearButton={clearButton}>
      <HeaderFilterPickerContainer>
        <PickerProvider>
          <TimePicker
            value={parseTimeFilterValue(item.value)}
            onChange={(newValue) =>
              applyFilterValue(item, applyValue, formatTimeFilterValue(newValue))
            }
            views={["hours", "minutes"]}
            ampm={false}
            slotProps={commonPickerSlotProps(props)}
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
      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
          overflow: "hidden",
          "& .MuiTextField-root": {
            minWidth: 0,
            flex: 1,
          },
        }}>
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
          InputLabelProps={{ shrink: true }}
          sx={{
            "& input": {
              textAlign: "right",
              direction: "rtl",
            },
          }}
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
          InputLabelProps={{ shrink: true }}
          sx={{
            "& input": {
              textAlign: "right",
              direction: "rtl",
            },
          }}
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
          <DateTimeRangeContainer direction="row" spacing={0.5}>
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

export const TimeRangeFilterInput: React.FC<FilterInputProps> = (props) => {
  const { item, applyValue, headerFilterMenu, clearButton } = props;
  const range = (item.value ?? {}) as RangeValue;

  return (
    <HeaderFilterInputShell headerFilterMenu={headerFilterMenu} clearButton={clearButton}>
      <HeaderFilterPickerContainer>
        <PickerProvider>
          <DateTimeRangeContainer direction="row" spacing={0.5}>
            <TimePicker
              value={parseTimeFilterValue(range.from)}
              onChange={(newValue) =>
                applyFilterValue(item, applyValue, {
                  ...range,
                  from: formatTimeFilterValue(newValue),
                })
              }
              views={["hours", "minutes"]}
              ampm={false}
              slotProps={commonPickerSlotProps(props, "מ")}
            />

            <TimePicker
              value={parseTimeFilterValue(range.to)}
              onChange={(newValue) =>
                applyFilterValue(item, applyValue, {
                  ...range,
                  to: formatTimeFilterValue(newValue),
                })
              }
              views={["hours", "minutes"]}
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
  const { item, applyValue, options = [], headerFilterMenu, clearButton } = props;

  return (
    <HeaderFilterInputShell headerFilterMenu={headerFilterMenu} clearButton={clearButton}>
      <FormControl size="small" variant="standard" fullWidth>
        <InputLabel>ערך</InputLabel>

        <Select
          label="ערך"
          value={item.value ?? ""}
          onChange={(event) => applyFilterValue(item, applyValue, event.target.value)}>
          {options.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.text}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </HeaderFilterInputShell>
  );
};

export const MultiOptionFilterInput: React.FC<FilterInputProps> = (props) => {
  const { item, applyValue, options = [], headerFilterMenu, clearButton } = props;
  const selectedValues = Array.isArray(item.value) ? item.value.map(String) : [];

  return (
    <HeaderFilterInputShell headerFilterMenu={headerFilterMenu} clearButton={clearButton}>
      <FormControl size="small" variant="standard" fullWidth>
        <InputLabel>ערכים</InputLabel>

        <Select
          multiple
          label="ערכים"
          value={selectedValues}
          onChange={(event) => {
            const rawValue = event.target.value;

            applyFilterValue(
              item,
              applyValue,
              typeof rawValue === "string" ? rawValue.split(",") : rawValue,
            );
          }}
          renderValue={(selected) =>
            options
              .filter((option) => (selected as string[]).includes(option.id))
              .map((option) => option.text)
              .join(", ")
          }>
          {options.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              <Checkbox checked={selectedValues.includes(option.id)} />
              <ListItemText primary={option.text} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </HeaderFilterInputShell>
  );
};
