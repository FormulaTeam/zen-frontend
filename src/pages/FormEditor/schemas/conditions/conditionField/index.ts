import { discriminatedUnion } from "zod";
import shortTextConditionSchema from "./shortTextConditionSchema";
import longTextConditionSchema from "./longTextConditionSchema";
import optionsConditionSchema from "./optionsConditionSchema";
import dateConditionSchema from "./dateConditionSchema";
import checkboxConditionSchema from "./checkboxConditionSchema";
import numberConditionSchema from "./numberConditionSchema";
import {
  ConditionTypeOptions,
} from "../../../FormSandbox/FormConditionsModal/FormConditionEditor/steps/FormConditionBuilder/utils";

const conditionFieldSchema = discriminatedUnion("typeId", [
  shortTextConditionSchema,
  longTextConditionSchema,
  optionsConditionSchema,
  dateConditionSchema,
  checkboxConditionSchema,
  numberConditionSchema,
]).refine(({ typeId, targetValue, conditionType }) => (
    !ConditionTypeOptions[typeId ?? -1]?.data[conditionType ?? -1]?.requiresTargetValue || targetValue != undefined
  ),
  {
    error: "חייב להגדיר ערך עבור סוג התנאי שנבחר",
  },
);

export { conditionFieldSchema };