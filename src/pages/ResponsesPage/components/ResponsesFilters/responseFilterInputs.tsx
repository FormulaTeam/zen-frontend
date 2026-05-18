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
} from "@mui/material";

export type FilterOptionItem = {
  value: string;
  label: string;
};

type FilterInputProps = {
  item: any;
  applyValue: (item: any) => void;
  focusElementRef?: React.Ref<any>;
  inputRef?: React.Ref<any>;
  headerFilterMenu?: React.ReactNode;
  clearButton?: React.ReactNode;
  options?: FilterOptionItem[];
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
      <TextField
        inputRef={getInputRef(props)}
        type="date"
        value={item.value ?? ""}
        onChange={(event) => applyFilterValue(item, applyValue, event.target.value)}
        size="small"
        variant="standard"
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
    </HeaderFilterInputShell>
  );
};

export const TimeFilterInput: React.FC<FilterInputProps> = (props) => {
  const { item, applyValue, headerFilterMenu, clearButton } = props;

  return (
    <HeaderFilterInputShell headerFilterMenu={headerFilterMenu} clearButton={clearButton}>
      <TextField
        inputRef={getInputRef(props)}
        type="time"
        value={item.value ?? ""}
        onChange={(event) => applyFilterValue(item, applyValue, event.target.value)}
        size="small"
        variant="standard"
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
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

export const DateRangeFilterInput: React.FC<FilterInputProps> = (props) => (
  <RangeFilterInput {...props} inputType="date" />
);

export const TimeRangeFilterInput: React.FC<FilterInputProps> = (props) => (
  <RangeFilterInput {...props} inputType="time" />
);

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
            <MenuItem key={option.value} value={option.value}>
              {option.label}
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
              .filter((option) => (selected as string[]).includes(option.value))
              .map((option) => option.label)
              .join(", ")
          }>
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Checkbox checked={selectedValues.includes(option.value)} />
              <ListItemText primary={option.label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </HeaderFilterInputShell>
  );
};
