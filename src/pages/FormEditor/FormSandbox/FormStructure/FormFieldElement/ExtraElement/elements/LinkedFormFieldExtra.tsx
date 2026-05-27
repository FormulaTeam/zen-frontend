import { FieldTypeIds } from "@utils/interfaces";
import React, { useState, useMemo } from "react";
import { FormControl, CircularProgress, Autocomplete, TextField, Box, Typography } from "@mui/material";
import { ExtraElementProps } from "../index";
import { useGetForm, useGetLinkableForms } from "@api/formsApi";
import { useFormStructureContext } from "@pages/FormEditor/context/FormStructureContext";
import { LoaderContainer, WarningText } from "./styled";
import { useParams } from "react-router-dom";

type Props = ExtraElementProps<typeof FieldTypeIds.linkedForm>;

function LinkedFormFieldExtra({ extra, onChange, validationErrors, disabled }: Props) {
  const { linkedFormId } = extra;
  const { id: urlFormId } = useParams();

  const { formStructure } = useFormStructureContext();
  const [searchText, setSearchText] = useState("");

  const currentFormId = formStructure?.metadata?.id || urlFormId;

  const { data: initialForm, isLoading: isInitializing } = useGetForm({
    formId: linkedFormId ? linkedFormId.toString() : undefined,
  });

  const { data: allForms = [], isLoading } = useGetLinkableForms({
    formId: currentFormId ? currentFormId.toString() : undefined,
    search: searchText || undefined,
  });

  const availableForms = useMemo(() => {
    return allForms;
  }, [allForms]);

  const selectedForm = useMemo(() => {
    if (!initialForm) return null;
    return { id: initialForm.id, name: initialForm.name };
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
          getOptionLabel={(option: any) => {
            return option?.name || "";
          }}
          value={selectedForm}
          onInputChange={(_, newInputValue, reason) => {
            if (reason !== "reset") {
              setSearchText(newInputValue);
            }
          }}
          onChange={(_, newValue: any) => {
            onChange({ linkedFormId: newValue ? newValue.id.toString() : undefined });
          }}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          renderOption={(props, option: any) => (
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
        שימו לב! על מנת שמשתמש יוכל ליצור תגובות בטופס שנבחר, נדרש שיהיו לו הרשאות מתאימות לטופס
        שנבחר
      </WarningText>
    </>
  );
}

export { LinkedFormFieldExtra };
