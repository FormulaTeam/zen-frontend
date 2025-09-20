import { MonthOfYear } from "../types/enums/dashboard";

/** Hebrew names keyed by the enum value */
export const MonthName: Record<MonthOfYear, string> = {
  [MonthOfYear.JAN]: "ינו׳",
  [MonthOfYear.FEB]: "פבר׳",
  [MonthOfYear.MAR]: "מרץ",
  [MonthOfYear.APR]: "אפר׳",
  [MonthOfYear.MAY]: "מאי",
  [MonthOfYear.JUN]: "יונ׳",
  [MonthOfYear.JUL]: "יול׳",
  [MonthOfYear.AUG]: "אוג׳",
  [MonthOfYear.SEP]: "ספט׳",
  [MonthOfYear.OCT]: "אוק׳",
  [MonthOfYear.NOV]: "נוב׳",
  [MonthOfYear.DEC]: "דצמ׳",
};
