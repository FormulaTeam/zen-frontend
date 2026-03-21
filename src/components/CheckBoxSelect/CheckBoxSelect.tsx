import React from "react";
import {
  Box,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Info } from "@mui/icons-material";
import { CheckboxInitialValType } from "../../types/enums/formFields.enums";
import { FormFieldDto } from "../../types/shared";

type CheckBoxFieldExtra = {
  initialValType?: unknown;
};

interface CheckBoxSelectProps {
  formField: FormFieldDto;
  setFormFields: React.Dispatch<React.SetStateAction<FormFieldDto[]>>;
  index: number;
  formFields: FormFieldDto[];
}

const getFieldExtra = (field: FormFieldDto): CheckBoxFieldExtra =>
  (field.extra as CheckBoxFieldExtra | undefined) ?? {};

const CheckBoxSelect: React.FC<CheckBoxSelectProps> = ({
  formField,
  setFormFields,
  index,
  formFields,
}: CheckBoxSelectProps) => {
  const handleChange = (event: SelectChangeEvent) => {
    const val = event.target.value ?? "";

    const newFormFields = formFields.map((field) =>
      field.index === index
        ? {
            ...field,
            extra: {
              ...getFieldExtra(field),
              initialValType: val,
            },
          }
        : field,
    );

    setFormFields(newFormFields);
  };

  const initialValType = getFieldExtra(formField).initialValType;
  const selectedValue =
    typeof initialValType === "string" ? initialValType : CheckboxInitialValType.EMPTY;

  return (
    <FormControl sx={{ width: 180 }} margin="normal">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
        <FormLabel component="legend" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
          ערך ברירת המחדל
        </FormLabel>
        <Tooltip title="לתשומת ליבך, שדה זה הוא כשדה חובה מכיוון שתמיד יהיה ערך בשדה - כן/לא">
          <IconButton size="small" sx={{ padding: 0 }}>
            <Info fontSize="small" color="disabled" />
          </IconButton>
        </Tooltip>
      </Box>
      <Select size="small" value={selectedValue} onChange={handleChange}>
        <MenuItem value={CheckboxInitialValType.CHECKED}>כן</MenuItem>
        <MenuItem value={CheckboxInitialValType.EMPTY}>לא</MenuItem>
      </Select>
    </FormControl>
  );
};

export default CheckBoxSelect;
