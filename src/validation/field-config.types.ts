export enum NumberType {
  INTEGER = "integer",
  DOUBLE = "double",
}

export interface BaseFieldConfig {
  required?: boolean;
  uniqueId?: string;
}

export interface TextFieldConfig extends BaseFieldConfig {
  maxLength?: number;
  validationRegex?: string | RegExp;
}

export interface OptionsFieldDependenciesConfig {
  parentFieldUniqueId: string;
  parentFieldOptions: string[];
  rules: Record<string, string[]>;
}

export interface OptionsFieldConfig extends BaseFieldConfig {
  options?: string[];
  multiSelect?: boolean;
  dependencies?: OptionsFieldDependenciesConfig;
}

export type LinkFieldConfig = BaseFieldConfig;

export interface DateFieldConfig extends BaseFieldConfig {
  dateAndTime?: boolean;
}

export interface TimeFieldConfig extends BaseFieldConfig {
  showSeconds?: boolean;
}

export interface LocationFieldConfig extends BaseFieldConfig {
  coordinateType?: "UTM" | "WKT";
}

export interface ListFieldConfig extends BaseFieldConfig {
  minItems?: number;
  maxItems?: number;
}

export interface NumberFieldConfig extends BaseFieldConfig {
  numberType?: NumberType;
  minValue?: number;
  maxValue?: number;
}

export interface FileFieldConfig extends BaseFieldConfig {
  maxSize?: number;
  allowedTypes?: string[];
}

export type CheckboxFieldConfig = BaseFieldConfig;

export type FieldConfigUnion =
  | TextFieldConfig
  | OptionsFieldConfig
  | NumberFieldConfig
  | DateFieldConfig
  | TimeFieldConfig
  | LocationFieldConfig
  | ListFieldConfig
  | FileFieldConfig;
