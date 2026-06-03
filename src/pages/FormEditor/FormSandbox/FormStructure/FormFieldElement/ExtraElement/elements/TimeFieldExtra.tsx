import { FieldTypeIds } from "../../../../../../../utils/interfaces";
import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select } from "@mui/material";
import { ExtraElementProps } from "../index";

type Props = ExtraElementProps<typeof FieldTypeIds.time>;

function TimeFieldExtra({ extra, onChange, disabled }: Props) {
  const {
    defaultValue,
    timePrecision = "minutes",
  } = extra;

  return (
    <>
      <FormControlLabel disabled={disabled}
                        control={<Checkbox checked={timePrecision === "seconds"}
                                           onChange={(e) => {
                                             onChange({ timePrecision: e.target.checked ? "seconds" : "minutes" });
                                           }} />}
                        label="הצגת שניות" />
      <FormControl fullWidth disabled={disabled} variant="standard">
        <InputLabel id="default-value-label" shrink={true}>ערך ברירת מחדל</InputLabel>
        <Select labelId="default-value-label"
                value={defaultValue || ""}
                label="ערך ברירת מחדל"
                displayEmpty
                onChange={(e) => {
                  onChange({ defaultValue: e.target.value || undefined });
                }}>
          <MenuItem value="">ריק</MenuItem>
          <MenuItem value="currentTime">שעה נוכחית</MenuItem>
        </Select>
      </FormControl>
    </>
  );
}

export { TimeFieldExtra };
