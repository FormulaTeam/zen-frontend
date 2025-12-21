import { useFormConditionEditorContext } from "../../context/FormConditionEditorContext";
import { ConditionEditorStepId } from "../../constants";
import {
  Autocomplete,
  Box,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupProps,
} from "@mui/material";
import { useFormStructureContext } from "../../../../../context/FormStructureContext";
import styles from "./style.module.scss";
import { FormConditionField, FormConditionGroups, FormConditionOperator } from "../../../../../schemas/conditions";
import { DeleteOutlined } from "@mui/icons-material";
import { Fragment, SetStateAction } from "react";
import { DeepPartial } from "../../../../../../../types/utils";
import {
  CONDITION_FIELD_TYPE_IDS,
  ConditionFieldTypeId,
  FormConditionType,
} from "../../../../../schemas/conditions/conditionField/baseConditionFieldSchema";
import { FORM_ELEMENTS, FormFieldTypeId } from "../../../../../../../utils/interfaces";
import { ConditionTypeOptions } from "./utils";
import { FORM_ELEMENT_ICONS } from "../../../../../../../components/FORM_ELEMENT_ICONS";

function OperationToggle({ type, value, onChange }: {
  type: "group" | "condition",
  value: FormConditionOperator,

  onChange?: (value: FormConditionOperator) => void;
}) {
  const className = type === "group" ? styles.groupOperatorButtonGroup : styles.conditionOperatorButtonGroup;
  const orientation: ToggleButtonGroupProps["orientation"] = type === "group" ? "horizontal" : "vertical";

  return (
    <ToggleButtonGroup exclusive orientation={orientation}
                       className={className}
                       value={value}
                       onChange={(_, value) => onChange?.(value)}>
      <ToggleButton className={styles.operatorButton}
                    disabled={value === FormConditionOperator.AND}
                    value={FormConditionOperator.AND}
                    sx={{
                      border: "2px light-gray solid",
                      "&.Mui-selected": {
                        backgroundColor: "#1976D2",
                        color: "white",
                        boxShadow: "0 3px 0px 0 #0a5095 inset",
                      },
                    }}>
        וגם
      </ToggleButton>
      <ToggleButton className={styles.operatorButton}
                    disabled={value === FormConditionOperator.OR}
                    value={FormConditionOperator.OR}
                    sx={{
                      border: "2px light-gray solid",
                      "&.Mui-selected": {
                        backgroundColor: "#0d92d5",
                        color: "white",
                        boxShadow: "0 3px 0px 0 #236faf inset",
                      },
                    }}>
        או
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

function FormConditionsBuilder() {
  const { formStructure: { fields } } = useFormStructureContext();
  const { conditionData: { groups }, setData } = useFormConditionEditorContext(ConditionEditorStepId.CONDITION_BUILDER);

  const availableFields = Object.keys(fields).filter((fieldId) => fields[fieldId].data.displayName && (CONDITION_FIELD_TYPE_IDS as FormFieldTypeId[]).includes(fields[fieldId].data.typeId)).map((fieldId) => fields[fieldId]);
  const availableFieldIds = availableFields.map((field) => field.id);

  return (
    <div className={styles.mainContainer}>
      {
        groups?.map((group, groupIndex) => (
          group &&
          <Fragment key={group.id}>
            {
              group.operator &&
              <div>
                <div />
                <OperationToggle value={group.operator}
                                 type={"group"}
                                 onChange={
                                   (operator) => setData((prev) => {
                                     const group = { ...prev[groupIndex] };

                                     group.operator = operator;

                                     return [...prev].toSpliced(groupIndex, 1, group);
                                   })
                                 } />
                <div />
              </div>
            }
            <div className={styles.groupContainer}>
              <div className={styles.groupTitle}>{`קבוצה ${groupIndex + 1}`}</div>
              <div className={styles.conditionsWrapper}>
                {
                  group.conditions?.map((condition, conditionIndex) => (
                    condition &&
                    <div className={styles.conditionContainer} key={condition.id}>
                      {
                        condition.operator &&
                        <div className={styles.conditionOperatorButtonGroupWrapper}>
                          <div className={
                            conditionIndex === 1 ?
                              styles.firstOperationToggleTopConnector :
                              styles.operationToggleTopConnector
                          } />
                          <OperationToggle value={condition.operator}
                                           type={"condition"}
                                           onChange={
                                             (operator) => setData((prev) => {
                                               const group = { ...prev[groupIndex] };
                                               const modifiedCondition = { ...condition };

                                               modifiedCondition.operator = operator;
                                               group.conditions = group.conditions!.toSpliced(conditionIndex, 1, { ...modifiedCondition });

                                               return [...prev].toSpliced(groupIndex, 1, group);
                                             })
                                           } />
                          <div className={
                            conditionIndex === group.conditions!.length - 1 ?
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
                                          const group = { ...prev[groupIndex] };
                                          const modifiedCondition = { ...condition };

                                          if (fieldId) {
                                            const typeId = fields[fieldId]?.data?.typeId as ConditionFieldTypeId;

                                            modifiedCondition.field = {
                                              ...modifiedCondition.field,
                                              id: fieldId,
                                              typeId,
                                              conditionType: ConditionTypeOptions[typeId].values[0],
                                            } as FormConditionField;
                                          } else {
                                            modifiedCondition.field = undefined;
                                          }


                                          group.conditions = group.conditions!.toSpliced(conditionIndex, 1, { ...modifiedCondition });

                                          return [...prev].toSpliced(groupIndex, 1, group);
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
                              const group = { ...prev[groupIndex] };
                              const modifiedCondition = { ...condition };

                              modifiedCondition.field = {
                                ...modifiedCondition.field,
                                conditionType: (conditionType ?? undefined) as FormConditionType,
                              };
                              group.conditions = group.conditions!.toSpliced(conditionIndex, 1, { ...modifiedCondition });

                              return [...prev].toSpliced(groupIndex, 1, group);
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
                          (condition.field?.typeId && condition.field?.conditionType) &&
                          ConditionTypeOptions[condition.field?.typeId].data[condition.field?.conditionType].requiresTargetValue &&
                          <TextField variant={"standard"}
                                     label={"ערך"}
                                     value={condition.field?.targetValue ?? ""}
                                     onChange={(e) => setData!(((prev) => {
                                       const group = { ...prev[groupIndex] };
                                       const modifiedCondition = { ...condition };

                                       modifiedCondition.field = {
                                         ...modifiedCondition.field,
                                         targetValue: e.target.value as any,
                                       };
                                       group.conditions = group.conditions!.toSpliced(conditionIndex, 1, { ...modifiedCondition });

                                       return [...prev].toSpliced(groupIndex, 1, group);
                                     }) as SetStateAction<DeepPartial<FormConditionGroups>>)} />
                        }
                      </div>
                      <div className={styles.deleteButtonContainer}>
                        {
                          group.conditions!.length > 1 &&
                          <Button className={styles.deleteButton}
                                  onClick={() => setData!(((prev) => {
                                    const group = { ...prev[groupIndex] };
                                    group.conditions = group.conditions!.toSpliced(conditionIndex, 1);

                                    if (conditionIndex === 0 && group.conditions.length) {
                                      group.conditions[0]!.operator = undefined;
                                    }

                                    return [...prev].toSpliced(groupIndex, 1, group);
                                  }) as SetStateAction<DeepPartial<FormConditionGroups>>)}>
                            <DeleteOutlined />
                          </Button>
                        }
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </Fragment>
        ))
      }
    </div>
  );
}

export { FormConditionsBuilder };