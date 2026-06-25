import { FieldTypeIds } from "@utils/interfaces";
import React, { useState, useMemo } from "react";
import { FormControl, CircularProgress, Autocomplete, TextField, Box, Typography, Tooltip, IconButton } from "@mui/material";
import { InfoOutlined as InfoIcon } from "@mui/icons-material";
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
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
      <FormControl disabled={disabled} error={!!validationErrors?.properties?.linkedFormId} sx={{ flexGrow: 1, minWidth: 0 }}>
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
            onChange({ linkedFormId: newValue ? Number(newValue.id) : undefined });
          }}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          renderOption={(props, option: any) => (
            <li {...props}>
              <Box
                component="span"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                }}>
                <Typography component="span">{option.name}</Typography>

                <Typography
                  component="span"
                  sx={{
                    marginInlineStart: "auto",
                    paddingInlineStart: 2,
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    flexShrink: 0,
                  }}>
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

      <Tooltip
        title={
          <Box
            sx={{ display: "flex", flexDirection: "column", py: 0.5, px: 0.5, direction: "ltr" }}>
            <ul style={{ margin: 0, padding: 0, listStyleType: "disc", listStylePosition: "inside" }}>
              <li style={{ marginBottom: "6px" }}>
                <Typography variant="caption" sx={{ fontSize: "0.8rem", lineHeight: 1.4 }}>
                  על הטפסים המוצעים יש לך הרשאת שליטה מלאה
                </Typography>
              </li>
              <li style={{ marginBottom: "6px" }}>
                <Typography variant="caption" sx={{ fontSize: "0.8rem", lineHeight: 1.4 }}>
                  הטפסים המוצעים לא מכילים בעצם שדה מסוג טופס מקושר
                </Typography>
              </li>
              <li>
                <Typography variant="caption" sx={{ fontSize: "0.8rem", lineHeight: 1.4 }}>
                  השדה יוצג רק לבעלי יכולת יצירת תגובה לטופס הנבחר
                </Typography>
              </li>
            </ul>
          </Box>
        }
        placement="top"
        arrow>
        <IconButton size="small" sx={{ color: "text.secondary", flexShrink: 0, mt: 1 }}>
          <InfoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export { LinkedFormFieldExtra };
