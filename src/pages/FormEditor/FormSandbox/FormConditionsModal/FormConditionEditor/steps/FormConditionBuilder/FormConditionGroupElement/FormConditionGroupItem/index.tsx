import { Autocomplete, Box, Button, TextField } from "@mui/material";
import { DeleteOutlined } from "@mui/icons-material";
import {
  ConditionFieldTypeId,
  ConditionFieldTypeIds,
  FormConditionType,
} from "../../../../../../../schemas/conditions/conditionField/baseConditionFieldSchema";
import { ConditionTypeOptions } from "../../utils";
import { FormConditionField, FormConditionGroup } from "../../../../../../../schemas/conditions";
import { FORM_ELEMENT_ICONS } from "../../../../../../../../../components/FORM_ELEMENT_ICONS";
import { FieldTypeIds, FORM_ELEMENTS } from "../../../../../../../../../utils/interfaces";
import { useEffect, useMemo, useRef } from "react";
import { ConditionOperationToggle } from "../../ConditionOperationToggle";
import { ConditionEditorSetDataFunction } from "../../../../context/FormConditionEditorContext";
import { ConditionEditorStepId } from "../../../../constants";
import { ArrayElement, DeepPartial } from "../../../../../../../../../types/utils";
import styles from "./style.module.scss";
import { FormStructure } from "../../../../../../../context/FormStructureContext";
import { FormFieldExtra } from "../../../../../../../schemas/fields";
import { OptionsSource } from "../../../../../../../schemas/fields/optionsSchema";
import {
  SpecificOptions,
} from "../../../../../../FormStructure/FormFieldElement/ExtraElement/elements/OptionsFieldExtra";
import { GroupItemValidationErrors } from "../../types";


interface Props {
  condition: DeepPartial<ArrayElement<FormConditionGroup["conditions"]>>;
  index: number;
  parentGroupIndex: number;
  isLastCondition: boolean;
  hasSiblings: boolean;
  fields: FormStructure["fields"];
  availableFieldIds: string[];
  shouldScrollIntoView: boolean;
  validationErrors: GroupItemValidationErrors;
  setData: ConditionEditorSetDataFunction<typeof ConditionEditorStepId.CONDITION_BUILDER>;
}

