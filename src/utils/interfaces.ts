import { IOrderBy } from "../types/enums/filtersAndSorts.enum";
import { formsTabs } from "./utils";

declare module "@mui/material/styles" {
  interface Theme {
    borders: {
      base: string;
      lg: string;
      color: string;
    };
    scrollBar: {
      width: string;
      height: string;
      color: string;
      borderRadius: string;
    };
    darkPaper: string;
  }
  interface ThemeOptions {
    borders: {
      base: string;
      lg: string;
      color: string;
    };
    scrollBar: {
      width: string;
      height: string;
      color: string;
      borderRadius: string;
    };
    darkPaper: string;
  }
}

export type RoleId = number;

export interface Role {
  _id: string;
  role_id: RoleId;
  roleName: string;
  role_description: string;
  permission_types: number[];
  form_id: null | number;
}

// export type Roles = Role[];

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    destructive: true;
    base: true;
  }
}

// types.ts (optional, if you want to separate types)
export interface RouteContextType {
  path: string;
  changePath: (newPath: string) => void;
}

export interface RequestConfig {
  Querytext: string;
  ClientType: "ContentSearchRegular";
  RowLimit?: number;
  StartRow?: number;
}
export const FieldTypeIds = {
  longText: 1,
  smallText: 2,
  options: 3,
  link: 4,
  date: 5,
  hour: 6,
  location: 7,
  checkbox: 8,
  list: 9,
  number: 10,
  file: 11,
  form: 12,
} as const;

export const FieldTypes = {
  string: "string",
  boolean: "boolean",
  date: "Date",
  number: "number",
  file: "file",
} as const;

export const connectionTypes = {
  manual: "manual",
  form: "form",
} as const;

export enum IConnectionType {
  manual = "manual",
  form = "form",
}

/**
 * Represents a field within a form.
 */

export type FormFieldTypeId = (typeof FieldTypeIds)[keyof typeof FieldTypeIds];
export type FormFieldFieldType = (typeof FieldTypes)[keyof typeof FieldTypes];
export interface FormField {
  uniqueId: string;
  uniqId?: string;
  name: string; // Internal name
  displayName: string;
  required: boolean;
  index: number;
  typeId: FormFieldTypeId | typeof DRAGGED_ITEM_ID;
  fieldType: FormFieldFieldType;
  options?: string[];
  parentFieldId?: string;
  parentFieldName?: string;
  parentDependencies?: ParentDependencies[];
  connectionType?: (typeof connectionTypes)[keyof typeof connectionTypes];
  connectedFormId?: number;
  connectedFieldId?: string;
  childFieldId?: string;
  childFieldName?: string;
  validationRegex?: string;
  initialValType?: string;
  multiSelect?: boolean;
  showSeconds?: boolean;
  dateAndTime?: boolean;
  numberType?: string;
  coordinateType?: string;
  maxValue?: number;
  minValue?: number;
  initialNumberValue?: number;
  fieldName?: string;
  fieldIcon?: string;
  shouldSyncToMetro?: boolean;
  defaultValue?: string | null;
  sectionId: string; // ID of the section this field belongs to
  sectionName?: string; // Name of the section this field belongs to
  sectionDescription?: string; // Description of the section this field belongs to
  sectionOrder: number; // Order of the section this field belongs to
  conditions?: ConditionGroup[]; // Conditional display rules for this field
}

export interface ParentDependencies {
  parentOptionIndex: number;
  childOptionIndices: number[];
}

export const DRAGGED_ITEM_ID = 100;

export type FieldsIconsNames =
  | "menu"
  | "dragHandle"
  | "moreVert"
  | "link"
  | "dateRange"
  | "accessTime"
  | "location"
  | "checkbox"
  | "list"
  | "numbers"
  | "forms"
  | "file";

export type FieldsIcons = {
  [key in FieldsIconsNames]: JSX.Element;
};
export interface FormFieldEditableMetaData {
  typeId: FormFieldTypeId | typeof DRAGGED_ITEM_ID;
  name: string;
  icon: FieldsIconsNames;
  fieldType: FormFieldFieldType;
}
/**
 * Represents the data required to create a new form.
 */
export type NewForm = Omit<Form, "id" | "created" | "edited" | "permissions">;

export interface UpdateFormPayload {
  id: number;
  formData: Partial<Form>;
  
  isUpdateMetro?: boolean;
}

export type FormsTab = (typeof formsTabs)[keyof typeof formsTabs];

/**
 * Represents a form with various metadata and fields.
 */
