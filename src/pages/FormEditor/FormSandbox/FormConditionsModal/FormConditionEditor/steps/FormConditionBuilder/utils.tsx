import {
  CONDITION_FIELD_TYPE_IDS,
  ConditionFieldTypeId,
  FieldTypeIdToComparator,
} from "../../../../../schemas/conditions/conditionField/baseConditionFieldSchema";
import { FieldTypeIds } from "../../../../../../../utils/interfaces";
import { ArrayElement, ValueOf } from "../../../../../../../types/utils";
import { TextComparator } from "../../../../../schemas/conditions/conditionField/comparators/TextComparator";
import { NumberComparator } from "../../../../../schemas/conditions/conditionField/comparators/NumberComparator";
import { DateComparator } from "../../../../../schemas/conditions/conditionField/comparators/DateComparator";
import { OptionsComparator } from "../../../../../schemas/conditions/conditionField/comparators/OptionsComparator";
import { CheckboxComparator } from "../../../../../schemas/conditions/conditionField/comparators/CheckboxComparator";
import { FunctionComponent } from "react";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { ManualItems } from "../../../../FormStructure/FormFieldElement/ExtraElement/elements/OptionsFieldExtra/ManualOptions";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import moment, { Moment } from "moment";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import "moment/locale/he";

type ComparatorValue = number;

interface ComparatorOptionData {
  label: string;
  requiresTargetValue?: boolean;
}

type ComparatorOptionsProperties = {
  [key in keyof typeof FieldTypeIdToComparator]: {
    [k in ValueOf<(typeof FieldTypeIdToComparator)[key]> & number]: ComparatorOptionData;
  };
};

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
    [NumberComparator.LARGER_OR_EQUAL]: {
      label: "גדול או שווה ל",
      requiresTargetValue: true,
    },
    [NumberComparator.SMALLER_OR_EQUAL]: {
      label: "קטן או שווה ל",
      requiresTargetValue: true,
    },
    [NumberComparator.EMPTY]: { label: "ריק" },
    [NumberComparator.NOT_EMPTY]: { label: "לא ריק" },
  },
  [FieldTypeIds.date]: {
    [DateComparator.EQUAL]: { label: "זהה ל", requiresTargetValue: true },
    [DateComparator.NOT_EQUAL]: { label: "שונה מ", requiresTargetValue: true },
    [DateComparator.BEFORE]: { label: "קודם ל", requiresTargetValue: true },
    [DateComparator.AFTER]: { label: "מאוחר מ", requiresTargetValue: true },
    [DateComparator.BEFORE_OR_EQUAL]: {
      label: "קודם או זהה ל",
      requiresTargetValue: true,
    },
    [DateComparator.AFTER_OR_EQUAL]: {
      label: "מאוחר או זהה ל",
      requiresTargetValue: true,
    },
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

const ComparatorDescriptionToValue: Record<number, Record<string, ComparatorValue>> = {
  [FieldTypeIds.longText]: {
    equals: TextComparator.EQUAL,
    not_equals: TextComparator.NOT_EQUAL,
    contains: TextComparator.CONTAINS,
    not_contains: TextComparator.NOT_CONTAINS,
    is_empty: TextComparator.EMPTY,
    is_not_empty: TextComparator.NOT_EMPTY,
  },
  [FieldTypeIds.shortText]: {
    equals: TextComparator.EQUAL,
    not_equals: TextComparator.NOT_EQUAL,
    contains: TextComparator.CONTAINS,
    not_contains: TextComparator.NOT_CONTAINS,
    is_empty: TextComparator.EMPTY,
    is_not_empty: TextComparator.NOT_EMPTY,
  },
  [FieldTypeIds.number]: {
    equals: NumberComparator.EQUAL,
    not_equals: NumberComparator.NOT_EQUAL,
    greater_than: NumberComparator.LARGER,
    less_than: NumberComparator.SMALLER,
    greater_than_or_equal: NumberComparator.LARGER_OR_EQUAL,
    less_than_or_equal: NumberComparator.SMALLER_OR_EQUAL,
    is_empty: NumberComparator.EMPTY,
    is_not_empty: NumberComparator.NOT_EMPTY,
  },
  [FieldTypeIds.date]: {
    equals: DateComparator.EQUAL,
    not_equals: DateComparator.NOT_EQUAL,
    before: DateComparator.BEFORE,
    after: DateComparator.AFTER,
    before_or_equal: DateComparator.BEFORE_OR_EQUAL,
    after_or_equal: DateComparator.AFTER_OR_EQUAL,
    is_empty: DateComparator.EMPTY,
    is_not_empty: DateComparator.NOT_EMPTY,
  },
  [FieldTypeIds.options]: {
    equals: OptionsComparator.ONLY,
    not_equals: OptionsComparator.OTHER_THAN,
    contains: OptionsComparator.INCLUDES,
    not_contains: OptionsComparator.NOT_INCLUDES,
    is_empty: OptionsComparator.NONE,
    is_not_empty: OptionsComparator.ANY,
  },
  [FieldTypeIds.checkbox]: {
    equals: CheckboxComparator.EQUAL,
  },
};

const getStaticComparatorOptionsProperties = (
  typeId: number,
): Record<number, ComparatorOptionData> => {
  return (
    (
      ComparatorOptionsProperties as unknown as Record<number, Record<number, ComparatorOptionData>>
    )[typeId] ?? {}
  );
};

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
      <TextField fullWidth multiline variant="standard" type="text" {...restProps} />
    ),
  },
  [FieldTypeIds.shortText]: {
    valueTransformer: String,
    inputComponent: ({ ...restProps }: ComparatorValueComponentProps) => (
      <TextField fullWidth variant="standard" type="text" {...restProps} />
    ),
  },
  [FieldTypeIds.number]: {
    valueTransformer: Number,
    inputComponent: ({ ...restProps }: ComparatorValueComponentProps) => (
      <TextField fullWidth variant="standard" type="number" {...restProps} />
    ),
  },
  [FieldTypeIds.date]: {
    valueTransformer: (value) => (!!value ? (value as Moment).toISOString() : undefined),
    inputComponent: ({
      label: _,
      value,
      onChange,
      disabled,
      error,
      helperText,
      ...restProps
    }: ComparatorValueComponentProps) => (
      <FormControl disabled={disabled} error={error} sx={{ width: "100%", marginTop: 1 }}>
        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="he">
          <DatePicker
            value={!!value ? moment(String(value)) : null}
            disabled={disabled}
            sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
            onChange={(date) => onChange({ target: { value: date } })}
            {...restProps}
          />
        </LocalizationProvider>
        <FormHelperText id="options-value-helper-text">{helperText}</FormHelperText>
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
      items?: Pick<ArrayElement<ManualItems>, "id" | "text">[];
    }) => (
      <FormControl disabled={disabled} error={error} fullWidth sx={{ marginTop: 1 }}>
        <InputLabel id="options-value-label">{label}</InputLabel>
        <Select
          labelId="options-value-label"
          fullWidth
          aria-describedby="options-value-helper-text"
          label={label}
          {...restProps}>
          {items?.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.text}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText id="options-value-helper-text">{helperText}</FormHelperText>
      </FormControl>
    ),
  },
  [FieldTypeIds.checkbox]: {
    valueTransformer: Boolean,
    inputComponent: ({ helperText, disabled, error, value, ...restProps }) => (
      <FormControl disabled={disabled} error={error} fullWidth>
        <InputLabel id="checkbox-value-label" sx={{ marginTop: 1 }}>
          ערך
        </InputLabel>
        <Select
          labelId="checkbox-value-label"
          fullWidth
          variant="standard"
          value={value != undefined ? +(value as boolean) : ""}
          {...restProps}>
          <MenuItem value={+false}>לא</MenuItem>
          <MenuItem value={+true}>כן</MenuItem>
        </Select>
        <FormHelperText id="checkbox-value-helper-text">{helperText}</FormHelperText>
      </FormControl>
    ),
  },
} as const satisfies Record<keyof typeof FieldTypeIdToComparator, ComparatorValueProperty>;

