import React from "react";
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { SelectChangeEvent } from "@mui/material";
import {
  ElementTypeIds,
  Form,
  FormField,
  IConnectionType,
  NotificationTexts,
} from "../../utils/interfaces";
import { showErrorNotification } from "../../utils/utils";
import OptionsField, { CheckboxData, ParentField } from "../OptionsField/OptionsField";
import DateField from "../DateField/DateField";
import HourField from "../HourField/HourField";
import CoordinateField from "../CoordinateField/CoordinateField";
import CheckBoxSelect from "../CheckBoxSelect/CheckBoxSelect";
import NumberField from "../NumberField/NumberField";
import FormFieldWrapper from "../FormFieldWrapper/FormFieldWrapper";
import FormInFormField from "../FormInFormField/FormInFormField";
import { ErrorMessageType } from "../../types/interfaces/forms.types";

export interface FormPropertyRendererProps {
  formField: FormField;
  formFields: FormField[];
  setFormFields: React.Dispatch<React.SetStateAction<FormField[]>>;
  setParentFieldId: React.Dispatch<string | undefined>;
  getFormPropertyTitleTextField: (field: FormField, index: number) => JSX.Element;
  dragHandleProps: DraggableProvidedDragHandleProps | null;
  responsesCount: number;
  deleteField: (field: FormField) => void;
  setConfirmMsg: (msg: string) => void;
  setConfirmOkFunc: (fn: () => void) => void;
  setConfirmBtnText: (text: string) => void;
  setShowConfirmMsg: (show: boolean) => void;
  errors: ErrorMessageType[];
}

