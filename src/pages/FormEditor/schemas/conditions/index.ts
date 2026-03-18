import { array, enum as zod_enum, infer as zod_infer, partialRecord, strictObject, string } from "zod";
import { conditionFieldSchema } from "./conditionField";
import { fieldNotDefinedErrorMessage } from "./conditionField/baseConditionFieldSchema";

enum FormConditionBooleanOperator {
  AND = 1,
  OR = 2,
}

const FormComponentType = {
  SECTION: "section",
  FIELD: "field",
} as const;

const predicateGroupSchema = strictObject({
  id: string(),
  operator: zod_enum(FormConditionBooleanOperator).optional(),
  predicates: array(
    strictObject({
      id: string("חובה לבחור שדה"),
      operator: zod_enum(FormConditionBooleanOperator).optional(),
      field: conditionFieldSchema,
    }).refine(({ field }) => (!!field), { error: fieldNotDefinedErrorMessage }),
  ).min(1, "לא ניתן להגדיר קבוצת תנאים ריקה").refine((conditions) => (
    conditions.some((condition, index) => index === 0 || condition.operator != undefined)
  ), {
    error: "חובה לציין אופרטור בין תנאים",
  }),
});

const predicateGroupsSchema = array(predicateGroupSchema).min(1).refine((groups) => (
    groups.some((group, index) => index === 0 || group.operator != undefined)
  ), {
    error: "חובה לציין אופרטור בין קבוצות תנאים",
  },
);

const emptyDependantComponentsErrorMessage = "חובה לבחור לפחות אלמנט אחד";

const conditionDependantComponentsSchema = partialRecord(zod_enum(FormComponentType), array(string(), emptyDependantComponentsErrorMessage)).refine((dependantFields) => (
  Object.values(dependantFields).some(arr => arr?.length > 0)
), {
  error: emptyDependantComponentsErrorMessage,
});

const conditionSummarySchema = strictObject({
  name: string().optional(),
});

const conditionSchema = strictObject({
  ...conditionSummarySchema.shape,
  id: string(),
  groups: predicateGroupsSchema,
  dependantComponents: conditionDependantComponentsSchema,
});

const conditionsSchema = array(conditionSchema);

type FormConditionField = zod_infer<typeof conditionFieldSchema>;
type FormConditionPredicateGroup = zod_infer<typeof predicateGroupSchema>;
type FormConditionPredicateGroups = zod_infer<typeof predicateGroupsSchema>;
type FormConditionDependantComponents = zod_infer<typeof conditionDependantComponentsSchema>;
type FormConditionSummary = zod_infer<typeof conditionSummarySchema>;
type FormCondition = zod_infer<typeof conditionSchema>;
type FormConditions = zod_infer<typeof conditionsSchema>;

export {
  predicateGroupsSchema,
  conditionDependantComponentsSchema,
  conditionSummarySchema,
  conditionSchema,
  conditionsSchema,
  FormConditionBooleanOperator,
  FormComponentType,
};
export type {
  FormConditionField,
  FormConditionPredicateGroup,
  FormConditionPredicateGroups,
  FormConditionDependantComponents,
  FormConditionSummary,
  FormCondition,
  FormConditions,
};