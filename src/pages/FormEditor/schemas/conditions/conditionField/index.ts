import { discriminatedUnion } from "zod";
import shortTextConditionSchema from "./shortTextConditionSchema";
import longTextConditionSchema from "./longTextConditionSchema";

const conditionFieldSchema = discriminatedUnion("typeId", [
  shortTextConditionSchema,
  longTextConditionSchema,
]);

export { conditionFieldSchema };