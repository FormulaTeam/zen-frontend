import { FieldTypeIds } from "../../../../../../../utils/interfaces";
import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select } from "@mui/material";
import { DefaultTimeValue } from "../../../../../schemas/fields/timeSchema";
import { ExtraElementProps } from "../index";

type Props = ExtraElementProps<typeof FieldTypeIds.time>;

function TimeFieldExtra({ extra, onChange, disabled }: Props) {
  const {
    defaultValue = DefaultTimeValue.EMPTY,
    includeSeconds = false,
  } = extra;

  return (
    <>
      <FormControlLabel disabled={disabled}
                        control={<Checkbox checked={includeSeconds}
                                           onChange={(e) => {
                                             onChange({ includeSeconds: e.target.checked });
                                           }} />}
                        label="הצגת שניות" />
      <FormControl fullWidth disabled={disabled}>
        <InputLabel id="default-value-label">ערך ברירת מחדל</InputLabel>
        <Select labelId="default-value-label"
                value={defaultValue}
                label="ערך ברירת מחדל"
                onChange={(e) => {
                  onChange({ defaultValue: e.target.value });
                }}>
          <MenuItem value={DefaultTimeValue.EMPTY}>ריק</MenuItem>
          <MenuItem value={DefaultTimeValue.NOW}>שעה נוכחית</MenuItem>
        </Select>
      </FormControl>
    </>
  );
}

export { TimeFieldExtra };