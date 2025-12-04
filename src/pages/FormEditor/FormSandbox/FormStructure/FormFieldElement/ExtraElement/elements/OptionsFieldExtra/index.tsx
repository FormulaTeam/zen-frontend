import { FieldTypeIds } from "../../../../../../../../utils/interfaces";
import { ExtraElementProps } from "../../index";
import { OptionsSource } from "../../../../../../schemas/fields/optionsSchema";
import {
  SpecificDiscriminatedUnionSubObject,
  SpecificDiscriminatedUnionSubObjectErrorTree,
} from "../../../../../../schemas/types";
import { FormFieldExtra } from "../../../../../../schemas/fields";
import { ReactElement } from "react";
import { FormFieldResponsesOptions } from "./FormFieldResponsesOptions";
import { Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";
import { ManualOptions } from "./ManualOptions";

type FieldTypeId = typeof FieldTypeIds.options;

type SpecificOptions<Source extends OptionsSource> = SpecificDiscriminatedUnionSubObject<FormFieldExtra<FieldTypeId>, "source", Source, "options">;
type SpecificOptionsErrors<Source extends OptionsSource> = SpecificDiscriminatedUnionSubObjectErrorTree<FormFieldExtra<FieldTypeId>, "source", Source, "options">;

interface Props extends ExtraElementProps<FieldTypeId> {
  fieldId: string;
}

function OptionsFieldExtra({ fieldId, extra, onChange, validationErrors, disabled }: Props) {
  const {
    source = OptionsSource.MANUAL,
    multiple = false,
  } = extra;

  let optionsElement: ReactElement | null = null;
  let options: SpecificOptions<OptionsSource>;
  let optionsValidationErrors: SpecificOptionsErrors<OptionsSource> | undefined;

  switch (source) {
    case OptionsSource.FORM_FIELD_RESPONSES:
      options = extra.options as SpecificOptions<OptionsSource.FORM_FIELD_RESPONSES>;
      optionsValidationErrors = validationErrors?.properties?.options as SpecificOptionsErrors<OptionsSource.FORM_FIELD_RESPONSES> | undefined;

      optionsElement = <FormFieldResponsesOptions options={options}
                                                  validationErrors={optionsValidationErrors}
                                                  onChange={onChange} />;
      break;
    case OptionsSource.MANUAL:
      options = extra.options as SpecificOptions<OptionsSource.MANUAL>;
      optionsValidationErrors = validationErrors?.properties?.options as SpecificOptionsErrors<OptionsSource.MANUAL> | undefined;

      optionsElement = <ManualOptions fieldId={fieldId}
                                      options={options}
                                      validationErrors={optionsValidationErrors}
                                      onChange={onChange} />;
      break;
  }

  return (
    <>
      <FormControl disabled={disabled} style={{ gridColumn: "1 / -1" }}>
        <FormLabel>מקור אפשרויות</FormLabel>
        <RadioGroup row value={source} onChange={(e) => {
          onChange({ source: +e.target.value as OptionsSource, options: undefined });
        }}>
          <FormControlLabel value={OptionsSource.MANUAL} control={<Radio />} label="ידני" />
          <FormControlLabel value={OptionsSource.FORM_FIELD_RESPONSES} control={<Radio />} label="מטופס" />
        </RadioGroup>
      </FormControl>

      {optionsElement}

      <FormControlLabel style={{ gridColumn: "span 2" }}
                        disabled={disabled}
                        control={<Checkbox checked={multiple}
                                           onChange={(e) => {
                                             onChange({ multiple: e.target.checked });
                                           }} />}
                        label="בחירה מרובה" />
    </>
  );
}

export { OptionsFieldExtra };
export type{ FieldTypeId as OptionsFieldTypeId, SpecificOptions, SpecificOptionsErrors };