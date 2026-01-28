import { Masonry } from "@mui/lab";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { useMemo } from "react";

import { useResponseState } from "../../hooks/useResponseState";
import { FormField } from "../../utils/interfaces";
import { LoadingContainer } from "../../pages/Response/styled";

import {
  ConnectedFormFieldsWrapper,
  ConnectedFormTitle,
  ConnectedFormWrapper,
  ConnectedResponseDivider,
} from "./ConnectedFormSection.styled";

import { useResponseSave } from "../../hooks/useResponseSave";
import { useFormInFormResponseSave } from "../../hooks/useFormInFormResponseSave";
import FormFieldRenderer from "../Responses/FormFieldRenderer";
import ConnectedFormHeader from "./ConnectedFormHeader";

type Props = {
  field: FormField;
  formId: string;
  user: any;
  shouldSave: boolean;
  shouldValidate: boolean;
  index: number;
  childSaved: (saved: boolean) => void;
  childValid: (valid: boolean) => void;
  handleRemoveChildForm: () => void;
  parentResponse?: any;
  id?: number;
  viewMode?: boolean;
  copyMode?: boolean;
  shouldLoad?: boolean;
  formsLength: number;
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
  shouldLoad = false,
  formsLength,
  handleRemoveChildForm,
}: Props) {
  const connectedFormId = field.connectedFormId?.toString();
  if (!connectedFormId) return null;

  const {
    formFields,
    formFieldsByIdMap,
    formFieldsValuesMap,
    formFieldsValidMap,
    onChangeHandler,
    touchedFields,
    onBlurField,
    validateVisibleFields,
    loading,
    form,
    response,
    fieldOptions,
    loadingConnections,
  } = useResponseState(connectedFormId, id?.toString(), viewMode, copyMode);

  const { isSaving, saveResponse } = useResponseSave(
    form,
    response,
    user,
    `${formId};${parentResponse}`,
  );

  const { saved, error, valid } = useFormInFormResponseSave({
    shouldSave,
    shouldValidate,
    validateVisibleFields,
    form,
    saveResponse,
    formFieldsByIdMap,
    formFieldsValuesMap,
    childSaved,
    childValid,
    index,
  });

  const renderFormId = useMemo(() => {
    return form?.id ?? Number(connectedFormId);
  }, [form?.id, connectedFormId]);

  const isBusy = useMemo(() => {
    return shouldLoad || loading || loadingConnections || isSaving || shouldSave || shouldValidate;
  }, [shouldLoad, loading, loadingConnections, isSaving, shouldSave, shouldValidate]);

  if (isBusy) {
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

        <LoadingContainer>
          <CircularProgress />
        </LoadingContainer>
      </ConnectedFormWrapper>
    );
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
        <Masonry columns={3} spacing={2} sequential>
          {formFields
            ?.slice()
            .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
            .map((formFieldItem, fieldIdx) => {
              if (!formFieldItem) return null;

              const key = String(formFieldItem.uniqueId || formFieldItem.uniqId || fieldIdx);

              return (
                <FormFieldRenderer
                  key={key}
                  formId={renderFormId}
                  formField={formFieldItem}
                  formFieldsByIdMap={formFieldsByIdMap}
                  formFieldsValuesMap={formFieldsValuesMap}
                  formFieldsValidMap={formFieldsValidMap}
                  touchedFields={touchedFields}
                  onBlurField={onBlurField}
                  onChangeHandler={onChangeHandler}
                  viewMode={viewMode}
                  fieldOptions={fieldOptions}
                  formFields={formFields}
                  index={fieldIdx}
                />
              );
            })}
        </Masonry>

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
