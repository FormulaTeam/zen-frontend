import React, { useEffect, useState, useMemo } from "react";
import { FormControl, CircularProgress, Autocomplete, TextField, Tooltip, Typography, Box } from "@mui/material";
import { useGetForm } from "@api/formsApi";
import { useGetFormsData } from "@hooks/useGetFormsData";
import { formsScopeOption } from "@src/types/enums/filtersAndSorts.enum";
import { FormSectionDto, FormFieldDto } from "@src/types/shared";
import { useFormStructureContext } from "@pages/FormEditor/context/FormStructureContext";
import { FormOption } from "@utils/interfaces";
import { LoaderContainer, Container, FieldControl } from "./styled";
import { fieldType, optionsSource } from "formula-gear";
import { OptionsFieldTypeId } from "../index";
import { FormFieldExtra } from "@pages/FormEditor/schemas/fields";

interface Props {
  linkedFormId: number | undefined;
  connectedFieldId: string | undefined;
  onChange: (extra: Partial<FormFieldExtra<OptionsFieldTypeId>>) => void;
  validationErrors: any;
}

interface ValidField {
  id: string;
  displayName: string;
}

function FormFieldResponsesOptions(props: Props) {
  const {
    linkedFormId,
    connectedFieldId,
    validationErrors,
    onChange,
  } = props;

  const { formStructure } = useFormStructureContext();
  const [searchText, setSearchText] = useState("");
  const [fieldTouchAttempted, setFieldTouchAttempted] = useState(false);
  
  const { formsData: allForms, isLoading: isLoadingForms } = useGetFormsData({
    searchQuery: searchText || undefined,
    scope: formsScopeOption.LinkableForms,
    enabled: true,
  });

  const availableForms = useMemo<FormOption[]>(() => {
    const list = formStructure?.metadata?.id
      ? allForms.filter((form) => form.id !== formStructure.metadata.id)
      : allForms;

    return list.map((form) => ({ id: form.id.toString(), name: form.name }));
  }, [allForms, formStructure?.metadata?.id]);

  const { data: initialForm, isLoading: isInitializing } = useGetForm({
    formId: linkedFormId ? linkedFormId.toString() : undefined,
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

    const allowedTypes = [
      fieldType.Number,
      fieldType.ShortText,
      fieldType.LongText,
      fieldType.Date,
      fieldType.Time,
      fieldType.Location,
      fieldType.Link,
    ];

    const filtered = fields.filter((field) => allowedTypes.some((type) => type === field.fieldType));

    return filtered.map((field: FormFieldDto) => ({
      id: field.id.toString(),
      displayName: field.displayName
    }));
  }, [initialForm]);

  const selectedFieldOption = useMemo<ValidField | null>(() => {
    if (!connectedFieldId) return null;
    return availableFields.find((f) => f.id === connectedFieldId) ?? null;
  }, [availableFields, connectedFieldId]);

  if (isInitializing) {
    return (
      <LoaderContainer>
        <CircularProgress size={24} />
      </LoaderContainer>
    );
  }

  const formSelector: JSX.Element = (
    <FormControl error={!!validationErrors?.properties?.linkedFormId}>
      <Autocomplete
        options={availableForms}
        getOptionLabel={(option) => option?.name || ""}
        value={selectedFormOption}
        loading={isLoadingForms}
        loadingText="מחפש..."
        noOptionsText="לא נמצאו תוצאות"
        onInputChange={(_, newInputValue) => {
          setSearchText(newInputValue);
        }}
        onChange={(_, newValue) => {
          onChange({ 
            linkedFormId: newValue ? Number(newValue.id) : undefined,
            connectedFieldId: undefined,
            source: newValue ? optionsSource.FormFieldResponses : undefined
          });
        }}
        isOptionEqualToValue={(option, value) => option?.id === value?.id}
        renderOption={(props, option) => (
          <li {...props}>
            <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
              <Typography component="span">{option.name}</Typography>
              <Typography
                component="span"
                sx={{ color: "text.secondary", fontSize: "0.75rem", mt: "2px" }}>
                {option.id}
              </Typography>
            </Box>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="בחירת טופס"
            variant="standard"
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
  );

  const fieldSelect: JSX.Element = (
    <FieldControl error={!!validationErrors?.properties?.connectedFieldId}>
      <Tooltip title={!linkedFormId ? 'יש לבחור טופס' : ''}>
        <span style={{ display: 'block' }}>
          <Autocomplete
            options={availableFields}
            getOptionLabel={(option) => option.displayName || ""}
            value={selectedFieldOption}
            onOpen={() => setFieldTouchAttempted(true)}
            onChange={(_, newValue) => {
              onChange({ connectedFieldId: newValue ? newValue.id : undefined });
            }}
            noOptionsText={!linkedFormId ? (fieldTouchAttempted ? 'יש לבחור טופס' : '') : (availableFields.length ? 'לא נמצאו תוצאות' : 'אין שדות זמינים')}
            disabled={!linkedFormId}
            renderInput={(params) => (
              <TextField
                {...params}
                label={"בחירת שדה"}
                variant="standard"
                error={!!validationErrors?.properties?.connectedFieldId}
                helperText={validationErrors?.properties?.connectedFieldId?.errors?.[0]}
              />
            )}
          />
        </span>
      </Tooltip>
    </FieldControl>
  );

  return (
    <>
      <Container>
        {formSelector}
        {fieldSelect}
      </Container>
    </>
  );
}

export { FormFieldResponsesOptions };
