import { z } from "zod";

import fieldTypeToSchemaMap, { SchemaFactoryResult } from "./field-type-map";
import { ConditionUtils, FieldTypeIds, Form, FormField } from "../utils/interfaces";
import type {
  FieldConfigUnion,
  OptionsFieldConfig,
  OptionsFieldDependenciesConfig,
  FormFieldConfig,
} from "./field-config.types";

export type ResponseRow = Record<string, unknown>;
export type FormFetcher = (id: number) => Promise<Form | null>;

const getVisibleFields = (fields: FormField[], row: ResponseRow): FormField[] => {
  return fields.filter((field) => {
    if (!field.conditions?.length) return true;

    const conditionsRoot = { groups: field.conditions, affectedTargets: [] as any[] };
    try {
      return ConditionUtils.evaluateConditionsRoot(conditionsRoot, row, fields);
    } catch {
      return true;
    }
  });
};

const buildOptionDependencyConfig = (
  field: FormField, // child
  parent: FormField, // parent
): OptionsFieldDependenciesConfig | undefined => {
  const { options: parentOptions = [] } = parent;
  const { options: fieldOptions = [], parentDependencies = [] } = field;

  if (!parentOptions.length || !fieldOptions.length || !parentDependencies.length) {
    return undefined;
  }

  const rules: Record<string, string[]> = {};

  parentDependencies.forEach((dep) => {
    const parentOption = parentOptions[dep.parentOptionIndex];

    if (parentOption) {
      dep.childOptionIndices.forEach((childIndex) => {
        const childOption = fieldOptions[childIndex];

        if (childOption) {
          rules[childOption] ??= [];
          if (!rules[childOption].includes(parentOption)) rules[childOption].push(parentOption);
        }
      });
    }
  });

  return {
    parentFieldUniqueId: parent.uniqueId,
    parentFieldOptions: parentOptions,
    rules,
  };
};

const isSchemaFactoryResult = (result: unknown): result is SchemaFactoryResult => {
  return typeof (result as SchemaFactoryResult).fieldSchema !== "undefined";
};

const buildOptionsConfig = (
  field: FormField,
  fieldMap: Map<string, FormField>,
): OptionsFieldConfig => {
  const config: OptionsFieldConfig = {
    uniqueId: field.uniqueId,
    required: field.required,
    options: field.options,
    multiSelect: field.multiSelect,
  };

  if (field.parentDependencies?.length && field.parentFieldId) {
    const parent = fieldMap.get(field.parentFieldId);
    if (parent) {
      const depConfig = buildOptionDependencyConfig(field, parent);
      if (depConfig) config.dependencies = depConfig;
    }
  }

  return config;
};

const buildConfigForField = (
  field: FormField,
  fieldMap: Map<string, FormField>,
): FieldConfigUnion | FormFieldConfig => {
  if (field.typeId === FieldTypeIds.form) {
    return {
      displayName: field.displayName,
      connectedFormId: field.connectedFormId,
    };
  }

  if (field.typeId === FieldTypeIds.options) {
    return buildOptionsConfig(field, fieldMap);
  }

  return {
    uniqueId: field.uniqueId,
    required: field.required,
    validationRegex: field.validationRegex,
    minValue: field.minValue,
    maxValue: field.maxValue,
    numberType: field.numberType,
    showSeconds: field.showSeconds,
    dateAndTime: field.dateAndTime,
    options: field.options,
    coordinateType: field.coordinateType,
    multiSelect: field.multiSelect,
  };
};

export async function buildDynamicRowSchema(
  form: Form,
  row: ResponseRow,
  fetchFormById: FormFetcher,
  ancestorFormIds: number[] = [form.id],
): Promise<{ schema: z.ZodTypeAny; visibleFields: FormField[] }> {
  const allFields = form.fields ?? [];
  const visibleFields = getVisibleFields(allFields, row);
  const fieldMap = new Map(visibleFields.map((f) => [f.uniqueId, f]));

  const shape: Record<string, z.ZodTypeAny> = {};
  const dependencyValidators: Array<(r: ResponseRow, ctx: z.RefinementCtx) => void> = [];

  visibleFields.forEach((field) => {
    const uniqueId = String(field.uniqueId);
    const factory = fieldTypeToSchemaMap[field.typeId];

    if (!factory) {
      shape[uniqueId] = z.any();
    } else {
      const config = buildConfigForField(field, fieldMap);

      const factoryResult = factory(config, {
        fetchFormById,
        buildDynamicRowSchema,
        ancestorFormIds,
      });

      const normalized = isSchemaFactoryResult(factoryResult)
        ? factoryResult
        : { fieldSchema: factoryResult };

      shape[uniqueId] = normalized.fieldSchema;

      if (normalized.dependencyValidator) {
        dependencyValidators.push(normalized.dependencyValidator);
      }
    }
  });

  const schema = z
    .object(shape)
    .catchall(z.any())
    .superRefine((r, ctx) => {
      dependencyValidators.forEach((validator) => validator(r as ResponseRow, ctx));
    });

  return { schema, visibleFields };
}
