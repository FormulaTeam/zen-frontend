import { useEffect, useMemo, useState } from "react";
import { Masonry } from "@mui/lab";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

import type { FormFieldDto } from "../../types/shared";
import { useFormInFormResponseSave } from "../../hooks/useFormInFormResponseSave";
import { useResponseSave } from "../../hooks/useResponseSave";
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
  childValid: (saved: boolean) => void;
  handleRemoveChildForm: () => void;
  parentResponse?: string;
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
  formId,
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
    validateAllFieldsBeforeSubmit,
    loading,
    form,
    response,
    fieldOptions,
    loadingConnections,
  } = useResponseState(linkedFormId?.toString() ?? "", id, viewMode, copyMode);

  const computedParentResponse = useMemo(
    () => (parentResponse ? `${formId};${parentResponse}` : undefined),
    [formId, parentResponse],
  );

  const { isSaving, saveResponse } = useResponseSave(
    form,
    response,
    user,
    computedParentResponse,
    copyMode,
  );

  const validateRequiredFields = () => validateAllFieldsBeforeSubmit().isValid;

  const { saved, error, valid } = useFormInFormResponseSave({
    shouldSave: Boolean(shouldSave && parentResponse),
    shouldValidate,
    validateRequiredFields,
    form,
    saveResponse,
    formFieldsByIdMap,
    formFieldsValuesMap,
    childSaved,
    childValid,
    index,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(isSaving || shouldSave || shouldValidate);
  }, [isSaving, shouldSave, shouldValidate]);

  if (!linkedFormId) {
    return null;
  }

  if (isLoading || shouldLoad) {
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
        {loading || loadingConnections ? (
          <LoadingContainer>
            <CircularProgress />
          </LoadingContainer>
        ) : (
          <Masonry columns={3} spacing={2} sequential>
            {formFields
              ?.sort(
                (firstField, secondField) => (firstField.index ?? 0) - (secondField.index ?? 0),
              )
              ?.map((formField, fieldIndex) =>
                formField ? (
                  <FormFieldRenderer
                    key={formField.id ?? fieldIndex}
                    formField={formField}
                    formFieldsByIdMap={formFieldsByIdMap}
                    formFieldsValuesMap={formFieldsValuesMap}
                    formFieldsValidMap={formFieldsValidMap}
                    onChangeHandler={onChangeHandler}
                    viewMode={viewMode}
                    fieldOptions={fieldOptions}
                    formFields={formFields}
                    index={fieldIndex}
                  />
                ) : null,
              )}
          </Masonry>
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
