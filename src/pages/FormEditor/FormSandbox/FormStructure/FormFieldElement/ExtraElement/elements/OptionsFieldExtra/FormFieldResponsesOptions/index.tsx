import { OptionsSource } from "@pages/FormEditor/schemas/fields/optionsSchema";
import React, { useEffect, useState, useMemo } from "react";
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, Box, CircularProgress, styled, Autocomplete, TextField } from "@mui/material";
import { ExtraElementProps } from "../../../index";
import { OptionsFieldTypeId, SpecificOptions, SpecificOptionsErrors } from "../index";
import { useGetForm } from "@api/formsApi";
import { useGetFormsData } from "@hooks/useGetFormsData";
import { formsScopeOption } from "@src/types/enums/filtersAndSorts.enum";
import { FormSectionDto, FormFieldDto } from "@src/types/shared";
import { useFormStructureContext } from "@pages/FormEditor/context/FormStructureContext";
import { FormOption } from "@utils/interfaces";
import { LoaderContainer, Container, FieldControl } from "./styled";

interface Props extends Omit<ExtraElementProps<OptionsFieldTypeId>, "extra" | "validationErrors" | "disabled"> {
  options: SpecificOptions<OptionsSource.FORM_FIELD_RESPONSES>;
  validationErrors: SpecificOptionsErrors<OptionsSource.FORM_FIELD_RESPONSES> | undefined;
}

interface ValidField {
  id: string;
  displayName: string;
}

function FormFieldResponsesOptions(props: Props) {
  const {
    options = { formId: "", fieldId: "" },
    validationErrors,
    onChange,
  } = props;

  const { formStructure } = useFormStructureContext();
  const [searchText, setSearchText] = useState("");

  const { formsData: allForms, isLoading: isLoadingForms } = useGetFormsData({
    searchQuery: searchText.length >= 2 ? searchText : undefined,
    scope: formsScopeOption.AllForms,
    enabled: searchText.length >= 2,
  });

  const availableForms = useMemo<FormOption[]>(() => {
    const list = formStructure?.metadata?.id
      ? allForms.filter((form) => form.id !== formStructure.metadata.id)
      : allForms;

    return list.map((form) => ({ id: form.id.toString(), name: form.name }));
  }, [allForms, formStructure?.metadata?.id]);

  const { data: initialForm, isLoading: isInitializing } = useGetForm({
    formId: options?.formId ? options.formId : undefined,
  });

  const selectedFormOption = useMemo<FormOption | null>(() => {
    if (!initialForm) return null;
    return { id: initialForm.id.toString(), name: initialForm.name };
  }, [initialForm]);

  const availableFields = useMemo<ValidField[]>(() => {
    if (!initialForm) return [];

    const fields = (initialForm?.sections || []).reduce((acc: FormFieldDto[], section: FormSectionDto) => {
      return [...acc, ...(section.fields || [])];
    }, []);

    return fields.map((f: FormFieldDto) => ({
      id: f.id.toString(),
      displayName: f.displayName || f.name || f.id.toString()
    }));
  }, [initialForm]);

  useEffect(() => {
    onChange({ source: OptionsSource.FORM_FIELD_RESPONSES, options });
  }, []);

  if (isInitializing) {
    return (
      <LoaderContainer>
        <CircularProgress size={24} />
      </LoaderContainer>
    );
  }

  return (
    <>
      <Container>
        <FormControl error={!!validationErrors?.properties?.formId}>
          <Autocomplete
            options={availableForms}
            getOptionLabel={(option) => {
              return option?.name || "";
            }}
            value={selectedFormOption}
            loading={isLoadingForms}
            loadingText="מחפש..."
            noOptionsText={searchText.length < 2 ? "יש להזין לפחות 2 תווים" : "לא נמצאו תוצאות"}
            onInputChange={(_, newInputValue) => {
              setSearchText(newInputValue);
            }}
            onChange={(_, newValue) => {
              onChange({
                source: OptionsSource.FORM_FIELD_RESPONSES,
                options: { ...options, formId: newValue ? newValue.id.toString() : "", fieldId: "" }
              });
            }}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="בחירת טופס"
                variant="standard"
                error={!!validationErrors?.properties?.formId}
                helperText={validationErrors?.properties?.formId?.errors?.[0]}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {isLoadingForms ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
        </FormControl>

        <FieldControl error={!!validationErrors?.properties?.fieldId}>
          <InputLabel id="source-field-label">{availableForms.length ? "בחירת שדה" : "אין שדות זמינים"}</InputLabel>
          <Select labelId="source-field-label"
            variant={"standard"}
            aria-describedby={"source-field-helper-text"}
            value={options?.fieldId || ""}
            label={"בחירת שדה"}
            onChange={(e) => {
              onChange({
                source: OptionsSource.FORM_FIELD_RESPONSES,
                options: { ...options, fieldId: e.target.value }
              });
            }}>
            {
              availableFields.map((availableField) => (
                <MenuItem key={availableField.id} value={availableField.id}>{availableField.displayName}</MenuItem>
              ))
            }
          </Select>
          <FormHelperText id="source-field-helper-text">
            {validationErrors?.properties?.fieldId?.errors?.[0]}
          </FormHelperText>
        </FieldControl>
      </Container>
    </>
  );
}

export { FormFieldResponsesOptions };