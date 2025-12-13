import { discriminatedUnion } from "zod";
import shortTextConditionSchema from "./shortTextConditionSchema";
import longTextConditionSchema from "./longTextConditionSchema";
import optionsConditionSchema from "./optionsConditionSchema";
import dateConditionSchema from "./dateConditionSchema";
import checkboxConditionSchema from "./checkboxConditionSchema";
import numberConditionSchema from "./numberConditionSchema";

const conditionFieldSchema = discriminatedUnion("typeId", [
  shortTextConditionSchema,
  longTextConditionSchema,
  optionsConditionSchema,
  dateConditionSchema,
  checkboxConditionSchema,
  numberConditionSchema,
]);

export { conditionFieldSchema };