import { FieldTypeIds } from "../../../../../../../utils/interfaces";
import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select } from "@mui/material";
import { ExtraElementProps } from "../index";
import { dateType, dateDefaultValue } from "formula-gear";

type Props = ExtraElementProps<typeof FieldTypeIds.date>;

function DateFieldExtra({ extra, onChange, disabled }: Props) {
  const {
    defaultValue,
    dateType: type = dateType.Date,
  } = extra;

  const isDateTime = type === dateType.Datetime;

  return (
    <>
      <FormControlLabel disabled={disabled}
                        control={<Checkbox checked={isDateTime}
                                           onChange={(e) => {
                                             const nextDateType = e.target.checked ? dateType.Datetime : dateType.Date;
                                             const updates: any = { dateType: nextDateType };
                                             
                                             if (defaultValue === dateDefaultValue.CurrentDate) {
                                               updates.defaultValue = dateDefaultValue.CurrentDateTime;
                                             } else if (defaultValue === dateDefaultValue.CurrentDateTime) {
                                               updates.defaultValue = dateDefaultValue.CurrentDate;
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
          {!isDateTime && <MenuItem value={dateDefaultValue.CurrentDate}>תאריך של היום</MenuItem>}
          {isDateTime && <MenuItem value={dateDefaultValue.CurrentDateTime}>תאריך ושעה נוכחיים</MenuItem>}
        </Select>
      </FormControl>
    </>
  );
}

export { DateFieldExtra };
