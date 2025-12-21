import { array, enum as zod_enum, infer as zod_infer, strictObject, string, partialRecord } from "zod";
import { conditionFieldSchema } from "./conditionField";

enum FormConditionOperator {
  AND = 1,
  OR = 2,
}

const FormComponentType = {
  SECTION: "section",
  FIELD: "field",
} as const;

const conditionGroupSchema = strictObject({
  id: string(),
  operator: zod_enum(FormConditionOperator).optional(),
  conditions: array(strictObject({
    id: string(),
    operator: zod_enum(FormConditionOperator).optional(),
    field: conditionFieldSchema,
  })).min(1).refine((conditions) => (
    conditions.some((condition, index) => index !== 0 && condition.operator != undefined)
  ), {
    message: "חובה לציין אופרטור בין תנאים",
  }),
});

const conditionGroupsSchema = array(conditionGroupSchema)
  .min(1)
  .refine((groups) => (
    groups.some((group, index) => index !== 0 && group.operator != undefined)
  ), {
    message: "חובה לציין אופרטור בין קבוצות תנאים",
  });

const conditionDependantComponentsSchema = partialRecord(zod_enum(FormComponentType), array(string())).refine((dependantFields) => {
  for (const componentType of Object.keys(dependantFields)) {
    if (!dependantFields[componentType].length) return false;
  }

  return true;
}, {
  message: "חובה לבחור לפחות אלמנט אחד",
});

const conditionSchema = strictObject({
  id: string(),
  name: string().optional(),
  groups: conditionGroupsSchema,
  dependantComponents: conditionDependantComponentsSchema,
});

const conditionsSchema = array(conditionSchema);

type FormConditionField = zod_infer<typeof conditionFieldSchema>;
type FormConditionGroup = zod_infer<typeof conditionGroupSchema>;
type FormConditionGroups = zod_infer<typeof conditionGroupsSchema>;
type FormConditionDependantComponents = zod_infer<typeof conditionDependantComponentsSchema>;
type FormCondition = zod_infer<typeof conditionSchema>;
type FormConditions = zod_infer<typeof conditionsSchema>;

export {
  conditionGroupsSchema,
  conditionDependantComponentsSchema,
  conditionsSchema,
  FormConditionOperator,
  FormComponentType,
};
export type {
  FormConditionField,
  FormConditionGroup,
  FormConditionGroups,
  FormConditionDependantComponents,
  FormCondition,
  FormConditions,
};