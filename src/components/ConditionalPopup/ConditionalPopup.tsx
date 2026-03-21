import { conditionDisplayModes } from "../../utils/interfaces";
import { texts } from "../../utils/texts";
import { Close } from "@mui/icons-material";
import ConditionList from "./ConditionList";
import EditCondition from "./EditCondition";
import { useConditionalPopup } from "../../hooks/useConditionalPopup";
import { StyledDialog, StyledDialogTitle, CloseButton, StyledDialogContent } from "./styled";
import { FormFieldDto } from "../../types/shared";

type ConditionalFieldExtra = {
  conditions?: any[];
  sectionId?: string;
  sectionOrder?: number;
  sectionName?: string;
  sectionDescription?: string;
};

type ConditionalFormField = FormFieldDto & {
  extra?: ConditionalFieldExtra;
};

interface ConditionalPopupProps {
  formFields: ConditionalFormField[];
  onClose?: () => void;
  onSave?: (updatedFields: ConditionalFormField[]) => void;
}

const ConditionalPopup: React.FC<ConditionalPopupProps> = ({
  formFields,
  onClose,
  onSave,
}: ConditionalPopupProps) => {
  const {
    displayMode,
    editingConditions,
    handleEditCondition,
    handleDeleteCondition,
    handleCreateNew,
    handleBackToList,
  } = useConditionalPopup({ formFields, onSave });

  return (
    <StyledDialog open maxWidth="xl" fullWidth>
      <StyledDialogTitle>
        {texts.heb.manageConditions}
        <CloseButton aria-label="close" onClick={onClose}>
          <Close />
        </CloseButton>
      </StyledDialogTitle>
      <StyledDialogContent>
        {displayMode === conditionDisplayModes.list && (
          <ConditionList
            onSelect={handleCreateNew}
            formFields={formFields}
            onEditCondition={handleEditCondition}
            onDeleteCondition={handleDeleteCondition}
          />
        )}
        {displayMode === conditionDisplayModes.edit && (
          <EditCondition
            formFields={formFields}
            onClose={handleBackToList}
            onSave={onSave}
            existingConditions={editingConditions}
            index={editingConditions?.index}
          />
        )}
      </StyledDialogContent>
    </StyledDialog>
  );
};

export default ConditionalPopup;
