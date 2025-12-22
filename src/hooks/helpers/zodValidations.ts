import { buildLinkSchema, buildLocationSchema, buildNumberSchema } from "./zodSchemas";
import { ZodSchema } from "zod";

type LinkValue = { link?: string; linkTxt?: string } | null | undefined;
type LinkValidFlags = { link: boolean; linkTxt: boolean };
type LocationValue = { x?: string; y?: string } | null | undefined;
type LocationValidFlags = { x: boolean; y: boolean };
type NumberValue = string | number | null | undefined;

function validateWithZod<
  TValue,
  TFlags extends Record<string, boolean>
>(
  value: TValue | null | undefined,
  schema: ZodSchema,
  initialFlags: TFlags
): { isValid: boolean; flags: TFlags } {
  const result = schema.safeParse(value ?? {});

  const flags: TFlags = { ...initialFlags };

  if (!result.success) {
    for (const issue of result.error.issues) {
      const [fieldName] = issue.path as [keyof TFlags];
      if (fieldName in flags) {
        (flags[fieldName as keyof TFlags] as boolean) = false;
      }
    }
  }

  return { isValid: result.success, flags };
}

export function validateLinkWithZod(
  val: LinkValue,
  required: boolean
) {
  const schema = buildLinkSchema(required);
  return validateWithZod<LinkValue, LinkValidFlags>(val, schema, { link: true, linkTxt: true });
}


export function validateLocationWithZod(
  val: LocationValue,
  required: boolean,
  coordinateType: "UTM" | "WKT" | undefined
) {
  const schema = buildLocationSchema(required, coordinateType);
  return validateWithZod<LocationValue, LocationValidFlags>(val, schema, { x: true, y: true });
}

export function validateNumberWithZod(
  val: NumberValue,
  required: boolean,
  minValue: number | null | undefined,
  maxValue: number | null | undefined,
  numberType: "integer" | "decimal" | undefined
): boolean {
  const schema = buildNumberSchema(required, minValue, maxValue, numberType);

  const result = schema.safeParse({ value: val });

  return result.success;
}

