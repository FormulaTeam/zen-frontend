import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ResponseDto } from "../../types/shared";
import { fieldType } from "formula-gear";
import {
  Box,
  Button,
  Container,
  Tooltip,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useResponseSave, type ParentResponseRef } from "../../hooks/useResponseSave";
import { useResponseState } from "../../hooks/useResponseState";
import { showErrorNotification } from "../../utils/utils";
import { Close, Edit, Error as ErrorIcon, Add } from "@mui/icons-material";
import { FormSectionsContainer, PageContainer } from "./styled";
import ConnectedFormSection from "../../components/FormSection/ConnectedFormSection";
import { useChildForms } from "../../hooks/useChildForms";
import ResponseHeader from "../../components/ResponseComponents/ResponseHeader";
import ResponseSection from "../../components/ResponseComponents/ResponseSection";
import { useSuperAdmin } from "../../contexts/SuperAdminContext";
import ValidationErrorsDialog from "../../components/BasePopup/ValidationErrorsDialog";
import UnsavedChangesDialog from "../../components/BasePopup/UnsavedChangesDialog";
import { useValidationErrors, type ValidationDisplayError } from "../../hooks/useValidationErrors";
import { clearResponseDraft, getResponseDraft } from "../FormEditor/utils/draftPersistence";
import DraftRecoveryBanner from "../../components/BasePopup/DraftRecoveryBanner";

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
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<Map<string, any> | null>(null);
  const [showAlertMsg, setShowAlertMsg] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
    hiddenFieldIds,
    setFormFieldsValuesMap,
  } = useResponseState(
    formId,
    id,
    viewMode,
    copyMode,
    undefined,
    user,
    isSuperAdmin ?? undefined,
    setHasUnsavedChanges,
    hasUnsavedChanges,
  );

  useEffect(() => {
    if (!viewMode) {
      const draft = getResponseDraft(formId, id);
      if (draft && draft.values.length > 0) {
        setPendingDraft(new Map(draft.values));
        setShowRestoreBanner(true);
      }
    }
  }, [formId, id, viewMode]);

  const handleRestore = () => {
    if (pendingDraft) {
      setFormFieldsValuesMap(pendingDraft);
      setHasUnsavedChanges(true);
    }
    setShowRestoreBanner(false);
    setPendingDraft(null);
  };

  const handleDiscardDraft = () => {
    clearResponseDraft(formId, id);
    setShowRestoreBanner(false);
    setPendingDraft(null);
  };

  const onBack = () => {
    location.state?.parentFormId
      ? navigate(`/responses/${location.state.parentFormId}`, {})
      : form && navigate(`/responses/${form.id}`);
  };

  const onExitClick = () => {
    if (hasUnsavedChanges) {
      setShowAlertMsg(true);
    } else {
      onBack();
    }
  };

  const handleDiscardAndExit = () => {
    clearResponseDraft(formId, id);
    setShowAlertMsg(false);
    onBack();
  };

  const handleSaveAndExit = async () => {
    setShowAlertMsg(false);
    await saveAll();
    // note: saveAll sets setChildFormsSaving(true) if there are child forms.
    // if no child forms, it should ideally navigate back.
    // However, the current saveAll logic is a bit complex with child forms.
    // For now, let's just trigger the save.
  };

  const { saveResponse, isSaving } = useResponseSave(
    form,
    response,
    undefined,
    copyMode,
    hiddenFieldIds,
  );

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
            validationResult.rawValuesMap,
          ) as Promise<ResponseDto>;
        }

        result = await parentCreatePromiseRef.current;
      } else {
        result = (await saveResponse(
          formFieldsByIdMap,
          validationResult.parsedValuesMap,
          validationResult.rawValuesMap,
        )) as ResponseDto;
      }

      if (!result?.id) {
        throw new Error("Parent response id is missing after save");
      }

      clearResponseDraft(formId, id);
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
    viewMode,
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
    if (form) {
      setPermissionTypes(form?.permissions ?? []);
    }
  }, [form]);

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
      <PageContainer maxWidth={false}>
        <ResponseHeader
          formTitle={formTitle}
          viewMode={viewMode}
          isEdit={!!id && !viewMode && !copyMode}
          isCopy={copyMode}
          permissionTypes={permissionTypes}
          onEdit={onEdit}
          onBack={onExitClick}
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

      <ValidationErrorsDialog
        title="שגיאות ביצירת תגובה"
        subtitle="לא נוצרו תגובות. יש לתקן את השדות הבאים:"
        open={showValidationPopup}
        onClose={closeValidationPopup}
        errors={validationErrors}
      />

      <UnsavedChangesDialog
        open={showAlertMsg}
        onClose={() => setShowAlertMsg(false)}
        onSave={handleSaveAndExit}
        onDiscard={handleDiscardAndExit}
        message="יש לך שינויים שלא נשמרו בתגובה"
      />

      <DraftRecoveryBanner
        open={showRestoreBanner}
        onRestore={handleRestore}
        onDiscard={handleDiscardDraft}
      />
    </div>
  );
}
