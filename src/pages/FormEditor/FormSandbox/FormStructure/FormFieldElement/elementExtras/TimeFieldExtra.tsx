import { FormFieldExtra } from "../../../../schemas";
import { ElementTypeIds } from "../../../../../../utils/interfaces";
import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select } from "@mui/material";
import { DefaultTimeValue } from "../../../../schemas/timeSchema";

interface Props {
  extra: FormFieldExtra<typeof ElementTypeIds.time>;
  disabled: boolean;
}

function TimeFieldExtra({ extra, disabled }: Props) {
  return (
    <>
      <FormControl fullWidth disabled={disabled}>
        <InputLabel id="demo-simple-select-label">ערך ברירת מחדל</InputLabel>
        <Select labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={extra.defaultValue}
                label="ערך ברירת מחדל"
                onChange={() => {
                }}>
          <MenuItem value={DefaultTimeValue.EMPTY}>ריק</MenuItem>
          <MenuItem value={DefaultTimeValue.NOW}>שעה נוכחית</MenuItem>
        </Select>
      </FormControl>
      <FormControlLabel disabled={disabled}
                        control={<Checkbox checked={extra.includeSeconds ?? false} onChange={() => null} />}
                        label="הצגת שניות" />
    </>
  );
}

export { TimeFieldExtra };