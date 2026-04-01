import React from "react";
import {
  Condition,
  conditionOperatorLabels,
  ConditionOperators,
  ConditionOperatorType,
  FieldTypeIds,
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
import { FormFieldDto } from "../../types/shared";

type ConditionFieldExtra = {
  connectionType?: string | number;
  connectedFormId?: number;
  connectedFieldId?: string;
  conditions?: Condition[];
  sectionId?: string;
  sectionOrder?: number;
  sectionName?: string;
  sectionDescription?: string;
};

type ConditionalFormField = FormFieldDto & {
  extra?: ConditionFieldExtra;
};

type FieldOptionValue = {
  value?: unknown;
  fieldId: string;
};

interface ConditionItemProps {
  condition: Condition;
  formFields: ConditionalFormField[];
  availableFields?: ConditionalFormField[];
  onConditionChange: (field: string, value: any) => void;
  onRemove: () => void;
  fieldOptions?: Record<string, FieldOptionValue[]>;
}

const ConditionItem: React.FC<ConditionItemProps> = ({
  condition,
  formFields,
  availableFields,
  onConditionChange,
  onRemove,
  fieldOptions,
}) => {
  const fieldsForSelection = availableFields || formFields;

  const handleFieldChange = (value: string | string[]) => {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    if (selectedValue === "" || selectedValue === "בחר שדה...") {
      onConditionChange("field", "");
    } else {
      const selectedField = fieldsForSelection.find((field) => field.displayName === selectedValue);
      onConditionChange("field", selectedField?.id || "");
    }
  };

  const getFieldDisplayValue = () => {
    if (!condition.field) return "";
    const field = formFields.find((f) => f.id === condition.field);
    return field?.displayName || "";
  };

  const handleOperatorChange = (value: string | string[]) => {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    if (selectedValue === "" || selectedValue === "סוג התנאי...") {
      onConditionChange("operator", "");
    } else {
      const operatorEntry = Object.entries(conditionOperatorLabels).find(
        ([, label]) => label === selectedValue,
      );
      onConditionChange("operator", operatorEntry ? operatorEntry[0] : "");
    }
  };

  const getOperatorDisplayValue = () => {
    if (!condition.operator) return "";
    return conditionOperatorLabels[condition.operator] || "";
  };

  const getAvailableOperators = (field?: ConditionalFormField): ConditionOperatorType[] => {
    if (!field) return [];

    switch (field.fieldType) {
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

  const getConditionDescription = (
    currentCondition: Condition,
    formField?: ConditionalFormField,
  ): string => {
    if (!formField) return "שדה לא נבחר";

    const operatorLabel = conditionOperatorLabels[currentCondition.operator];
    const fieldName = formField.displayName;

    if (
      currentCondition.operator === ConditionOperators.empty ||
      currentCondition.operator === ConditionOperators.not_empty
    ) {
      return `${fieldName} ${operatorLabel}`;
    }

    let valueDisplay = "";
    if (formField.fieldType === FieldTypeIds.date && typeof currentCondition.value === "string") {
      valueDisplay = currentCondition.value
        ? new Date(currentCondition.value).toLocaleDateString("he-IL")
        : "";
    } else if (Array.isArray(currentCondition.value)) {
      valueDisplay = currentCondition.value.join(", ");
    } else if (currentCondition.value === "true" || currentCondition.value === "false") {
      valueDisplay = currentCondition.value === "true" ? "כן" : "לא";
    } else {
      valueDisplay = String(currentCondition.value || "");
    }

    return `${fieldName} ${operatorLabel} "${valueDisplay}"`;
  };

  const selectedField = formFields.find((field) => field.id === condition.field);

  return (
    <ConditionItemContainer>
      <ConditionItemFieldsContainer>
        <FormFieldWrapper style={{ width: "100%" }}>
          <CustomDropDownAutocomplete
            value={getFieldDisplayValue()}
            options={["בחר שדה...", ...fieldsForSelection.map((field) => field.displayName)]}
            onChangeHandler={handleFieldChange}
            label="בחר שדה..."
            isRequired={false}
            isDisabled={false}
            multipleOptions={false}
            validationMessage={null}
          />
        </FormFieldWrapper>

        <FormFieldWrapper style={{ width: "100%" }}>
          <CustomDropDownAutocomplete
            value={getOperatorDisplayValue()}
            options={[
              "סוג התנאי...",
              ...getAvailableOperators(selectedField).map(
                (operator) => conditionOperatorLabels[operator],
              ),
            ]}
            onChangeHandler={handleOperatorChange}
            label="סוג התנאי..."
            isRequired={false}
            isDisabled={!condition.field}
            multipleOptions={false}
            validationMessage={null}
          />
        </FormFieldWrapper>

        <FormFieldWrapper style={{ width: "100%" }}>
          <ConditionInputRenderer
            formField={selectedField}
            condition={condition}
            handleConditionChange={onConditionChange}
            fieldOptions={fieldOptions}
          />
        </FormFieldWrapper>

        <ConditionItemRemoveButton color="error" size="small" onClick={onRemove}>
          ✕
        </ConditionItemRemoveButton>
      </ConditionItemFieldsContainer>

      {condition.field && (
        <ConditionPreviewText>
          {getConditionDescription(condition, selectedField)}
        </ConditionPreviewText>
      )}
    </ConditionItemContainer>
  );
};

export default ConditionItem;
