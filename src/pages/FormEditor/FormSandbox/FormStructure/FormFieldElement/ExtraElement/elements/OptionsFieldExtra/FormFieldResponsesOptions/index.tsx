import React, { useMemo, useState } from "react";
import {
  FormControl,
  CircularProgress,
  Autocomplete,
  TextField,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import { useGetForm } from "@api/formsApi";
import { useGetFormsData } from "@hooks/useGetFormsData";
import { formsScopeOption } from "@src/types/enums/filtersAndSorts.enum";
import { FormSectionDto, FormFieldDto } from "@src/types/shared";
import { useFormStructureContext } from "@pages/FormEditor/context/FormStructureContext";
import { FormOption } from "@utils/interfaces";
import { LoaderContainer, Container, FieldControl } from "./styled";
import { fieldType } from "formula-gear";
import { OptionsFieldTypeId } from "../index";
import { FormFieldExtra } from "@pages/FormEditor/schemas/fields";

interface Props {
  linkedOptionsFieldId: string | null | undefined;
  onChange: (extra: Partial<FormFieldExtra<OptionsFieldTypeId>>) => void;
  validationErrors: any;
}

interface ValidField {
  id: string;
  displayName: string;
}

function FormFieldResponsesOptions(props: Props) {
  const { linkedOptionsFieldId, validationErrors, onChange } = props;

  const { formStructure } = useFormStructureContext();

  const [searchText, setSearchText] = useState("");
  const [selectedFormId, setSelectedFormId] = useState<number | undefined>();
  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>(
    linkedOptionsFieldId ?? undefined,
  );
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

  const { data: selectedForm, isLoading: isInitializing } = useGetForm({
    formId: selectedFormId ? selectedFormId.toString() : undefined,
  });

  const selectedFormOption = useMemo<FormOption | null>(() => {
    if (!selectedForm) return null;

    return {
      id: selectedForm.id.toString(),
      name: selectedForm.name,
    };
  }, [selectedForm]);

  const availableFields = useMemo<ValidField[]>(() => {
    if (!selectedForm) return [];

    const fields = (selectedForm.sections || []).reduce(
      (acc: FormFieldDto[], section: FormSectionDto) => {
        return [...acc, ...(section.fields || [])];
      },
      [],
    );

    const allowedTypes = [
      fieldType.Number,
      fieldType.ShortText,
      fieldType.LongText,
      fieldType.Date,
      fieldType.Time,
      fieldType.Location,
      fieldType.Link,
    ];

    const filtered = fields.filter((field) =>
      allowedTypes.some((type) => type === field.fieldType),
    );

    return filtered.map((field: FormFieldDto) => ({
      id: field.id.toString(),
      displayName: field.displayName,
    }));
  }, [selectedForm]);

  const selectedFieldOption = useMemo<ValidField | null>(() => {
    if (!selectedFieldId) return null;

    return availableFields.find((field) => field.id === selectedFieldId) ?? null;
  }, [availableFields, selectedFieldId]);

  if (isInitializing) {
    return (
      <LoaderContainer>
        <CircularProgress size={24} />
      </LoaderContainer>
    );
  }

  const formSelector: JSX.Element = (
    <FormControl>
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
          const nextFormId = newValue ? Number(newValue.id) : undefined;

          setSelectedFormId(nextFormId);
          setSelectedFieldId(undefined);

          onChange({
            linkedOptionsFieldId: null,
            defaultValue: [],
          });
        }}
        isOptionEqualToValue={(option, value) => option?.id === value?.id}
        renderOption={(props, option) => (
          <li {...props}>
            <Box
              component="span"
              sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
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
    <FieldControl error={!!validationErrors?.properties?.linkedOptionsFieldId}>
      <Tooltip title={!selectedFormId ? "יש לבחור טופס" : ""}>
        <span style={{ display: "block" }}>
          <Autocomplete
            options={availableFields}
            getOptionLabel={(option) => option.displayName || ""}
            value={selectedFieldOption}
            onOpen={() => setFieldTouchAttempted(true)}
            onChange={(_, newValue) => {
              const nextFieldId = newValue ? newValue.id : undefined;

              setSelectedFieldId(nextFieldId);

              onChange({
                linkedOptionsFieldId: nextFieldId,
                defaultValue: [],
              });
            }}
            noOptionsText={
              !selectedFormId
                ? fieldTouchAttempted
                  ? "יש לבחור טופס"
                  : ""
                : availableFields.length
                  ? "לא נמצאו תוצאות"
                  : "אין שדות זמינים"
            }
            disabled={!selectedFormId}
            renderInput={(params) => (
              <TextField
                {...params}
                label="בחירת שדה"
                variant="standard"
                error={!!validationErrors?.properties?.linkedOptionsFieldId}
                helperText={validationErrors?.properties?.linkedOptionsFieldId?.errors?.[0]}
              />
            )}
          />
        </span>
      </Tooltip>
    </FieldControl>
  );

  return (
    <Container>
      {formSelector}
      {fieldSelect}
    </Container>
  );
}

export { FormFieldResponsesOptions };
