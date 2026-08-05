import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const ISRAEL_TZ = "Asia/Jerusalem";

export const parseDateFilterValue = (value: unknown): Dayjs | null => {
  if (typeof value !== "string" || value.trim() === "") return null;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  const parsedValue = dayjs()
    .year(year)
    .month(month - 1)
    .date(day)
    .startOf("day");

  return parsedValue.isValid() ? parsedValue : null;
};

export const parseDateTimeFilterValue = (value: unknown): Dayjs | null => {
  if (typeof value !== "string" || value.trim() === "") return null;

  const parsedValue = dayjs.utc(value);

  return parsedValue.isValid() ? parsedValue.tz(ISRAEL_TZ) : null;
};

export const parseTimeFilterValue = (value: unknown): Dayjs | null => {
  if (typeof value !== "string" || value.trim() === "" || !value.includes(":")) return null;

  const [hours, minutes, seconds] = value.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    (seconds !== undefined && (Number.isNaN(seconds) || seconds < 0 || seconds > 59))
  ) {
    return null;
  }

  return dayjs()
    .hour(hours)
    .minute(minutes)
    .second(seconds ?? 0)
    .millisecond(0);
};

export const formatDateFilterValue = (value: Dayjs | null): string =>
  value?.isValid() ? value.format("YYYY-MM-DD") : "";

export const formatDateTimeFilterValue = (value: Dayjs | null): string =>
  value?.isValid()
    // Match response creation: interpret the picker value as Israel wall time,
    // then persist the equivalent UTC timestamp used by backend filtering.
    ? value.tz(ISRAEL_TZ, true).utc().format("YYYY-MM-DD[T]HH:mm:ss.000[Z]")
    : "";

export const formatTimeFilterValue = (
  value: Dayjs | null,
  timePrecision = "minutes",
): string =>
  value?.isValid()
    ? value.format(timePrecision === "seconds" ? "HH:mm:ss" : "HH:mm")
    : "";
