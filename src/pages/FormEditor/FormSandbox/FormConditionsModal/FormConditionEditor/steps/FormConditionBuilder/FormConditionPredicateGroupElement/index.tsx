import { Button } from "@mui/material";
import { AddOutlined, DeleteOutlined } from "@mui/icons-material";
import {
  CONDITION_FIELD_TYPE_IDS,
} from "../../../../../../schemas/conditions/conditionField/baseConditionFieldSchema";
import { FormConditionBooleanOperator, FormConditionPredicateGroup } from "../../../../../../schemas/conditions";
import { FormFieldTypeId } from "../../../../../../../../utils/interfaces";
import { generateConditionId } from "../../../../../../utils";
import { Fragment, useEffect, useRef } from "react";
import { ConditionOperationToggle } from "../ConditionOperationToggle";
import { ConditionEditorSetDataFunction } from "../../../context/FormConditionEditorContext";
import { ConditionEditorStepId } from "../../../constants";
import { useFormStructureContext } from "../../../../../../context/FormStructureContext";
import { DeepPartial } from "../../../../../../../../types/utils";
import styles from "./style.module.scss";
import { FormConditionPredicateElement } from "./FormConditionPredicateElement";
import { GroupValidationErrors } from "../types";

interface Props {
  group: DeepPartial<FormConditionPredicateGroup>;
  index: number;
  hasSiblings: boolean;
  shouldScrollIntoView: boolean;
  validationErrors: GroupValidationErrors;
  setData: ConditionEditorSetDataFunction<typeof ConditionEditorStepId.CONDITION_BUILDER>;
}

function FormConditionPredicateGroupElement({
                                              group,
                                              index,
                                              hasSiblings,
                                              shouldScrollIntoView,
                                              setData,
                                              validationErrors,
                                            }: Props) {
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
            group.predicates?.map((predicate, conditionIndex) => (
              predicate &&
              <FormConditionPredicateElement key={predicate.id}
                                               condition={predicate}
                                               index={conditionIndex}
                                               parentGroupIndex={index}
                                               setData={setData}
                                               isLastCondition={conditionIndex === group.predicates!.length - 1}
                                               hasSiblings={group.predicates!.length > 1}
                                               fields={fields}
                                               availableFieldIds={availableFieldIds}
                                               shouldScrollIntoView={shouldScrollIntoView}
                                               validationErrors={validationErrors?.["properties"]?.["conditions"]?.items?.[conditionIndex]?.properties ?? null} />
            ))
          }
          <div className={styles.addConditionButtonContainer}>
            <Button className={styles.addConditionButton}
                    color={"primary"}
                    variant={"contained"}
                    onClick={() => setData((prev) => {
                      const group = { ...prev[index] };
                      group.predicates = [...group.predicates ?? [], {
                        id: generateConditionId(),
                        operator: FormConditionBooleanOperator.AND,
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

export { FormConditionPredicateGroupElement };