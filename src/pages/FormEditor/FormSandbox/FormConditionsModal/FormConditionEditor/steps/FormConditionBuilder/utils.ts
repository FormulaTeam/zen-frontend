import {
  CONDITION_FIELD_TYPE_IDS,
  ConditionFieldTypeId,
  FieldTypeIdToConditionType,
  FormConditionType,
} from "../../../../../schemas/conditions/conditionField/baseConditionFieldSchema";
import { FieldTypeIds } from "../../../../../../../utils/interfaces";
import { ValueOf } from "../../../../../../../types/utils";
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

interface ConditionTypeOptionData {
  label: string;

  requiresTargetValue?: boolean;
}

type ConditionTypeOptionsData = { [key in keyof typeof FieldTypeIdToConditionType]: { [k in ValueOf<typeof FieldTypeIdToConditionType[key]> & number]: ConditionTypeOptionData } };

const ConditionTypeOptionsData = {
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
    [DateConditionType.BEFORE]: { label: "לפני ה", requiresTargetValue: true },
    [DateConditionType.AFTER]: { label: "אחרי ה", requiresTargetValue: true },
    [DateConditionType.BEFORE_OR_EQUAL]: { label: "לפני או זהה ל", requiresTargetValue: true },
    [DateConditionType.AFTER_OR_EQUAL]: { label: "אחרי או זהה ל", requiresTargetValue: true },
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
} as const satisfies ConditionTypeOptionsData;

interface ConditionTypeOption {
  values: FormConditionType[],
  data: ValueOf<ConditionTypeOptionsData>,
}

const ConditionTypeOptions = CONDITION_FIELD_TYPE_IDS.reduce((obj, typeId) => {
  obj[typeId] = {
    values: Object.values(FieldTypeIdToConditionType[typeId]),
    data: ConditionTypeOptionsData[typeId],
  } as ConditionTypeOption;

  return obj;
}, {}) as Record<ConditionFieldTypeId, ConditionTypeOption>;


export {
  ConditionTypeOptions,
  ConditionTypeOptionsData,
};