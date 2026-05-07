import { Autocomplete, Box, Button, TextField } from "@mui/material";
import { DeleteOutlined } from "@mui/icons-material";
import {
  ConditionFieldTypeId,
  ConditionFieldTypeIds,
  FormComparator,
} from "../../../../../../../schemas/conditions/conditionField/baseConditionFieldSchema";
import { ComparatorOptions } from "../../utils";
import { FormConditionField, FormConditionPredicateGroup } from "../../../../../../../schemas/conditions";
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
  condition: DeepPartial<ArrayElement<FormConditionPredicateGroup["predicates"]>>;
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

function FormConditionPredicateElement({
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

  const getIsTargetValueNotRequired = (comparator: ArrayElement<FormConditionPredicateGroup["predicates"]>["field"]["comparator"] | undefined) => (
    !(condition.field?.typeId && comparator && ComparatorOptions[condition.field?.typeId].optionsProperties[comparator].requiresTargetValue)
  );

  const renderTargetValueField = useMemo(() => {
    const disabled = !condition.field?.typeId || getIsTargetValueNotRequired(condition.field.comparator);

    return (
      ComparatorOptions[condition.field?.typeId ?? ConditionFieldTypeIds.shortText].valueProperties.inputComponent({
        disabled: disabled,
        value: condition.field?.targetValue ?? "",
        helperText: !disabled ? (validationErrors?.field?.properties?.targetValue?.errors[0] ?? "") : "",
        error: !disabled && !!validationErrors?.field?.properties?.targetValue?.errors[0],
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
            targetValue: e.target.value != undefined ? ComparatorOptions[condition.field!.typeId!].valueProperties.valueTransformer(e.target.value) as any : "",
          };
          group.predicates = group.predicates!.toSpliced(index, 1, { ...modifiedCondition });

          return prev.toSpliced(parentGroupIndex, 1, group);
        }),
      })
    );
  }, [condition.field?.comparator, condition.field?.targetValue, setData, parentGroupIndex, condition, validationErrors]);

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
                    group.predicates = group.predicates!.toSpliced(index, 1, { ...modifiedCondition });

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
                const newComparator = ComparatorOptions[typeId].values[0];

                modifiedCondition.field = {
                  ...modifiedCondition.field,
                  id: fieldId,
                  typeId,
                  comparator: newComparator,
                  targetValue: undefined,
                } as FormConditionField;
              } else {
                modifiedCondition.field = undefined;
              }


              group.predicates = group.predicates!.toSpliced(index, 1, { ...modifiedCondition });

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
              error={!!validationErrors?.field?.errors[0]}
              helperText={validationErrors?.field?.errors[0]}
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
          options={condition.field?.typeId ? ComparatorOptions[condition.field?.typeId].values : []}
          value={condition.field?.comparator ?? (condition.field?.typeId ? ComparatorOptions[condition.field?.typeId].values[0] : -1)}
          getOptionLabel={(comparator) => condition.field?.typeId ? ComparatorOptions[condition.field?.typeId].optionsProperties[comparator].label : ""}
          onChange={
            (_, comparator) => setData((prev) => {
              const group = { ...prev[parentGroupIndex] };
              const modifiedCondition = { ...condition };
              const newComparator = (comparator ?? undefined) as FormComparator;

              modifiedCondition.field = {
                ...modifiedCondition.field,
                comparator: newComparator,
                ...(getIsTargetValueNotRequired(newComparator) && { targetValue: undefined }),
              };
              group.predicates = group.predicates!.toSpliced(index, 1, { ...modifiedCondition });

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
              group.predicates = group.predicates!.toSpliced(index, 1);

              if (index === 0 && group.predicates.length) {
                group.predicates[0]!.operator = undefined;
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

export { FormConditionPredicateElement };