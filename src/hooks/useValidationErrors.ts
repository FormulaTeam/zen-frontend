type FieldValidationMessage = {
  code: string;
  message: string;
  detail: string;
};

type FieldValidationError = {
  messages: FieldValidationMessage[];
  pathMessages: Record<string, FieldValidationMessage[]>;
};

export type ValidationDisplayError = {
  fieldName?: string;
  message: string;
  detail?: string;
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
  const generateValidationErrorMessages = (
    validationMapOverride?: Map<string, FieldValidationError | null>,
  ): ValidationDisplayError[] => {
    const errors: ValidationDisplayError[] = [];
    const validationMap = validationMapOverride ?? formFieldsValidMap;

    formFields.forEach((field) => {
      const fieldId = String(field.id);
      const validation = validationMap.get(fieldId);

      if (!validation || validation.messages.length === 0) {
        return;
      }

      const fieldName = field.displayName || field.name || `שדה ${fieldId}`;

      validation.messages.forEach((message) => {
        errors.push({
          fieldName,
          message: message.message,
          detail: message.detail,
        });
      });
    });

    if (childForms && childForms.length > 0) {
      childForms.forEach((childForm, childFormIndex) => {
        if (childForm.shown && childForm.children && childForm.children.length > 0) {
          const childFormField = formFields.find(
            (field) =>
              field.extra?.linkedFormId === childForm.formId ||
              field.linkedFormId === childForm.formId,
          );

          const childFormName =
            childFormField?.displayName ||
            childFormField?.name ||
            `טופס מקושר ${childFormIndex + 1}`;

          childForm.children.forEach((_child: any, childIndex: number) => {
            if (
              childForm.valid &&
              childForm.valid.length > childIndex &&
              childForm.valid[childIndex] === false
            ) {
              errors.push({
                fieldName: `${childFormName} (תגובה ${childIndex + 1})`,
                message: "שדה חובה",
                detail: "יש שדות חובה שלא מולאו",
              });
            }
          });

          if (
            childFormsValidate &&
            childForm.valid &&
            childForm.valid.length < childForm.children.length
          ) {
            errors.push({
              fieldName: childFormName,
              message: "שדה חובה",
              detail: "יש לוודא שכל שדות החובה מולאו",
            });
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