export interface Form {
  id: number;
  name: string;
  owner_email: string;
  owner_upn: string;
  users: FormUser[];
  fields: FormField[];
  description: string;
  created: string;
  edited: string;
  created_by: string;
  created_by_name: string;
  edited_by: string;
  edited_by_name: string;
  deleted?: string;
  numberOfResponses: number;
  lastEditedResponse?: string;
  permissions: number[];
  columns?: GridColDef[];

  isPublic?: boolean;
  formPermission?: {
    role_id?: number;
    roleName?: string;
  };
}

export interface FormUser extends User {
  role_id?: number;
}

export interface User {
  id?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  upn?: string;
  role_id?: number;
}

export interface SuperAdmin {
  _id: number;
  upn: string;
}

/**
 * Represents a response form with metadata and associated form ID.
 */
export interface ResponseForm {
  id: number;
  created_by: string;
  edited_by: string;
  edited_by_name: string;
  form_id: number;
  created: string;
  edited: string;
  data: ResponseFieldValue[];
  created_by_name?: string;
  deleted?: string;
  pushed_to_metro?: null | string;
  parentResponse?: string;
  deleted_by?: string;
  parentFormStatus?: string | null;
}

/**
 * Represents the data required to create a new response.
 */
export type NewResponse = Omit<ResponseForm, "id" | "created" | "edited">;

/**
 * Represents a filter of a form or a response (the response filter has the form_id in the query).
 */
export interface Filter {
  form_id?: number;
  query?: {
    [key: string]: any;
  };
  sortBy?: string;
  orderBy?: IOrderBy.ASC | IOrderBy.DESC;
  pageSize?: number;
  pageNumber?: number;
  searchFilters?: any[];
  signal?: AbortSignal;
  deleted?: boolean;
  isDeletedForm?: boolean;
}

/**
 * Represents a filter of a search response request.
 */
export interface SearchFilter {
  searchText: string | number;
  searchField?: string;
}

/**
 * Represents a filter of a search response request.
 */
export interface SearchResponsesFilter {
  form_id: number;
  searchFilters: SearchFilter[]; // Updated to an array of filter objects
  sortBy?: string;
  orderBy?: IOrderBy.ASC | IOrderBy.DESC;
  pageSize?: number;
  pageNumber?: number;
  signal?: AbortSignal;
}

/**
 * Represents the data that returns from the send to metro endpoint.
 */
export interface MetroReturnedData {
  formId: number;
  responseIds: number[];
  failedResponsesIds?: number[];
}

/**
 * Represents the Config object of the config collection.
 */
export interface Config {
  [key: string]: {
    description: string;
    title: string;
    value: any;
  } | null;
}

/**
 * Represents the IconNameObj object from the config collection.
 */
export interface IconNameObj {
  name: string;
  searchKeywords: string[];
}

/**
 * Represents the data required to delete multiple responses.
 */
export interface DeleteMultipleResponsesRequest {
  form_id: number;
  response_ids: number[];
}

export enum NotificationTexts {
  CreateFormFailed = "יצירת הטופס נכשלה",
  OptionsMinAmount = "לא ניתן להכין אפשרויות עם פחות מ-2 אפשרויות",
  FailedLoadingResponses = "שליפת התגובות לטופס נכשלה",
  CreateResponseFailed = "יצירת התגובה נכשלה",
  UpdateResponseFailed = "עידכון התגובה נכשל",
  CreatedButSyncFaild = "התגובה נוצרה אך הסנכרון נכשל",
  UpdateButSyncFaild = "התגובה עודכנה אך הסנכרון נכשל",
  DeletedSuccessfully = "התגובה נמחקה בהצלחה",
  DeletedFailed = "התגובה לא נמחקה",
}

export enum fieldConnectionTooltipTexts {
  FormConnection = "ייבוא האפשרויות מתגובות בטופס אחר - נדרש לתת הרשאות למשתמשים לראות את התגובות בטופס המקורי",
  ManualConnection = "מילוי ידני",
  AllowedFields = "שדות טקסט ומספר בלבד",
}

export type LocationValue = {
  x: string;
  y: string;
};

export type LocationValueError = {
  x: boolean;
  y: boolean;
};

export type LinkValue = {
  link: string;
  linkTxt: string;
};

export type LinkValueError = {
  link: boolean;
  linkTxt: boolean;
};

export type FieldValue =
  | string
  | boolean
  | Date
  | LocationValue
  | LinkValue
  | null
  | MultiInputFieldValues
  | any;

export interface ResponseFieldValue {
  value: FieldValue;
  uniqueId: string;
}

