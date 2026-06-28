import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Masonry } from "@mui/lab";
import { Box, CircularProgress, Typography } from "@mui/material";
import { fieldType } from "formula-gear";

import type { FormFieldDto, ResponseDto } from "../../types/shared";
import { useResponseSave, type ParentResponseRef } from "../../hooks/useResponseSave";
import { useResponseState } from "../../hooks/useResponseState";
import { LoadingContainer } from "../../pages/Response/styled";
import { NOT_A_SECTION_ID } from "../../utils/sections/consts";
import FormFieldRenderer from "../Responses/FormFieldRenderer";
import ConnectedFormHeader from "./ConnectedFormHeader";
import {
  ConnectedFormCard,
  ConnectedFormFieldsWrapper,
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
  initialResponse?: ResponseDto;
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const getLinkedFormId = (field: FormFieldDto): number | undefined => {
  if (!field.extra || typeof field.extra !== "object") {
    return undefined;
  }

  const linkedFormId = (field.extra as { linkedFormId?: unknown }).linkedFormId;
  return toNumber(linkedFormId);
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
  initialResponse,
}: Props) {
  const linkedFormId = getLinkedFormId(field);

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
    responsSections,
  } = useResponseState(
    linkedFormId?.toString() ?? "",
    id,
    viewMode,
    copyMode,
    undefined,
    user,
    undefined,
    undefined,
    undefined,
    initialResponse,
  );

  const { isSaving, saveResponse } = useResponseSave(
    form,
    response,
    parentResponse,
    copyMode,
  );

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const [valid, setValid] = useState(true);

  const hasTriggeredSaveRef = useRef(false);
  const hasTriggeredValidateRef = useRef(false);

  const sortedSections = useMemo(
    () =>
      Object.entries(responsSections).sort(([idA, a], [idB, b]) => {
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;

        return orderA === orderB ? idA.localeCompare(idB) : orderA - orderB;
      }),
    [responsSections],
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
      const result = await saveResponse(
        formFieldsByIdMap,
        validationResult.parsedValuesMap,
        validationResult.rawValuesMap,
      );

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

  return (
    <ConnectedFormCard>
      <ConnectedFormHeader
        formsLength={formsLength}
        index={index}
        onDelete={handleRemoveChildForm}
        viewMode={viewMode}
      />

      {!valid && (
        <Typography variant="subtitle2" color="error" sx={{ mt: 1, mb: 1 }}>
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
            {sortedSections.map(([sectionId, section]) => {
              const sectionFields = section.fields
                .filter((formField) => formField.fieldType !== fieldType.Form)
                .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

              if (sectionFields.length === 0) {
                return null;
              }

              return (
                <Box key={sectionId} sx={{ mb: sectionId !== NOT_A_SECTION_ID ? 4 : 0 }}>
                  {sectionId !== NOT_A_SECTION_ID && section.name && (
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 2,
                        fontWeight: 700,
                        color: "text.secondary",
                        fontSize: "0.9rem",
                        borderBottom: "1px solid #f0f0f0",
                        pb: 0.5,
                      }}>
                      {section.name}
                    </Typography>
                  )}

                  <Masonry columns={3} spacing={2} sequential>
                    {sectionFields.map((formField, fieldIndex) => (
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
              );
            })}
          </Box>
        )}

        {saved && (
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            נשמר בהצלחה
          </Typography>
        )}

        {error && (
          <Typography variant="subtitle1" color="error" sx={{ mt: 2 }}>
            שגיאה בשמירה
          </Typography>
        )}
      </ConnectedFormFieldsWrapper>
    </ConnectedFormCard>
  );
}

export default ConnectedFormSection;
