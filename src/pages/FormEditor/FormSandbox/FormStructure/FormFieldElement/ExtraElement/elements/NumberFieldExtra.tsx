import { FieldTypeIds } from "../../../../../../../utils/interfaces";
import { ExtraElementProps } from "../index";
import { FormControl, FormHelperText, Input, InputLabel, MenuItem, Select } from "@mui/material";
import { useEffect, useState } from "react";
import { REGEX, numberType } from "formula-gear";

type Props = ExtraElementProps<typeof FieldTypeIds.number>;

function NumberFieldExtra({ extra, validationErrors, onChange, disabled }: Props) {
  const { numberType: type = numberType.Integer, defaultValue, max, min } = extra;

  const [localValues, setLocalValues] = useState({
    defaultValue: defaultValue !== undefined ? String(defaultValue) : "",
    min: min !== undefined ? String(min) : "",
    max: max !== undefined ? String(max) : "",
  });

  useEffect(() => {
    onChange({ numberType: type });
  }, []);

  useEffect(() => {
    setLocalValues({
      defaultValue: defaultValue !== undefined ? String(defaultValue) : "",
      min: min !== undefined ? String(min) : "",
      max: max !== undefined ? String(max) : "",
    });
  }, [defaultValue, min, max]);

  const handleNumberChange = (value: string, fieldName: "defaultValue" | "min" | "max") => {
    if (value === "" || value === "-") {
      setLocalValues((prev) => ({ ...prev, [fieldName]: value }));
      onChange({ [fieldName]: undefined });
      return;
    }

    if (value.endsWith(".") && !value.slice(0, -1).includes(".")) {
      setLocalValues((prev) => ({ ...prev, [fieldName]: value }));
      return;
    }

    if (REGEX.NUMBER.test(value)) {
      setLocalValues((prev) => ({ ...prev, [fieldName]: value }));
      onChange({ [fieldName]: +value });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+"].includes(e.key)) {
      e.preventDefault();
      return;
    }

    if (e.key === "-") {
      const target = e.target as HTMLInputElement;
      const selectionStart = target.selectionStart ?? 0;
      if (selectionStart !== 0 || target.value.includes("-")) {
        e.preventDefault();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData("text/plain");
    if (!REGEX.NUMBER.test(pasteData)) {
      e.preventDefault();
    }
  };

  return (
    <>
      <FormControl fullWidth disabled={disabled}>
        <InputLabel id="format-label">סוג מספר</InputLabel>
        <Select
          labelId="format-label"
          value={type}
          label="סוג מספר"
          onChange={(e) => {
            onChange({ numberType: e.target.value as any });
          }}>
          <MenuItem value={numberType.Integer}>שלם</MenuItem>
          <MenuItem value={numberType.Decimal}>עשרוני</MenuItem>
        </Select>
      </FormControl>
      <FormControl
        fullWidth
        disabled={disabled}
        error={!!validationErrors?.properties?.defaultValue?.errors[0]}>
        <InputLabel>ערך ברירת מחדל</InputLabel>
        <Input
          type={"text"}
          inputProps={{ dir: "ltr", style: { textAlign: 'right' }, inputMode: "numeric" }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          aria-describedby="default-value-helper-text"
          value={localValues.defaultValue}
          onChange={(e) => handleNumberChange(e.target.value, "defaultValue")}></Input>
        <FormHelperText id="default-value-helper-text">
          {validationErrors?.properties?.defaultValue?.errors[0]}
        </FormHelperText>
      </FormControl>
      <FormControl
        fullWidth
        disabled={disabled}
        error={!!validationErrors?.properties?.min?.errors[0]}>
        <InputLabel>ערך מינמלי</InputLabel>
        <Input
          type={"text"}
          inputProps={{ dir: "ltr", style: { textAlign: 'right' }, inputMode: "numeric" }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          value={localValues.min}
          aria-describedby={"min-helper-text"}
          onChange={(e) => handleNumberChange(e.target.value, "min")}></Input>
        <FormHelperText id="min-helper-text">
          {validationErrors?.properties?.min?.errors[0]}
        </FormHelperText>
      </FormControl>
      <FormControl
        fullWidth
        disabled={disabled}
        error={!!validationErrors?.properties?.max?.errors[0]}>
        <InputLabel>ערך מקסימלי</InputLabel>
        <Input
          type={"text"}
          inputProps={{ dir: "ltr", style: { textAlign: 'right' }, inputMode: "numeric" }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          value={localValues.max}
          aria-describedby={"max-helper-text"}
          onChange={(e) => handleNumberChange(e.target.value, "max")}></Input>
        <FormHelperText id="max-helper-text">
          {validationErrors?.properties?.max?.errors[0]}
        </FormHelperText>
      </FormControl>
    </>
  );
}

export { NumberFieldExtra };
