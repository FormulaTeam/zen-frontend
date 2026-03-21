import React from "react";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  useTheme,
} from "@mui/material";
import { FormFieldDto } from "../../types/shared";

type DateFieldExtra = {
  dateAndTime?: boolean;
  initialValType?: unknown;
};

type Props = {
  getBaseFieldElement: () => JSX.Element;
  formField: FormFieldDto;
  onToggleDateAndTime: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange: (e: SelectChangeEvent) => void;
};

const getFieldExtra = (field: FormFieldDto): DateFieldExtra =>
  (field.extra as DateFieldExtra | undefined) ?? {};

export default function DateField({
  getBaseFieldElement,
  formField,
  onToggleDateAndTime,
  onDateChange,
}: Props) {
  const theme = useTheme();
  const extra = getFieldExtra(formField);
  const initialValType = typeof extra.initialValType === "string" ? extra.initialValType : "";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {getBaseFieldElement()}
      <FormControlLabel
        label="תאריך ושעה"
        control={
          <Checkbox
            checked={Boolean(extra.dateAndTime)}
            style={{
              color: theme.palette.primary.dark,
            }}
            onChange={onToggleDateAndTime}
          />
        }
      />
      <FormControl sx={{ width: 180 }}>
        <Select
          id="initial-val-type-simple-select"
          className="initial-val-type-simple-select"
          value={initialValType}
          label=""
          displayEmpty
          renderValue={(value: unknown) => {
            if (!value || typeof value !== "string") {
              return <Typography color="gray">ערך ברירת המחדל</Typography>;
            }

            return (
              <Typography color="black">{value === "empty" ? "ריק" : "תאריך של היום"}</Typography>
            );
          }}
          onChange={onDateChange}>
          <MenuItem
            value="currentTime"
            className="initial-val-type-menu-item"
            key="initialValType_currentTime">
            תאריך של היום
          </MenuItem>

          <MenuItem value="empty" className="initial-val-type-menu-item" key="initialValType_empty">
            ריק
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
