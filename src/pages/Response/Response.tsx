import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormRoleDto, ResponseDto } from "../../types/shared";
import { fieldType } from "formula-gear";
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
import { useGetFormRoles } from "../../api/rolesApi";

const PageContainer = styled(Container)`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

interface ResponseProps {
  user: any;
  viewMode?: boolean;
  copyMode?: boolean;
}

export default function Response({ user, viewMode = false, copyMode = false }: ResponseProps) {
  const [permissionTypes, setPermissionTypes] = useState<number[]>([]);
  const [savedResponse, setSavedResponse] = useState<ResponseDto | null>(null);
  const [showLoadingSaveBtn, setShowLoadingSaveBtn] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationPopup, setShowValidationPopup] = useState<boolean>(false);

  const { formId, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isSuperAdmin } = useSuperAdmin();

  const { data: formRoles } = useGetFormRoles(formId);
  const roles = useMemo(() => (formRoles as FormRoleDto | undefined)?.userRoles ?? [], [formRoles]);

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
  } = useResponseState(formId, id, viewMode, copyMode, roles, user, isSuperAdmin ?? undefined);

  const { saveResponse, isSaving } = useResponseSave(form, response, user, undefined, copyMode);

  const parentCreatePromiseRef = useRef<Promise<any> | null>(null);
  const generateValidationErrorMessagesRef = useRef<() => string[]>(() => []);

  const saveAll = useCallback(async () => {
    if (validateRequiredFields() && form) {
      try {
        let result: any;

        if (copyMode) {
          if (!parentCreatePromiseRef.current) {
            parentCreatePromiseRef.current = saveResponse(formFieldsByIdMap, formFieldsValuesMap);
          }

          result = await parentCreatePromiseRef.current;
        } else {
          result = await saveResponse(formFieldsByIdMap, formFieldsValuesMap);
        }

        if (!Array.isArray(result)) {
          setSavedResponse(result);
        }

        setChildFormsSaving(true);
      } catch (error: any) {
        if (copyMode) {
          parentCreatePromiseRef.current = null;
        }

        if (error?.response?.data?.error?.includes("Metro")) {
          navigate(`/responses/${form.id}`);
        } else {
          showErrorNotification("משהו השתבש");
          setShowLoadingSaveBtn(false);
        }
      }
    } else {
      const errorMessages = generateValidationErrorMessagesRef.current?.() || [];

      if (errorMessages.length > 0) {
        setValidationErrors(errorMessages);
        setShowValidationPopup(true);
      }

      setShowLoadingSaveBtn(false);
    }
  }, [
    copyMode,
    form,
    formFieldsByIdMap,
    formFieldsValuesMap,
    navigate,
    saveResponse,
    validateRequiredFields,
  ]);

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
    copyMode,
  });

  const { generateValidationErrorMessages } = useValidationErrors({
    form,
    formFields,
    formFieldsValidMap,
    childForms,
    childFormsValidate,
  });

  useEffect(() => {
    generateValidationErrorMessagesRef.current = generateValidationErrorMessages;
  }, [generateValidationErrorMessages]);

  const isLoading = useMemo(() => {
    return isSaving || childFormsSaving || loading || loadingConnections;
  }, [isSaving, childFormsSaving, loading, loadingConnections]);

  useEffect(() => {
    resolveUserPermissions(form, user, roles, viewMode, setPermissionTypes);
  }, [form, user, roles, viewMode]);

  useEffect(() => {
    if (childFormsValidate) {
      const shownForms = childForms.filter((childForm) => childForm.shown);

      const allValidated = shownForms.every(
        (childForm) => childForm.children?.length === childForm.valid?.length,
      );

      if (allValidated) {
        const isValid = shownForms.every((shownForm) => shownForm.valid?.every(Boolean));

        if (!isValid) {
          const errorMessages = generateValidationErrorMessages();

          if (errorMessages.length > 0) {
            setValidationErrors(errorMessages);
            setShowValidationPopup(true);
          }
        }
      }
    }
  }, [childForms, childFormsValidate, generateValidationErrorMessages]);

  const onBack = () => {
    location.state?.parentFormId
      ? navigate(`/responses/${location.state.parentFormId}`, {})
      : form && navigate(`/responses/${form.id}`);
  };

  const onEdit = () => navigate(`/response/edit/${formId}/${id}`);

  const onSaveAndClose = () => {
    childForms.length > 0 ? setChildFormsValidate(true) : saveAll();
  };

  const closeValidationPopup = () => {
    setShowValidationPopup(false);
    setValidationErrors([]);

    setChildForms((prev) =>
      prev.map((childForm) =>
        childForm.shown
          ? {
              ...childForm,
              valid: [],
            }
          : childForm,
      ),
    );
  };

  const getChildFormTitle = (childFormId: number) => {
    return (
      formFields.find((field: any) => field.extra?.connectedFormId === childFormId)?.displayName ||
      ""
    );
  };

  const getFormInFormProperty = (formField: any) => {
    if (formField.fieldType !== fieldType.Form || !formField.extra?.connectedFormId) {
      return null;
    }

    const childFormIndex = childForms.findIndex(
      (childForm) => childForm.formId === formField.extra.connectedFormId,
    );

    const childFormData = childForms[childFormIndex];

    if (!childFormData || childFormIndex === -1) {
      return null;
    }

    const childFormTitle = getChildFormTitle(childFormData.formId);
    const addResponseTitle = `הוספת תגובה${childFormTitle ? ` - ${childFormTitle}` : ""}`;

    return (
      <Box key={`child-form-${formField.extra.connectedFormId}`}>
        {childFormData.children.map(
          (child, index) =>
            childFormData.shown && (
              <ConnectedFormSection
                key={
                  child.responseId ||
                  child.instanceKey ||
                  `child-${formField.extra.connectedFormId}-${index}`
                }
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
                id={child.responseId}
                shouldLoad={isSaving}
              />
            ),
        )}
        {!isLoading && !viewMode && (
          <Button
            variant="text"
            size="small"
            startIcon={<Add />}
            sx={{ minWidth: "auto", padding: "8px" }}
            onClick={() => handleAddChildForm(childFormIndex)}>
            <Tooltip title={addResponseTitle}>
              <Typography variant="subtitle2" fontWeight={600}>
                {addResponseTitle}
              </Typography>
            </Tooltip>
          </Button>
        )}
      </Box>
    );
  };

  const sortedSections = useMemo(
    () =>
      Object.entries(responsSections).sort(([idA, a], [idB, b]) => {
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;

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
          saveDisabled={isSaving || childFormsSaving || showLoadingSaveBtn}
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
              formId={formId}
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
