import { IOrderBy } from "../types/enums/filtersAndSorts.enum";
import { formsTabs } from "./utils";
import { z } from "zod";
import { FormOverviewSchema } from "formula-gear";
import { GridColDef } from "@mui/x-data-grid";
import { ResponseFiltersDto } from "@src/types/shared";

export type FormOverviewType = z.infer<typeof FormOverviewSchema>;

export type FormOverview = FormOverviewType & {
  permissions?: number[];
};

export interface FormOption {
  id: string;
  name: string;
}

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

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    destructive: true;
    base: true;
  }
}

export interface RequestConfig {
  Querytext: string;
  ClientType: "ContentSearchRegular";
  RowLimit?: number;
  StartRow?: number;
}

export const MetaColumnIds = {
  index: 1,
  created_at: 2,
  updated_at: 3,
  created_by: 4,
  updated_by: 5,
  pushed_to_metro: 6,
  id: 7,
} as const satisfies Record<string, number>;

export type MetaColumnId = (typeof MetaColumnIds)[keyof typeof MetaColumnIds];

export const FieldTypeIds = {
  longText: 1,
  shortText: 2,
  options: 3,
  link: 4,
  date: 5,
  time: 6,
  location: 7,
  checkbox: 8,
  list: 9,
  number: 10,
  file: 11,
  linkedForm: 12,
} as const satisfies Record<string, number>;

export const FieldDataTypes = {
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
export type FormFieldDataType = (typeof FieldDataTypes)[keyof typeof FieldDataTypes];

export interface FormField {
  uniqueId: string;
  uniqId?: string;
  name: string; // Internal name
  displayName: string;
  required: boolean;
  index: number;
  typeId: FormFieldTypeId | typeof DRAGGED_ITEM_ID;
  fieldType: FormFieldDataType;
  options?: string[];
  parentFieldId?: string;
  parentFieldName?: string;
  parentDependencies?: ParentDependencies[];
  connectionType?: (typeof connectionTypes)[keyof typeof connectionTypes];
  linkedFormId?: number;
  connectedFieldId?: string;
  childFieldId?: string;
  childFieldName?: string;
  validationRegex?: string;
  initialValType?: string;
  multiSelect?: boolean;
  showSeconds?: boolean;
  dateAndTime?: boolean;
  numberType?: string;
  locationFormat?: string;
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
  fieldType: FormFieldDataType;
}

/**
 * Represents the data required to create a new form.
 */
export type NewForm = Omit<Form, "id" | "created" | "updated" | "permissions">;

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
  updated: string;
  created_by: string;
  created_by_name: string;
  updated_by?: string;
  edited_by?: string;
  updated_by_name?: string;
  edited_by_name?: string;
  deleted?: string;
  numberOfResponses: number;
  lastUpdatedResponse?: string;
  permissions: number[];
  columns?: GridColDef[];

  isPublic?: boolean;
  formPermission?: {
    role_id?: number;
    roleName?: string;
  };
  metro_access_url?: string;
  metro_access_token?: string;
  oasisSourceKey?: string;
  oasisSourceId?: string;
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
  id: string; // Response.id (UUID)
  index: number; // Response.index
  form_id: number;

  created_at: Date;
  updated_at: Date;

  created_by: {
    id: number; // User.id
    upn: string; // User.upn
    name?: string; // User.name
  };

  updated_by: {
    id: number;
    upn: string;
    name?: string;
  };

  fieldValues?: ResponseFieldValue[];
  data?: ResponseFieldValue[];
  mainResponses?: { id: string; index: number; form_id: number }[];
  subResponses?: { id: string; index: number; form_id: number }[];

  deleted_at?: string | null;
  deleted_by?: { id: number; upn: string; name?: string } | null;
  deleted_with_form?: boolean;

  form_name?: string;
  parentFormStatus?: string | null;
  edited_by_name?: string;
  edited_by?: string;
}

/**
 * Represents the data required to create a new response.
 */
export type NewResponse = {
  form_id: number;
  created_by: string; // UPN
  updated_by?: string; // UPN
  edited_by?: string; // UPN
  data: ResponseFieldValue[];
  parentResponse?: string; // parent Response.id (UUID) if linked
};
/**
 * Represents a filter of a form or a response (the response filter has the form_id in the query).
 */
