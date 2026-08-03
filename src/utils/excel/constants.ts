import { TIME } from "formula-gear";

export const EXCEL_DATE_FORMAT = "dd/mm/yyyy";
export const EXCEL_DATE_TIME_FORMAT = "dd/mm/yyyy hh:mm";
export const EXPORT_TIMEZONE = TIME.TIMEZONE;
export const EXPORT_PAGE_SIZE = 100;

export const EXCEL_FILE_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
export const EXCEL_FILE_EXTENSION = "xlsx";

export const RESPONSE_INDEX_COLUMN = "מזהה התגובה";

export const HEBREW_TITLES = {
  isSynchronized: "סונכרן",
  created: "נוצר בתאריך",
  created_by: "נוצר על ידי",
  updated: "השתנה בתאריך",
  updated_by: "השתנה על ידי",
} as const;
