import { OptionsSource } from "../../../../../../../schemas/optionsSchema";
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from "@mui/material";
import { ExtraElementProps } from "../../../index";
import { OptionsFieldTypeId, SpecificOptions, SpecificOptionsErrors } from "../index";
import { useEffect } from "react";

interface Props extends Omit<ExtraElementProps<OptionsFieldTypeId>, "extra" | "validationErrors" | "disabled"> {
  options: SpecificOptions<OptionsSource.FORM_FIELD_RESPONSES>;
  validationErrors: SpecificOptionsErrors<OptionsSource.FORM_FIELD_RESPONSES> | undefined;
}

interface ValidForm {
  id: string;
  title: string;
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

  useEffect(() => {
    onChange({ source: OptionsSource.FORM_FIELD_RESPONSES, options });
  }, []);

  const availableForms: ValidForm[] = [
    {
      id: "2342342",
      title: "cshshvjhv",
    },
    {
      id: "234346657",
      title: "tyklkjklyly",
    },
  ]; //TODO populate with actual forms

  const availableFields: ValidField[] = [
    {
      id: "2342342",
      displayName: "235rt564",
    },
    {
      id: "234346657",
      displayName: "546tyhgju",
    },
  ]; //TODO populate with actual fields

  return (
    <>
      <FormControl>
        <FormControl error={!!validationErrors?.properties?.formId}>
          <InputLabel id="source-form-label">{availableForms.length ? "בחירת טופס" : "אין טפסים זמינים"}</InputLabel>
          <Select labelId="source-form-label"
                  variant={"standard"}
                  aria-describedby={"source-form-helper-text"}
                  value={options?.formId}
                  label={"בחירת טופס"}
                  onChange={(e) => {
                    onChange({ options: { ...options, formId: e.target.value } });
                  }}>
            {
              availableForms.map((availableForm) => (
                <MenuItem key={availableForm.id} value={availableForm.id}>{availableForm.title}</MenuItem>
              ))
            }
          </Select>
          <FormHelperText id="source-form-helper-text">
            {validationErrors?.properties?.formId?.errors[0]}
          </FormHelperText>
        </FormControl>

        <FormControl error={!!validationErrors?.properties?.fieldId} style={{ marginTop:8 }}>
          <InputLabel id="source-field-label">{availableForms.length ? "בחירת שדה" : "אין שדות זמינים"}</InputLabel>
          <Select labelId="source-field-label"
                  variant={"standard"}
                  aria-describedby={"source-field-helper-text"}
                  value={options?.fieldId}
                  label={"בחירת שדה"}
                  onChange={(e) => {
                    onChange({ options: { ...options, fieldId: e.target.value } });
                  }}>
            {
              availableFields.map((availableField) => (
                <MenuItem key={availableField.id} value={availableField.id}>{availableField.displayName}</MenuItem>
              ))
            }
          </Select>
          <FormHelperText id="source-field-helper-text">
            {validationErrors?.properties?.fieldId?.errors[0]}
          </FormHelperText>
        </FormControl>
      </FormControl>
    </>
  );
}

export { FormFieldResponsesOptions };