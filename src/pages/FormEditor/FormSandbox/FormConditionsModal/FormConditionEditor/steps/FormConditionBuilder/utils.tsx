import {
  CONDITION_FIELD_TYPE_IDS,
  ConditionFieldTypeId,
  FieldTypeIdToConditionType,
  FormConditionType,
} from "../../../../../schemas/conditions/conditionField/baseConditionFieldSchema";
import { FieldTypeIds } from "../../../../../../../utils/interfaces";
import { ArrayElement, ValueOf } from "../../../../../../../types/utils";
import { TextConditionType } from "../../../../../schemas/conditions/conditionField/conditionTypes/TextConditionType";
import {
  NumberConditionType,
} from "../../../../../schemas/conditions/conditionField/conditionTypes/NumberConditionType";
import { DateConditionType } from "../../../../../schemas/conditions/conditionField/conditionTypes/DateConditionType";
import {
  OptionsConditionType,
} from "../../../../../schemas/conditions/conditionField/conditionTypes/OptionsConditionType";
import {
  CheckboxConditionType,
} from "../../../../../schemas/conditions/conditionField/conditionTypes/CheckboxConditionType";
import { FunctionComponent } from "react";
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import {
  ManualItems,
} from "../../../../FormStructure/FormFieldElement/ExtraElement/elements/OptionsFieldExtra/ManualOptions";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import moment, { Moment } from "moment";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import "moment/locale/he";

interface ConditionTypeOptionData {
  label: string;

  requiresTargetValue?: boolean;
}

type ConditionTypeOptionsProperties = { [key in keyof typeof FieldTypeIdToConditionType]: { [k in ValueOf<typeof FieldTypeIdToConditionType[key]> & number]: ConditionTypeOptionData } };

const ConditionTypeOptionsProperties = {
  [FieldTypeIds.longText]: {
    [TextConditionType.EQUAL]: { label: "שווה ל", requiresTargetValue: true },
    [TextConditionType.NOT_EQUAL]: { label: "שונה מ", requiresTargetValue: true },
    [TextConditionType.CONTAINS]: { label: "מכיל", requiresTargetValue: true },
    [TextConditionType.NOT_CONTAINS]: { label: "לא מכיל", requiresTargetValue: true },
    [TextConditionType.EMPTY]: { label: "ריק" },
    [TextConditionType.NOT_EMPTY]: { label: "לא ריק" },
  },
  [FieldTypeIds.shortText]: {
    [TextConditionType.EQUAL]: { label: "שווה ל", requiresTargetValue: true },
    [TextConditionType.NOT_EQUAL]: { label: "שונה מ", requiresTargetValue: true },
    [TextConditionType.CONTAINS]: { label: "מכיל", requiresTargetValue: true },
    [TextConditionType.NOT_CONTAINS]: { label: "לא מכיל", requiresTargetValue: true },
    [TextConditionType.EMPTY]: { label: "ריק" },
    [TextConditionType.NOT_EMPTY]: { label: "לא ריק" },
  },
  [FieldTypeIds.number]: {
    [NumberConditionType.EQUAL]: { label: "שווה ל", requiresTargetValue: true },
    [NumberConditionType.NOT_EQUAL]: { label: "שונה מ", requiresTargetValue: true },
    [NumberConditionType.LARGER]: { label: "גדול מ", requiresTargetValue: true },
    [NumberConditionType.SMALLER]: { label: "קטן מ", requiresTargetValue: true },
    [NumberConditionType.LARGER_OR_EQUAL]: { label: "גדול או שווה ל", requiresTargetValue: true },
    [NumberConditionType.SMALLER_OR_EQUAL]: { label: "קטן או שווה ל", requiresTargetValue: true },
    [NumberConditionType.EMPTY]: { label: "ריק" },
    [NumberConditionType.NOT_EMPTY]: { label: "לא ריק" },
  },
  [FieldTypeIds.date]: {
    [DateConditionType.EQUAL]: { label: "זהה ל", requiresTargetValue: true },
    [DateConditionType.NOT_EQUAL]: { label: "שונה מ", requiresTargetValue: true },
    [DateConditionType.BEFORE]: { label: "קודם ל", requiresTargetValue: true },
    [DateConditionType.AFTER]: { label: "מאוחר מ", requiresTargetValue: true },
    [DateConditionType.BEFORE_OR_EQUAL]: { label: "קודם או זהה ל", requiresTargetValue: true },
    [DateConditionType.AFTER_OR_EQUAL]: { label: "מאוחר או זהה ל", requiresTargetValue: true },
    [DateConditionType.EMPTY]: { label: "ריק" },
    [DateConditionType.NOT_EMPTY]: { label: "לא ריק" },
  },
  [FieldTypeIds.options]: {
    [OptionsConditionType.ONLY]: { label: "רק", requiresTargetValue: true },
    [OptionsConditionType.OTHER_THAN]: { label: "חוץ מ", requiresTargetValue: true },
    [OptionsConditionType.INCLUDES]: { label: "כולל", requiresTargetValue: true },
    [OptionsConditionType.NOT_INCLUDES]: { label: "לא כולל", requiresTargetValue: true },
    [OptionsConditionType.NONE]: { label: "ריק" },
    [OptionsConditionType.ANY]: { label: "לא ריק" },
  },
  [FieldTypeIds.checkbox]: {
    [CheckboxConditionType.EQUAL]: { label: "שווה ל", requiresTargetValue: true },
  },
} as const satisfies ConditionTypeOptionsProperties;

