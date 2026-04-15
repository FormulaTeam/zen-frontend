import React from "react";
import Box from "@mui/material/Box";
import {
  Condition,
  ConditionOperators,
  ConditionUtils,
  connectionTypes,
  FieldTypeIds,
} from "../../utils/interfaces";
import FormControlLabel from "@mui/material/FormControlLabel";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import CustomNumberField from "../FormFields/CustomNumberField/CustomNumberField";
import CustomTextField from "../FormFields/CustomTextField/CustomTextField";
import CustomDateTime from "../FormFields/CustomDateTime/CustomDateTime";
import CustomDropDownAutocomplete from "../FormFields/CustomDropDownAutocomplete/CustomDropDownAutocomplete";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { FormFieldDto } from "../../types/shared";

type ConditionFieldExtra = {
  connectionType?: string | number;
  options?: string[];
  numberFormat?: number;
  min?: number;
  max?: number;
};

type ConditionalFormField = FormFieldDto & {
  extra?: ConditionFieldExtra;
};

type FieldOptionValue = {
  value?: unknown;
  fieldId: string;
};

interface ConditionInputRendererProps {
  formField?: ConditionalFormField;
  condition: Condition;
  handleConditionChange: (field: string, value: any) => void;
  fieldOptions?: Record<string, FieldOptionValue[]>;
}

const getFieldExtra = (field?: ConditionalFormField): ConditionFieldExtra =>
  (field?.extra as ConditionFieldExtra | undefined) ?? {};

const ConditionInputRenderer: React.FC<ConditionInputRendererProps> = ({
  formField,
  condition,
  handleConditionChange,
  fieldOptions,
}) => {
  if (!formField) {
    return <Box>לא נבחר שדה</Box>;
  }

  if (
    condition.operator === ConditionOperators.empty ||
    condition.operator === ConditionOperators.not_empty
  ) {
    return <></>;
  }

  const fieldExtra = getFieldExtra(formField);

  switch (formField.fieldType) {
    case FieldTypeIds.longText:
    case FieldTypeIds.shortText:
      return (
        <CustomTextField
          value={condition.value || ""}
          onChangeHandler={(value) => handleConditionChange("value", value)}
          label="הזן טקסט"
          isDisabled={false}
          isRequired={false}
          validationMessage={null}
        />
      );

    case FieldTypeIds.options: {
      const isMultiSelect = ConditionUtils.isMultiValueOperator(condition.operator);
      const selectValue = isMultiSelect
        ? Array.isArray(condition.value)
          ? condition.value.map((val) => String(val))
          : []
        : Array.isArray(condition.value)
          ? String(condition.value[0] || "")
          : String(condition.value || "");

      let optionsToUse: string[] = [];

      if (fieldExtra.connectionType === connectionTypes.form && fieldOptions?.[formField.id]) {
        const connectedOptions = fieldOptions[formField.id].map((option) =>
          String(option.value || ""),
        );
        optionsToUse = [...new Set(connectedOptions)];
      } else {
        optionsToUse = fieldExtra.options || [];
      }

      return (
        <CustomDropDownAutocomplete
          value={selectValue}
          multipleOptions={isMultiSelect}
          options={isMultiSelect ? optionsToUse : [...optionsToUse]}
          onChangeHandler={(value) => {
            const newValue = ConditionUtils.normalizeConditionValue(
              value,
              condition.operator,
              formField.fieldType,
            );
            handleConditionChange("value", newValue);
          }}
          label={isMultiSelect ? "בחר אפשרויות..." : "בחר אפשרות..."}
          isRequired={false}
          isDisabled={false}
          validationMessage={null}
        />
      );
    }

    case FieldTypeIds.checkbox:
      if (!condition.value) condition.value = "false";
      return (
        <FormControl>
          <FormLabel
            sx={{
              fontSize: "0.875rem !important",
            }}>
            בחירת אפשרות...
          </FormLabel>
          <RadioGroup
            value={condition.value === "true" ? "true" : "false"}
            onChange={(e) => handleConditionChange("value", e.target.value)}
            sx={{ display: "flex", alignItems: "center" }}
            row>
            <FormControlLabel value="true" control={<Radio />} label="כן" />
            <FormControlLabel value="false" control={<Radio />} label="לא" />
          </RadioGroup>
        </FormControl>
      );

    case FieldTypeIds.number:
      return (
        <CustomNumberField
          defaultValue={condition.value}
          onChangeHandler={(value) => handleConditionChange("value", value)}
          label="הכנס מספר"
          isDisabled={false}
          isRequired={false}
          numberFormat={fieldExtra.numberFormat}
          min={fieldExtra.min}
          max={fieldExtra.max}
          validationMessage={null}
        />
      );

    case FieldTypeIds.date:
      return (
        <CustomDateTime
          value={String(condition.value) || null}
          onChangeHandler={(value) => handleConditionChange("value", value)}
          label="בחר תאריך"
          isDisabled={false}
          isRequired={false}
          validationMessage={null}
        />
      );

    default:
      return <></>;
  }
};

export default ConditionInputRenderer;
