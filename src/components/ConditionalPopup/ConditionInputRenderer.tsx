import React from "react";
import Box from "@mui/material/Box";
import {
  Condition,
  ConditionOperators,
  FieldTypeIds,
  FormField,
  ConditionUtils,
  connectionTypes,
  ResponseFieldValue,
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

interface ConditionInputRendererProps {
  formField: FormField;
  condition: Condition;
  handleConditionChange: (field: string, value: any) => void;
  fieldOptions?: Record<string, ResponseFieldValue[]>;
}

const ConditionInputRenderer: React.FC<ConditionInputRendererProps> = ({
  formField,
  condition,
  handleConditionChange,
  fieldOptions,
}) => {
  if (!formField) {
    return <Box>לא נבחר שדה</Box>;
  }

  // Don't show value input for empty/not_empty operators
  if (
    condition.operator === ConditionOperators.empty ||
    condition.operator === ConditionOperators.not_empty
  ) {
    return <></>;
  }

  switch (formField.typeId) {
    case FieldTypeIds.longText:
    case FieldTypeIds.shortText:
      return (
        <CustomTextField
          value={condition.value || ""}
          onChangeHandler={(value) => handleConditionChange("value", value)}
          label="הזן טקסט"
          isDisabled={false}
          isValid={true}
          isRequired={false}
        />
      );

    case FieldTypeIds.options:
      const isMultiSelect = ConditionUtils.isMultiValueOperator(condition.operator);
      const selectValue = isMultiSelect
        ? Array.isArray(condition.value)
          ? condition.value.map((val) => String(val))
          : []
        : Array.isArray(condition.value)
          ? String(condition.value[0] || "")
          : String(condition.value || "");

      // For connected fields, use fieldOptions, otherwise use formField.options
      let optionsToUse: string[] = [];
      if (formField.connectionType === connectionTypes.form && fieldOptions?.[formField.uniqueId]) {
        // Use connected form options and remove duplicates
        const connectedOptions = fieldOptions[formField.uniqueId].map((option) =>
          String(option.value || ""),
        );
        optionsToUse = [...new Set(connectedOptions)]; // Remove duplicates
      } else {
        // Use regular field options
        optionsToUse = formField.options || [];
      }

      return (
        <CustomDropDownAutocomplete
          value={selectValue}
          multipleOptions={isMultiSelect}
          options={isMultiSelect ? optionsToUse : [...optionsToUse]}
          onChangeHandler={(value, isValid) => {
            const newValue = ConditionUtils.normalizeConditionValue(
              value,
              condition.operator,
              formField.typeId === 100 ? 1 : formField.typeId, // Handle DRAGGED_ITEM_ID
            );
            handleConditionChange("value", newValue);
          }}
          isValid={true}
          label={isMultiSelect ? "בחר אפשרויות..." : "בחר אפשרות..."}
          isRequired={false}
          isDisabled={false}
        />
      );

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
          </RadioGroup>{" "}
        </FormControl>
      );

    case FieldTypeIds.number:
      return (
        <CustomNumberField
          value={condition.value}
          onChangeHandler={(value) => handleConditionChange("value", value)}
          label="הכנס מספר"
          isDisabled={false}
          isValid={true}
          isRequired={false}
          numberType={formField.numberType}
          minValue={formField.minValue}
          maxValue={formField.maxValue}
        />
      );

    case FieldTypeIds.date:
      return (
        <CustomDateTime
          value={String(condition.value) || null}
          onChangeHandler={(value) => handleConditionChange("value", value)}
          label="בחר תאריך"
          isDisabled={false}
          isValid={true}
          isRequired={false}
        />
      );

    default:
      return <></>;
  }
};

export default ConditionInputRenderer;
