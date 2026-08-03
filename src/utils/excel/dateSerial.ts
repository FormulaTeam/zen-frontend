import { parseDateFieldValue } from "formula-gear";
import { EXPORT_TIMEZONE } from "./constants";

const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);
const MINUTES_PER_DAY = 24 * 60;

type ExcelDatePrecision = "date" | "minute";

export type ExcelDateCell = {
  rowIndex: number;
  header: string;
  date: Date;
  numberFormat: string;
};

export const toExcelSerialDate = (
  date: Date,
  timeZone = EXPORT_TIMEZONE,
  precision: ExcelDatePrecision = "minute",
): number => {
  const dateTime = new Intl.DateTimeFormat("sv-SE", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
    .format(date)
    .replace(" ", "T");

  const wallClockUtcMillis = Date.parse(`${dateTime}Z`);
  const rawSerial = (wallClockUtcMillis - EXCEL_EPOCH_UTC) / 86400000;

  if (precision === "date") {
    return Math.round(rawSerial);
  }

  return Math.round(rawSerial * MINUTES_PER_DAY) / MINUTES_PER_DAY;
};

export const toValidDate = (value: unknown): Date | null => {
  const parsed = parseDateFieldValue(value);
  return parsed instanceof Date && !Number.isNaN(parsed.getTime()) ? parsed : null;
};