export type CustomFormField = Pick<
  FormField,
  "typeId" | "fieldType" | "validationRegex" | "fieldName" | "fieldIcon" | "shouldSyncToMetro"
> & {
  name: string;
  category: string;
  displayName: string;
  icon: FieldsIconsNames;
  deleted?: string;
  sectionId?: string;
  sectionName?: string;
  sectionDescription?: string;
  sectionOrder?: number;
};

export type MultiInputFieldValues = string[];

export interface CustomInputFormFieldProps {
  label: string;
  isRequired: boolean;
  isValid: boolean;
  isDisabled: boolean;
  onChangeHandler: (value: any, valid: boolean) => void;
  validationRegex?: string;
}
// Add this type to define the structure of a field blueprint
export interface DefaultField {
  typeId: FormFieldTypeId;
  name: string;
  icon: FieldsIconsNames;
  fieldType: FormFieldFieldType;
}

// Default field options for the form builder
export const DEFAULT_FIELDS: DefaultField[] = [
  {
    typeId: FieldTypeIds.longText,
    name: "מס' שורות טקסט",
    icon: "menu",
    fieldType: FieldTypes.string,
  },
  {
    typeId: FieldTypeIds.smallText,
    name: "שורה אחת",
    icon: "dragHandle",
    fieldType: FieldTypes.string,
  },
  {
    typeId: FieldTypeIds.options,
    name: "אפשרויות",
    icon: "moreVert",
    fieldType: FieldTypes.string,
  },
  {
    typeId: FieldTypeIds.link,
    name: "היפר-קישור",
    icon: "link",
    fieldType: FieldTypes.string,
  },
  {
    typeId: FieldTypeIds.date,
    name: "תאריך",
    icon: "dateRange",
    fieldType: FieldTypes.date,
  },
  {
    typeId: FieldTypeIds.hour,
    name: "שעה",
    icon: "accessTime",
    fieldType: FieldTypes.string,
  },
  {
    typeId: FieldTypeIds.location,
    name: "נקודת ציון",
    icon: "location",
    fieldType: FieldTypes.string,
  },
  {
    typeId: FieldTypeIds.checkbox,
    name: "כן/לא",
    icon: "checkbox",
    fieldType: FieldTypes.boolean,
  },
  {
    typeId: FieldTypeIds.list,
    name: "רשימה",
    icon: "list",
    fieldType: FieldTypes.string,
  },
  {
    typeId: FieldTypeIds.number,
    name: "מספר",
    icon: "numbers",
    fieldType: FieldTypes.number,
  },
  {
    typeId: FieldTypeIds.file,
    name: "קובץ",
    icon: "file",
    fieldType: FieldTypes.file,
  },
  {
    typeId: FieldTypeIds.form,
    name: "טופס בתוך טופס",
    icon: "forms",
    fieldType: FieldTypes.string,
  },
];

export interface Section {
  id: string;
  name: string;
  description?: string;
  collapsed: boolean;
  order: number;
  expanded?: boolean;
}

