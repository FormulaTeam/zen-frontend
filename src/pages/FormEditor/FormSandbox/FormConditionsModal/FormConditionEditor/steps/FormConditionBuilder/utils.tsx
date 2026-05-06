import {
  CONDITION_FIELD_TYPE_IDS,
  ConditionFieldTypeId,
  FieldTypeIdToComparator,
  FormComparator,
} from "../../../../../schemas/conditions/conditionField/baseConditionFieldSchema";
import { FieldTypeIds } from "../../../../../../../utils/interfaces";
import { ArrayElement, ValueOf } from "../../../../../../../types/utils";
import { TextComparator } from "../../../../../schemas/conditions/conditionField/comparators/TextComparator";
import {
  NumberComparator,
} from "../../../../../schemas/conditions/conditionField/comparators/NumberComparator";
import { DateComparator } from "../../../../../schemas/conditions/conditionField/comparators/DateComparator";
import {
  OptionsComparator,
} from "../../../../../schemas/conditions/conditionField/comparators/OptionsComparator";
import {
  CheckboxComparator,
} from "../../../../../schemas/conditions/conditionField/comparators/CheckboxComparator";
import { FunctionComponent } from "react";
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import {
  ManualItems,
} from "../../../../FormStructure/FormFieldElement/ExtraElement/elements/OptionsFieldExtra/ManualOptions";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import moment, { Moment } from "moment";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import "moment/locale/he";

interface ComparatorOptionData {
  label: string;

  requiresTargetValue?: boolean;
}

type ComparatorOptionsProperties = { [key in keyof typeof FieldTypeIdToComparator]: { [k in ValueOf<typeof FieldTypeIdToComparator[key]> & number]: ComparatorOptionData } };

const ComparatorOptionsProperties = {
  [FieldTypeIds.longText]: {
    [TextComparator.EQUAL]: { label: "שווה ל", requiresTargetValue: true },
    [TextComparator.NOT_EQUAL]: { label: "שונה מ", requiresTargetValue: true },
    [TextComparator.CONTAINS]: { label: "מכיל", requiresTargetValue: true },
    [TextComparator.NOT_CONTAINS]: { label: "לא מכיל", requiresTargetValue: true },
    [TextComparator.EMPTY]: { label: "ריק" },
    [TextComparator.NOT_EMPTY]: { label: "לא ריק" },
  },
  [FieldTypeIds.shortText]: {
    [TextComparator.EQUAL]: { label: "שווה ל", requiresTargetValue: true },
    [TextComparator.NOT_EQUAL]: { label: "שונה מ", requiresTargetValue: true },
    [TextComparator.CONTAINS]: { label: "מכיל", requiresTargetValue: true },
    [TextComparator.NOT_CONTAINS]: { label: "לא מכיל", requiresTargetValue: true },
    [TextComparator.EMPTY]: { label: "ריק" },
    [TextComparator.NOT_EMPTY]: { label: "לא ריק" },
  },
  [FieldTypeIds.number]: {
    [NumberComparator.EQUAL]: { label: "שווה ל", requiresTargetValue: true },
    [NumberComparator.NOT_EQUAL]: { label: "שונה מ", requiresTargetValue: true },
    [NumberComparator.LARGER]: { label: "גדול מ", requiresTargetValue: true },
    [NumberComparator.SMALLER]: { label: "קטן מ", requiresTargetValue: true },
    [NumberComparator.LARGER_OR_EQUAL]: { label: "גדול או שווה ל", requiresTargetValue: true },
    [NumberComparator.SMALLER_OR_EQUAL]: { label: "קטן או שווה ל", requiresTargetValue: true },
    [NumberComparator.EMPTY]: { label: "ריק" },
    [NumberComparator.NOT_EMPTY]: { label: "לא ריק" },
  },
  [FieldTypeIds.date]: {
    [DateComparator.EQUAL]: { label: "זהה ל", requiresTargetValue: true },
    [DateComparator.NOT_EQUAL]: { label: "שונה מ", requiresTargetValue: true },
    [DateComparator.BEFORE]: { label: "קודם ל", requiresTargetValue: true },
    [DateComparator.AFTER]: { label: "מאוחר מ", requiresTargetValue: true },
    [DateComparator.BEFORE_OR_EQUAL]: { label: "קודם או זהה ל", requiresTargetValue: true },
    [DateComparator.AFTER_OR_EQUAL]: { label: "מאוחר או זהה ל", requiresTargetValue: true },
    [DateComparator.EMPTY]: { label: "ריק" },
    [DateComparator.NOT_EMPTY]: { label: "לא ריק" },
  },
  [FieldTypeIds.options]: {
    [OptionsComparator.ONLY]: { label: "שווה ל", requiresTargetValue: true },
    [OptionsComparator.OTHER_THAN]: { label: "שונה מ", requiresTargetValue: true },
    [OptionsComparator.INCLUDES]: { label: "מכיל", requiresTargetValue: true },
    [OptionsComparator.NOT_INCLUDES]: { label: "לא מכיל", requiresTargetValue: true },
    [OptionsComparator.NONE]: { label: "ריק" },
    [OptionsComparator.ANY]: { label: "לא ריק" },
  },
  [FieldTypeIds.checkbox]: {
    [CheckboxComparator.EQUAL]: { label: "שווה ל", requiresTargetValue: true },
  },
} as const satisfies ComparatorOptionsProperties;

