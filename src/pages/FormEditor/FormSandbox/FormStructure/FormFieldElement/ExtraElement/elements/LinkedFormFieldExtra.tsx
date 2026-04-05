import { FieldTypeIds } from "@utils/interfaces";
import React, { useState, useMemo } from "react";
import { FormControl, CircularProgress, Box, styled, Autocomplete, TextField } from "@mui/material";
import { ExtraElementProps } from "../index";
import { useGetForm } from "@api/formsApi";
import { useGetFormsData } from "@hooks/useGetFormsData";
import { formsScopeOption } from "@src/types/enums/filtersAndSorts.enum";
import { useFormStructureContext } from "@pages/FormEditor/context/FormStructureContext";
import { FormOption } from "@utils/interfaces";
import { LoaderContainer, WarningText } from "./styled";

type Props = ExtraElementProps<typeof FieldTypeIds.linkedForm>;

function LinkedFormFieldExtra({ extra, onChange, validationErrors, disabled }: Props) {
  const {
    linkedFormId,
  } = extra;

  const { formStructure } = useFormStructureContext();
  const [searchText, setSearchText] = useState("");

  const { data: initialForm, isLoading: isInitializing } = useGetForm({
    formId: linkedFormId ? linkedFormId.toString() : undefined,
  });

  const { formsData: allForms, isLoading } = useGetFormsData({
    searchQuery: searchText.length >= 2 ? searchText : undefined,
    scope: formsScopeOption.MyForms,
    enabled: searchText.length >= 2,
  });

  const availableForms = useMemo<FormOption[]>(() => {
    const list = formStructure?.metadata?.id
      ? allForms.filter((form) => form.id !== formStructure.metadata.id)
      : allForms;

    return list.map(form => ({ id: form.id.toString(), name: form.name }));
  }, [allForms, formStructure?.metadata?.id]);

  const selectedForm = useMemo<FormOption | null>(() => {
    if (!initialForm) return null;
    return { id: initialForm.id.toString(), name: initialForm.name };
  }, [initialForm]);

  if (isInitializing) {
    return (
      <LoaderContainer>
        <CircularProgress size={24} />
      </LoaderContainer>
    );
  }

  return (
    <>
      <FormControl disabled={disabled} error={!!validationErrors?.properties?.linkedFormId}>
        <Autocomplete
          options={availableForms}
          getOptionLabel={(option) => {
            return option?.name || "";
          }}
          value={selectedForm}
          loading={isLoading}
          loadingText="מחפש..."
          noOptionsText={searchText.length < 2 ? "יש להזין לפחות 2 תווים" : "לא נמצאו תוצאות"}
          onInputChange={(_, newInputValue) => {
            setSearchText(newInputValue);
          }}
          onChange={(_, newValue) => {
            onChange({ linkedFormId: newValue ? newValue.id.toString() : undefined });
          }}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="בחירת טופס"
              variant="standard"
              error={!!validationErrors?.properties?.linkedFormId}
              helperText={validationErrors?.properties?.linkedFormId?.errors[0]}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <React.Fragment>
                    {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </React.Fragment>
                ),
              }}
            />
          )}
        />
      </FormControl>
      <WarningText>
        שימו לב! על מנת שמשתמש יוכל ליצור תגובות בטופס שנבחר, נדרש שיהיו לו הרשאות מתאימות לטופס שנבחר
      </WarningText>
    </>
  );
}

export { LinkedFormFieldExtra };