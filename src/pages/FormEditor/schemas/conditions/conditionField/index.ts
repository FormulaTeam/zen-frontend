import { discriminatedUnion } from "zod";
import shortTextConditionSchema from "./shortTextConditionSchema";
import longTextConditionSchema from "./longTextConditionSchema";
import optionsConditionSchema from "./optionsConditionSchema";
import dateConditionSchema from "./dateConditionSchema";
import checkboxConditionSchema from "./checkboxConditionSchema";
import numberConditionSchema from "./numberConditionSchema";
import {
  ComparatorOptions,
} from "../../../FormSandbox/FormConditionsModal/FormConditionEditor/steps/FormConditionBuilder/utils";
import { fieldNotDefinedErrorMessage } from "./baseConditionFieldSchema";

const conditionFieldSchema = discriminatedUnion("typeId", [
  shortTextConditionSchema,
  longTextConditionSchema,
  optionsConditionSchema,
  dateConditionSchema,
  checkboxConditionSchema,
  numberConditionSchema,
], fieldNotDefinedErrorMessage).refine(({ typeId, targetValue, comparator }) => (
    !ComparatorOptions[typeId ?? -1]?.optionsProperties[comparator ?? -1]?.requiresTargetValue || (targetValue != undefined && String(targetValue).length > 0)
  ),
  {
    error: "חייב להגדיר ערך עבור סוג התנאי שנבחר",
    path: ["targetValue"],
  },
);

export { conditionFieldSchema };