import React, { useEffect, useState } from "react";
import { ConditionGroup, ConditionUtils } from "../../utils/interfaces";
import AffectedTargetsSection from "./AffectedTargetsSection";
import ConditionGroupComponent from "./ConditionGroup";
import ConditionsPreview from "./ConditionsPreview";
import ConditionControls from "./ConditionControls";
import { useConditions } from "../../hooks/useConditions";
import { useConnectedFormOptions } from "../../hooks/useConnectedFormOptions";
import {
  EditConditionContainer,
  EditConditionTitle,
  EditConditionMainLayout,
  EditConditionRightPanel,
  EditConditionScrollContainer,
  EditConditionLeftPanel,
  EditConditionLeftScrollContainer,
  EditConditionControlsContainer,
  EditConditionPreviewContainer,
  SectionTitle,
  CloseButton,
  MainEditConditionContainer,
} from "./styled";
import { ArrowBackIosNew, Info, Edit } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import AffectedTargetsDescription from "./AffectedTargetsDescription";
import { Typography, IconButton, ClickAwayListener, Box } from "@mui/material";
import BaseFormInput from "../BaseFormInput/BaseFormInput";
import { FormFieldDto } from "../../types/shared";

type ConditionalFieldExtra = {
  conditions?: ConditionGroup[];
  sectionId?: string;
  sectionOrder?: number;
  sectionName?: string;
  sectionDescription?: string;
};

type ConditionalFormField = FormFieldDto & {
  extra?: ConditionalFieldExtra;
};

interface EditConditionProps {
  formFields: ConditionalFormField[];
  onClose: () => void;
  onSave?: (updatedFields: ConditionalFormField[]) => void;
  existingConditions?: {
    conditions: ConditionGroup[];
    affectedFields: ConditionalFormField[];
  } | null;
  index?: number;
}

const EditCondition: React.FC<EditConditionProps> = ({
  formFields,
  onClose,
  onSave,
  existingConditions,
  index,
}) => {
  const { fieldOptions } = useConnectedFormOptions({ formFields });
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");

  const {
    conditionsRoot,
    handleAddCondition,
    handleAddConditionGroup,
    handleConditionChange,
    handleGroupLogicalOperatorChange,
    handleGroupParentLogicalOperatorChange,
    handleRemoveCondition,
    handleRemoveGroup,
    handleAddAffectedTarget,
    handleRemoveAffectedTarget,
    handleNameChange,
    handleSave,
  } = useConditions({
    formFields,
    existingConditions,
    onSave,
    onClose,
  });

  useEffect(() => {
    setDraftName(conditionsRoot.name || "");
  }, [conditionsRoot.name]);

  const handleNameSave = () => {
    handleNameChange(draftName.trim());
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setDraftName(conditionsRoot.name || "");
    setIsEditingName(false);
  };

  const handleClickAway = () => {
    if (isEditingName) {
      handleNameSave();
    }
  };

  const getConditionDisplayName = () => {
    if (conditionsRoot.name?.trim()) {
      return conditionsRoot.name;
    }
    if (index !== undefined) {
      return `התנייה #${index + 1}`;
    }
    return "התנייה חדשה";
  };

  const availableFieldsForConditions = ConditionUtils.getAvailableFields(
    formFields,
    conditionsRoot,
  );

  return (
    <EditConditionContainer>
      <EditConditionTitle variant="h6">
        <ClickAwayListener onClickAway={handleClickAway}>
          <Box sx={{ display: "inline-flex", alignItems: "center", mb: 2, gap: 1 }}>
            {isEditingName ? (
              <BaseFormInput
                autoFocus
                value={draftName}
                placeholder="הזן שם..."
                onChange={(e) => setDraftName(e.target.value)}
                variant="standard"
                sx={{ flexGrow: 1 }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleNameSave();
                  } else if (e.key === "Escape") {
                    handleNameCancel();
                  }
                }}
              />
            ) : (
              <Typography variant="h6">{getConditionDisplayName()}</Typography>
            )}

            {!isEditingName && (
              <Tooltip title="עריכת שם התנייה">
                <IconButton size="small" onClick={() => setIsEditingName(true)}>
                  <Edit />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </ClickAwayListener>

        <CloseButton onClick={onClose} aria-label="close">
          <ArrowBackIosNew />
        </CloseButton>
      </EditConditionTitle>

      <MainEditConditionContainer>
        <EditConditionMainLayout>
          <EditConditionLeftPanel>
            <EditConditionLeftScrollContainer>
              <SectionTitle variant="subtitle1">תנאים להצגה</SectionTitle>
              {conditionsRoot.groups.map((group, groupIndex) => (
                <ConditionGroupComponent
                  key={group.id}
                  group={group}
                  groupIndex={groupIndex}
                  formFields={formFields}
                  availableFields={availableFieldsForConditions}
                  onConditionChange={handleConditionChange}
                  onRemoveCondition={handleRemoveCondition}
                  onGroupLogicalOperatorChange={handleGroupLogicalOperatorChange}
                  onGroupParentLogicalOperatorChange={handleGroupParentLogicalOperatorChange}
                  onAddCondition={handleAddCondition}
                  onRemoveGroup={handleRemoveGroup}
                  showRemoveGroup={conditionsRoot.groups.length > 1}
                  fieldOptions={fieldOptions}
                />
              ))}
            </EditConditionLeftScrollContainer>
          </EditConditionLeftPanel>

          <EditConditionRightPanel>
            <EditConditionScrollContainer>
              <SectionTitle variant="subtitle1">
                במידה והתנאים מתקיימים מה נדרש להציג{" "}
                <Tooltip title={<AffectedTargetsDescription />}>
                  <Info fontSize="small" />
                </Tooltip>
              </SectionTitle>
              <AffectedTargetsSection
                conditionsRoot={conditionsRoot}
                formFields={formFields}
                onAddAffectedTarget={handleAddAffectedTarget}
                onRemoveAffectedTarget={handleRemoveAffectedTarget}
              />
            </EditConditionScrollContainer>
          </EditConditionRightPanel>
        </EditConditionMainLayout>

        <EditConditionPreviewContainer>
          <ConditionsPreview conditionsRoot={conditionsRoot} formFields={formFields} />
        </EditConditionPreviewContainer>
      </MainEditConditionContainer>

      <EditConditionControlsContainer>
        <ConditionControls
          conditionsRoot={conditionsRoot}
          formFields={formFields}
          onAddConditionGroup={handleAddConditionGroup}
          onSave={handleSave}
        />
      </EditConditionControlsContainer>
    </EditConditionContainer>
  );
};

export default EditCondition;
