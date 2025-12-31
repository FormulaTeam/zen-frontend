import { useEffect, useMemo, useState } from "react";
import { FieldTypeIds, ResponseForm } from "../../utils/interfaces";
import { Box, Button, Container, Tooltip, Typography } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useResponseSave } from "../../hooks/useResponseSave";
import { useResponseState } from "../../hooks/useResponseState";
import { showErrorNotification } from "../../utils/utils";
import { Add } from "@mui/icons-material";
import { FormSectionsContainer } from "./styled";
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

        if (!Array.isArray(result)) {
          setSavedResponse(result);
        }

        setChildFormsSaving(true);
      } catch (error: any) {
        if (error?.response?.data?.error?.includes("Metro")) {
          navigate(`/responses/${form.id}`);
        } else {
          showErrorNotification("משהו השתבש");
          setShowLoadingSaveBtn(false);
        }
      }
    } else {
      const errorMessages = generateValidationErrorMessages();

      if (errorMessages) {
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
    if (childFormsValidate) {
      const shownForms = childForms.filter((childForm) => childForm.shown);

      // Check if all child forms have been validated
      const allValidated = shownForms.every(
        (childForm) => childForm.children?.length === childForm.valid?.length,
      );

      if (allValidated) {
        const isValid = shownForms.every((shownForm) => shownForm.valid?.every(Boolean));

        if (!isValid) {
          const errorMessages = generateValidationErrorMessages();

          if (errorMessages) {
            setValidationErrors(errorMessages);
            setShowValidationPopup(true);
          }
        }
      }
    }
  }, [childForms, childFormsValidate]);

  const onBack = () => {
    location.state?.parentFormId ?
       navigate(`/responses/${location.state.parentFormId}`, {}) :
       (form && navigate(`/responses/${form.id}`));
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
    return (
      formFields.find((field: any) => field.connectedFormId === childFormId)?.displayName || ""
    );
  };

  const getFormInFormProperty = (formField: any) => {
    if (formField.typeId !== FieldTypeIds.form || !formField.connectedFormId) {
      return null;
    }

    const childFormIndex = childForms.findIndex(
      (childForm) => childForm.formId === formField.connectedFormId,
    );

    const childFormData = childForms[childFormIndex];

    if (!childFormData || childFormIndex === -1) {
      return null;
    }

    const CHILD_FORM_TITLE = getChildFormTitle(childFormData.formId);
    const ADD_RESPONSE_TITLE = `הוספת תגובה${CHILD_FORM_TITLE ? ` - ${CHILD_FORM_TITLE}` : ""}`;

    return (
      <Box key={`child-form-${formField.connectedFormId}`}>
        {
           childFormData.children.map(
          (child, index) =>
            childFormData.shown && (
              <ConnectedFormSection
                key={child.id || child.uniqueId || `child-${formField.connectedFormId}-${index}`}
                handleRemoveChildForm={() => {
                  handleRemoveChildForm(childFormIndex, index);
                }}
                formsLength={childFormData.children.length}
                shouldSave={childFormsSaving}
                user={user}
                viewMode={viewMode}
                copyMode={copyMode}
                formId={formId!}
                field={child}
                parentResponse={savedResponse?.id}
                index={index}
                childSaved={(success: boolean) => handleChildSaved(childFormIndex, success)}
                shouldValidate={childFormsValidate}
                childValid={(success: boolean) => handleChildValid(childFormIndex, success)}
                id={child.id}
                shouldLoad={isSaving}
              />
            ),
            )
            }
        {!isLoading && !viewMode && (
          <Button
            variant="text"
            size="small"
            startIcon={<Add />}
            sx={{ minWidth: "auto", padding: "8px" }}
            onClick={() => handleAddChildForm(childFormIndex)}>
            <Tooltip title={ADD_RESPONSE_TITLE}>
              <Typography variant="subtitle2" fontWeight={600}>
                {ADD_RESPONSE_TITLE}
              </Typography>
            </Tooltip>
          </Button>
        )}
      </Box>
    );
  };

  const sortedSections = useMemo(() =>
      Object.entries(responsSections).sort(([idA, a], [idB, b]) => {
        const orderA = a.fields[0]?.sectionOrder ?? 0;
        const orderB = b.fields[0]?.sectionOrder ?? 0;

        return orderA === orderB ? idA.localeCompare(idB) : orderA - orderB;
      }),
    [responsSections],
  );

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
