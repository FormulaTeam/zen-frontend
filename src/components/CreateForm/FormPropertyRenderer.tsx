import React from "react";
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { SelectChangeEvent } from "@mui/material";
import { NotificationTexts } from "../../utils/interfaces";
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
import { FormDto, FormFieldDto } from "../../types/shared";
import { fieldType } from "formula-gear";

type ParentDependency = {
  parentOptionIndex: number;
  childOptionIndices: number[];
};

type FieldExtra = {
  options?: string[];
  multiSelect?: boolean;
  defaultValue?: string | string[];
  connectionType?: string | number;
  connectedFormId?: number;
  connectedFieldId?: string;
  parentFieldId?: string;
  parentFieldName?: string;
  parentDependencies?: ParentDependency[];
  dateAndTime?: boolean;
  initialValType?: unknown;
  showSeconds?: boolean;
  numberType?: string;
  shouldSyncToMetro?: boolean;
};

const getFieldExtra = (field: FormFieldDto): FieldExtra =>
  (field.extra as FieldExtra | undefined) ?? {};

const updateFieldExtra = (field: FormFieldDto, patch: Partial<FieldExtra>): FormFieldDto => ({
  ...field,
  extra: {
    ...getFieldExtra(field),
    ...patch,
  },
});

const updateFieldByIndex = (
  fields: FormFieldDto[],
  index: number,
  updater: (field: FormFieldDto) => FormFieldDto,
): FormFieldDto[] => fields.map((field) => (field.index === index ? updater(field) : field));

export interface FormPropertyRendererProps {
  formField: FormFieldDto;
  formFields: FormFieldDto[];
  setFormFields: React.Dispatch<React.SetStateAction<FormFieldDto[]>>;
  setParentFieldId: React.Dispatch<string | undefined>;
  getFormPropertyTitleTextField: (field: FormFieldDto, index: number) => JSX.Element;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  responsesCount: number;
  deleteField: (field: FormFieldDto) => void;
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
  const formFieldExtra = getFieldExtra(formField);

  let input: JSX.Element | null = null;
  let showRequiredToggle = true;

