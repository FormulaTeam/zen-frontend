import { FieldTypeIds } from "../../../../../../../utils/interfaces";
import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select } from "@mui/material";
import { DefaultDateValue } from "../../../../../schemas/dateSchema";
import { ExtraElementProps } from "../index";

type Props = ExtraElementProps<typeof FieldTypeIds.date>;

function DateFieldExtra({ extra, onChange, disabled }: Props) {
  const {
    defaultValue = DefaultDateValue.EMPTY,
    includeTime = false,
  } = extra;

  return (
    <>
      <FormControlLabel disabled={disabled}
                        control={<Checkbox checked={includeTime}
                                           onChange={(e) => {
                                             onChange({ includeTime: e.target.checked });
                                           }} />}
                        label="תאריך ושעה" />
      <FormControl disabled={disabled}>
        <InputLabel id="default-value-label">ערך ברירת מחדל</InputLabel>
        <Select labelId="default-value-label"
                value={defaultValue}
                label="ערך ברירת מחדל"
                onChange={(e) => {
                  onChange({ defaultValue: e.target.value });
                }}>
          <MenuItem value={DefaultDateValue.EMPTY}>ריק</MenuItem>
          <MenuItem value={DefaultDateValue.NOW}>תאריך של היום</MenuItem>
        </Select>
      </FormControl>
    </>
  );
}

export { DateFieldExtra };