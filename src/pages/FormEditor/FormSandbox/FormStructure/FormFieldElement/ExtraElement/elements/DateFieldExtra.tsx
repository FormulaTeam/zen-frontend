import { FieldTypeIds } from "../../../../../../../utils/interfaces";
import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select } from "@mui/material";
import { ExtraElementProps } from "../index";

type Props = ExtraElementProps<typeof FieldTypeIds.date>;

function DateFieldExtra({ extra, onChange, disabled }: Props) {
  const {
    defaultValue,
    dateType = "date",
  } = extra;

  const isDateTime = dateType === "datetime";

  return (
    <>
      <FormControlLabel disabled={disabled}
                        control={<Checkbox checked={isDateTime}
                                           onChange={(e) => {
                                             const nextDateType = e.target.checked ? "datetime" : "date";
                                             const updates: any = { dateType: nextDateType };
                                             
                                             if (defaultValue === "currentDate") {
                                               updates.defaultValue = "currentDateTime";
                                             } else if (defaultValue === "currentDateTime") {
                                               updates.defaultValue = "currentDate";
                                             }
                                             
                                             onChange(updates);
                                           }} />}
                        label="תאריך ושעה" />
      <FormControl disabled={disabled} fullWidth variant="standard">
        <InputLabel id="default-value-label" shrink={true}>ערך ברירת מחדל</InputLabel>
        <Select labelId="default-value-label"
                value={defaultValue || ""}
                label="ערך ברירת מחדל"
                displayEmpty
                onChange={(e) => {
                  onChange({ defaultValue: e.target.value || undefined });
                }}>
          <MenuItem value="">ריק</MenuItem>
          {!isDateTime && <MenuItem value="currentDate">תאריך של היום</MenuItem>}
          {isDateTime && <MenuItem value="currentDateTime">תאריך ושעה נוכחיים</MenuItem>}
        </Select>
      </FormControl>
    </>
  );
}

export { DateFieldExtra };