export interface IResponseSection {
  name?: string | undefined;
  description?: string | undefined;
  fields: FormField[];
  order: number;
  id?: string;
}
export const DEFAULT_FORM_ICONS: IconNameObj[] = [
  {
    name: "track_changes",
    searchKeywords: ["מעקב", "מכם", "ראדר", "שינויים", "מעקב שינויים"],
  },
  {
    name: "local_phone",
    searchKeywords: ["טלפון", "שיחה"],
  },
  {
    name: "email",
    searchKeywords: ["דואר אלקטרוני", "אימייל", "מייל"],
  },
  {
    name: "location_on",
    searchKeywords: ["מיקום", "מפה", "איפה"],
  },
  {
    name: "event",
    searchKeywords: ["אירוע", "תאריך", "לוח שנה"],
  },
  {
    name: "check_circle",
    searchKeywords: ["בדיקה", "אישור", "סימון"],
  },
  {
    name: "error",
    searchKeywords: ["שגיאה", "בעיה", "אזהרה"],
  },
  {
    name: "info",
    searchKeywords: ["מידע", "פרטים", "הסבר"],
  },
  {
    name: "help",
    searchKeywords: ["עזרה", "סיוע", "תמיכה"],
  },
  {
    name: "assignment",
    searchKeywords: ["משימה", "מטלה", "מטלות"],
  },
  {
    name: "wb_sunny",
    searchKeywords: ["שמש", "אור", "בהיר"],
  },
  {
    name: "cloud",
    searchKeywords: ["ענן", "מזג אוויר", "שמיים"],
  },
  {
    name: "favorite",
    searchKeywords: ["אהוב", "לב", "אהבה"],
  },
  {
    name: "star",
    searchKeywords: ["כוכב", "דירוג", "הערכה"],
  },
  {
    name: "alarm",
    searchKeywords: ["שעון", "התראה", "התראה"],
  },
  {
    name: "accessibility",
    searchKeywords: ["נגישות", "גישה", "גישה קלה"],
  },
  {
    name: "security",
    searchKeywords: ["אבטחה", "מנעול", "הגנה"],
  },
  {
    name: "settings",
    searchKeywords: ["הגדרות", "תצורה", "אפשרויות"],
  },
  {
    name: "dashboard",
    searchKeywords: ["לוח מחוונים", "בקרה", "סטטיסטיקה"],
  },
  {
    name: "search",
    searchKeywords: ["חיפוש", "איתור", "מציאה"],
  },
  {
    name: "visibility",
    searchKeywords: ["נראות", "תצוגה", "הצגה"],
  },
  {
    name: "visibility_off",
    searchKeywords: ["הסתרה", "הסתר", "לא נראות"],
  },
  {
    name: "delete",
    searchKeywords: ["מחיקה", "איפוס", "הסרה"],
  },
  {
    name: "save",
    searchKeywords: ["שמירה", "שמור", "אחסון"],
  },
  {
    name: "add_circle",
    searchKeywords: ["הוספה", "מעגל", "יצירה"],
  },
  {
    name: "remove_circle",
    searchKeywords: ["הסרה", "מעגל", "מחיקה"],
  },
  {
    name: "edit",
    searchKeywords: ["עריכה", "שינוי", "עדכון"],
  },
  {
    name: "check",
    searchKeywords: ["בדיקה", "אישור", "סימון"],
  },
  {
    name: "close",
    searchKeywords: ["סגירה", "ביטול", "הסרה"],
  },
  {
    name: "warning",
    searchKeywords: ["אזהרה", "זהירות", "סכנה"],
  },
  {
    name: "done",
    searchKeywords: ["בוצע", "הושלם", "סיום"],
  },
  {
    name: "pending",
    searchKeywords: ["בהמתנה", "ממתין", "לא סופי"],
  },
  {
    name: "sync",
    searchKeywords: ["סנכרון", "התאמה", "עדכון"],
  },
  {
    name: "refresh",
    searchKeywords: ["רענון", "עדכון", "חדש"],
  },
  {
    name: "upload",
    searchKeywords: ["העלאה", "טעינה", "שליחה"],
  },
  {
    name: "download",
    searchKeywords: ["הורדה", "שמירה", "קבלת קובץ"],
  },
  {
    name: "file_upload",
    searchKeywords: ["העלאת קובץ", "שליחת קובץ", "טעינת קובץ"],
  },
  {
    name: "file_download",
    searchKeywords: ["הורדת קובץ", "שמירת קובץ", "קבלת קובץ"],
  },
  {
    name: "folder",
    searchKeywords: ["תיקייה", "ארכיון", "אחסון"],
  },
  {
    name: "folder_open",
    searchKeywords: ["פתיחת תיקייה", "גישה לתיקייה", "תיקייה פתוחה"],
  },
  {
    name: "folder_shared",
    searchKeywords: ["תיקייה משותפת", "שיתוף תיקייה", "גישה משותפת"],
  },
  {
    name: "attachment",
    searchKeywords: ["קובץ מצורף", "קישור מצורף", "הוספת קובץ"],
  },
  {
    name: "link_off",
    searchKeywords: ["קישור מנותק", "הסרת קישור", "ביטול קישור"],
  },
  {
    name: "link",
    searchKeywords: ["קישור", "חיבור", "קישוריות"],
  },
  {
    name: "share",
    searchKeywords: ["שיתוף", "הפצה", "שיתוף פעולה"],
  },
  {
    name: "group",
    searchKeywords: ["קבוצה", "צוות", "קהילה", "אנשים"],
  },
  {
    name: "people",
    searchKeywords: ["אנשים", "קהילה", "חברה", "קבוצת אנשים"],
  },
  {
    name: "person",
    searchKeywords: ["אדם", "פרט", "יחיד"],
  },
  {
    name: "person_add",
    searchKeywords: ["הוספת אדם", "הוספת משתמש", "הוספת חבר"],
  },
  {
    name: "person_remove",
    searchKeywords: ["הסרת אדם", "הסרת משתמש", "הסרת חבר"],
  },
  {
    name: "person_outline",
    searchKeywords: ["פרופיל", "אדם ללא תמונה", "אדם כללי"],
  },
  {
    name: "person_pin",
    searchKeywords: ["סימון אדם", "הדגשת אדם", "אדם עם סימון"],
  },
  {
    name: "person_search",
    searchKeywords: ["חיפוש אדם", "איתור אדם", "מציאת אדם"],
  },
  {
    name: "person_add_alt_1",
    searchKeywords: ["הוספת אדם חלופי", "הוספת משתמש חלופי", "הוספת חבר חלופי"],
  },
  {
    name: "person_remove_alt_1",
    searchKeywords: ["הסרת אדם חלופי", "הסרת משתמש חלופי", "הסרת חבר חלופי"],
  },
  {
    name: "person_off",
    searchKeywords: ["אדם מנותק", "הסרת אדם", "ביטול אדם"],
  },
  {
    name: "person_outline_alt_1",
    searchKeywords: ["פרופיל חלופי", "אדם ללא תמונה חלופי", "אדם כללי חלופי"],
  },
  {
    name: "person_pin_circle",
    searchKeywords: ["סימון אדם מעגלי", "הדגשת אדם מעגלית", "אדם עם סימון מעגלי"],
  },
  {
    name: "directions_car",
    searchKeywords: ["הכוונה לרכב", "נסיעה ברכב", "נתיב רכב"],
  },
  {
    name: "directions_walk",
    searchKeywords: ["הליכה", "נתיב הליכה", "הליכה רגלית"],
  },
  {
    name: "directions_bike",
    searchKeywords: ["אופניים", "נתיב אופניים", "נסיעה באופניים"],
  },
  {
    name: "directions_bus",
    searchKeywords: ["אוטובוס", "נתיב אוטובוס", "נסיעה באוטובוס"],
  },
  {
    name: "directions_train",
    searchKeywords: ["רכבת", "נתיב רכבת", "נסיעה ברכבת"],
  },
  {
    name: "directions_subway",
    searchKeywords: ["רכבת תחתית", "נתיב רכבת תחתית", "נסיעה ברכבת תחתית"],
  },
  {
    name: "directions_boat",
    searchKeywords: ["סירה", "נתיב סירה", "נסיעה בסירה"],
  },
  {
    name: "directions_airplane",
    searchKeywords: ["מטוס", "נתיב מטוס", "נסיעה במטוס"],
  },
];

