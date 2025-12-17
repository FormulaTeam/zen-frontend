import { useFormConditionEditorContext } from "../../context/FormConditionEditorContext";
import { ConditionEditorStepId } from "../../constants";
import { Autocomplete, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useFormStructureContext } from "../../../../../context/FormStructureContext";
import styles from "./style.module.css";
import { FormConditionOperator } from "../../../../../schemas/conditions";

function OperationToggle({ value, className }: { value: FormConditionOperator, className: string }) {
  return (
    <ToggleButtonGroup exclusive orientation={"vertical"} className={className} value={value}>
      <ToggleButton className={styles.operatorButton} value={FormConditionOperator.AND}>
        וגם
      </ToggleButton>
      <ToggleButton className={styles.operatorButton} value={FormConditionOperator.OR}>
        או
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

function FormConditionsBuilder() {
  const { formStructure: { fields } } = useFormStructureContext();
  const { conditionData: { groups }, setData } = useFormConditionEditorContext(ConditionEditorStepId.CONDITION_BUILDER);

  const availableFields = Object.keys(fields).filter((fieldId) => fields[fieldId].data.displayName && fields[fieldId].data.typeId).map((fieldId) => fields[fieldId]);
  const availableFieldIds = availableFields.map((field) => field.id);

  return (
    <div className={styles.mainContainer}>
      {
        groups?.map((group, index) => (
          group &&
          <>
            {
              group.operator &&
              <div>
                <div />
                <OperationToggle value={group.operator} className={styles.groupOperatorButtonGroup} />
                <div />
              </div>
            }
            <div className={styles.groupContainer} key={group.id}>
              <div className={styles.groupTitle}>{`קבוצה ${index + 1}`}</div>
              <div className={styles.conditionsWrapper}>
                {
                  group.conditions?.map((condition) => (
                    condition &&
                    <>
                      {
                        condition.operator &&
                        <div>
                          <div />
                          <OperationToggle value={condition.operator} className={styles.conditionOperatorButtonGroup} />
                          <div />
                        </div>
                      }
                      <div className={styles.conditionContainer} key={condition.id}>
                        <Autocomplete options={availableFieldIds}
                                      value={condition.field?.id}
                                      getOptionLabel={(fieldId) => fields[fieldId]?.data?.displayName}
                          // renderOption={
                          //
                          // }
                                      renderInput={(params) => (
                                        <TextField {...params}
                                                   label={"בחירת שדה"}
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
                                                   label={"בחירת שדה"}
                                                   slotProps={{
                                                     htmlInput: {
                                                       ...params.inputProps,
                                                       autoComplete: "new-password",
                                                     },
                                                   }} />
                                      )}
                        />
                      </div>
                    </>
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