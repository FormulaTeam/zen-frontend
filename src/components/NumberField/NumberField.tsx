import {
  Box,
  FormControl,
  FormLabel,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { FormField } from "../../utils/interfaces";
import { useState } from "react";
import { NumberType } from "../../validation/field-config.types";

type Props = {
  formField: FormField;
  setFormFields: (newFormFields: FormField[]) => void;
  index: number;
  formFields: FormField[];
};

interface Errors {
  range: boolean;
  initialNumberValue: boolean;
}

export default function NumberField({
  formField,
  setFormFields,
  index,
  formFields,
}: Props) {
  const theme = useTheme();
  const [errors, setErrors] = useState<Errors>({
    range: false,
    initialNumberValue: false,
  });

  function handleValChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newFormFields = [...formFields];
    const currentField = newFormFields.find((i) => i.index === index);
    if (currentField) {
      const parsedValue =
        currentField.numberType === "double"
          ? parseFloat(event.target.value)
          : parseInt(event.target.value);

      currentField[event.target.name] = isNaN(parsedValue) ? undefined : parsedValue;
      setFormFields(newFormFields);
      validateNumberField(currentField);
    }
  }

  function handleTypeChange(event: SelectChangeEvent) {
    const newFormFields = [...formFields];
    const currentField = newFormFields.find((i) => i.index === index);
    if (currentField) {
      if (event.target.value === "integer") {
        if (currentField.minValue !== undefined)
          currentField.minValue = Math.floor(currentField.minValue);
        if (currentField.maxValue !== undefined)
          currentField.maxValue = Math.floor(currentField.maxValue);
        if (currentField.initialNumberValue !== undefined)
          currentField.initialNumberValue = Math.floor(currentField.initialNumberValue);
      }
      currentField.numberType = event.target.value as NumberType;
      setFormFields(newFormFields);
      validateNumberField(currentField);
    }
  }

  function validateNumberField(field: FormField) {
    const newErrors = { ...errors };
    const { minValue, maxValue, initialNumberValue } = field;

    newErrors.range = minValue !== undefined && maxValue !== undefined && minValue > maxValue;

    if (initialNumberValue !== undefined) {
      newErrors.initialNumberValue =
        (minValue !== undefined && initialNumberValue < minValue) ||
        (maxValue !== undefined && initialNumberValue > maxValue);
    } else {
      newErrors.initialNumberValue = false;
    }
    setErrors(newErrors);
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, marginTop: "10px" }}>
      <Grid container direction="column" gap={1}>
        <Grid>
          <FormControl>
            <FormLabel>סוג מספר</FormLabel>
            <Select
              value={formField.numberType ?? "integer"}
              className="number-type-select"
              type="number"
              name="numberType"
              size="small"
              onChange={handleTypeChange}>
              <MenuItem value={"integer"}>שלם</MenuItem>
              <MenuItem value={"double"}>עשרוני</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid alignItems="center">
          <TextField
            className="formField-textfield"
            value={formField.initialNumberValue ?? ""}
            type="number"
            name="initialNumberValue"
            size="small"
            placeholder="ערך ברירת מחדל"
            onChange={handleValChange}
          />
        </Grid>

        {errors.initialNumberValue && (
          <Typography variant="caption" sx={{ color: theme.palette.error.main }}>
            ערך ברירת המחדל חייב להיות בטווח הערכים
          </Typography>
        )}

        <Grid container direction="column" gap={1}>
          <Grid>
            <FormLabel>טווח ערכים</FormLabel>
          </Grid>
          <Grid container gap={1}>
            <TextField
              className="formField-range"
              value={formField.minValue ?? ""}
              name="minValue"
              size="small"
              placeholder="מינימום"
              type="number"
              onChange={handleValChange}
            />
            <TextField
              className="formField-range"
              value={formField.maxValue ?? ""}
              name="maxValue"
              size="small"
              placeholder="מקסימום"
              type="number"
              onChange={handleValChange}
            />
          </Grid>
          {errors.range && (
            <Typography variant="caption" sx={{ color: theme.palette.error.main }}>
              טווח ערכים לא תקין
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
