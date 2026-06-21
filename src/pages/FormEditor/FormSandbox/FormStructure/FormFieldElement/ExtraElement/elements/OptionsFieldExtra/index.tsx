import { useState } from "react";
import { fieldConnectionTooltipTexts, FieldTypeIds } from "@utils/interfaces";
import { ExtraElementProps } from "../../index";

import { SpecificFormFieldData } from "@pages/FormEditor/schemas/fields";
import { FormFieldResponsesOptions } from "./FormFieldResponsesOptions";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Tooltip,
} from "@mui/material";
import { ManualOptions } from "./ManualOptions";
import { Info } from "@mui/icons-material";
import { selectionMode, optionsSource, OptionsSource } from "formula-gear";

type FieldTypeId = typeof FieldTypeIds.options;

interface Props extends ExtraElementProps<FieldTypeId> {
  fieldId: string;
}

function OptionsFieldExtra({
  fieldId,
  extra,
  onChange,
  onDataChange,
  validationErrors,
  disabled,
}: Props) {
  const {
    selectionMode: mode = selectionMode.Single,
    linkedOptionsFieldId,
    defaultValue = [],
    source,
  } = extra as any;

  const [selectedSource, setSelectedSource] = useState<OptionsSource>(
    linkedOptionsFieldId || source === optionsSource.FormFieldResponses
      ? optionsSource.FormFieldResponses
      : optionsSource.Manual,
  );

  const isLinkedToForm =
    selectedSource === optionsSource.FormFieldResponses;
  const multiple = mode === selectionMode.Multiple;

  const handleSourceChange = (nextSource: OptionsSource) => {
    setSelectedSource(nextSource);

    onChange({
      linkedOptionsFieldId:
        nextSource === optionsSource.FormFieldResponses
          ? linkedOptionsFieldId ?? null
          : null,
      defaultValue: [],
    });
  };

  return (
    <>
      <FormControl disabled={disabled} style={{ gridColumn: "1 / -1" }}>
        <FormLabel>מקור אפשרויות</FormLabel>
        <RadioGroup
          row
          value={selectedSource}
          onChange={(event) => {
            handleSourceChange(Number(event.target.value) as OptionsSource);
          }}
        >
          <FormControlLabel value={optionsSource.Manual} control={<Radio />} label="ידני" />

          <FormControlLabel
            value={optionsSource.FormFieldResponses}
            control={<Radio />}
            label={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span>מטופס</span>
                <Tooltip title={fieldConnectionTooltipTexts.FormConnection}>
                  <span style={{ display: "inline-flex", alignItems: "center" }}>
                    <Info color="disabled" sx={{ cursor: "pointer" }} />
                  </span>
                </Tooltip>
              </span>
            }
          />
        </RadioGroup>
      </FormControl>

      {isLinkedToForm ? (
        <FormFieldResponsesOptions
          linkedOptionsFieldId={linkedOptionsFieldId}
          defaultValue={defaultValue}
          selectionMode={mode}
          validationErrors={validationErrors as any}
          onChange={onChange}
        />
      ) : (
        <ManualOptions
          fieldId={fieldId}
          defaultValue={defaultValue}
          selectionMode={mode}
          onChange={onChange}
          onDataChange={onDataChange}
          validationErrors={validationErrors as any}
        />
      )}

      <FormControlLabel
        style={{ gridColumn: "span 2" }}
        disabled={disabled}
        control={
          <Checkbox
            checked={multiple}
            onChange={(event) => {
              onChange({
                selectionMode: event.target.checked ? selectionMode.Multiple : selectionMode.Single,
              });
            }}
          />
        }
        label="בחירה מרובה"
      />
    </>
  );
}

export { OptionsFieldExtra };
export type { FieldTypeId as OptionsFieldTypeId, SpecificFormFieldData };