interface ComparatorValueComponentProps {
  label: string;
  value: unknown;
  disabled: boolean;
  onChange: (e: { target: { value: string | unknown } }) => void;

  error?: boolean;
  helperText?: string;
}

interface ComparatorValueProperty {
  valueTransformer: (value: unknown) => any;
  inputComponent: FunctionComponent<ComparatorValueComponentProps>;
}

const ComparatorValueProperties = {
  [FieldTypeIds.longText]: {
    valueTransformer: String,
    inputComponent: ({ ...restProps }: ComparatorValueComponentProps) => (
      <TextField fullWidth multiline variant={"standard"} type={"text"} {...restProps} />
    ),
  },
  [FieldTypeIds.shortText]: {
    valueTransformer: String,
    inputComponent: ({ ...restProps }: ComparatorValueComponentProps) => (
      <TextField fullWidth variant={"standard"} type={"text"} {...restProps} />
    ),
  },
  [FieldTypeIds.number]: {
    valueTransformer: Number,
    inputComponent: ({ ...restProps }: ComparatorValueComponentProps) => (
      <TextField fullWidth variant={"standard"} type={"number"} {...restProps} />
    ),
  },
  [FieldTypeIds.date]: {
    valueTransformer: (value) => !!value ? (value as Moment).toISOString() : undefined,
    inputComponent: ({
      label: _,
      value,
      onChange,
      disabled,
      error,
      helperText,
      ...restProps
    }: ComparatorValueComponentProps) => (
      <FormControl disabled={disabled}
        error={error}
        sx={{ width: "100%", marginTop: 1 }}>
        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="he">
          <DatePicker value={!!value ? moment(String(value)) : null}
            disabled={disabled}
            sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
            onChange={(date) => onChange({ target: { value: date } })}
            {...restProps} />
        </LocalizationProvider>
        <FormHelperText id="options-value-helper-text">
          {helperText}
        </FormHelperText>
      </FormControl>
    ),
  },
  [FieldTypeIds.options]: {
    valueTransformer: String,
    inputComponent: ({
      disabled,
      error,
      label,
      items,
      helperText,
      ...restProps
    }: ComparatorValueComponentProps & {
      items?: Pick<ArrayElement<ManualItems>, "id" | "text">[],
    }) => (
      <FormControl disabled={disabled} error={error} fullWidth sx={{ marginTop: 1 }}>
        <InputLabel id="options-value-label">{label}</InputLabel>
        <Select labelId="options-value-label"
          fullWidth
          aria-describedby={"options-value-helper-text"}
          label={label}
          {...restProps}>
          {
            items?.map((item) => (
              <MenuItem key={item.id} value={item.id}>{item.text}</MenuItem>
            ))
          }
        </Select>
        <FormHelperText id="options-value-helper-text">
          {helperText}
        </FormHelperText>
      </FormControl>
    ),
  },
  [FieldTypeIds.checkbox]: {
    valueTransformer: Boolean,
    inputComponent: ({ helperText, disabled, error, value, ...restProps }) => (
      <FormControl disabled={disabled} error={error} fullWidth>
        <InputLabel id="checkbox-value-label" sx={{ marginTop: 1 }}>ערך</InputLabel>
        <Select labelId="checkbox-value-label"
          fullWidth
          variant={"standard"}
          value={value != undefined ? +(value as boolean) : ""}
          {...restProps}>
          <MenuItem value={+false}>לא</MenuItem>
          <MenuItem value={+true}>כן</MenuItem>
        </Select>
        <FormHelperText id="checkbox-value-helper-text">
          {helperText}
        </FormHelperText>
      </FormControl>
    ),
  },
} as const satisfies Record<keyof typeof FieldTypeIdToComparator, ComparatorValueProperty>;

interface ComparatorOption {
  values: FormComparator[];
  optionsProperties: ValueOf<ComparatorOptionsProperties>;
  valueProperties: ValueOf<typeof ComparatorValueProperties>;
}

const ComparatorOptions = CONDITION_FIELD_TYPE_IDS.reduce((obj, typeId) => {
  obj[typeId] = {
    values: Object.values(FieldTypeIdToComparator[typeId]),
    optionsProperties: ComparatorOptionsProperties[typeId],
    valueProperties: ComparatorValueProperties[typeId],
  } as ComparatorOption;

  return obj;
}, {}) as Record<ConditionFieldTypeId, ComparatorOption>;

export {
  ComparatorOptions,
  ComparatorOptionsProperties,
};