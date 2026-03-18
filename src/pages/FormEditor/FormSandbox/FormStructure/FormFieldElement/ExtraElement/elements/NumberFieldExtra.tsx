import { FieldTypeIds } from "../../../../../../../utils/interfaces";
import { ExtraElementProps } from "../index";
import { NumberFormat } from "../../../../../schemas/fields/numberSchema";
import { FormControl, FormHelperText, Input, InputLabel, MenuItem, Select } from "@mui/material";
import { useEffect } from "react";

type Props = ExtraElementProps<typeof FieldTypeIds.number>;

function NumberFieldExtra({ extra, validationErrors, onChange, disabled }: Props) {
  const {
    format = NumberFormat.INTEGER,
    defaultValue,
    max,
    min,
  } = extra;

  useEffect(() => {
    onChange({ format });
  }, []);

  return (
    <>
      <FormControl fullWidth disabled={disabled}>
        <InputLabel id="format-label">סוג מספר</InputLabel>
        <Select labelId="format-label"
                value={format}
                label="סוג מספר"
                onChange={(e) => {
                  onChange({ format: e.target.value });
                }}>
          <MenuItem value={NumberFormat.INTEGER}>שלם</MenuItem>
          <MenuItem value={NumberFormat.DECIMAL}>עשרוני</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth disabled={disabled} error={!!validationErrors?.properties?.defaultValue?.errors[0]}>
        <InputLabel>ערך ברירת מחדל</InputLabel>
        <Input type={"number"}
               aria-describedby="default-value-helper-text"
               value={defaultValue !== undefined ? +defaultValue : ""}
               onChange={(e) => {
                 onChange({ defaultValue: e.target.value.length ? +e.target.value : undefined });
               }}>
        </Input>
        <FormHelperText id="default-value-helper-text">
          {validationErrors?.properties?.defaultValue?.errors[0]}
        </FormHelperText>
      </FormControl>
      <FormControl fullWidth disabled={disabled} error={!!validationErrors?.properties?.min?.errors[0]}>
        <InputLabel>ערך מינמלי</InputLabel>
        <Input type={"number"}
               value={min !== undefined ? +min : ""}
               aria-describedby={"min-helper-text"}
               onChange={(e) => {
                 onChange({ min: e.target.value.length ? +e.target.value : undefined });
               }}>
        </Input>
        <FormHelperText id="min-helper-text">
          {validationErrors?.properties?.min?.errors[0]}
        </FormHelperText>
      </FormControl>
      <FormControl fullWidth disabled={disabled} error={!!validationErrors?.properties?.max?.errors[0]}>
        <InputLabel>ערך מקסימלי</InputLabel>
        <Input type={"number"}
               value={max !== undefined ? +max : ""}
               aria-describedby={"max-helper-text"}
               onChange={(e) => {
                 onChange({ max: e.target.value.length ? +e.target.value : undefined });
               }}>
        </Input>
        <FormHelperText id="max-helper-text">
          {validationErrors?.properties?.max?.errors[0]}
        </FormHelperText>
      </FormControl>
    </>
  );
}

export { NumberFieldExtra };