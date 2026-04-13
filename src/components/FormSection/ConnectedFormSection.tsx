import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Masonry } from "@mui/lab";
import { Box, CircularProgress, Typography } from "@mui/material";
import { fieldType } from "formula-gear";

import type { FormFieldDto, ResponseDto } from "../../types/shared";
import { useResponseSave, type ParentResponseRef } from "../../hooks/useResponseSave";
import { useResponseState } from "../../hooks/useResponseState";
import { LoadingContainer } from "../../pages/Response/styled";
import FormFieldRenderer from "../Responses/FormFieldRenderer";
import ConnectedFormHeader from "./ConnectedFormHeader";
import {
  ConnectedFormFieldsWrapper,
  ConnectedFormTitle,
  ConnectedFormWrapper,
  ConnectedResponseDivider,
} from "./ConnectedFormSection.styled";

type ConnectedChildField = FormFieldDto & {
  responseId?: string;
  instanceKey?: string;
};

type Props = {
  field: ConnectedChildField;
  formId: string;
  user: any;
  shouldSave: boolean;
  shouldValidate: boolean;
  index: number;
  childSaved: (saved: boolean) => void;
  childValid: (valid: boolean) => void;
  handleRemoveChildForm: () => void;
  parentResponse?: ParentResponseRef;
  id?: string;
  viewMode?: boolean;
  copyMode?: boolean;
  shouldLoad?: boolean;
  formsLength: number;
};

const getConnectedFormId = (field: FormFieldDto): number | undefined => {
  if (!field.extra || typeof field.extra !== "object") {
    return undefined;
  }

  const linkedFormId = (field.extra as { linkedFormId?: unknown }).linkedFormId;
  return typeof linkedFormId === "number" ? linkedFormId : undefined;
};

function ConnectedFormSection({
  field,
  user,
  id,
  viewMode = false,
  copyMode = false,
  shouldSave,
  parentResponse,
  index,
  childSaved,
  shouldValidate,
  childValid,
  shouldLoad,
  formsLength,
  handleRemoveChildForm,
}: Props) {
  const linkedFormId = getConnectedFormId(field);

  const {
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
  } = useResponseState(linkedFormId?.toString() ?? "", id, viewMode, copyMode);

  const { isSaving, saveResponse } = useResponseSave(
    form,
    response,
    user,
    parentResponse,
    copyMode,
  );

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const [valid, setValid] = useState(true);

  const hasTriggeredSaveRef = useRef(false);
  const hasTriggeredValidateRef = useRef(false);

  const normalFields = useMemo(
    () =>
      [...(formFields ?? [])]
        .filter((formField) => formField.fieldType !== fieldType.Form)
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0)),
    [formFields],
  );

  const saveCurrentResponse = useCallback(async (): Promise<ResponseDto | null> => {
    if (!form || loading || loadingConnections) {
      return null;
    }

    const validationResult = validateAllFieldsBeforeSubmit();

    if (!validationResult.isValid) {
      setValid(false);
      setError(true);
      setSaved(false);
      return null;
    }

    try {
      const result = await saveResponse(formFieldsByIdMap, validationResult.parsedValuesMap);

      if (!result?.id) {
        setSaved(false);
        setError(true);
        return null;
      }

      setSaved(true);
      setError(false);
      setValid(true);
      return result;
    } catch {
      setSaved(false);
      setError(true);
      return null;
    }
  }, [
    form,
    loading,
    loadingConnections,
    validateAllFieldsBeforeSubmit,
    saveResponse,
    formFieldsByIdMap,
  ]);

  useEffect(() => {
    if (!shouldSave) {
      hasTriggeredSaveRef.current = false;
      setSaved(false);
      setError(false);
      return;
    }

    if (hasTriggeredSaveRef.current || !form || loading || loadingConnections) {
      return;
    }

    hasTriggeredSaveRef.current = true;

    const validationResult = validateAllFieldsBeforeSubmit();

    if (!validationResult.isValid) {
      setValid(false);
      setError(true);
      childSaved(false);
      return;
    }

    setValid(true);

    void saveCurrentResponse().then((result) => {
      childSaved(Boolean(result?.id));
    });
  }, [
    shouldSave,
    form,
    loading,
    loadingConnections,
    validateAllFieldsBeforeSubmit,
    saveCurrentResponse,
    childSaved,
  ]);

  useEffect(() => {
    if (!shouldValidate) {
      hasTriggeredValidateRef.current = false;
      return;
    }

    if (hasTriggeredValidateRef.current || !form || loading || loadingConnections) {
      return;
    }

    hasTriggeredValidateRef.current = true;

    const validationResult = validateAllFieldsBeforeSubmit();

    if (!validationResult.isValid) {
      setValid(false);
      childValid(false);
      return;
    }

    setValid(true);
    childValid(true);
  }, [
    shouldValidate,
    form,
    loading,
    loadingConnections,
    validateAllFieldsBeforeSubmit,
    childValid,
  ]);

  const isContentLoading = loading || loadingConnections || Boolean(shouldLoad);

  if (!linkedFormId) {
    return null;
  }

  if (isContentLoading) {
    return null;
  }

  return (
    <ConnectedFormWrapper>
      {formsLength > 1 && index > 0 && <ConnectedResponseDivider />}

      {index === 0 && <ConnectedFormTitle>{field.displayName}</ConnectedFormTitle>}

      <ConnectedFormHeader
        formsLength={formsLength}
        index={index}
        onDelete={handleRemoveChildForm}
        viewMode={viewMode}
      />

      {!valid && (
        <Typography variant="subtitle2" color="error">
          שימו לב! יש למלא את כל השדות בצורה תקינה ולאחר מכן ניתן לנסות שוב לשמור
        </Typography>
      )}

      <ConnectedFormFieldsWrapper>
        {isContentLoading ? (
          <LoadingContainer>
            <CircularProgress />
          </LoadingContainer>
        ) : (
          <Box>
            <Masonry columns={3} spacing={2} sequential>
              {normalFields.map((formField, fieldIndex) => (
                <FormFieldRenderer
                  key={formField.id ?? fieldIndex}
                  formField={formField}
                  formFieldsByIdMap={formFieldsByIdMap}
                  formFieldsValuesMap={formFieldsValuesMap}
                  formFieldsValidMap={formFieldsValidMap}
                  onChangeHandler={onChangeHandler}
                  onBlurHandler={onBlurHandler}
                  viewMode={viewMode}
                  fieldOptions={fieldOptions}
                  formFields={formFields}
                  index={fieldIndex}
                />
              ))}
            </Masonry>
          </Box>
        )}

        {saved && <Typography variant="subtitle1">נשמר בהצלחה</Typography>}

        {error && (
          <Typography variant="subtitle1" color="error">
            שגיאה בשמירה
          </Typography>
        )}
      </ConnectedFormFieldsWrapper>
    </ConnectedFormWrapper>
  );
}

export default ConnectedFormSection;
