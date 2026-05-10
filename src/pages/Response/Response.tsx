import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ResponseDto } from "../../types/shared";
import { fieldType } from "formula-gear";
import { Box, Button, Container, Tooltip, Typography } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useResponseSave, type ParentResponseRef } from "../../hooks/useResponseSave";
import { useResponseState } from "../../hooks/useResponseState";
import { showErrorNotification } from "../../utils/utils";
import { Add } from "@mui/icons-material";
import { FormSectionsContainer } from "./styled";
import ConnectedFormSection from "../../components/FormSection/ConnectedFormSection";
import { useChildForms } from "../../hooks/useChildForms";
import styled from "styled-components";
import ResponseHeader from "../../components/ResponseComponents/ResponseHeader";
import ResponseSection from "../../components/ResponseComponents/ResponseSection";
import { useSuperAdmin } from "../../contexts/SuperAdminContext";
import AlertMsg from "../../components/AlertMsg/AlertMsg";
import { useValidationErrors, type ValidationDisplayError } from "../../hooks/useValidationErrors";

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
  const { formId, id } = useParams();

  const [permissionTypes, setPermissionTypes] = useState<number[]>([]);
  const [savedParentResponseId, setSavedParentResponseId] = useState<string | undefined>(id);
  const [showLoadingSaveBtn, setShowLoadingSaveBtn] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationDisplayError[]>([]);
  const [showValidationPopup, setShowValidationPopup] = useState(false);

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
    onBlurHandler,
    validateAllFieldsBeforeSubmit,
    loading,
    form,
    response,
    fieldOptions,
    loadingConnections,
    responsSections,
    collapsedSections,
    toggleSectionCollapse,
  } = useResponseState(formId, id, viewMode, copyMode, undefined, user, isSuperAdmin ?? undefined);

  const { saveResponse, isSaving } = useResponseSave(form, response, undefined, copyMode);

  const parentCreatePromiseRef = useRef<Promise<ResponseDto> | null>(null);
  const generateValidationErrorMessagesRef = useRef<
    (validationMapOverride?: Map<string, any>) => ValidationDisplayError[]
  >(() => []);

  useEffect(() => {
    if (id) {
      setSavedParentResponseId(id);
    }
  }, [id]);

  const saveAll = useCallback(async () => {
    const validationResult = validateAllFieldsBeforeSubmit();

    if (!validationResult.isValid || !form) {
      const errorMessages =
        generateValidationErrorMessagesRef.current?.(validationResult.validationMap) || [];

      if (errorMessages.length > 0) {
        setValidationErrors(errorMessages);
        setShowValidationPopup(true);
      }

      setShowLoadingSaveBtn(false);
      return;
    }

    try {
      let result: ResponseDto;

      if (copyMode) {
        if (!parentCreatePromiseRef.current) {
          parentCreatePromiseRef.current = saveResponse(
            formFieldsByIdMap,
            validationResult.parsedValuesMap,
          ) as Promise<ResponseDto>;
        }

        result = await parentCreatePromiseRef.current;
      } else {
        result = (await saveResponse(
          formFieldsByIdMap,
          validationResult.parsedValuesMap,
        )) as ResponseDto;
      }

      if (!result?.id) {
        throw new Error("Parent response id is missing after save");
      }

      setSavedParentResponseId(result.id);
      setChildFormsSaving(true);
    } catch (error: any) {
      if (copyMode) {
        parentCreatePromiseRef.current = null;
      }

      if (error?.response?.data?.error?.includes("Metro")) {
        navigate(`/responses/${form?.id ?? formId}`);
      } else {
        showErrorNotification("משהו השתבש");
        setShowLoadingSaveBtn(false);
      }
    }
  }, [
    copyMode,
    form,
    formFieldsByIdMap,
    formId,
    navigate,
    saveResponse,
    validateAllFieldsBeforeSubmit,
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

  const isLoading = useMemo(
    () => isSaving || childFormsSaving || loading || loadingConnections,
    [isSaving, childFormsSaving, loading, loadingConnections],
  );

  useEffect(() => {
    if (viewMode && form) {
      setPermissionTypes(form?.permissions ?? []);
    }
  }, [form, viewMode]);

  useEffect(() => {
    if (!childFormsValidate) {
      return;
    }

    const shownForms = childForms.filter((childForm) => childForm.shown);
    const allValidated = shownForms.every(
      (childForm) => childForm.children.length === childForm.valid.length,
    );

    if (!allValidated) {
      return;
    }

    const isValid = shownForms.every((shownForm) => shownForm.valid.every(Boolean));

    if (!isValid) {
      const errorMessages = generateValidationErrorMessages();

      if (errorMessages.length > 0) {
        setValidationErrors(errorMessages);
        setShowValidationPopup(true);
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

  const getChildFormTitle = (childFormId: number) =>
    formFields.find((field: any) => Number(field.extra?.linkedFormId) === childFormId)
      ?.displayName || "";

  const getFormInFormProperty = (formField: any) => {
    if (formField.fieldType !== fieldType.Form || !formField.extra?.linkedFormId) {
      return null;
    }

    const linkedFormId = Number(formField.extra.linkedFormId);
    const childFormIndex = childForms.findIndex((childForm) => childForm.formId === linkedFormId);
    const childFormData = childForms[childFormIndex];

    if (!childFormData || childFormIndex === -1) {
      return null;
    }

    const childFormTitle = getChildFormTitle(childFormData.formId);
    const addResponseTitle = `הוספת תגובה${childFormTitle ? ` - ${childFormTitle}` : ""}`;

    const parentResponse: ParentResponseRef | undefined = savedParentResponseId
      ? {
        formId: Number(formId),
        responseId: savedParentResponseId,
      }
      : undefined;

    return (
      <Box key={`child-form-${linkedFormId}`}>
        {childFormData.children.map(
          (child, index) =>
            childFormData.shown && (
              <ConnectedFormSection
                key={child.instanceKey}
                handleRemoveChildForm={() => handleRemoveChildForm(childFormIndex, index)}
                formsLength={childFormData.children.length}
                shouldSave={childFormsSaving}
                user={user}
                viewMode={viewMode}
                copyMode={copyMode}
                formId={formId!}
                field={child}
                parentResponse={parentResponse}
                index={index}
                childSaved={(success: boolean) => handleChildSaved(childFormIndex, success, index)}
                shouldValidate={childFormsValidate}
                childValid={(success: boolean) => handleChildValid(childFormIndex, success, index)}
                id={child.responseId}
                shouldLoad={false}
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
              onBlurHandler={onBlurHandler}
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
