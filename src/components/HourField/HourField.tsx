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

type HourFieldExtra = {
  showSeconds?: boolean;
  initialValType?: unknown;
};

type Props = {
  getBaseFieldElement: () => JSX.Element;
  formField: FormFieldDto;
  onSetDefaultTime: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTimeChange: (e: SelectChangeEvent) => void;
};

const getFieldExtra = (field: FormFieldDto): HourFieldExtra =>
  (field.extra as HourFieldExtra | undefined) ?? {};

export default function HourField({
  getBaseFieldElement,
  formField,
  onSetDefaultTime,
  onTimeChange,
}: Props) {
  const theme = useTheme();
  const extra = getFieldExtra(formField);
  const initialValType = typeof extra.initialValType === "string" ? extra.initialValType : "";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {getBaseFieldElement()}
      <FormControlLabel
        label="הצגת שניות"
        control={
          <Checkbox
            checked={Boolean(extra.showSeconds)}
            style={{
              color: theme.palette.primary.dark,
            }}
            onChange={onSetDefaultTime}
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
              <Typography color="black">{value === "empty" ? "ריק" : "שעה נוכחית"}</Typography>
            );
          }}
          onChange={onTimeChange}>
          <MenuItem
            value="currentTime"
            className="initial-val-type-menu-item"
            key="initialValType_currentTime">
            שעה נוכחית
          </MenuItem>

          <MenuItem value="empty" className="initial-val-type-menu-item" key="initialValType_empty">
            ריק
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
