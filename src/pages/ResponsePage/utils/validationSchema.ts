import { FieldTypeIds, FormField, ResponseFieldValue } from "utils/interfaces";
import { z } from "zod";
import { texts } from "utils/texts";
import { utmLatitudeRegexY, utmLongitudeRegexX, wktLatitudeRegexY, wktLongitudeRegexX } from "utils/utils";
import dayjs from "dayjs";
import { getFormat } from "./dateFormating";

const validationMessages = {
  required: texts.heb.required,
  number: texts.heb.number,
  number_min: texts.heb.number_min,
  number_max: texts.heb.number_max,
  date: texts.heb.date,
  link: texts.heb.link,
  location_utm_latitude: texts.heb.location_utm_latitude,
  location_utm_longitude: texts.heb.location_utm_longitude,
  location_wkt_latitude: texts.heb.location_wkt_latitude,
  location_wkt_longitude: texts.heb.location_wkt_longitude,
};

export function buildSchema(fields: FormField[]) {
  console.log("fields", fields);
  const shape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    let schema: z.ZodTypeAny;

    switch (field.typeId) {
      case FieldTypeIds.smallText:
      case FieldTypeIds.longText:
        schema = field.required ? z.string().min(1, validationMessages.required) : z.string();
        break;
      case FieldTypeIds.number:
        let numberSchema = z.number({ error: validationMessages.number });

        if (field.numberType === "integer") {
          numberSchema = numberSchema.refine((val) => Number.isInteger(val), {
            message: validationMessages.number,
          });
        }

        if (typeof field.minValue === "number") {
          numberSchema = numberSchema.min(
            field.minValue,
            validationMessages.number_min + field.minValue,
          );
        }

        if (typeof field.maxValue === "number") {
          numberSchema = numberSchema.max(
            field.maxValue,
            validationMessages.number_max + field.maxValue,
          );
        }

        schema = z.preprocess((val) => {
          if (val === "" || val === null || val === undefined) return undefined;
          if (typeof val === "number") return val;
          if (typeof val === "string") {
            const s = val.replace(",", ".").trim();

            if (s.endsWith(".")) return undefined;

            const parsed = Number(s);
            return Number.isNaN(parsed) ? undefined : parsed;
          }
          return undefined;
        }, numberSchema);

        if (!field.required) {
          schema = schema.optional();
        } else {
          schema = schema.refine((val) => val !== undefined && val !== null, {
            message: validationMessages.required,
          });
        }

        break;
      case FieldTypeIds.location:
        let locationSchema = z.object({
          latitude: z.string().optional(),
          longitude: z.string().optional(),
        });

        locationSchema = locationSchema.superRefine((val, ctx) => {
          const lat = val.latitude?.trim() ?? "";
          const lng = val.longitude?.trim() ?? "";
          const hasLat = lat !== "";
          const hasLng = lng !== "";
          const coordType = field.coordinateType || "UTM";

          if (field.required && !hasLat && !hasLng) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["latitude"],
              message: validationMessages.required,
            });
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["longitude"],
              message: validationMessages.required,
            });
            return;
          }

          if (hasLat && !hasLng) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["longitude"],
              message: validationMessages.required,
            });
          }
          if (!hasLat && hasLng) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["latitude"],
              message: validationMessages.required,
            });
          }

          if (coordType === "UTM") {
            if (hasLat && !utmLatitudeRegexY.test(lat)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["latitude"],
                message: validationMessages.location_utm_latitude,
              });
            }
            if (hasLng && !utmLongitudeRegexX.test(lng)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["longitude"],
                message: validationMessages.location_utm_longitude,
              });
            }
          } else if (coordType === "WKT") {
            if (hasLat && !wktLatitudeRegexY.test(lat)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["latitude"],
                message: validationMessages.location_wkt_latitude,
              });
            }
            if (hasLng && !wktLongitudeRegexX.test(lng)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["longitude"],
                message: validationMessages.location_wkt_longitude,
              });
            }
          }
        });

        schema = locationSchema;
        break;
      case FieldTypeIds.checkbox:
        schema = z.boolean();
        break;
      case FieldTypeIds.link:
        let linkSchema = z.object({
          link: z.string().optional(),
          linkTxt: z.string().optional(),
        });

        linkSchema = linkSchema.superRefine((val, ctx) => {
          const link = val.link?.trim() ?? "";
          const linkTxt = val.linkTxt?.trim() ?? "";
          const hasLink = link !== "";
          const hasLinkTxt = linkTxt !== "";
          if (hasLink) {
            try {
              new URL(link);
            } catch {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["link"],
                message: validationMessages.link,
              });
            }
          }

          if (field.required) {
            if (!hasLink) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["link"],
                message: validationMessages.required,
              });
            }
            if (!hasLinkTxt) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["linkTxt"],
                message: validationMessages.required,
              });
            }
          } else {
            if (hasLink && !hasLinkTxt) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["linkTxt"],
                message: validationMessages.required,
              });
            }
          }
        });

        schema = linkSchema;
        break;
      case FieldTypeIds.file:
        schema = z.array(z.instanceof(File));
        schema = schema.superRefine((val, ctx) => {
          if (val && Array.isArray(val) && val.length === 0) {
            if (field.required) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["files"],
                message: validationMessages.required,
              });
            }
          }
        });
        if (!field.required) {
          schema = schema.optional();
        } else {
          schema = schema.refine((val) => val !== undefined && val !== null, {
            message: validationMessages.required,
          });
        }
        break;
      case FieldTypeIds.date:
      case FieldTypeIds.hour:
        {
          const isTimeOnly = field.typeId === FieldTypeIds.hour;
          schema = z.string().refine((val) => getFormat(field.dateAndTime, field.showSeconds, isTimeOnly ? "time" : "date", val) !== "", {
            message: validationMessages.date,
          }).optional();
          if (!field.required) {
            schema = schema.optional();
          } else {
            schema = schema.refine((val) => getFormat(field.dateAndTime, field.showSeconds, isTimeOnly ? "time" : "date", val as string) !== "", {
              message: validationMessages.required,
            });
          }
        }
        break;
      case FieldTypeIds.list:
        schema = z.array(z.string());
        schema = schema.superRefine((val, ctx) => {
          if (val && Array.isArray(val) && val.length === 0) {
            if (field.required) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["list"],
                message: validationMessages.required,
              });
            }
          }
        });
        if (!field.required) {
          schema = schema.optional();
        } else {
          schema = schema.refine((val) => val !== undefined && val !== null, {
            message: validationMessages.required,
          });
        }
        break;
      default:
        schema = z.string().optional();
        break;
    }
    shape[field.uniqueId] = schema;
  });

  return z.object(shape);
}