export interface Filter {
  form_id?: number;
  query?: any;
  sortBy?: string;
  orderBy?: IOrderBy.ASC | IOrderBy.DESC;
  pageSize?: number;
  pageNumber?: number;
  searchFilters?: any[];
  responseFilters?: ResponseFiltersDto;
  signal?: AbortSignal;
  deleted?: boolean;
  isDeletedForm?: boolean;
  before?: string;
  after?: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
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
  SuccessfulExportToExcel = "הייצוא לאקסל בוצע בהצלחה",
  FailedExportToExcel = "הייצוא לאקסל נכשל",
}

export enum fieldConnectionTooltipTexts {
  FormConnection = "ייבוא האפשרויות מתגובות בטופס אחר - נדרש לתת הרשאות למשתמשים לראות את התגובות בטופס המקורי",
  ManualConnection = "מילוי ידני",
  AllowedFields = "שדות טקסט ומספר בלבד",
}

export type FieldValidationError = {
  messages: string[];
  pathMessages: Record<string, string[]>;
};

export type LocationValue = {
  x: string;
  y: string;
};

export type LocationValueError = {
  x?: string;
  y?: string;
  general?: string;
};

export type LinkValue = {
  link: string;
  linkTxt: string;
};

export type LinkValueError = {
  link?: string;
  linkTxt?: string;
  general?: string;
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
  field_id?: string;
  uniqueId?: string;
}

export interface CustomInputFormFieldProps {
  label: string;
  isRequired: boolean;
  isDisabled: boolean;
  onChangeHandler: (value: any) => void;
  validationMessage?: string | null;
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
  isDisabled: boolean;
  onChangeHandler: (value: any) => void;
  validationMessage?: string | null;
}

// Add this type to define the structure of a field blueprint
export interface DefaultField {
  name: string;
  icon: FieldsIconsNames;
  fieldType: FormFieldDataType;
}

export type FormElements = Record<FormFieldTypeId, DefaultField>;

// Default field options for the form builder
export const FORM_ELEMENTS: FormElements = {
  [FieldTypeIds.longText]: {
    name: "מס' שורות טקסט",
    icon: "menu",
    fieldType: FieldDataTypes.string,
  },
  [FieldTypeIds.shortText]: {
    name: "שורה אחת",
    icon: "dragHandle",
    fieldType: FieldDataTypes.string,
  },
  [FieldTypeIds.options]: {
    name: "אפשרויות",
    icon: "moreVert",
    fieldType: FieldDataTypes.string,
  },
  [FieldTypeIds.link]: {
    name: "היפר-קישור",
    icon: "link",
    fieldType: FieldDataTypes.string,
  },
  [FieldTypeIds.date]: {
    name: "תאריך",
    icon: "dateRange",
    fieldType: FieldDataTypes.date,
  },
  [FieldTypeIds.time]: {
    name: "שעה",
    icon: "accessTime",
    fieldType: FieldDataTypes.string,
  },
  [FieldTypeIds.location]: {
    name: "נקודת ציון",
    icon: "location",
    fieldType: FieldDataTypes.string,
  },
  [FieldTypeIds.checkbox]: {
    name: "כן/לא",
    icon: "checkbox",
    fieldType: FieldDataTypes.boolean,
  },
  [FieldTypeIds.list]: {
    name: "רשימה",
    icon: "list",
    fieldType: FieldDataTypes.string,
  },
  [FieldTypeIds.number]: {
    name: "מספר",
    icon: "numbers",
    fieldType: FieldDataTypes.number,
  },
  [FieldTypeIds.file]: {
    name: "קובץ",
    icon: "file",
    fieldType: FieldDataTypes.file,
  },
  [FieldTypeIds.linkedForm]: {
    name: "טופס בתוך טופס",
    icon: "forms",
    fieldType: FieldDataTypes.string,
  },
};

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

export interface Row {
  id: string;
  edited?: string;
  editedByName?: string;
  parentResponse?: string;
  created?: string;
  createdByName?: string;
  [key: string]: unknown;
}

export interface ChildResponseForm {
  id: number;
  form_id: number;
  created: string;
  created_by_name: string;
  createdByName: string;
  editedByName?: string;
  edited?: string;
  parentResponse?: string;
  [key: string]: unknown;
}
