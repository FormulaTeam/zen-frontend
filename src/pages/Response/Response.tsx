import { useEffect, useMemo, useState } from "react";
import { FieldTypeIds, ResponseForm } from "../../utils/interfaces";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useResponseSave } from "../../hooks/useResponseSave";
import { useResponseState } from "../../hooks/useResponseState";
import { showErrorNotification } from "../../utils/utils";
import { Add } from "@mui/icons-material";
import { FieldsWrapper, FormSectionsContainer, LoadingContainer, SectionContainer } from "./styled";
import ConnectedFormSection from "../../components/FormSection/ConnectedFormSection";
import { useChildForms } from "../../hooks/useChildForms";
import { resolveUserPermissions } from "../../utils/formFieldsResponses";
import styled from "styled-components";
import ResponseHeader from "../../components/ResponseComponents/ResponseHeader";
import ResponseSection from "../../components/ResponseComponents/ResponseSection";
import { useSuperAdmin } from "../../contexts/SuperAdminContext";
import AlertMsg from "../../components/AlertMsg/AlertMsg";
import { useValidationErrors } from "../../hooks/useValidationErrors";

const PageContainer = styled(Container)`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export default function Response({ user, roles, viewMode = false, copyMode = false }) {
  const [permissionTypes, setPermissionTypes] = useState<number[]>([]);
  const [savedResponse, setSavedResponse] = useState<ResponseForm | null>(null);
  const [showLoadingSaveBtn, setShowLoadingSaveBtn] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationPopup, setShowValidationPopup] = useState<boolean>(false);

  const { formId, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isSuperAdmin } = useSuperAdmin();
  const {
    formTitle,
    formFields,
    formFieldsByIdMap,
    formFieldsValuesMap,
    formFieldsValidMap,
    onChangeHandler,
    validateRequiredFields,
    loading,
    form,
    response,
    fieldOptions,
    loadingConnections,
    responsSections,
    collapsedSections,
    toggleSectionCollapse,
  } = useResponseState(formId, id, viewMode, copyMode);

  const saveAll = async () => {
    if (validateRequiredFields() && form) {
      try {
        const result = await saveResponse(formFieldsByIdMap, formFieldsValuesMap);
        if (!Array.isArray(result)) setSavedResponse(result);
        setChildFormsSaving(true);
      } catch (error: any) {
        if (error?.response?.data?.error?.includes("Metro")) {
          navigate(`/responses/${form.id}`);
        } else {
          console.error("error:", error);
          showErrorNotification("משהו השתבש");
          setShowLoadingSaveBtn(false);
        }
      }
    } else {
      console.error("some values are not valid!");
      // Generate validation error messages and show popup
      const errorMessages = generateValidationErrorMessages();
      if (errorMessages.length > 0) {
        setValidationErrors(errorMessages);
        setShowValidationPopup(true);
      }
      setShowLoadingSaveBtn(false);
    }
  };

  const { saveResponse, isSaving } = useResponseSave(form, response, user);

  const {
    childForms,
    setChildForms,
    childFormsSaving,
    setChildFormsSaving,
    childFormsValidate,
    setChildFormsValidate,
    handleAddChildForm,
    handleRemoveChildForm,
    handleChildSaved,
    handleChildValid,
  } = useChildForms({
    formFields,
    id,
    formId,
    saveAll,
    user,
    isSuperAdmin,
    roles,
  });

  const { generateValidationErrorMessages } = useValidationErrors({
    form,
    formFields,
    formFieldsValidMap,
    childForms,
    childFormsValidate,
  });

  const isLoading = useMemo(() => {
    return isSaving || childFormsSaving || loading || loadingConnections;
  }, [isSaving, childFormsSaving, loading, loadingConnections]);

  useEffect(() => {
    resolveUserPermissions(form, user, roles, viewMode, setPermissionTypes);
  }, [roles, form]);

  // Handle child form validation results
  useEffect(() => {
    if (!childFormsValidate) return;

    const shownForms = childForms.filter((cf) => cf.shown);

    // Check if all child forms have been validated
    const allValidated = shownForms.every(
      (childForm) => childForm.children?.length === childForm.valid?.length,
    );

    if (allValidated) {
      const isValid = shownForms.every((childForm) =>
        childForm.valid?.every((valid) => valid === true),
      );

      if (!isValid) {
        // Child form validation failed, show validation errors
        const errorMessages = generateValidationErrorMessages();
        if (errorMessages.length > 0) {
          setValidationErrors(errorMessages);
          setShowValidationPopup(true);
        }
      }
    }
  }, [childForms, childFormsValidate]);

  const onBack = () => {
    if (location.state?.parentFormId) {
      navigate(`/responses/${location.state.parentFormId}`, {});
    } else {
      form && navigate(`/responses/${form.id}`);
    }
  };

  const onEdit = () => navigate(`/response/edit/${formId}/${id}`);

  const onSaveAndClose = () => {
    childForms.length > 0 ? setChildFormsValidate(true) : saveAll();
  };

  const closeValidationPopup = () => {
    setShowValidationPopup(false);
    setValidationErrors([]);

    // Reset child form validation arrays so subsequent validations work
    setChildForms((prev) => {
      const newChildForms = [...prev];
      newChildForms.forEach((childForm) => {
        if (childForm.shown) {
          childForm.valid = [];
        }
      });
      return newChildForms;
    });
  };

  const getChildFormTitle = (childFormId: number) => {
    return formFields.find((f) => f.connectedFormId === childFormId)?.displayName || "";
  };

  const getFormInFormProperty = (formField: any) => {
    if (formField.typeId !== FieldTypeIds.form || !formField.connectedFormId) {
      return null;
    }

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
                handleRemoveChildForm(childFormIndex, i);
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
              childValid={(success: boolean) => handleChildValid(childFormIndex, success)}
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

  // Sort sections by their order and ensure proper section hierarchy
  const sortedSections = useMemo(() => {
    return Object.entries(responsSections).sort((a, b) => {
      // Extract section order from the first field in each section
      // Default to 0 if no sectionOrder is defined
      const aOrder = a[1].fields[0]?.sectionOrder ?? 0;
      const bOrder = b[1].fields[0]?.sectionOrder ?? 0;

      // If both sections have the same order value, sort by section ID
      // This ensures section_0 comes before other sections with the same order
      // Using localeCompare for proper string comparison
      if (aOrder === bOrder) {
        return a[0].localeCompare(b[0]);
      }

      // Primary sorting: by section order (ascending - lower numbers first)
      // This ensures sections appear in their intended sequence
      return aOrder - bOrder;
    });
  }, [responsSections]);

  return (
    <div className="response-page">
      <PageContainer disableGutters maxWidth={false}>
        <ResponseHeader
          formTitle={formTitle}
          viewMode={viewMode}
          permissionTypes={permissionTypes}
          onEdit={onEdit}
          onBack={onBack}
          onSaveAndClose={onSaveAndClose}
          saveDisabled={isSaving || childFormsSaving}
        />
        <FormSectionsContainer>
          {sortedSections.map(([sectionId, section], sectionIdx) => (
            <ResponseSection
              key={sectionId}
              section={section}
              sectionId={sectionId}
              sectionIdx={sectionIdx}
              collapsedSections={collapsedSections}
              toggleSectionCollapse={toggleSectionCollapse}
              formFieldsByIdMap={formFieldsByIdMap}
              formFieldsValuesMap={formFieldsValuesMap}
              formFieldsValidMap={formFieldsValidMap}
              onChangeHandler={onChangeHandler}
              viewMode={viewMode}
              fieldOptions={fieldOptions}
              formFields={formFields}
              getFormInFormProperty={getFormInFormProperty}
              isLoading={isLoading}
            />
          ))}
        </FormSectionsContainer>
      </PageContainer>
      {showValidationPopup && (
        <AlertMsg msg={validationErrors} closePopup={closeValidationPopup} isSuccess={false} />
      )}
    </div>
  );
}
