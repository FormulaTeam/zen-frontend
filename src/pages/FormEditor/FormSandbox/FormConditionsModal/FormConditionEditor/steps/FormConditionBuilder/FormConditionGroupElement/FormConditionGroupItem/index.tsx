import { Autocomplete, Box, Button, TextField } from "@mui/material";
import { DeleteOutlined } from "@mui/icons-material";
import {
  ConditionFieldTypeId,
  FormConditionType,
} from "../../../../../../../schemas/conditions/conditionField/baseConditionFieldSchema";
import { ConditionTypeOptions } from "../../utils";
import { FormConditionField, FormConditionGroup } from "../../../../../../../schemas/conditions";
import { FORM_ELEMENT_ICONS } from "../../../../../../../../../components/FORM_ELEMENT_ICONS";
import { FORM_ELEMENTS } from "../../../../../../../../../utils/interfaces";
import { useEffect, useRef } from "react";
import { ConditionOperationToggle } from "../../ConditionOperationToggle";
import { ConditionEditorSetDataFunction } from "../../../../context/FormConditionEditorContext";
import { ConditionEditorStepId } from "../../../../constants";
import { ArrayElement, DeepPartial } from "../../../../../../../../../types/utils";
import styles from "./style.module.scss";
import { FormStructure } from "../../../../../../../context/FormStructureContext";

interface Props {
  condition: DeepPartial<ArrayElement<FormConditionGroup["conditions"]>>;
  index: number;
  parentGroupIndex: number;
  isLastCondition: boolean;
  hasSiblings: boolean;
  fields: FormStructure["fields"];
  availableFieldIds: string[];
  shouldScrollIntoView: boolean;
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
                                  setData,
                                }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getIsTargetValueNotRequired = (conditionType: ArrayElement<FormConditionGroup["conditions"]>["field"]["conditionType"] | undefined) => (
    !(condition.field?.typeId && conditionType && ConditionTypeOptions[condition.field?.typeId].data[conditionType].requiresTargetValue)
  );

  useEffect(() => {
    shouldScrollIntoView &&
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [shouldScrollIntoView]);

  return (
    <div ref={containerRef} className={styles.conditionContainer}>
      {
        condition.operator &&
        <div className={styles.conditionOperatorButtonGroupWrapper}>
          <div className={
            index === 1 ?
              styles.firstOperationToggleTopConnector :
              styles.operationToggleTopConnector
          } />
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
          <div className={
            isLastCondition ?
              styles.lastOperationToggleBottomConnector :
              styles.operationToggleBottomConnector
          } />
        </div>
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
          getOptionLabel={(conditionType) => condition.field?.typeId ? ConditionTypeOptions[condition.field?.typeId].data[conditionType].label : ""}
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
        {
          <TextField variant={"standard"}
                     label={"ערך"}
                     disabled={!condition.field?.typeId || getIsTargetValueNotRequired(condition.field.conditionType)}
                     value={condition.field?.targetValue ?? ""}
                     onChange={(e) => setData((prev) => {
                       const group = { ...prev[parentGroupIndex] };
                       const modifiedCondition = { ...condition };

                       modifiedCondition.field = {
                         ...modifiedCondition.field,
                         targetValue: e.target.value as any,
                       };
                       group.conditions = group.conditions!.toSpliced(index, 1, { ...modifiedCondition });

                       return prev.toSpliced(parentGroupIndex, 1, group);
                     })} />
        }
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