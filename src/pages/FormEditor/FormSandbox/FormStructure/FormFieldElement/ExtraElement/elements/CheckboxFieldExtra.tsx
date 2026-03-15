import { FieldTypeIds } from "../../../../../../../utils/interfaces";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { ExtraElementProps } from "../index";

type Props = ExtraElementProps<typeof FieldTypeIds.checkbox>;

function CheckboxFieldExtra({ extra, onChange, disabled }: Props) {
  const {
    defaultValue = false,
  } = extra;

  return (
    <>
      <FormControl fullWidth disabled={disabled}>
        <InputLabel id="default-value-label">ערך ברירת מחדל</InputLabel>
        <Select labelId="default-value-label"
                value={+defaultValue}
                label="ערך ברירת מחדל"
                onChange={(e) => {
                  onChange({ defaultValue: Boolean(e.target.value) });
                }}>
          <MenuItem value={+false}>לא</MenuItem>
          <MenuItem value={+true}>כן</MenuItem>
        </Select>
      </FormControl>
    </>
  );
}

export { CheckboxFieldExtra };