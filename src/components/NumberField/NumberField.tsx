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
import { useState } from "react";
import { FormFieldDto } from "../../types/shared";

type NumberFieldExtra = {
  numberType?: string;
  minValue?: number;
  maxValue?: number;
  initialNumberValue?: number;
};

type Props = {
  formField: FormFieldDto;
  setFormFields: React.Dispatch<React.SetStateAction<FormFieldDto[]>>;
  index: number;
  formFields: FormFieldDto[];
};

interface Errors {
  range: boolean;
  initialNumberValue: boolean;
}

const getFieldExtra = (field: FormFieldDto): NumberFieldExtra =>
  (field.extra as NumberFieldExtra | undefined) ?? {};

const updateFieldExtra = (field: FormFieldDto, patch: Partial<NumberFieldExtra>): FormFieldDto => ({
  ...field,
  extra: {
    ...getFieldExtra(field),
    ...patch,
  },
});

export default function NumberField({ formField, setFormFields, index, formFields }: Props) {
  const theme = useTheme();
  const [errors, setErrors] = useState<Errors>({
    range: false,
    initialNumberValue: false,
  });

  function handleValChange(event: React.ChangeEvent<HTMLInputElement>) {
    const fieldName = event.target.name as keyof Pick<
      NumberFieldExtra,
      "minValue" | "maxValue" | "initialNumberValue"
    >;

    const newFormFields = formFields.map((field) => {
      if (field.index !== index) return field;

      const extra = getFieldExtra(field);
      const parsedValue =
        extra.numberType === "double"
          ? parseFloat(event.target.value)
          : parseInt(event.target.value, 10);

      const nextValue = isNaN(parsedValue) ? undefined : parsedValue;

      return updateFieldExtra(field, {
        [fieldName]: nextValue,
      });
    });

    setFormFields(newFormFields);

    const currentField = newFormFields.find((i) => i.index === index);
    if (currentField) {
      validateNumberField(currentField);
    }
  }

  function handleTypeChange(event: SelectChangeEvent) {
    const nextType = event.target.value;

    const newFormFields = formFields.map((field) => {
      if (field.index !== index) return field;

      const extra = getFieldExtra(field);
      let minValue = extra.minValue;
      let maxValue = extra.maxValue;
      let initialNumberValue = extra.initialNumberValue;

      if (nextType === "integer") {
        if (minValue !== undefined) minValue = Math.floor(minValue);
        if (maxValue !== undefined) maxValue = Math.floor(maxValue);
        if (initialNumberValue !== undefined) initialNumberValue = Math.floor(initialNumberValue);
      }

      return updateFieldExtra(field, {
        numberType: nextType,
        minValue,
        maxValue,
        initialNumberValue,
      });
    });

    setFormFields(newFormFields);

    const currentField = newFormFields.find((i) => i.index === index);
    if (currentField) {
      validateNumberField(currentField);
    }
  }

  function validateNumberField(field: FormFieldDto) {
    const newErrors = { ...errors };
    const { minValue, maxValue, initialNumberValue } = getFieldExtra(field);

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

  const extra = getFieldExtra(formField);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, marginTop: "10px" }}>
      <Grid container direction="column" gap={1}>
        <Grid>
          <FormControl>
            <FormLabel>סוג מספר</FormLabel>
            <Select
              value={extra.numberType ?? "integer"}
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
            value={extra.initialNumberValue ?? ""}
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
              value={extra.minValue ?? ""}
              name="minValue"
              size="small"
              placeholder="מינימום"
              type="number"
              onChange={handleValChange}
            />
            <TextField
              className="formField-range"
              value={extra.maxValue ?? ""}
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