  const toggleRequired = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormFields((prev) =>
      updateFieldByIndex(prev, index, (field) => ({
        ...field,
        isRequired: e.target.checked,
      })),
    );
  };

  switch (formField.fieldType) {
    case fieldType.LongText:
    case fieldType.ShortText:
      input = getFormPropertyTitleTextField(formField, index);
      break;

    case fieldType.Options: {
      const getDefaultValue = () => {
        if (typeof formFieldExtra.defaultValue === "string") return formFieldExtra.defaultValue;
        if (Array.isArray(formFieldExtra.defaultValue)) return formFieldExtra.defaultValue[0];
        return undefined;
      };

      const changeDefault = (val: string) => {
        setFormFields((prev) =>
          updateFieldByIndex(prev, index, (field) =>
            updateFieldExtra(field, {
              defaultValue: val,
            }),
          ),
        );
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
            setFormFields((prev) =>
              updateFieldByIndex(prev, index, (field) => {
                const extra = getFieldExtra(field);
                const options = [...(extra.options ?? [])];
                options[idx] = e.target.value;
                return updateFieldExtra(field, { options });
              }),
            );
          }}
          onClose={(e, idx) => {
            e.preventDefault();

            const currentOptions = formFieldExtra.options ?? [];
            if (currentOptions.length <= 2) {
              showErrorNotification(NotificationTexts.OptionsMinAmount);
              return;
            }

            setFormFields((prev) =>
              updateFieldByIndex(prev, index, (field) => {
                const extra = getFieldExtra(field);
                const options = [...(extra.options ?? [])];
                options.splice(idx, 1);

                const parentDependencies = extra.parentDependencies?.map((dep) => ({
                  ...dep,
                  childOptionIndices: dep.childOptionIndices
                    .filter((childIndex) => childIndex !== idx)
                    .map((childIndex) => (childIndex > idx ? childIndex - 1 : childIndex)),
                }));

                return updateFieldExtra(field, {
                  options,
                  parentDependencies,
                });
              }),
            );
          }}
          onAddOption={() => {
            setFormFields((prev) =>
              updateFieldByIndex(prev, index, (field) => {
                const extra = getFieldExtra(field);
                return updateFieldExtra(field, {
                  options: [...(extra.options ?? []), ""],
                });
              }),
            );
          }}
          onToggleIsMultiSelect={(e) => {
            setFormFields((prev) =>
              updateFieldByIndex(prev, index, (field) =>
                updateFieldExtra(field, {
                  multiSelect: e.target.checked,
                }),
              ),
            );
          }}
          onChangeFieldConnectionType={(e: SelectChangeEvent) => {
            const val = e.target.value as string | number | undefined;

            setFormFields((prev) =>
              updateFieldByIndex(prev, index, (field) =>
                updateFieldExtra(field, {
                  connectionType: val,
                }),
              ),
            );
          }}
          onChangeConnectedForm={(val) => {
            setFormFields((prev) =>
              updateFieldByIndex(prev, index, (field) =>
                updateFieldExtra(field, {
                  connectedFormId: val,
                }),
              ),
            );
          }}
          onChangeConnectedFormField={(val) => {
            setFormFields((prev) =>
              updateFieldByIndex(prev, index, (field) =>
                updateFieldExtra(field, {
                  connectedFieldId: val || undefined,
                }),
              ),
            );
          }}
          onFieldConnected={(data: ParentField) => {
            setFormFields((prev) =>
              updateFieldByIndex(prev, index, (field) => {
                const extra = getFieldExtra(field);

                if (!data.parentFieldId) {
                  setParentFieldId(undefined);
                  return updateFieldExtra(field, {
                    parentFieldId: undefined,
                    parentFieldName: undefined,
                    parentDependencies: undefined,
                  });
                }

                const options = extra.options ?? [];
                const parentDependencies = (data.parentFieldOptions ?? []).map(
                  (_, optionIndex) => ({
                    parentOptionIndex: optionIndex,
                    childOptionIndices: options.map((__, childIndex) => childIndex),
                  }),
                );

                setParentFieldId(data.parentFieldId);

                return updateFieldExtra(field, {
                  parentFieldId: data.parentFieldId,
                  parentFieldName: data.parentFieldName,
                  parentDependencies,
                });
              }),
            );
          }}
          onCheckboxChange={(data: CheckboxData) => {
            setFormFields((prev) =>
              updateFieldByIndex(prev, index, (field) => {
                const extra = getFieldExtra(field);
                const dependencies = [...(extra.parentDependencies ?? [])];
                const { parentOptionIndex, childOptionIndex, enabled } = data;

                const dependencyIndex = dependencies.findIndex(
                  (dep) => dep.parentOptionIndex === parentOptionIndex,
                );

                if (dependencyIndex === -1) {
                  if (enabled) {
                    dependencies.push({
                      parentOptionIndex,
                      childOptionIndices: [childOptionIndex],
                    });
                  }

                  return updateFieldExtra(field, {
                    parentDependencies: dependencies,
                  });
                }

                const dependency = dependencies[dependencyIndex];
                const updatedIndices = enabled
                  ? Array.from(new Set([...dependency.childOptionIndices, childOptionIndex]))
                  : dependency.childOptionIndices.filter((idx) => idx !== childOptionIndex);

                dependencies[dependencyIndex] = {
                  ...dependency,
                  childOptionIndices: updatedIndices,
                };

                return updateFieldExtra(field, {
                  parentDependencies: dependencies,
                });
              }),
            );
          }}
        />
      );
      break;
    }

    case fieldType.Link:
      input = (
        <div className="link-inputs-div">{getFormPropertyTitleTextField(formField, index)}</div>
      );
      break;

    case fieldType.Date:
      input = (
        <DateField
          getBaseFieldElement={() => getFormPropertyTitleTextField(formField, index)}
          formField={formField}
          onToggleDateAndTime={(e) => {
            setFormFields((prev) =>
              updateFieldByIndex(prev, index, (field) =>
                updateFieldExtra(field, {
                  dateAndTime: e.target.checked,
                }),
              ),
            );
          }}
          onDateChange={(e) => {
            setFormFields((prev) =>
              updateFieldByIndex(prev, index, (field) =>
                updateFieldExtra(field, {
                  initialValType: e.target.value,
                }),
              ),
            );
          }}
        />
      );
      break;

    case fieldType.Time:
      input = (
        <HourField
          getBaseFieldElement={() => getFormPropertyTitleTextField(formField, index)}
          formField={formField}
          onSetDefaultTime={(e) => {
            setFormFields((prev) =>
              updateFieldByIndex(prev, index, (field) =>
                updateFieldExtra(field, {
                  showSeconds: e.target.checked,
                }),
              ),
            );
          }}
          onTimeChange={(e) => {
            setFormFields((prev) =>
              updateFieldByIndex(prev, index, (field) =>
                updateFieldExtra(field, {
                  initialValType: e.target.value,
                }),
              ),
            );
          }}
        />
      );
      break;

    case fieldType.Location:
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

    case fieldType.Boolean:
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

    case fieldType.List:
      input = (
        <div className="list-inputs-div">{getFormPropertyTitleTextField(formField, index)}</div>
      );
      break;

    case fieldType.Number:
      input = (
        <>
          {getFormPropertyTitleTextField(formField, index)}
          <NumberField
            formField={
              formFieldExtra.numberType
                ? formField
                : updateFieldExtra(formField, { numberType: "integer" })
            }
            setFormFields={setFormFields}
            index={index}
            formFields={formFields}
          />
        </>
      );
      break;

    case fieldType.File:
      input = <>{getFormPropertyTitleTextField(formField, index)}</>;
      break;

    case fieldType.Form:
      showRequiredToggle = false;

      input = (
        <>
          {getFormPropertyTitleTextField(formField, index)}
          <FormInFormField
            error={errors.find((error) => error.fieldId === formField.id)?.message}
            formField={updateFieldExtra(formField, { shouldSyncToMetro: false })}
            onChangeConnectedForm={(value: Partial<FormDto> | undefined) => {
              if (!value) return;

              setFormFields((prev) =>
                updateFieldByIndex(prev, index, (field) => ({
                  ...updateFieldExtra(field, {
                    connectedFormId: value.id,
                    shouldSyncToMetro: false,
                  }),
                  displayName: value.name || field.displayName,
                })),
              );
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
          setConfirmBtnText("מחיקת השדה");
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
