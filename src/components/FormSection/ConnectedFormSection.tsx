import { Masonry } from "@mui/lab";
import { useTheme } from "@mui/material/styles";
import { useResponseState } from "../../hooks/useResponseState";
import { FormField } from "../../utils/interfaces";
import { LoadingContainer } from "../../pages/Response/styled";
import {
  ConnectedFormFieldsWrapper,
  ConnectedFormTitle,
  ConnectedFormWrapper,
  ConnectedResponseDivider,
} from "./ConnectedFormSection.styled";
import Typography from "@mui/material/Typography";
import { useResponseSave } from "../../hooks/useResponseSave";
import CircularProgress from "@mui/material/CircularProgress";
import { useFormInFormResponseSave } from "../../hooks/useFormInFormResponseSave";
import FormFieldRenderer from "../Responses/FormFieldRenderer";
import ConnectedFormHeader from "./ConnectedFormHeader";
import { useEffect, useState } from "react";

type Props = {
  field: FormField;
  formId: string;
  user: any;
  shouldSave: boolean;
  shouldValidate: boolean;
  index: number;
  childSaved: (saved: boolean) => void;
  childValid: (saved: boolean) => void;
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
  shouldLoad,
  formsLength,
  handleRemoveChildForm,
}: Props) {
  const {
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
  } = useResponseState(field.connectedFormId?.toString()!, id?.toString(), viewMode, copyMode);

  const computedParentResponse = parentResponse ? `${formId};${parentResponse}` : undefined;

  const { isSaving, saveResponse } = useResponseSave(
    form,
    response,
    user,
    computedParentResponse,
    copyMode,
  );

  const { saved, error, valid } = useFormInFormResponseSave({
    shouldSave: shouldSave && !!parentResponse,
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
  }, [isSaving, shouldSave, shouldValidate, shouldLoad]);
  if (isLoading || shouldLoad) return null; // prevent rendering while saving
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
              ?.sort((i, i2) => (i.index ?? 0) - (i2.index ?? 0))
              ?.map((formField, index) => {
                return (
                  formField && (
                    <FormFieldRenderer
                      key={index}
                      formField={formField}
                      formFieldsByIdMap={formFieldsByIdMap}
                      formFieldsValuesMap={formFieldsValuesMap}
                      formFieldsValidMap={formFieldsValidMap}
                      onChangeHandler={onChangeHandler}
                      viewMode={viewMode}
                      fieldOptions={fieldOptions}
                      formFields={formFields}
                      index={index}
                    />
                  )
                );
              })}
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
