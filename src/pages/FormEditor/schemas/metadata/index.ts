import { infer as zod_infer, number, strictObject, string } from "zod";

const formMetadataSchema = strictObject({
  title: string().regex(/^[\u0590-\u05FF\s]*$/, "ניתן להזין אותיות בעברית בלבד").min(5, "יש להזין שם עם לפחות חמש אותיות בעברית"),
  description: string().optional(),
  iconId: number().optional(),
});

type FormMetadata = zod_infer<typeof formMetadataSchema>;

export { formMetadataSchema as FormMetadataSchema };
export type { FormMetadata };
