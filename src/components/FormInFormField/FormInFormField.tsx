import Autocomplete from "@mui/material/Autocomplete";
import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { FormFieldsPreview } from "../FormFieldsPreview/FormFieldsPreview";
import { FieldWrapper, FormSelectInput, LoadingContainer } from "./styled";
import { useFormInFormSearch } from "../../hooks/useFormInFormSearch";
import { FormDto, FormFieldDto } from "../../types/shared";

type FormInFormFieldExtra = {
  linkedFormId?: number;
};

type Props = {
  formField: FormFieldDto;
  onChangeConnectedForm: (value: Partial<FormDto> | undefined) => void;
  error?: string;
};

const getFieldExtra = (field: FormFieldDto): FormInFormFieldExtra =>
  (field.extra as FormInFormFieldExtra | undefined) ?? {};

function FormInFormField({ formField, onChangeConnectedForm, error }: Props) {
  const fieldExtra = getFieldExtra(formField);

  const {
    forms,
    loadingForms,
    selectedForm,
    formSearchText,
    loading,
    handleSearchForm,
    handleSelectForm,
  } = useFormInFormSearch({ linkedFormId: fieldExtra.linkedFormId });

  const onFormSelect = (event: React.SyntheticEvent, value: FormDto | null) => {
    handleSelectForm(event, value);
    onChangeConnectedForm(value ?? undefined);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  return (
    <FieldWrapper>
      <Autocomplete
        disablePortal
        onChange={onFormSelect}
        options={forms}
        value={selectedForm}
        getOptionLabel={(option) => option.name}
        loading={loadingForms}
        loadingText="מחפש..."
        noOptionsText={formSearchText.length > 3 ? "לא נמצאו תוצאות" : "יש להזין לפחות 3 תווים"}
        renderInput={(params) => (
          <FormSelectInput
            onChange={handleSearchForm}
            value={formSearchText}
            error={!!error}
            helperText={error}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            {...params}
            label="בחירת טופס..."
          />
        )}
      />
      {selectedForm && <FormFieldsPreview form={selectedForm} />}
      <Typography variant="subtitle2" fontWeight={600}>
        שימו לב! על מנת שמשתמש יוכל ליצור תגובות בטופס שנבחר, נדרש שיהיו לו הרשאות מתאימות לטופס
        שנבחר
      </Typography>
    </FieldWrapper>
  );
}

export default FormInFormField;