// Import condition-related types and utilities from conditionUtils
import type { ConditionOperatorType, LogicalOperatorType } from "./conditionUtils";
import { GridColDef } from "@mui/x-data-grid";

// Re-export condition utilities for backward compatibility
export type {
  ConditionOperatorType,
  LogicalOperatorType,
  ConditionDisplayMode,
} from "./conditionUtils";
export {
  ConditionUtils,
  ConditionOperators,
  LogicalOperators,
  conditionOperatorLabels,
  logicalOperatorLabels,
  DEFAULT_OPERATOR,
  DEFAULT_LOGICAL_OPERATOR,
  conditionDisplayModes,
} from "./conditionUtils";

// Updated condition group interface to support logical operators
export interface ConditionGroup {
  id: string;
  conditionSetId?: string; // Identifies which condition set this group belongs to (for supporting multiple independent condition sets per field)
  conditions: Condition[];
  logicalOperator: LogicalOperatorType; // How conditions within this group are combined
  parentLogicalOperator?: LogicalOperatorType; // How this group relates to the previous group/condition
  name?: string; // Optional name for the condition group
}

// Interface for defining what sections/fields are affected by conditions
export interface AffectedTarget {
  type: "section" | "field";
  id: string; // section ID or field uniqueId
  name: string; // section name or field displayName
}

// Root interface for all conditions
export interface ConditionsRoot {
  groups: ConditionGroup[];
  affectedTargets: AffectedTarget[]; // Sections/fields that will be affected when conditions are met
  name?: string; // Optional name for the condition set
}

// Condition value types for better type safety
export type ConditionValue = string | string[] | boolean | number | null;

export interface Condition {
  field: string; // Unique ID of the field
  operator: ConditionOperatorType; // Single operator, not array
  value: ConditionValue; // Value to compare against - can be various types
  id?: string; // Optional ID for the condition, useful for editing or deleting
}

export const ALLOWED_FIELD_TYPES_FOR_CONDITION: number[] = [
  FieldTypeIds.smallText,
  FieldTypeIds.longText,
  FieldTypeIds.number,
  FieldTypeIds.date,
  FieldTypeIds.options,
  FieldTypeIds.checkbox,
];

export type Row = { [key: string]: string } | null;

