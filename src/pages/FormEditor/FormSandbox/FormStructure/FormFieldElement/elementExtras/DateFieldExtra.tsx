import { FormFieldExtra } from "../../../../schemas";
import { ElementTypeIds } from "../../../../../../utils/interfaces";
import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select } from "@mui/material";
import { DefaultDateValues } from "../../../../schemas/dateSchema";

interface Props {
  extra: FormFieldExtra<typeof ElementTypeIds.date>;
  disabled: boolean;
}

function DateFieldExtra({ extra, disabled }: Props) {
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
          <MenuItem value={DefaultDateValues.EMPTY}>ריק</MenuItem>
          <MenuItem value={DefaultDateValues.NOW}>תאריך של היום</MenuItem>
        </Select>
      </FormControl>
      <FormControlLabel disabled={disabled}
                        control={<Checkbox checked={extra.includeTime ?? false} onChange={() => null} />}
                        label="תאריך ושעה" />
    </>
  );
}

export { DateFieldExtra };