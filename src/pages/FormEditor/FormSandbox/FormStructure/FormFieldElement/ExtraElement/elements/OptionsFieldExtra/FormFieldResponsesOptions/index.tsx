import { OptionsSource } from "@pages/FormEditor/schemas/fields/optionsSchema";
import React, { useEffect, useState, useMemo } from "react";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Box,
  CircularProgress,
  styled,
  Autocomplete,
  TextField,
  Tooltip,
} from "@mui/material";
import { ExtraElementProps } from "../../../index";
import { OptionsFieldTypeId, SpecificOptions, SpecificOptionsErrors } from "../index";
import { useGetForm, useGetLinkableForms } from "@api/formsApi";
import { FormSectionDto, FormFieldDto } from "@src/types/shared";
import { useFormStructureContext } from "@pages/FormEditor/context/FormStructureContext";
import { FormOption } from "@utils/interfaces";
import { LoaderContainer, Container, FieldControl } from "./styled";
import { useParams } from "react-router-dom";
import { FieldTypeIds } from "@utils/interfaces";
import * as Gear from "formula-gear";

interface Props
  extends Omit<ExtraElementProps<OptionsFieldTypeId>, "extra" | "validationErrors" | "disabled"> {
  options: SpecificOptions<OptionsSource.FORM_FIELD_RESPONSES>;
  validationErrors: SpecificOptionsErrors<OptionsSource.FORM_FIELD_RESPONSES> | undefined;
}

interface ValidField {
  id: string;
  displayName: string;
}

// Helper to bypass static analysis of bundlers which might have stale cache
const getGearConstant = (key: string) => {
  const g = Gear as any;
  return g[key];
};

function FormFieldResponsesOptions(props: Props) {
  const { options = { formId: "", fieldId: "" }, validationErrors, onChange } = props;

  const { formStructure } = useFormStructureContext();
  const { id: urlFormId } = useParams();
  const [searchText, setSearchText] = useState("");
  const [fieldTouchAttempted, setFieldTouchAttempted] = useState(false);

  const currentFormId = formStructure?.metadata?.id || urlFormId;

  const { data: allForms = [], isLoading: isLoadingForms } = useGetLinkableForms({
    formId: currentFormId ? currentFormId.toString() : "",
    search: searchText || undefined,
  });

  const availableForms = useMemo(() => {
    return allForms;
  }, [allForms]);

  const { data: initialForm, isLoading: isInitializing } = useGetForm({
    formId: options?.formId ? options.formId : undefined,
  });

  const selectedFormOption = useMemo(() => {
    if (!initialForm) return null;
    return { id: initialForm.id, name: initialForm.name };
  }, [initialForm]);

  const availableFields = useMemo<ValidField[]>(() => {
    if (!initialForm) return [];

    const fields = (initialForm?.sections || []).reduce(
      (acc: FormFieldDto[], section: FormSectionDto) => {
        return [...acc, ...(section.fields || [])];
      },
      [],
    );

    // Use bracket notation to bypass static analysis of bundler which might have stale cache
    const gearComparableFieldTypes = getGearConstant("comparable" + "FieldTypes") || [
      Gear.fieldType.Number,
      Gear.fieldType.ShortText,
      Gear.fieldType.LongText,
      Gear.fieldType.Date,
      Gear.fieldType.Time,
      Gear.fieldType.Location,
    ];

    const filtered = fields.filter((field) =>
      (gearComparableFieldTypes as number[]).includes(field.fieldType),
    );

    return filtered.map((field: FormFieldDto) => ({
      id: field.id.toString(),
      displayName: field.displayName,
    }));
  }, [initialForm]);

  const selectedFieldOption = useMemo<ValidField | null>(() => {
    if (!options?.fieldId) return null;
    return availableFields.find((f) => f.id === options.fieldId) ?? null;
  }, [availableFields, options?.fieldId]);

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

  const formSelector: JSX.Element = (
    <FormControl error={!!validationErrors?.properties?.formId}>
      <Autocomplete
        options={availableForms}
        getOptionLabel={(option: any) => option?.name || ""}
        value={selectedFormOption}
        inputValue={searchText}
        loading={isLoadingForms}
        loadingText="מחפש..."
        noOptionsText="לא נמצאו תוצאות"
        onInputChange={(_, newInputValue, reason) => {
          if (reason === "input") {
            setSearchText(newInputValue);
          } else if (reason === "clear") {
            setSearchText("");
          }
        }}
        onChange={(_, newValue: any) => {
          onChange({
            source: OptionsSource.FORM_FIELD_RESPONSES,
            options: { ...options, formId: newValue ? newValue.id.toString() : "", fieldId: "" },
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
  );

  const fieldSelect: JSX.Element = (
    <FieldControl error={!!validationErrors?.properties?.fieldId}>
      <Tooltip title={!options?.formId ? "יש לבחור טופס" : ""}>
        <span style={{ display: "block" }}>
          <Autocomplete
            options={availableFields}
            getOptionLabel={(option) => option.displayName || ""}
            value={selectedFieldOption}
            onOpen={() => setFieldTouchAttempted(true)}
            onChange={(_, newValue) => {
              onChange({
                source: OptionsSource.FORM_FIELD_RESPONSES,
                options: { ...options, fieldId: newValue ? newValue.id : "" },
              });
            }}
            noOptionsText={
              !options?.formId
                ? fieldTouchAttempted
                  ? "יש לבחור טופס"
                  : ""
                : availableFields.length
                  ? "לא נמצאו תוצאות"
                  : "אין שדות זמינים"
            }
            disabled={!options?.formId}
            renderInput={(params) => (
              <TextField
                {...params}
                label={"בחירת שדה"}
                variant="standard"
                error={!!validationErrors?.properties?.fieldId}
                helperText={validationErrors?.properties?.fieldId?.errors?.[0]}
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
