import { Button } from "@mui/material";
import { AddOutlined, DeleteOutlined } from "@mui/icons-material";
import {
  CONDITION_FIELD_TYPE_IDS,
} from "../../../../../../schemas/conditions/conditionField/baseConditionFieldSchema";
import { FormConditionGroup, FormConditionOperator } from "../../../../../../schemas/conditions";
import { FormFieldTypeId } from "../../../../../../../../utils/interfaces";
import { generateConditionId } from "../../../../../../utils";
import { Fragment, useEffect, useRef } from "react";
import { ConditionOperationToggle } from "../ConditionOperationToggle";
import { ConditionEditorSetDataFunction } from "../../../context/FormConditionEditorContext";
import { ConditionEditorStepId } from "../../../constants";
import { useFormStructureContext } from "../../../../../../context/FormStructureContext";
import { DeepPartial } from "../../../../../../../../types/utils";
import styles from "./style.module.scss";
import { FormConditionGroupItem } from "./FormConditionGroupItem";

interface Props {
  group: DeepPartial<FormConditionGroup>;
  index: number;
  hasSiblings: boolean;
  shouldScrollIntoView: boolean;
  setData: ConditionEditorSetDataFunction<typeof ConditionEditorStepId.CONDITION_BUILDER>;
}

function FormConditionGroupElement({ group, index, hasSiblings, shouldScrollIntoView, setData }: Props) {
  const { formStructure: { fields } } = useFormStructureContext();

  const containerRef = useRef<HTMLDivElement>(null);

  const availableFields = Object.keys(fields).filter((fieldId) => fields[fieldId].data.displayName && (CONDITION_FIELD_TYPE_IDS as FormFieldTypeId[]).includes(fields[fieldId].data.typeId)).map((fieldId) => fields[fieldId]);
  const availableFieldIds = availableFields.map((field) => field.id);

  useEffect(() => {
    shouldScrollIntoView &&
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [shouldScrollIntoView]);

  return (
    <>
      {
        group.operator &&
        <div>
          <div />
          <ConditionOperationToggle value={group.operator}
                                    type={"group"}
                                    onChange={
                                      (operator) => setData((prev) => {
                                        const group = { ...prev[index] };
                                        group.operator = operator;

                                        return prev.toSpliced(index, 1, group);
                                      })
                                    } />
          <div />
        </div>
      }
      <div ref={containerRef} className={styles.groupContainer}>
        <div className={styles.groupTitle}>
          {`קבוצה ${index + 1}`}
          <div className={styles.deleteGroupButtonContainer}>
            <Button className={styles.deleteGroupButton}
                    disabled={!hasSiblings}
                    color={"error"}
                    onClick={(_) => {
                      hasSiblings &&
                      setData((prev) => {
                        const groups = [...prev];
                        groups.splice(index, 1);

                        if (index === 0 && groups.length) {
                          groups[0] = { ...groups[0], operator: undefined };
                        }

                        return groups;
                      });
                    }}>
              <DeleteOutlined sx={{ fontSize: 25, color: hasSiblings ? "#b53442" : "#85878D" }} />
            </Button>
          </div>
        </div>
        <div className={styles.conditionsWrapper}>
          {
            group.conditions?.map((condition, conditionIndex) => (
              condition &&
              <FormConditionGroupItem key={condition.id}
                                      condition={condition}
                                      index={conditionIndex}
                                      parentGroupIndex={index}
                                      setData={setData}
                                      isLastCondition={conditionIndex === group.conditions!.length - 1}
                                      hasSiblings={group.conditions!.length > 1}
                                      fields={fields}
                                      availableFieldIds={availableFieldIds}
                                      shouldScrollIntoView={shouldScrollIntoView} />
            ))
          }
          <div className={styles.addConditionButtonContainer}>
            <Button className={styles.addConditionButton}
                    color={"primary"}
                    variant={"contained"}
                    onClick={() => setData((prev) => {
                      const group = { ...prev[index] };
                      group.conditions = [...group.conditions ?? [], {
                        id: generateConditionId(),
                        operator: FormConditionOperator.AND,
                      }];

                      return prev.toSpliced(index, 1, group);
                    })}>
              <AddOutlined />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export { FormConditionGroupElement };