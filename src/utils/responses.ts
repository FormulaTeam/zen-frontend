import moment from "moment";
import { FieldTypeIds, FormField, ResponseForm } from "./interfaces";
import { DEFAULT_DATE_FORMAT, DEFAULT_DATE_TIME_FORMAT } from "./utils";

export function getResponseFieldStringValue(field: FormField, value: any) {
  if ([undefined, null].includes(value)) return "";
  switch (field.typeId) {
    case FieldTypeIds.longText:
    case FieldTypeIds.smallText:
      return value;
    case FieldTypeIds.number:
      return value.toString();
    case FieldTypeIds.hour:
      if (value && value !== "") {
        const validTimeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
        // Check if it's already in the correct format
        if (validTimeRegex.test(value)) {
          return value;
        }
        // If it's a Date object, format it
        if (value instanceof Date) {
          const hours = value.getHours().toString().padStart(2, "0");
          const minutes = value.getMinutes().toString().padStart(2, "0");
          const seconds = value.getSeconds().toString().padStart(2, "0");
          const timeString = `${hours}:${minutes}:${seconds}`;
          return timeString;
        }
      }
      return "";
    case FieldTypeIds.date:
      if (!moment(value).isValid()) return "";
      if (field.dateAndTime) return moment(value).format(DEFAULT_DATE_TIME_FORMAT);
      return moment(value).format(DEFAULT_DATE_FORMAT);

    case FieldTypeIds.checkbox:
      return value === "true" || value === true ? "כן" : "לא";
    case FieldTypeIds.location:
      if (!value || (!value.latitude && !value.longitude)) return "";
      return value ? `x: ${value.x}, y: ${value.y}` : "";
    case FieldTypeIds.link:
      return value.linkTxt;
    default:
      break;
  }
  if (value && typeof value === "string") {
    return value;
  } else if (value && Array.isArray(value)) {
    let str = "";
    value.forEach((element, i) => {
      if (i === 0) {
        str = str + element;
      } else {
        str = str + ", " + element;
      }
    });

    return str;
  }
  return "";
}

/**
 * Compares two values and determines if they are different.
 *
 * - Supports deep comparison of arrays and objects.
 * - Returns `true` if the values are different in type or content.
 * - Returns `false` if the values are deeply equal.
 *
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @returns `true` if the values are different, otherwise `false`.
 */
export const isDifferent = (a: any, b: any): boolean => {
  if (a === b) return false;
  if (typeof a !== typeof b) return true;

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length !== b.length || a.some((val, i) => isDifferent(val, b[i]));
  }

  if (typeof a === "object" && typeof b === "object" && a && b) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    return (
      aKeys.length !== bKeys.length ||
      aKeys.some((key) => !b.hasOwnProperty(key) || isDifferent(a[key], b[key]))
    );
  }
  return true;
};
