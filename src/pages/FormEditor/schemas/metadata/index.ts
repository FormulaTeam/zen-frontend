import { infer as zod_infer, number, strictObject, string } from "zod";

const formMetadataSchema = strictObject({
  id: number().optional(),
  title: string()
    .regex(/^[\u0590-\u05FF]*$/, "ניתן להזין אותיות בעברית בלבד (ללא רווחים)")
    .min(5, "יש להזין שם עם לפחות חמש אותיות בעברית")
    .max(60, "סך התווים המקסימלי הוא 60"),
  description: string()
    .regex(/^[\u0590-\u05FF]*$/, "ניתן להזין אותיות בעברית בלבד (ללא רווחים)")
    .max(255, "סך התווים המקסימלי הוא 255")
    .optional(),
  iconId: string().optional(),
});

type FormMetadata = zod_infer<typeof formMetadataSchema>;

export { formMetadataSchema as FormMetadataSchema };
export type { FormMetadata };
