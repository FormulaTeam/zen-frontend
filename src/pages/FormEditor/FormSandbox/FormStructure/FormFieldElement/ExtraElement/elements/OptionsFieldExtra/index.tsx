import { fieldConnectionTooltipTexts, FieldTypeIds } from "@utils/interfaces";
import { ExtraElementProps } from "../../index";

import { SpecificFormFieldData } from "@pages/FormEditor/schemas/fields";
import { FormFieldResponsesOptions } from "./FormFieldResponsesOptions";
import { Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Tooltip } from "@mui/material";
import { ManualOptions } from "./ManualOptions";
import { Info } from "@mui/icons-material";

type FieldTypeId = typeof FieldTypeIds.options;

interface Props extends ExtraElementProps<FieldTypeId> {
  fieldId: string;
}

function OptionsFieldExtra({ fieldId, extra, onChange, onDataChange, validationErrors, disabled }: Props) {
  const {
    selectionMode = "single",
    linkedOptionsFieldId,
    defaultValue = [],
  } = extra;

  const isLinked = linkedOptionsFieldId !== undefined;
  const multiple = selectionMode === "multiple";

  const handleSourceChange = (newIsLinked: boolean) => {
    if (newIsLinked) {
      onChange({ linkedOptionsFieldId: undefined });
    } else {
      onChange({ linkedOptionsFieldId: undefined });
    }
  };

  return (
    <>
      <FormControl disabled={disabled} style={{ gridColumn: "1 / -1" }}>
        <FormLabel>מקור אפשרויות</FormLabel>
        <RadioGroup row value={isLinked ? "linked" : "manual"} onChange={(e) => {
          handleSourceChange(e.target.value === "linked");
        }}>
          <FormControlLabel value="manual" control={<Radio />} label="ידני" />
          <FormControlLabel value="linked" control={<Radio />} label={
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

      {isLinked ? (
        <FormFieldResponsesOptions
          linkedOptionsFieldId={linkedOptionsFieldId ?? undefined}
          validationErrors={validationErrors as any}
          onChange={onChange}
        />
      ) : (
        <ManualOptions
          fieldId={fieldId}
          defaultValue={defaultValue}
          selectionMode={selectionMode}
          onChange={onChange}
          onDataChange={onDataChange}
          validationErrors={validationErrors as any}
        />
      )}

      <FormControlLabel style={{ gridColumn: "span 2" }}
        disabled={disabled}
        control={<Checkbox checked={multiple}
          onChange={(e) => {
            onChange({ selectionMode: e.target.checked ? "multiple" : "single" });
          }} />}
        label="בחירה מרובה" />
    </>
  );
}

export { OptionsFieldExtra };
export type { FieldTypeId as OptionsFieldTypeId, SpecificFormFieldData };