interface ConditionTypeValueComponentProps {
  label: string;
  value: unknown;
  disabled: boolean;
  onChange: (e: { target: { value: string | unknown } }) => void;

  error?: boolean;
  helperText?: string;
}

interface ConditionTypeValueProperty {
  valueTransformer: (value: unknown) => any;
  inputComponent: FunctionComponent<ConditionTypeValueComponentProps>;
}

const ConditionTypeValueProperties = {
  [FieldTypeIds.longText]: {
    valueTransformer: String,
    inputComponent: ({ ...restProps }: ConditionTypeValueComponentProps) => (
      <TextField fullWidth multiline variant={"standard"} type={"text"} {...restProps} />
    ),
  },
  [FieldTypeIds.shortText]: {
    valueTransformer: String,
    inputComponent: ({ ...restProps }: ConditionTypeValueComponentProps) => (
      <TextField fullWidth variant={"standard"} type={"text"} {...restProps} />
    ),
  },
  [FieldTypeIds.number]: {
    valueTransformer: Number,
    inputComponent: ({ ...restProps }: ConditionTypeValueComponentProps) => (
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
                     }: ConditionTypeValueComponentProps) => (
      <FormControl disabled={disabled}
                   error={error}
                   sx={{ width: "100%", marginTop: 1}}>
        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="he">
          <DatePicker value={!!value ? moment(String(value)) : null}
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
                     }: ConditionTypeValueComponentProps & {
      items?: Pick<ArrayElement<ManualItems>, "id" | "text">[],
    }) => (
      <FormControl disabled={disabled}
                   error={error}>
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
    inputComponent: ({ helperText, disabled, error, value, onChange, ...restProps }) => (
      <FormControl disabled={disabled} error={error}>
        <InputLabel id="checkbox-value-label">ערך ברירת מחדל</InputLabel>
        <Select labelId="checkbox-value-label"
                fullWidth
                variant={"standard"}
                value={+(value as boolean)}
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
} as const satisfies Record<keyof typeof FieldTypeIdToConditionType, ConditionTypeValueProperty>;

interface ConditionTypeOption {
  values: FormConditionType[];
  optionsProperties: ValueOf<ConditionTypeOptionsProperties>;
  valueProperties: ValueOf<typeof ConditionTypeValueProperties>;
}

const ConditionTypeOptions = CONDITION_FIELD_TYPE_IDS.reduce((obj, typeId) => {
  obj[typeId] = {
    values: Object.values(FieldTypeIdToConditionType[typeId]),
    optionsProperties: ConditionTypeOptionsProperties[typeId],
    valueProperties: ConditionTypeValueProperties[typeId],
  } as ConditionTypeOption;

  return obj;
}, {}) as Record<ConditionFieldTypeId, ConditionTypeOption>;


export {
  ConditionTypeOptions,
  ConditionTypeOptionsProperties,
};