export default function FormPropertyRenderer({
  formField,
  formFields,
  setFormFields,
  setParentFieldId,
  getFormPropertyTitleTextField,
  dragHandleProps,
  responsesCount,
  deleteField,
  setConfirmMsg,
  setConfirmOkFunc,
  setConfirmBtnText,
  setShowConfirmMsg,
  errors,
}: FormPropertyRendererProps) {
  const index = formField.index;
  let input: JSX.Element | null = null;
  let showRequiredToggle = true;

  const toggleRequired = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFields = [...formFields];
    const item = newFields.find((f) => f.index === index);
    if (item) {
      item.required = e.target.checked;
      setFormFields(newFields);
    }
  };

  // Field‐type specific rendering
  switch (formField.typeId) {
    case ElementTypeIds.longText:
    case ElementTypeIds.shortText:
      input = getFormPropertyTitleTextField(formField, index);
      break;

    case ElementTypeIds.options: {
      // default‐value helper
      const getDefaultValue = () => {
        if (typeof formField.defaultValue === "string") return formField.defaultValue;
        if (Array.isArray(formField.defaultValue)) return formField.defaultValue[0];
        return undefined;
      };
      const changeDefault = (val: string) => {
        const newFields = [...formFields];
        const target = newFields.find((f) => f.index === index);
        if (target) {
          target.defaultValue = val;
          setFormFields(newFields);
        }
      };

      input = (
        <OptionsField
          key={`options-${formFields.length}`}
          getBaseFieldElement={() => getFormPropertyTitleTextField(formField, index)}
          allFormFields={formFields}
          formField={formField}
          isOptionValid={(opt) => !!opt}
          defaultValue={getDefaultValue()}
          onChangeDefaultValue={changeDefault}
          onChange={(e, idx) => {
            const newFields = [...formFields];
            const item = newFields.find((f) => f.index === index);
            if (item && item.options) {
              item.options[idx] = e.target.value;
              setFormFields(newFields);
            }
          }}
          onClose={(e, idx) => {
            e.preventDefault();
            const newFields = [...formFields];
            const item = newFields.find((f) => f.index === index);
            if (item && item.options && item.options.length > 2) {
              item.options.splice(idx, 1);
              // update dependencies, etc...
              setFormFields(newFields);
            } else {
              showErrorNotification(NotificationTexts.OptionsMinAmount);
            }
          }}
          onAddOption={() => {
            const newFields = [...formFields];
            const item = newFields.find((f) => f.index === index);
            if (item && item.options) {
              item.options = [...item.options, ""];
              setFormFields(newFields);
            }
          }}
          onToggleIsMultiSelect={(e) => {
            const newFields = [...formFields];
            const item = newFields.find((f) => f.index === index);
            if (item) {
              item.multiSelect = e.target.checked;
              setFormFields(newFields);
            }
          }}
          onChangeFieldConnectionType={(e: SelectChangeEvent) => {
            const val = e.target.value as IConnectionType | undefined;
            const newFields = [...formFields];
            const item = newFields.find((f) => f.index === index);
            if (item) {
              item.connectionType = val;
              setFormFields(newFields);
            }
          }}
          onChangeConnectedForm={(val) => {
            const newFields = [...formFields];
            const item = newFields.find((f) => f.index === index);
            if (item) {
              item.connectedFormId = val;
              setFormFields(newFields);
            }
          }}
          onChangeConnectedFormField={(val) => {
            const newFields = [...formFields];
            const item = newFields.find((f) => f.index === index);
            if (item) {
              item.connectedFieldId = val;
              setFormFields(newFields);
            }
          }}
          onFieldConnected={(data: ParentField) => {
            const newFields = [...formFields];
            // ...update parentFieldId & dependencies...
            if (!data.parentFieldId) {
              formField.parentFieldId = undefined;
              formField.parentFieldName = undefined;
              formField.parentDependencies = undefined;
            } else {
              formField.parentFieldId = data.parentFieldId;
              formField.parentFieldName = data.parentFieldName;
              formField.parentDependencies = data.parentFieldOptions?.map((_, index) => ({
                parentOptionIndex: index,
                childOptionIndices: formField.options?.map((_, index) => index) ?? [],
              }));
            }
            setParentFieldId(formField.parentFieldId);
            ///////////////////////////////////////

            setFormFields(newFields);
          }}
          onCheckboxChange={(data: CheckboxData) => {
            const newFields = [...formFields];
            if (!formField.parentDependencies) {
              formField.parentDependencies = [];
            }
            const { parentOptionIndex, childOptionIndex, enabled } = data;
            let dependency = formField.parentDependencies.find(
              (dep) => dep.parentOptionIndex === parentOptionIndex,
            );
            if (!dependency && enabled) {
              formField.parentDependencies.push({
                parentOptionIndex: parentOptionIndex,
                childOptionIndices: [childOptionIndex],
              });
            }
            if (dependency) {
              const updatedIndices = enabled
                ? Array.from(new Set([...dependency.childOptionIndices, childOptionIndex]))
                : dependency.childOptionIndices.filter((idx) => idx !== childOptionIndex);
              dependency.childOptionIndices = updatedIndices;
            }

            setFormFields(newFields);
          }}
        />
      );
      break;
    }

    case ElementTypeIds.link:
      input = (
        <div className="link-inputs-div">{getFormPropertyTitleTextField(formField, index)}</div>
      );
      break;

    case ElementTypeIds.date:
      input = (
        <DateField
          getBaseFieldElement={() => getFormPropertyTitleTextField(formField, index)}
          formField={formField}
          onToggleDateAndTime={(e) => {
            const newFields = [...formFields];
            const item = newFields.find((f) => f.index === index);
            if (item) {
              item.dateAndTime = e.target.checked;
              setFormFields(newFields);
            }
          }}
          onDateChange={(e) => {
            const newFields = [...formFields];
            const item = newFields.find((f) => f.index === index);
            if (item) {
              item.initialValType = e.target.value;
              setFormFields(newFields);
            }
          }}
        />
      );
      break;

    case ElementTypeIds.time:
      input = (
        <HourField
          getBaseFieldElement={() => getFormPropertyTitleTextField(formField, index)}
          formField={formField}
          onSetDefaultTime={(e) => {
            const newFields = [...formFields];
            const item = newFields.find((f) => f.index === index);
            if (item) {
              item.showSeconds = e.target.checked;
              setFormFields(newFields);
            }
          }}
          onTimeChange={(e) => {
            const newFields = [...formFields];
            const item = newFields.find((f) => f.index === index);
            if (item) {
              item.initialValType = e.target.value;
              setFormFields(newFields);
            }
          }}
        />
      );
      break;

    case ElementTypeIds.location:
      input = (
        <>
          <div className="link-inputs-div">{getFormPropertyTitleTextField(formField, index)}</div>
          <CoordinateField
            formField={formField}
            setFormFields={setFormFields}
            index={index}
            formFields={formFields}
          />
        </>
      );
      break;

    case ElementTypeIds.checkbox:
      showRequiredToggle = false;
      input = (
        <>
          {getFormPropertyTitleTextField(formField, index)}
          <CheckBoxSelect
            formField={formField}
            setFormFields={setFormFields}
            index={index}
            formFields={formFields}
          />
        </>
      );
      break;

    case ElementTypeIds.list:
      input = (
        <div className="list-inputs-div">{getFormPropertyTitleTextField(formField, index)}</div>
      );
      break;

    case ElementTypeIds.number:
      if (!formField.numberType) formField.numberType = "integer";
      input = (
        <>
          {getFormPropertyTitleTextField(formField, index)}
          <NumberField
            formField={formField}
            setFormFields={setFormFields}
            index={index}
            formFields={formFields}
          />
        </>
      );
      break;

    case ElementTypeIds.file:
      input = <>{getFormPropertyTitleTextField(formField, index)}</>;
      break;

    case ElementTypeIds.linkedForm: //טופס
      formField.shouldSyncToMetro = false;
      showRequiredToggle = false;

      input = (
        <>
          {getFormPropertyTitleTextField(formField, index)}
          <FormInFormField
            error={errors.find((error) => error.fieldId === formField.uniqueId)?.message}
            formField={formField}
            onChangeConnectedForm={(value: Partial<Form> | undefined) => {
              const item = formFields[index];
              if (item && value) {
                item.connectedFormId = value.id;
                item.displayName = value.name || formField.displayName;
                setFormFields((prev) => [...prev]);
              }
            }}
          />
        </>
      );
      break;
  }

  if (!input) return null;

  return (
    <FormFieldWrapper
      formField={formField}
      allFormFields={formFields}
      showRequiredToggle={showRequiredToggle}
      dragHandleProps={dragHandleProps}
      onFieldDelete={() => {
        if (responsesCount > 0) {
          setConfirmMsg(
            "לתשומת לבך! ייתכן ושדה זה מכיל תוכן כחלק מהתגובות לטופס. לכן, מחיקת השדה תוביל למחיקה והסרת הנתונים מהטופס ללא יכולת שחזור. האם למחוק שדה זה מהטופס?",
          );
          setConfirmOkFunc(() => () => {
            deleteField(formField);
          });
          setConfirmBtnText("מחיקת השדה"); // Set the correct button text here

          setShowConfirmMsg(true);
        } else {
          deleteField(formField);
        }
      }}
      onToggleRequired={toggleRequired}>
      {input}
    </FormFieldWrapper>
  );
}
