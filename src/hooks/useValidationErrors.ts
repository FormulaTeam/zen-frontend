type FieldValidationError = {
  messages: string[];
  pathMessages: Record<string, string[]>;
};

interface UseValidationErrorsParams {
  form: any;
  formFields: any[];
  formFieldsValidMap: Map<string, FieldValidationError | null>;
  childForms: any[];
  childFormsValidate: boolean;
}

export const useValidationErrors = ({
  formFields,
  formFieldsValidMap,
  childForms,
  childFormsValidate,
}: UseValidationErrorsParams) => {
  const generateValidationErrorMessages = (): string[] => {
    const errors: string[] = [];

    formFields.forEach((field) => {
      const fieldId = String(field.id);
      const validation = formFieldsValidMap.get(fieldId);

      if (!validation || validation.messages.length === 0) {
        return;
      }

      const fieldName = field.displayName || field.name || `שדה ${fieldId}`;

      validation.messages.forEach((message) => {
        errors.push(`${fieldName}: ${message}`);
      });
    });

    if (childForms && childForms.length > 0) {
      childForms.forEach((childForm, childFormIndex) => {
        if (childForm.shown && childForm.children && childForm.children.length > 0) {
          const childFormField = formFields.find(
            (f) =>
              f.extra?.linkedFormId === childForm.formId ||
              f.linkedFormId === childForm.formId,
          );

          const childFormName =
            childFormField?.displayName ||
            childFormField?.name ||
            `טופס משובץ ${childFormIndex + 1}`;

          childForm.children.forEach((child: any, childIndex: number) => {
            if (
              childForm.valid &&
              childForm.valid.length > childIndex &&
              childForm.valid[childIndex] === false
            ) {
              errors.push(`${childFormName} (תגובה ${childIndex + 1}): יש שדות חובה שלא מולאו`);
            }
          });

          if (
            childFormsValidate &&
            childForm.valid &&
            childForm.valid.length < childForm.children.length
          ) {
            errors.push(`${childFormName}: יש לוודא שכל השדות החובה מולאו`);
          }
        }
      });
    }

    return errors;
  };

  return {
    generateValidationErrorMessages,
  };
};