export const getInitialValues = (fields: FormField[], responseData?: ResponseFieldValue[]) => {
  const initialValues: Record<string, any> = {};
  if (responseData && responseData.length > 0) {
    responseData.forEach((item: ResponseFieldValue) => {
      initialValues[item.uniqueId] = item.value as any;
    });
    return initialValues;
  }

  fields.forEach((field) => {
    switch (field.typeId) {
      case FieldTypeIds.smallText:
      case FieldTypeIds.longText:
        initialValues[field.uniqueId] = field.defaultValue || "";
        break;
      case FieldTypeIds.number:
        initialValues[field.uniqueId] = field.initialNumberValue || 0;
        break;
      case FieldTypeIds.link:
        initialValues[field.uniqueId] = { link: "", linkTxt: "" };
        break;
      case FieldTypeIds.checkbox:
        initialValues[field.uniqueId] = field.initialValType === "checked" ? true : false;
        break;
      case FieldTypeIds.location:
        initialValues[field.uniqueId] = { latitude: "", longitude: "" };
        break;
      case FieldTypeIds.file:
        initialValues[field.uniqueId] = [];
        break;
      case FieldTypeIds.date:
        initialValues[field.uniqueId] = field.initialValType === "currentTime" ? dayjs().format("YYYY-MM-DD[T]HH:mm") : "";
        break;
      case FieldTypeIds.hour:
        initialValues[field.uniqueId] = field.initialValType === "currentTime" ? dayjs().format(field.showSeconds ? "HH:mm:ss" : "HH:mm") : "";
        break;
      case FieldTypeIds.list:
        initialValues[field.uniqueId] = [];
        break;
      case FieldTypeIds.form:
        initialValues[field.uniqueId] = {};
        break;
    }
  });
  return initialValues;
}

