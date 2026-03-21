import MenuItem from "@mui/material/MenuItem";
import { ConditionsRoot, ConditionUtils, AffectedTarget } from "../../utils/interfaces";
import {
  AffectedTargetsContainer,
  AffectedTargetsListContainer,
  AffectedTargetsListTitle,
  AffectedTargetsWrapper,
  AffectedTargetItem,
  AffectedTargetText,
  AffectedTargetRemoveButton,
  AffectedTargetsSelectContainer,
  AffectedTargetsSelect,
} from "./styled";
import { FormFieldDto } from "../../types/shared";
import type { ConditionalFormField } from "../../utils/conditionUtils";

interface AffectedTargetsSectionProps {
  conditionsRoot: ConditionsRoot;
  formFields: ConditionalFormField[];
  onAddAffectedTarget: (target: AffectedTarget) => void;
  onRemoveAffectedTarget: (targetType: "section" | "field", targetId: string) => void;
}

const AffectedTargetsSection: React.FC<AffectedTargetsSectionProps> = ({
  conditionsRoot,
  formFields,
  onAddAffectedTarget,
  onRemoveAffectedTarget,
}: AffectedTargetsSectionProps) => {
  return (
    <AffectedTargetsContainer elevation={2}>
      {conditionsRoot.affectedTargets.length > 0 && (
        <AffectedTargetsListContainer>
          <AffectedTargetsListTitle variant="subtitle2">מה יוצג:</AffectedTargetsListTitle>
          <AffectedTargetsWrapper>
            {conditionsRoot.affectedTargets.map((target) => (
              <AffectedTargetItem
                key={`${target.type}-${target.id}`}
                elevation={1}
                targetType={target.type}>
                <AffectedTargetText variant="body2">
                  {target.type === "section" ? "מקטע" : "שדה"}: {target.name}
                </AffectedTargetText>
                <AffectedTargetRemoveButton
                  size="small"
                  onClick={() => onRemoveAffectedTarget(target.type, target.id)}>
                  ✕
                </AffectedTargetRemoveButton>
              </AffectedTargetItem>
            ))}
          </AffectedTargetsWrapper>
        </AffectedTargetsListContainer>
      )}

      <AffectedTargetsSelectContainer>
        {ConditionUtils.getAvailableSections(formFields, conditionsRoot).length > 0 && (
          <AffectedTargetsSelect
            displayEmpty
            size="small"
            onChange={(e) => {
              const sectionId = e.target.value as string;
              if (sectionId) {
                const sections = ConditionUtils.getAvailableSections(formFields, conditionsRoot);
                const section = sections.find((s) => s.id === sectionId);
                if (section) {
                  onAddAffectedTarget({
                    type: "section",
                    id: section.id,
                    name: section.name,
                  });
                }
                (e.target as HTMLSelectElement).value = "";
              }
            }}
            value="">
            <MenuItem value="">
              <em>הוסף מקטע...</em>
            </MenuItem>
            {ConditionUtils.getAvailableSections(formFields, conditionsRoot)
              .filter(
                (section) =>
                  !conditionsRoot.affectedTargets.some(
                    (target) => target.type === "section" && target.id === section.id,
                  ),
              )
              .map((section) => (
                <MenuItem key={section.id} value={section.id}>
                  מקטע: {section.name}
                </MenuItem>
              ))}
          </AffectedTargetsSelect>
        )}

        <AffectedTargetsSelect
          displayEmpty
          size="small"
          onChange={(e) => {
            const fieldId = e.target.value as string;
            if (fieldId) {
              const field = formFields.find((f) => f.id === fieldId);
              if (field) {
                onAddAffectedTarget({
                  type: "field",
                  id: field.id,
                  name: field.displayName,
                });
              }
              (e.target as HTMLSelectElement).value = "";
            }
          }}
          value="">
          <MenuItem value="">
            <em>הוסף שדה...</em>
          </MenuItem>
          {ConditionUtils.getAvailableFields(formFields, conditionsRoot, true)
            .filter(
              (field) =>
                !conditionsRoot.affectedTargets.some(
                  (target) => target.type === "field" && target.id === field.id,
                ),
            )
            .map((field) => (
              <MenuItem key={field.id} value={field.id}>
                שדה: {field.displayName}
              </MenuItem>
            ))}
        </AffectedTargetsSelect>
      </AffectedTargetsSelectContainer>
    </AffectedTargetsContainer>
  );
};

export default AffectedTargetsSection;
