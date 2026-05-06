import React, { useRef, useState, useEffect } from "react";
import { useFormConditionEditorContext } from "../../context/FormConditionEditorContext";
import { ConditionEditorStepId, ConditionOperatorLabel } from "../../constants";
import { useFormStructureContext } from "../../../../../context/FormStructureContext";
import { ComparatorOptionsProperties } from "../FormConditionBuilder/utils";
import { Chip, TextField, Typography, Tooltip } from "@mui/material";
import { OverflowTooltip } from "@components/OverflowTooltip";
import { FormComponentType, FormConditionBooleanOperator } from "../../../../../schemas/conditions";
import styles from "../../../../../FormEditorHeader/style.module.css";
import summaryStyles from "./style.module.css";

function FormConditionsSummary() {
  const {
    conditionData: { groups, dependantComponents, name },
    setData,
  } = useFormConditionEditorContext(ConditionEditorStepId.SUMMARY);
  const { formStructure: { fields, sections } } = useFormStructureContext();

  const dependantFields = dependantComponents[FormComponentType.FIELD] ?? [];
  const dependantSections = dependantComponents[FormComponentType.SECTION] ?? [];

  return (
    <div className={summaryStyles.container}>

      <div className={summaryStyles.borderedSection}>
        <Typography className={summaryStyles.sectionTitle}>שם ההתנייה</Typography>
        <div className={summaryStyles.nameInputWrapper}>
          <TextField
            value={name ?? ""}
            slotProps={{ htmlInput: { className: styles.titleInput, maxLength: 30, } }}
            size="medium"
            placeholder="התנייה #1"
            variant="standard"
            fullWidth
            onChange={(e) => setData(e.target.value || undefined)}
          />
        </div>
      </div>

      <div className={summaryStyles.borderedSection}>
        <Typography className={summaryStyles.sectionTitle}>התנאים שהוגדרו</Typography>
        <div className={summaryStyles.groupsRow}>
          {(groups ?? []).map((group, groupIndex) => {
            const groupOperator = group?.operator;

            return (
              <div key={group?.id ?? groupIndex} className={summaryStyles.groupWrapper}>
                {groupOperator != null && groupIndex > 0 && (
                  <div
                    className={`${summaryStyles.operatorBadge} ${groupOperator === FormConditionBooleanOperator.OR
                      ? summaryStyles.operatorBadgeOr
                      : summaryStyles.operatorBadgeAnd
                      }`}
                  >
                    {ConditionOperatorLabel[groupOperator as FormConditionBooleanOperator]}
                  </div>
                )}

                <div className={summaryStyles.groupCard}>
                  <Typography className={summaryStyles.groupTitle}>
                    קבוצה {groupIndex + 1}
                  </Typography>

                  <Typography className={summaryStyles.groupSubtitle}>
                    כאשר מתקיימים התנאים
                  </Typography>

                  <div className={summaryStyles.predicatesList}>
                    {(group?.predicates ?? []).map((predicate, predicateIndex) => {
                      const { field, operator: predicateOperator } = predicate ?? {};

                      const fieldDisplayName =
                        fields[field?.id ?? ""]?.data?.displayName ?? "שגיאה - שדה אינו קיים";
                      const comparatorLabel =
                        ComparatorOptionsProperties[field?.typeId ?? -1]?.[field?.comparator as number]?.label ?? "";
                      const targetValue = field?.targetValue;

                      return (
                        <div key={predicate?.id ?? predicateIndex} className={summaryStyles.predicateRow}>
                          {predicateIndex > 0 && predicateOperator != null && (
                            <Typography className={summaryStyles.predicateOperator}>
                              {ConditionOperatorLabel[predicateOperator as FormConditionBooleanOperator]}
                            </Typography>
                          )}
                          <div className={summaryStyles.predicateText}>
                            <span>שדה</span>
                            <OverflowTooltip title={fieldDisplayName}>
                              <span className={summaryStyles.ellipsisText}>{fieldDisplayName}</span>
                            </OverflowTooltip>
                            <span>{comparatorLabel}</span>
                            {targetValue != null && (
                              <OverflowTooltip title={String(targetValue)}>
                                <span className={summaryStyles.ellipsisText}>{String(targetValue)}</span>
                              </OverflowTooltip>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={summaryStyles.borderedSection}>
        <Typography className={summaryStyles.sectionTitle}>האלמנטים המותנים</Typography>

        {dependantSections.length > 0 && (
          <div className={summaryStyles.dependantRow}>
            <Typography className={summaryStyles.dependantLabel}>
              {dependantSections.length} מקטעים
            </Typography>
            <div className={summaryStyles.chipsRow}>
              {dependantSections.map((sectionId) => (
                <Chip
                  key={sectionId}
                  label={sections[sectionId ?? ""]?.title ?? sectionId}
                  size="small"
                  color="primary"
                  className={summaryStyles.sectionChip}
                />
              ))}
            </div>
          </div>
        )}

        {dependantFields.length > 0 && (
          <div className={summaryStyles.dependantRow}>
            <Typography className={summaryStyles.dependantLabel}>
              {dependantFields.length} שדות
            </Typography>
            <div className={summaryStyles.chipsRow}>
              {dependantFields.map((fieldId) => (
                <Chip
                  key={fieldId}
                  label={fields[fieldId ?? ""]?.data?.displayName ?? fieldId}
                  size="small"
                  variant="outlined"
                  color="primary"
                  className={summaryStyles.fieldChip}
                />
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export { FormConditionsSummary };
