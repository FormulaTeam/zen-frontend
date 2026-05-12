import { fieldConnectionTooltipTexts, FieldTypeIds } from "@utils/interfaces";
import { ExtraElementProps } from "../../index";

import {
  SpecificDiscriminatedUnionSubObject,
  SpecificDiscriminatedUnionSubObjectErrorTree,
} from "@pages/FormEditor/schemas/types";
import { FormFieldExtra } from "@pages/FormEditor/schemas/fields";
import { ReactElement } from "react";
import { FormFieldResponsesOptions } from "./FormFieldResponsesOptions";
import { Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Tooltip } from "@mui/material";
import { ManualOptions } from "./ManualOptions";
import { Info } from "@mui/icons-material";
import { OptionsSource, optionsSource } from "formula-gear";

type FieldTypeId = typeof FieldTypeIds.options;

type SpecificOptions<Source extends OptionsSource> = SpecificDiscriminatedUnionSubObject<FormFieldExtra<FieldTypeId>, "source", Source, "options">;
type SpecificOptionsErrors<Source extends OptionsSource> = SpecificDiscriminatedUnionSubObjectErrorTree<FormFieldExtra<FieldTypeId>, "source", Source, "options">;

interface Props extends ExtraElementProps<FieldTypeId> {
  fieldId: string;
}

function OptionsFieldExtra({ fieldId, extra, onChange, validationErrors, disabled }: Props) {
  const {
    source = optionsSource.Manual,
    multiple = false,
  } = extra;

  let optionsElement: ReactElement | null = null;

  switch (source) {
    case optionsSource.FormFieldResponses:
      optionsElement = <FormFieldResponsesOptions options={extra.options as SpecificOptions<typeof optionsSource.FormFieldResponses>}
        validationErrors={validationErrors?.properties?.options as SpecificOptionsErrors<typeof optionsSource.FormFieldResponses> | undefined}
        onChange={onChange} />;
      break;
    case optionsSource.Manual:
      optionsElement = <ManualOptions fieldId={fieldId}
        options={extra.options as SpecificOptions<typeof optionsSource.Manual>}
        validationErrors={validationErrors?.properties?.options as SpecificOptionsErrors<typeof optionsSource.Manual> | undefined}
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
          <FormControlLabel value={optionsSource.Manual} control={<Radio />} label="ידני" />
          <FormControlLabel value={optionsSource.FormFieldResponses} control={<Radio />} label={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span>מטופס</span>
              <Tooltip title={fieldConnectionTooltipTexts.FormConnection}>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <Info color="disabled" sx={{ cursor: "pointer" }} />
                </span>
              </Tooltip>
            </span>
          } />
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
export type { FieldTypeId as OptionsFieldTypeId, SpecificOptions, SpecificOptionsErrors };
