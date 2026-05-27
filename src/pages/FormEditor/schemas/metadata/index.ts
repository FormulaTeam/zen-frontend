import { infer as zod_infer, number, strictObject, string } from "zod";
import { texts } from "@utils/texts";

const formMetadataSchema = strictObject({
  id: number().optional(),
  title: string()
    .regex(/^[\u0590-\u05FF\s]*$/, texts.heb.onlyHebrewError)
    .refine((v) => v.trim().length >= 5, texts.heb.fiveLettersMinAlert)
    .max(60, "סך התווים המקסימלי הוא 60"),
  description: string()
    .regex(/^[\u0590-\u05FF\s]*$/, texts.heb.onlyHebrewError)
    .max(255, "סך התווים המקסימלי הוא 255")
    .optional(),
  iconId: string().optional(),
});

type FormMetadata = zod_infer<typeof formMetadataSchema>;

export { formMetadataSchema as FormMetadataSchema };
export type { FormMetadata };
