import React from "react";
import { FormField } from "../../utils/interfaces";
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

type Props = {
  getBaseFieldElement: () => JSX.Element;
  formField: FormField;
  onSetDefaultTime: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTimeChange: (e: SelectChangeEvent) => void;
};

export default function HourField({
  getBaseFieldElement,
  formField,
  onSetDefaultTime,
  onTimeChange,
}: Props) {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {getBaseFieldElement()}
      <FormControlLabel
        label="הצגת שניות"
        control={
          <Checkbox
            checked={formField.showSeconds || false}
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
          value={formField.initialValType || ""}
          label=""
          displayEmpty
          renderValue={(value: any) => {
            if (!value) {
              return <Typography color="gray">ערך ברירת המחדל</Typography>;
            } else {
              return (
                <Typography color="black">{value === "empty" ? "ריק" : "שעה נוכחית"}</Typography>
              );
            }
          }}
          onChange={onTimeChange}>
          <MenuItem
            value={"currentTime"}
            className="initial-val-type-menu-item"
            key="initialValType_currentTime">
            שעה נוכחית
          </MenuItem>

          <MenuItem
            value={"empty"}
            className="initial-val-type-menu-item"
            key="initialValType_empty">
            ריק
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
