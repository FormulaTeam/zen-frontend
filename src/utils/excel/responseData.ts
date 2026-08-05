import moment from "moment";
import { FieldType, fieldType, syncStatus } from "formula-gear";
import { LinkValue, LocationValue, MultiInputFieldValues } from "../interfaces";
import { FormDto, ResponseDto, ResponseFieldValueDto } from "../../types/shared";
import { DEFAULT_DATE_FORMAT, DEFAULT_DATE_TIME_FORMAT } from "../date";
import { EXCEL_DATE_FORMAT, EXCEL_DATE_TIME_FORMAT, HEBREW_TITLES, RESPONSE_INDEX_COLUMN } from "./constants";
import { ExcelDateCell, toValidDate } from "./dateSerial";

const sortByIndex = <T extends { index?: number | null }>(items: T[]) => {
  return [...items].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
};

const preferredOrder = (obj: Record<string, unknown>, order: string[]) => {
  const next: Record<string, unknown> = {};

  for (const key of order) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      next[key] = obj[key];
    }
  }

  return next;
};

const getValueWithMetadata = (response: ResponseDto, formFields: any[]) => {
  return (response.fieldValues ?? []).reduce<
    Array<
      ResponseFieldValueDto & {
        displayName: string;
        fieldType: FieldType;
        dateType?: "date" | "datetime";
        timePrecision?: "seconds" | "minutes";
      }
    >
  >((acc, item) => {
    const field = formFields.find((f) => f.id === item.fieldId);
    if (!field) return acc;

    const extra = (field.extra || {}) as {
      dateType?: "date" | "datetime";
      timePrecision?: "seconds" | "minutes";
    };

    acc.push({
      displayName: field.displayName,
      value: item.value,
      fieldId: item.fieldId,
      dateType: (field as any).dateType || extra.dateType,
      timePrecision: (field as any).timePrecision || extra.timePrecision,
      fieldType: field.fieldType as FieldType,
    });

    return acc;
  }, []);
};

const formatFieldValue = (
  value: unknown,
  currentFieldType: FieldType,
  dateType?: "date" | "datetime",
  timePrecision?: "seconds" | "minutes",
) => {
  if (value === null || value === undefined) {
    return { formattedValue: "" as string | { f: string } };
  }

  switch (currentFieldType) {
    case fieldType.LongText:
    case fieldType.ShortText:
      return { formattedValue: value as string };

    case fieldType.Options:
      if (Array.isArray(value)) {
        return {
          formattedValue: value.map((option) => (option as { text: string }).text).join(","),
        };
      }
      return { formattedValue: (value as { text: string }).text };

    case fieldType.Link: {
      const linkValue = value as LinkValue;
      return {
        formattedValue: {
          f: '=HYPERLINK("' + linkValue.link + `","${linkValue.linkTxt}")`,
        },
      };
    }

    case fieldType.Date: {
      const parsedDate = toValidDate(value);
      if (!parsedDate) {
        return { formattedValue: "" };
      }

      if (dateType === "datetime") {
        return {
          formattedValue: moment(value as string).format(DEFAULT_DATE_TIME_FORMAT),
          date: parsedDate,
          numberFormat: EXCEL_DATE_TIME_FORMAT,
        };
      }

      return {
        formattedValue: moment(value as string).format(DEFAULT_DATE_FORMAT),
        date: parsedDate,
        numberFormat: EXCEL_DATE_FORMAT,
      };
    }

    case fieldType.Time: {
      const timeValue = value as string;
      const format = timePrecision === "seconds" ? "HH:mm:ss" : "HH:mm";

      if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(timeValue)) {
        if (timePrecision === "minutes" && timeValue.split(":").length === 3) {
          return { formattedValue: timeValue.substring(0, 5) };
        }

        return { formattedValue: timeValue };
      }

      if (value instanceof Date) {
        return { formattedValue: moment(value).format(format) };
      }

      return { formattedValue: "" };
    }

    case fieldType.Location: {
      const locationValue = value as LocationValue;
      return { formattedValue: `${locationValue.x},${locationValue.y}` };
    }

    case fieldType.Number:
      return { formattedValue: String(value) };

    case fieldType.Boolean: {
      if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();

        if (normalized === "true") {
          return { formattedValue: "כן" };
        }

        if (normalized === "false") {
          return { formattedValue: "לא" };
        }
      }

      return { formattedValue: value === true ? "כן" : "לא" };
    }

    case fieldType.List: {
      const multiInputFieldValue = value as MultiInputFieldValues;
      return { formattedValue: multiInputFieldValue.join(";") };
    }

    default:
      return { formattedValue: "" };
  }
};

