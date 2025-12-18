import { FieldTypeIds, FormField, ResponseForm } from "../../../utils/interfaces";
import { Box, Button, Tooltip, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { Add } from "@mui/icons-material";
import ConnectedFormSection from "../../../components/FormSection/ConnectedFormSection";

interface FormInsideFormProps {
  formField: any;
  childForms: any;
  handleRemoveChildForm: (uniqueId: string, index: number) => void;
  childFormsSaving: boolean;
  user: any;
  viewMode: boolean;
  copyMode: boolean;
  savedResponse: ResponseForm | null;
  handleChildSaved: (childFormIndex: number, success: boolean) => void;
  handleChildValid: (uniqueId: string, success: boolean) => void;
  childFormsValidate: boolean;
  isSaving: boolean;
  isLoading: boolean;
  handleAddChildForm: (childFormIndex: number) => void;
  formFields: FormField[];
}

const FormInsideForm = ({
  formField,
  childForms,
  childFormsSaving,
  handleRemoveChildForm,
  user,
  viewMode,
  copyMode,
  savedResponse,
  handleChildSaved,
  handleChildValid,
  childFormsValidate,
  isSaving,
  isLoading,
  handleAddChildForm,
  formFields,
}: FormInsideFormProps) => {
  const { formId } = useParams();
  if (formField.typeId !== FieldTypeIds.form || !formField.connectedFormId) {
    return null;
  }

  const getChildFormTitle = (childFormId: number) => {
    return formFields.find((f) => f.connectedFormId === childFormId)?.displayName || "";
  };

  // Find the corresponding child form data and its index
  const childFormIndex = childForms.findIndex((cf) => cf.formId === formField.connectedFormId);
  const childFormData = childForms[childFormIndex];

  if (!childFormData || childFormIndex === -1) {
    return null;
  }

  return (
    <Box key={`child-form-${formField.connectedFormId}`}>
      {childFormData.children.map((child, i) =>
        childFormData.shown ? (
          <ConnectedFormSection
            key={child.id || child.uniqueId || `child-${formField.connectedFormId}-${i}`}
            handleRemoveChildForm={() => {
              handleRemoveChildForm(child.uniqueId, i);
            }}
            formsLength={childFormData.children.length}
            shouldSave={childFormsSaving}
            user={user}
            viewMode={viewMode}
            copyMode={copyMode}
            formId={formId!}
            field={child}
            parentResponse={savedResponse?.id}
            index={i}
            childSaved={(success: boolean) => handleChildSaved(childFormIndex, success)}
            shouldValidate={childFormsValidate}
            childValid={(success: boolean) => handleChildValid(child.uniqueId, success)}
            id={child.id}
            shouldLoad={isSaving}
          />
        ) : null,
      )}
      {!isLoading && !viewMode && (
        <Button
          variant="text"
          size="small"
          startIcon={<Add />}
          sx={{ minWidth: "auto", padding: "8px" }}
          onClick={() => handleAddChildForm(childFormIndex)}>
          <Tooltip title={"הוספת תגובה - " + getChildFormTitle(childFormData.formId)}>
            <Typography variant="subtitle2" fontWeight={600}>
              {getChildFormTitle(childFormData.formId)
                ? "הוספת תגובה - " + getChildFormTitle(childFormData.formId)
                : "הוספת תגובה"}
            </Typography>
          </Tooltip>
        </Button>
      )}
    </Box>
  );
};

export default FormInsideForm;
