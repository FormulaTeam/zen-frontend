import { z } from "zod";

import { textFieldSchema } from "./field-schemas/text-field.schema";
import { numberFieldSchema } from "./field-schemas/number-field.schema";
import { dateFieldSchema } from "./field-schemas/date-field.schema";
import { timeFieldSchema } from "./field-schemas/time-field.schema";
import { linkFieldSchema } from "./field-schemas/link-field.schema";
import { locationFieldSchema } from "./field-schemas/location-field.schema";
import { checkboxFieldSchema } from "./field-schemas/checkbox-field.schema";
import { listFieldSchema } from "./field-schemas/list-field.schema";
import { fileFieldSchema } from "./field-schemas/file-field.schema";
import { optionsFieldSchema } from "./field-schemas/options-field.schema";
import { formFieldSchema } from "./field-schemas/form-field.schema";
import type { Form, FormField } from "../utils/interfaces";
import type {
  DateFieldConfig,
  FileFieldConfig,
  FormFieldConfig,
  ListFieldConfig,
  LocationFieldConfig,
  NumberFieldConfig,
  OptionsFieldConfig,
  TextFieldConfig,
  TimeFieldConfig,
} from "./field-config.types";

/**
 * Unified type for all configuration objects across field types
 */
export type FieldConfigUnion =
  | TextFieldConfig
  | OptionsFieldConfig
  | NumberFieldConfig
  | DateFieldConfig
  | TimeFieldConfig
  | LocationFieldConfig
  | ListFieldConfig
  | FileFieldConfig
  | FormFieldConfig;

/**
 * Runtime context for schema factories that need it (typeId=12).
 */
export type SchemaFactoryContext = {
  fetchFormById: (id: number) => Promise<Form | null>;
  buildDynamicRowSchema: (
    form: Form,
    row: Record<string, unknown>,
    fetchFormById: (id: number) => Promise<Form | null>,
    ancestorFormIds?: number[],
  ) => Promise<{ schema: z.ZodTypeAny; visibleFields: FormField[] }>;
  ancestorFormIds: number[];
};

/**
 * Result returned by schema factories when they include a dependency validator.
 */
export interface SchemaFactoryResult {
  fieldSchema: z.ZodTypeAny;
  dependencyValidator?: (row: Record<string, unknown>, ctx: z.RefinementCtx) => void;
}

export type SchemaFactory = (
  config: any,
  ctx?: SchemaFactoryContext,
) => z.ZodTypeAny | SchemaFactoryResult;

// Maps a numeric FieldTypeId to appropriate schema factory.
const fieldTypeToSchemaMap: Record<number, SchemaFactory> = {
  1: textFieldSchema,
  2: textFieldSchema,
  3: optionsFieldSchema,
  4: linkFieldSchema,
  5: dateFieldSchema,
  6: timeFieldSchema,
  7: locationFieldSchema,
  8: checkboxFieldSchema,
  9: listFieldSchema,
  10: numberFieldSchema,
  11: fileFieldSchema,
  12: formFieldSchema,
};

export default fieldTypeToSchemaMap;