interface ComparatorOption {
  values: ComparatorValue[];
  optionsProperties: Record<number, ComparatorOptionData>;
  valueProperties: ValueOf<typeof ComparatorValueProperties>;
}

type ComparatorsByFieldTypeDto = Record<
  number,
  {
    id: number;
    description: string;
  }[]
>;

const getComparatorLabel = (typeId: number | undefined, comparator: number | undefined): string => {
  if (typeId == null || comparator == null) {
    return "";
  }

  return getStaticComparatorOptionsProperties(typeId)[comparator]?.label ?? "";
};

const getFallbackComparatorValues = (typeId: ConditionFieldTypeId): ComparatorValue[] => {
  return Object.values(FieldTypeIdToComparator[typeId]).filter(
    (value): value is number => typeof value === "number",
  );
};

const getComparatorValuesFromDb = (
  typeId: ConditionFieldTypeId,
  comparatorsByFieldType?: ComparatorsByFieldTypeDto,
): ComparatorValue[] | null => {
  const dbComparators = comparatorsByFieldType?.[typeId];

  if (!dbComparators || dbComparators.length === 0) {
    return null;
  }

  const staticOptionsProperties = getStaticComparatorOptionsProperties(typeId);

  return Array.from(
    new Set(
      dbComparators
        .map((comparator) => ComparatorDescriptionToValue[typeId]?.[comparator.description])
        .filter(
          (comparator): comparator is number =>
            comparator !== undefined && comparator in staticOptionsProperties,
        ),
    ),
  );
};

const buildComparatorOptions = (
  comparatorsByFieldType?: ComparatorsByFieldTypeDto,
): Record<ConditionFieldTypeId, ComparatorOption> => {
  return CONDITION_FIELD_TYPE_IDS.reduce(
    (obj, typeId) => {
      const staticOptionsProperties = getStaticComparatorOptionsProperties(typeId);

      const values =
        getComparatorValuesFromDb(typeId, comparatorsByFieldType) ??
        getFallbackComparatorValues(typeId);

      const optionsProperties = values.reduce<Record<number, ComparatorOptionData>>(
        (acc, comparator) => {
          const staticProperty = staticOptionsProperties[comparator];

          if (staticProperty) {
            acc[comparator] = staticProperty;
          }

          return acc;
        },
        {},
      );

      obj[typeId] = {
        values,
        optionsProperties,
        valueProperties: ComparatorValueProperties[typeId],
      };

      return obj;
    },
    {} as Record<ConditionFieldTypeId, ComparatorOption>,
  );
};

const ComparatorOptions = buildComparatorOptions();

export {
  ComparatorOptions,
  ComparatorOptionsProperties,
  buildComparatorOptions,
  getComparatorLabel,
};
