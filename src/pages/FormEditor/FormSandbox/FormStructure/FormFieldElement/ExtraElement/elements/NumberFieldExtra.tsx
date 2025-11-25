import { FieldTypeIds } from "../../../../../../../utils/interfaces";
import { ExtraElementProps } from "../index";
import { NumberFormat } from "../../../../../schemas/numberSchema";
import { FormControl, Input, InputLabel, MenuItem, Select } from "@mui/material";

type Props = ExtraElementProps<typeof FieldTypeIds.number>;

function NumberFieldExtra({ extra, onChange, disabled }: Props) {
  const {
    format = NumberFormat.INTEGER,
    defaultValue,
    max,
    min,
  } = extra;

  return (
    <>
      <FormControl fullWidth disabled={disabled}>
        <InputLabel id="format-label">סוג מספר</InputLabel>
        <Select labelId="format-label"
                value={format}
                label="סוג מספר"
                onChange={(e) => {
                  onChange({format: e.target.value});
                }}>
          <MenuItem value={NumberFormat.INTEGER}>שלם</MenuItem>
          <MenuItem value={NumberFormat.DECIMAL}>עשרוני</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth disabled={disabled}>
        <InputLabel id="default-value-label">ערך ברירת מחדל</InputLabel>
        <Input type={"number"}
               value={defaultValue}
               onChange={(e) => {
                 onChange({defaultValue: +e.target.value});
               }}>
        </Input>
      </FormControl>
      <FormControl fullWidth disabled={disabled}>
        <InputLabel id="default-value-label">ערך מינמלי</InputLabel>
        <Input type={"number"}
               value={min}
               onChange={(e) => {
                 onChange({min: +e.target.value});
               }}>
        </Input>
      </FormControl>
      <FormControl fullWidth disabled={disabled}>
        <InputLabel id="default-value-label">ערך מקסימלי</InputLabel>
        <Input type={"number"}
               value={max}
               onChange={(e) => {
                 onChange({max: +e.target.value});
               }}>
        </Input>
      </FormControl>
    </>
  );
}

export { NumberFieldExtra };