export const buildResponseExportData = (responsesArr: ResponseDto[], form: FormDto) => {
  const sortedResponses = sortByIndex(responsesArr);
  const formFields = sortByIndex(form.sections ?? [])
    .flatMap((section) => sortByIndex(section.fields ?? []));

  const formFieldsIds = formFields
    .filter((field) => field.fieldType !== fieldType.Form)
    .map((field) => field.id);

  const data: any[] = [];
  const excelDateCells: ExcelDateCell[] = [];

  sortedResponses.forEach((response, rowIndex) => {
    const syncStatusId = response.syncStatusId ?? response.syncStatus?.id;
    const isSynced = syncStatusId === syncStatus.Completed;

    data[rowIndex] = {
      [RESPONSE_INDEX_COLUMN]: response.index ? `\u202B${String(response.index)}\u202C` : "",
      [HEBREW_TITLES.isSynchronized]: isSynced ? "כן" : "לא",
      [HEBREW_TITLES.created_by]: response.createdBy?.name ?? "",
      [HEBREW_TITLES.created]: response.createdAt
        ? moment(response.createdAt).format(DEFAULT_DATE_TIME_FORMAT)
        : "",
      [HEBREW_TITLES.updated_by]: response.updatedBy?.name ?? "",
      [HEBREW_TITLES.updated]: response.updatedAt
        ? moment(response.updatedAt).format(DEFAULT_DATE_TIME_FORMAT)
        : "",
    };

    const createdDate = toValidDate(response.createdAt);
    if (createdDate) {
      excelDateCells.push({
        rowIndex,
        header: HEBREW_TITLES.created,
        date: createdDate,
        numberFormat: EXCEL_DATE_TIME_FORMAT,
      });
    }

    const updatedDate = toValidDate(response.updatedAt);
    if (updatedDate) {
      excelDateCells.push({
        rowIndex,
        header: HEBREW_TITLES.updated,
        date: updatedDate,
        numberFormat: EXCEL_DATE_TIME_FORMAT,
      });
    }

    const names: string[] = [];

    formFields.forEach((field) => {
      if (field.fieldType === fieldType.Form) return;

      data[rowIndex] = {
        ...data[rowIndex],
        [field.displayName]: "",
      };
      names.push(field.displayName);
    });

    data[rowIndex] = preferredOrder(data[rowIndex], [
      RESPONSE_INDEX_COLUMN,
      HEBREW_TITLES.isSynchronized,
      ...names,
      HEBREW_TITLES.created_by,
      HEBREW_TITLES.created,
      HEBREW_TITLES.updated_by,
      HEBREW_TITLES.updated,
    ]);

    const fieldValuesWithMeta = getValueWithMetadata(response, formFields);

    for (const fieldValue of fieldValuesWithMeta) {
      const { displayName, fieldType: currentFieldType, value, fieldId, dateType, timePrecision } =
        fieldValue;

      if (!formFieldsIds.includes(fieldId || "") || currentFieldType === fieldType.Form) {
        continue;
      }

      const { formattedValue, date, numberFormat } = formatFieldValue(
        value,
        currentFieldType,
        dateType,
        timePrecision,
      );

      data[rowIndex][displayName] = formattedValue;

      if (date && numberFormat) {
        excelDateCells.push({
          rowIndex,
          header: displayName,
          date,
          numberFormat,
        });
      }
    }
  });

  return { data, excelDateCells };
};

export const buildMoldData = (form: FormDto) => {
  const fields = sortByIndex(form.sections ?? [])
    .flatMap((section) => sortByIndex(section.fields ?? []))
    .filter((field) => field.fieldType !== fieldType.Form);

  const data: any[] = [];
  fields.forEach((field) => {
    data[0] = {
      ...data[0],
      [field.displayName]: "",
    };
  });

  return data;
};
