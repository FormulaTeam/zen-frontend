import { useFormConditionEditorContext } from "../../context/FormConditionEditorContext";
import { ConditionEditorStepId } from "../../constants";
import {
  Autocomplete,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupProps,
} from "@mui/material";
import { useFormStructureContext } from "../../../../../context/FormStructureContext";
import styles from "./style.module.scss";
import { FormConditionGroups, FormConditionOperator } from "../../../../../schemas/conditions";
import { DeleteOutlined } from "@mui/icons-material";
import { SetStateAction } from "react";
import { ArrayElement, DeepPartial } from "../../../../../../../types/utils";
import { ConditionFieldTypeIds } from "../../../../../schemas/conditions/conditionField/baseConditionFieldSchema";
import { FieldTypeIds, FormFieldTypeId } from "../../../../../../../utils/interfaces";
import { TextConditionType } from "../../../../../schemas/conditions/conditionField/conditionTypes/TextConditionType";
import {
  NumberConditionType,
} from "../../../../../schemas/conditions/conditionField/conditionTypes/NumberConditionType";
import {
  CheckboxConditionType,
} from "../../../../../schemas/conditions/conditionField/conditionTypes/CheckboxConditionType";
import { DateConditionType } from "../../../../../schemas/conditions/conditionField/conditionTypes/DateConditionType";
import {
  OptionsConditionType,
} from "../../../../../schemas/conditions/conditionField/conditionTypes/OptionsConditionType";

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
                        backgroundColor: "#8f73e6",
                        color: "white",
                        boxShadow: "0 3px 0px 0 #5a5095 inset",
                      },
                    }}>
        או
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

const CONDITION_FIELD_TYPE_IDS = Object.values(ConditionFieldTypeIds);

const ConditionTypeOptions: Record<ArrayElement<typeof CONDITION_FIELD_TYPE_IDS>, number[]> = {
  [FieldTypeIds.shortText]: Object.values(TextConditionType),
  [FieldTypeIds.longText]: Object.values(TextConditionType),
  [FieldTypeIds.number]: Object.values(NumberConditionType),
  [FieldTypeIds.date]: Object.values(DateConditionType),
  [FieldTypeIds.options]: Object.values(OptionsConditionType),
  [FieldTypeIds.checkbox]: Object.values(CheckboxConditionType),
} as const;

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
          <>
            {
              group.operator &&
              <div>
                <div />
                <OperationToggle value={group.operator}
                                 type={"group"}
                                 onChange={(operator) => setData!(((prev) => {
                                   const group = { ...prev[groupIndex] };

                                   group.operator = operator;

                                   return [...prev].toSpliced(groupIndex, 1, group);
                                 }) as SetStateAction<DeepPartial<FormConditionGroups>>)
                                 } />
                <div />
              </div>
            }
            <div className={styles.groupContainer} key={group.id}>
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
                                           onChange={(operator) => setData!(((prev) => {
                                             const group = { ...prev[groupIndex] };
                                             const modifiedCondition = { ...condition };

                                             modifiedCondition.operator = operator;
                                             group.conditions = group.conditions!.toSpliced(conditionIndex, 1, { ...modifiedCondition });

                                             return [...prev].toSpliced(groupIndex, 1, group);
                                           }) as SetStateAction<DeepPartial<FormConditionGroups>>)
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
                                      value={condition.field?.id}
                                      getOptionLabel={(fieldId) => fields[fieldId]?.data?.displayName}
                                      onChange={(_, id) => setData!(((prev) => {
                                        const group = { ...prev[groupIndex] };
                                        const modifiedCondition = { ...condition };

                                        modifiedCondition.field = {
                                          ...modifiedCondition.field,
                                          id: id ?? undefined,
                                        };
                                        group.conditions = group.conditions!.toSpliced(conditionIndex, 1, { ...modifiedCondition });

                                        return [...prev].toSpliced(groupIndex, 1, group);
                                      }) as SetStateAction<DeepPartial<FormConditionGroups>>)}
                          // renderOption={
                          //
                          // }
                                      renderInput={(params) => (
                                        <TextField {...params}
                                                   label={"שדה"}
                                                   slotProps={{
                                                     htmlInput: {
                                                       ...params.inputProps,
                                                       autoComplete: "new-password",
                                                     },
                                                   }} />
                                      )}
                        />
                        <Autocomplete options={availableFieldIds}
                                      value={condition.field?.id}
                                      getOptionLabel={(fieldId) => fields[fieldId]?.data?.displayName}
                          // renderOption={
                          //
                          // }
                                      renderInput={(params) => (
                                        <TextField {...params}
                                                   label={"סוג תנאי"}
                                                   slotProps={{
                                                     htmlInput: {
                                                       ...params.inputProps,
                                                       autoComplete: "new-password",
                                                     },
                                                   }} />
                                      )}
                        />
                        <TextField variant={"standard"} label={"ערך"} />
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
          </>
        ))
      }
    </div>
  );
}

export { FormConditionsBuilder };