import React, { useEffect, useMemo, useRef, useState, useImperativeHandle } from "react";
import {
  FormControl,
  CircularProgress,
  Autocomplete,
  TextField,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import { getFormIdByFieldId, useGetForm } from "@api/formsApi";
import { useGetFormsData } from "@hooks/useGetFormsData";
import { formsScopeOption } from "@src/types/enums/filtersAndSorts.enum";
import { FormSectionDto, FormFieldDto, FormDto } from "@src/types/shared";
import { useFormStructureContext } from "@pages/FormEditor/context/FormStructureContext";
import { FormOption } from "@utils/interfaces";
import { LoaderContainer, Container, FieldControl } from "./styled";
import { fieldType } from "formula-gear";
import { OptionsFieldTypeId } from "../index";
import { FormFieldExtra } from "@pages/FormEditor/schemas/fields";
import { usePaginatedFieldValueOptions } from "@src/hooks/usePaginatedFieldValueOptions";
import { PaginatedAutocompleteListbox } from "@src/components/PaginatedAutocompleteListbox";

interface Props {
  linkedOptionsFieldId: string | null | undefined;
  onChange: (extra: Partial<FormFieldExtra<OptionsFieldTypeId>>) => void;
  validationErrors: any;
  defaultValue?: string[];
  selectionMode: "single" | "multiple";
}

interface ValidField {
  id: string;
  displayName: string;
}

const linkedOptionsOwnerFormIdCache = new Map<string, number>();

const getFieldsFromForm = (form: FormDto): FormFieldDto[] => {
  return (form.sections ?? []).flatMap((section: FormSectionDto) => section.fields ?? []);
};

function FormFieldResponsesOptions(props: Props) {
  const {
    linkedOptionsFieldId,
    validationErrors,
    onChange,
    defaultValue = [],
    selectionMode,
  } = props;

  const { formStructure } = useFormStructureContext();

  const [searchText, setSearchText] = useState("");
  const [isFormSelectorOpen, setIsFormSelectorOpen] = useState(false);

  const [selectedFormId, setSelectedFormId] = useState<number | undefined>(() => {
    if (!linkedOptionsFieldId) return undefined;
    return linkedOptionsOwnerFormIdCache.get(linkedOptionsFieldId);
  });

  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>(
    linkedOptionsFieldId ?? undefined,
  );

  const [fieldTouchAttempted, setFieldTouchAttempted] = useState(false);
  const [isResolvingInitialSelection, setIsResolvingInitialSelection] = useState(false);

  const resolvedFieldIdRef = useRef<string | null>(null);

  const { formsData: allForms, isLoading: isLoadingForms } = useGetFormsData({
    searchQuery: searchText || undefined,
    scope: formsScopeOption.LinkableForms,
    enabled: isFormSelectorOpen,
  });

  const {
    options: defaultValueOptions,
    isLoading: isLoadingDefaultValues,
    loadMore: loadMoreDefaultValues,
  } = usePaginatedFieldValueOptions({
    formId: selectedFormId,
    fieldId: selectedFieldId,
  });

  const selectedDefaultValueOptions = useMemo(() => {
    const loadedOptionsById = new Map(
      defaultValueOptions.map((option) => [option.id, option]),
    );

    return defaultValue.map(String).map((value) => {
      return (
        loadedOptionsById.get(value) ?? {
          id: value,
          text: value,
        }
      );
    });
  }, [defaultValueOptions, defaultValue]);

  useEffect(() => {
    setSelectedFieldId(linkedOptionsFieldId ?? undefined);

    if (!linkedOptionsFieldId) {
      setSelectedFormId(undefined);
      resolvedFieldIdRef.current = null;
      return;
    }

    const cachedOwnerFormId = linkedOptionsOwnerFormIdCache.get(linkedOptionsFieldId);

    if (cachedOwnerFormId) {
      setSelectedFormId(cachedOwnerFormId);
      resolvedFieldIdRef.current = linkedOptionsFieldId;
    }
  }, [linkedOptionsFieldId]);

  useEffect(() => {
    if (!linkedOptionsFieldId) return;

    const cachedOwnerFormId = linkedOptionsOwnerFormIdCache.get(linkedOptionsFieldId);

    if (cachedOwnerFormId) {
      setSelectedFormId(cachedOwnerFormId);
      setSelectedFieldId(linkedOptionsFieldId);
      resolvedFieldIdRef.current = linkedOptionsFieldId;
      return;
    }

    if (resolvedFieldIdRef.current === linkedOptionsFieldId && selectedFormId) {
      return;
    }

    let isMounted = true;

    const resolveSelectedForm = async () => {
      setIsResolvingInitialSelection(true);

      try {
        const formId = await getFormIdByFieldId(linkedOptionsFieldId);

        if (formId) {
          linkedOptionsOwnerFormIdCache.set(linkedOptionsFieldId, formId);

          if (isMounted) {
            setSelectedFormId(formId);
            setSelectedFieldId(linkedOptionsFieldId);
            resolvedFieldIdRef.current = linkedOptionsFieldId;
          }
        }
      } finally {
        if (isMounted) {
          setIsResolvingInitialSelection(false);
        }
      }
    };

    void resolveSelectedForm();

    return () => {
      isMounted = false;
    };
  }, [linkedOptionsFieldId, selectedFormId]);

  const availableForms = useMemo<FormOption[]>(() => {
    const list = formStructure?.metadata?.id
      ? allForms.filter((form) => form.id !== formStructure.metadata.id)
      : allForms;

    return list.map((form) => ({
      id: form.id.toString(),
      name: form.name,
    }));
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

    const fields = getFieldsFromForm(selectedForm);

    const allowedTypes = [
      fieldType.Number,
      fieldType.ShortText,
      fieldType.LongText,
      fieldType.Date,
      fieldType.Time,
    ];

    return fields
      .filter((field) => allowedTypes.some((type) => type === field.fieldType))
      .map((field) => ({
        id: field.id.toString(),
        displayName: field.displayName,
      }));
  }, [selectedForm]);

  const selectedFieldOption = useMemo<ValidField | null>(() => {
    if (!selectedFieldId) return null;
    return availableFields.find((field) => field.id === selectedFieldId) ?? null;
  }, [availableFields, selectedFieldId]);

  if (isResolvingInitialSelection && !selectedFormId) {
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
        loading={isLoadingForms || isInitializing}
        loadingText="מחפש..."
        noOptionsText="לא נמצאו תוצאות"
        onInputChange={(_, newInputValue) => {
          setSearchText(newInputValue);
        }}
        onOpen={() => setIsFormSelectorOpen(true)}
        onClose={() => setIsFormSelectorOpen(false)}
        onChange={(_, newValue) => {
          const nextFormId = newValue ? Number(newValue.id) : undefined;

          setSelectedFormId(nextFormId);
          setSelectedFieldId(undefined);
          resolvedFieldIdRef.current = null;

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
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Typography component="span">
                {option.name}
              </Typography>

              <Typography
                component="span"
                sx={{
                  marginInlineStart: "auto",
                  paddingInlineStart: 2,
                  color: "text.secondary",
                  fontSize: "0.75rem",
                  flexShrink: 0,
                }}
              >
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
                <>
                  {isLoadingForms || isInitializing ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
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
            loading={isInitializing}
            loadingText="טוען..."
            onOpen={() => setFieldTouchAttempted(true)}
            onChange={(_, newValue) => {
              const nextFieldId = newValue ? newValue.id : undefined;

              setSelectedFieldId(nextFieldId);
              resolvedFieldIdRef.current = nextFieldId ?? null;

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

  const defaultValueSelect: JSX.Element = (
    <FieldControl>
      <Tooltip title={!selectedFieldId ? "יש לבחור שדה" : ""}>
        <span style={{ display: "block" }}>
          <Autocomplete
            multiple={selectionMode === "multiple"}
            options={defaultValueOptions}
            getOptionLabel={(option) => option.text}
            value={
              selectionMode === "multiple"
                ? selectedDefaultValueOptions
                : selectedDefaultValueOptions[0] ?? null
            }
            loading={isLoadingDefaultValues}
            loadingText="טוען..."
            noOptionsText="אין ערכים זמינים"
            disabled={!selectedFieldId}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_, value) => {
              onChange({
                defaultValue: Array.isArray(value)
                  ? value.map((item) => item.id)
                  : value
                    ? [value.id]
                    : [],
              });
            }}
            ListboxComponent={PaginatedAutocompleteListbox}
            ListboxProps={{ onLoadMore: loadMoreDefaultValues } as any}
            renderInput={(params) => (
              <TextField {...params} label="ברירת מחדל" variant="standard" />
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
      {defaultValueSelect}
    </Container>
  );
}

export { FormFieldResponsesOptions };