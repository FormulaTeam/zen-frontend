import { useState } from "react";
import { fieldConnectionTooltipTexts, FieldTypeIds } from "@utils/interfaces";
import { ExtraElementProps } from "../../index";

import { SpecificFormFieldData } from "@pages/FormEditor/schemas/fields";
import { FormFieldResponsesOptions } from "./FormFieldResponsesOptions";
import { Checkbox, FormControlLabel, Radio, RadioGroup, Tooltip } from "@mui/material";
import { ManualOptions } from "./ManualOptions";
import { selectionMode, optionsSource, OptionsSource } from "formula-gear";
import {
  InfoIcon,
  MultipleSelectionControlLabel,
  SourceFormControl,
  SourceFormLabel,
  SourceOptionLabel,
  TooltipAnchor,
} from "./styled";

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
    dependentOptionsFieldId,
    defaultValue = [],
  } = extra as any;

  const [selectedSource, setSelectedSource] = useState<OptionsSource>(
    linkedOptionsFieldId ? optionsSource.FormFieldResponses : optionsSource.Manual,
  );

  const isLinkedToForm = selectedSource === optionsSource.FormFieldResponses;
  const multiple = mode === selectionMode.Multiple;

  const handleSourceChange = (nextSource: OptionsSource) => {
    setSelectedSource(nextSource);

    const isFormFieldResponses = nextSource === optionsSource.FormFieldResponses;

    onDataChange?.({
      replaceExtra: true,
      extra: {
        selectionMode: mode,
        linkedOptionsFieldId: isFormFieldResponses ? (linkedOptionsFieldId ?? null) : null,
        dependentOptionsFieldId: null,
        defaultValue: [],
      },
      ...(isFormFieldResponses ? { options: [] } : {}),
    } as any);
  };

  return (
    <>
      <SourceFormControl disabled={disabled}>
        <SourceFormLabel>מקור אפשרויות</SourceFormLabel>
        <RadioGroup
          row
          value={selectedSource}
          onChange={(event) => {
            handleSourceChange(Number(event.target.value) as OptionsSource);
          }}>
          <FormControlLabel value={optionsSource.Manual} control={<Radio />} label="ידני" />

          <FormControlLabel
            value={optionsSource.FormFieldResponses}
            control={<Radio />}
            label={
              <SourceOptionLabel>
                <span>מטופס</span>
                <Tooltip title={fieldConnectionTooltipTexts.FormConnection} arrow>
                  <TooltipAnchor>
                    <InfoIcon color="disabled" />
                  </TooltipAnchor>
                </Tooltip>
              </SourceOptionLabel>
            }
          />
        </RadioGroup>
      </SourceFormControl>

      {isLinkedToForm ? (
        <FormFieldResponsesOptions
          fieldId={fieldId}
          linkedOptionsFieldId={linkedOptionsFieldId}
          dependentOptionsFieldId={dependentOptionsFieldId}
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

      <MultipleSelectionControlLabel
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