function FormConditionGroupItem({
                                  condition,
                                  index,
                                  parentGroupIndex,
                                  isLastCondition,
                                  hasSiblings,
                                  fields,
                                  availableFieldIds,
                                  shouldScrollIntoView,
                                  validationErrors,
                                  setData,
                                }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getIsTargetValueNotRequired = (conditionType: ArrayElement<FormConditionGroup["conditions"]>["field"]["conditionType"] | undefined) => (
    !(condition.field?.typeId && conditionType && ConditionTypeOptions[condition.field?.typeId].optionsProperties[conditionType].requiresTargetValue)
  );

  const renderTargetValueField = useMemo(() => {
    const disabled = !condition.field?.typeId || getIsTargetValueNotRequired(condition.field.conditionType);

    console.log(validationErrors?.field?.properties?.targetValue?.errors);

    return (
      ConditionTypeOptions[condition.field?.typeId ?? ConditionFieldTypeIds.shortText].valueProperties.inputComponent({
        disabled: disabled,
        value: condition.field?.targetValue ?? "",
        helperText: !disabled ? (validationErrors?.field?.properties?.targetValue?.errors[0] ?? "") : "",
        error: !disabled && !!validationErrors?.field?.properties?.targetValue?.errors,
        label: "ערך",
        ...(condition.field?.typeId === ConditionFieldTypeIds.options && condition.field.id ?
            {
              items: (
                (
                  fields[condition.field.id].data.extra as FormFieldExtra<typeof FieldTypeIds.options>
                )?.options as SpecificOptions<typeof OptionsSource.MANUAL>
              ).items,
            } :
            undefined
        ),
        onChange: (e) => setData((prev) => {
          const group = { ...prev[parentGroupIndex] };
          const modifiedCondition = { ...condition };

          modifiedCondition.field = {
            ...modifiedCondition.field,
            targetValue: ConditionTypeOptions[condition.field!.typeId!].valueProperties.valueTransformer(e.target.value) as any,
          };
          group.conditions = group.conditions!.toSpliced(index, 1, { ...modifiedCondition });

          return prev.toSpliced(parentGroupIndex, 1, group);
        }),
      })
    );
  }, [condition.field?.conditionType, condition.field?.targetValue, setData, parentGroupIndex, condition, validationErrors]);

  useEffect(() => {
    shouldScrollIntoView &&
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [shouldScrollIntoView]);

  return (
    <div ref={containerRef} className={styles.conditionContainer}>
      {
        index === 0 && hasSiblings ? (
          <div className={styles.conditionOperationToggleContainer}>
            <div className={styles.firstOperationToggleTopConnector} />
          </div>
        ) : (
          condition.operator &&
          <div className={styles.conditionOperationToggleContainer}>
            <div className={styles.conditionOperationToggleWrapper}>
              <ConditionOperationToggle value={condition.operator}
                                        type={"condition"}
                                        onChange={
                                          (operator) => setData((prev) => {
                                            const group = { ...prev[parentGroupIndex] };
                                            const modifiedCondition = { ...condition };

                                            modifiedCondition.operator = operator;
                                            group.conditions = group.conditions!.toSpliced(index, 1, { ...modifiedCondition });

                                            return prev.toSpliced(parentGroupIndex, 1, group);
                                          })
                                        } />
            </div>
            <div className={
              isLastCondition ?
                styles.lastOperationToggleBottomConnector :
                styles.operationToggleBottomConnector
            } />
            {
              !isLastCondition &&
              <div className={styles.operationToggleTopConnector} />
            }
          </div>
        )
      }
      <div className={styles.conditionFieldsContainer}>
        <Autocomplete options={availableFieldIds}
                      value={condition.field?.id ?? null}
                      getOptionLabel={(fieldId) => fields[fieldId]?.data?.displayName ?? "שגיאה - שדה אינו קיים"}
                      noOptionsText={"אין שדות מתאימים בטופס"}
                      onChange={
                        (_, fieldId) => setData((prev) => {
                          const group = { ...prev[parentGroupIndex] };
                          const modifiedCondition = { ...condition };

                          if (fieldId) {
                            const typeId = fields[fieldId]?.data?.typeId as ConditionFieldTypeId;
                            const newConditionType = ConditionTypeOptions[typeId].values[0];

                            modifiedCondition.field = {
                              ...modifiedCondition.field,
                              id: fieldId,
                              typeId,
                              conditionType: newConditionType,
                              ...(getIsTargetValueNotRequired(newConditionType) && { targetValue: undefined }),
                            } as FormConditionField;
                          } else {
                            modifiedCondition.field = undefined;
                          }


                          group.conditions = group.conditions!.toSpliced(index, 1, { ...modifiedCondition });

                          return prev.toSpliced(parentGroupIndex, 1, group);
                        })
                      }
                      renderOption={({ key, ...restProps }, fieldId) => {
                        const typeId = fields[fieldId]?.data?.typeId as ConditionFieldTypeId;

                        return (
                          <Box key={key} component={"li"} {...restProps}>
                            <div className={styles.fieldOptionIcon}>
                              {FORM_ELEMENT_ICONS[FORM_ELEMENTS[typeId].icon]}
                            </div>
                            {fields[fieldId]?.data?.displayName}
                          </Box>
                        );
                      }
                      }
                      renderInput={(params) => (
                        <TextField {...params}
                                   label={"שדה"}
                                   error={!!validationErrors?.field?.properties?.id?.errors}
                                   helperText={validationErrors?.field?.properties?.id?.errors[0]}
                                   slotProps={{
                                     htmlInput: {
                                       ...params.inputProps,
                                       autoComplete: "new-password",
                                       dir: "rtl",
                                     },
                                   }} />
                      )}
        />
        <Autocomplete
          disableClearable
          disabled={condition.field?.typeId === undefined}
          options={condition.field?.typeId ? ConditionTypeOptions[condition.field?.typeId].values : []}
          value={condition.field?.conditionType ?? (condition.field?.typeId ? ConditionTypeOptions[condition.field?.typeId].values[0] : -1)}
          getOptionLabel={(conditionType) => condition.field?.typeId ? ConditionTypeOptions[condition.field?.typeId].optionsProperties[conditionType].label : ""}
          onChange={
            (_, conditionType) => setData((prev) => {
              const group = { ...prev[parentGroupIndex] };
              const modifiedCondition = { ...condition };
              const newConditionType = (conditionType ?? undefined) as FormConditionType;

              modifiedCondition.field = {
                ...modifiedCondition.field,
                conditionType: newConditionType,
                ...(getIsTargetValueNotRequired(newConditionType) && { targetValue: undefined }),
              };
              group.conditions = group.conditions!.toSpliced(index, 1, { ...modifiedCondition });

              return prev.toSpliced(parentGroupIndex, 1, group);
            })
          }
          renderInput={(params) => (
            <TextField {...params}
                       label={"סוג תנאי"}
                       slotProps={{
                         htmlInput: {
                           ...params.inputProps,
                           autoComplete: "new-password",
                           dir: "rtl",
                         },
                       }} />
          )}
        />
        <div style={{ marginTop: -8 }}>
          {renderTargetValueField}
        </div>
      </div>
      <div className={styles.deleteConditionButtonContainer}>
        {
          hasSiblings &&
          <Button className={styles.deleteConditionButton}
                  onClick={() => setData((prev) => {
                    const group = { ...prev[parentGroupIndex] };
                    group.conditions = group.conditions!.toSpliced(index, 1);

                    if (index === 0 && group.conditions.length) {
                      group.conditions[0]!.operator = undefined;
                    }

                    return prev.toSpliced(parentGroupIndex, 1, group);
                  })}>
            <DeleteOutlined />
          </Button>
        }
      </div>
    </div>
  );
}

export { FormConditionGroupItem };