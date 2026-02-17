import React from "react";
import {
  Condition,
  FormField,
  ConditionOperators,
  conditionOperatorLabels,
  ConditionOperatorType,
  FieldTypeIds,
  ResponseFieldValue,
} from "../../utils/interfaces";
import ConditionInputRenderer from "./ConditionInputRenderer";
import CustomDropDownAutocomplete from "../FormFields/CustomDropDownAutocomplete/CustomDropDownAutocomplete";
import { FormFieldWrapper } from "../Responses/FormFieldRenderer.styled";
import {
  ConditionItemContainer,
  ConditionItemFieldsContainer,
  ConditionItemRemoveButton,
  ConditionPreviewText,
} from "./styled";

interface ConditionItemProps {
  condition: Condition;
  formFields: FormField[]; // Full form fields for metadata lookup
  availableFields?: FormField[]; // Filtered fields for selection (optional, defaults to formFields)
  onConditionChange: (field: string, value: any) => void;
  onRemove: () => void;
  fieldOptions?: Record<string, ResponseFieldValue[]>; // Connected field options
}

const ConditionItem: React.FC<ConditionItemProps> = ({
  condition,
  formFields,
  availableFields,
  onConditionChange,
  onRemove,
  fieldOptions,
}) => {
  // Use availableFields for selection, fallback to formFields if not provided
  const fieldsForSelection = availableFields || formFields;

  const handleFieldChange = (value: string | string[], isValid: boolean) => {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    if (selectedValue === "" || selectedValue === "בחר שדה...") {
      onConditionChange("field", "");
    } else {
      // Find the field by displayName and get its uniqueId
      const selectedField = fieldsForSelection.find((field) => field.displayName === selectedValue);
      onConditionChange("field", selectedField?.uniqueId || "");
    }
  };

  const getFieldDisplayValue = () => {
    if (!condition.field) return "";
    const field = formFields.find((f) => f.uniqueId === condition.field);
    return field?.displayName || "";
  };

  const handleOperatorChange = (value: string | string[], isValid: boolean) => {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    if (selectedValue === "" || selectedValue === "סוג התנאי...") {
      onConditionChange("operator", "");
    } else {
      // Find the operator by its label and get its value
      const operatorEntry = Object.entries(conditionOperatorLabels).find(
        ([key, label]) => label === selectedValue,
      );
      onConditionChange("operator", operatorEntry ? operatorEntry[0] : "");
    }
  };

  const getOperatorDisplayValue = () => {
    if (!condition.operator) return "";
    return conditionOperatorLabels[condition.operator] || "";
  };
  const getAvailableOperators = (field: FormField): ConditionOperatorType[] => {
    if (!field) return [];

    switch (field.typeId) {
      case FieldTypeIds.shortText:
      case FieldTypeIds.longText:
        return [
          ConditionOperators.equals,
          ConditionOperators.not_equals,
          ConditionOperators.contains,
          ConditionOperators.not_contains,
          ConditionOperators.empty,
          ConditionOperators.not_empty,
        ];

      case FieldTypeIds.options:
        return [
          ConditionOperators.equals,
          ConditionOperators.not_equals,
          ConditionOperators.contains,
          ConditionOperators.not_contains,
          ConditionOperators.empty,
          ConditionOperators.not_empty,
        ];

      case FieldTypeIds.checkbox:
        return [ConditionOperators.equals];

      case FieldTypeIds.number:
      case FieldTypeIds.date:
        return [
          ConditionOperators.equals,
          ConditionOperators.not_equals,
          ConditionOperators.greater_than,
          ConditionOperators.less_than,
          ConditionOperators.greater_than_or_equal,
          ConditionOperators.less_than_or_equal,
          ConditionOperators.empty,
          ConditionOperators.not_empty,
        ];

      default:
        return [
          ConditionOperators.equals,
          ConditionOperators.not_equals,
          ConditionOperators.empty,
          ConditionOperators.not_empty,
        ];
    }
  };

  const getConditionDescription = (condition: Condition, formField?: FormField): string => {
    if (!formField) return "שדה לא נבחר";

    const operatorLabel = conditionOperatorLabels[condition.operator];
    const fieldName = formField.displayName;

    if (
      condition.operator === ConditionOperators.empty ||
      condition.operator === ConditionOperators.not_empty
    ) {
      return `${fieldName} ${operatorLabel}`;
    }

    let valueDisplay = "";
    if (formField.typeId === FieldTypeIds.date && typeof condition.value === "string") {
      valueDisplay = condition.value ? new Date(condition.value).toLocaleDateString("he-IL") : "";
    } else if (Array.isArray(condition.value)) {
      valueDisplay = condition.value.join(", ");
    } else if (condition.value === "true" || condition.value === "false") {
      valueDisplay = condition.value === "true" ? "כן" : "לא";
    } else {
      valueDisplay = String(condition.value || "");
    }

    return `${fieldName} ${operatorLabel} "${valueDisplay}"`;
  };

  return (
    <ConditionItemContainer>
      {/* Condition row */}
      <ConditionItemFieldsContainer>
        <FormFieldWrapper style={{ width: "100%" }}>
          <CustomDropDownAutocomplete
            value={getFieldDisplayValue()}
            options={["בחר שדה...", ...fieldsForSelection.map((field) => field.displayName)]}
            onChangeHandler={handleFieldChange}
            isValid={true}
            label="בחר שדה..."
            isRequired={false}
            isDisabled={false}
            multipleOptions={false}
          />
        </FormFieldWrapper>

        <FormFieldWrapper style={{ width: "100%" }}>
          <CustomDropDownAutocomplete
            value={getOperatorDisplayValue()}
            options={[
              "סוג התנאי...",
              ...getAvailableOperators(
                formFields.find((field) => field.uniqueId === condition.field) || ({} as FormField),
              ).map((operator) => conditionOperatorLabels[operator]),
            ]}
            onChangeHandler={handleOperatorChange}
            isValid={true}
            label="סוג התנאי..."
            isRequired={false}
            isDisabled={!condition.field}
            multipleOptions={false}
          />
        </FormFieldWrapper>
        <FormFieldWrapper style={{ width: "100%" }}>
          <ConditionInputRenderer
            formField={formFields.find((f) => f.uniqueId === condition.field) || ({} as FormField)}
            condition={condition}
            handleConditionChange={onConditionChange}
            fieldOptions={fieldOptions}
          />
        </FormFieldWrapper>
        {/* Remove condition button */}
        <ConditionItemRemoveButton color="error" size="small" onClick={onRemove}>
          ✕
        </ConditionItemRemoveButton>
      </ConditionItemFieldsContainer>

      {/* Condition preview */}
      {condition.field && (
        <ConditionPreviewText>
          {getConditionDescription(
            condition,
            formFields.find((f) => f.uniqueId === condition.field),
          )}
        </ConditionPreviewText>
      )}
    </ConditionItemContainer>
  );
};

export default ConditionItem;
