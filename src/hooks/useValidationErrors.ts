import { ElementTypeIds } from "../utils/interfaces";

interface UseValidationErrorsParams {
  form: any;
  formFields: any[];
  formFieldsValidMap: Map<string, any>;
  childForms: any[];
  childFormsValidate: boolean;
}

export const useValidationErrors = ({
  form,
  formFields,
  formFieldsValidMap,
  childForms,
  childFormsValidate,
}: UseValidationErrorsParams) => {
  const generateValidationErrorMessages = (): string[] => {
    const errors: string[] = [];
    
    // Check main form validation errors
    if (form?.fields) {
      form.fields.forEach((field) => {
        const uniqueId = field?.uniqueId + "";
        const isValid = formFieldsValidMap.get(uniqueId);
        
        if (isValid === false || (typeof isValid === 'object' && isValid !== null)) {
          const fieldName = field.displayName || field.name || `שדה ${uniqueId}`;
          
          // Handle different field types and their specific validation errors
          if (field.typeId === ElementTypeIds.link && typeof isValid === 'object') {
            if (!isValid.link && !isValid.linkTxt) {
              errors.push(`${fieldName}: שדה זה הינו חובה`);
            } else if (!isValid.link) {
              errors.push(`${fieldName}: יש להזין קישור תקף`);
            } else if (!isValid.linkTxt) {
              errors.push(`${fieldName}: יש להזין תיאור לקישור`);
            }
          } else if (field.typeId === ElementTypeIds.location && typeof isValid === 'object') {
            if (!isValid.x && !isValid.y) {
              errors.push(`${fieldName}: שדה זה הינו חובה`);
            } else if (!isValid.x) {
              errors.push(`${fieldName}: יש להזין קואורדינטת X תקפה`);
            } else if (!isValid.y) {
              errors.push(`${fieldName}: יש להזין קואורדינטת Y תקפה`);
            }
          } else if (isValid === false) {
            errors.push(generateFieldErrorMessage(field, fieldName));
          }
        }
      });
    }
    
    // Check child form validation errors
    if (childForms && childForms.length > 0) {
      childForms.forEach((childForm, childFormIndex) => {
        if (childForm.shown && childForm.children && childForm.children.length > 0) {
          // Get the field name for this child form
          const childFormField = formFields.find(f => f.connectedFormId === childForm.formId);
          const childFormName = childFormField?.displayName || childFormField?.name || `טופס משובץ ${childFormIndex + 1}`;
          
          // Check if any child responses have validation errors
          childForm.children.forEach((child, childIndex) => {
            // Check if this child has validation errors
            // If valid array exists and has a false value at this index, it means validation failed
            if (childForm.valid && childForm.valid.length > childIndex && childForm.valid[childIndex] === false) {
              errors.push(`${childFormName} (תגובה ${childIndex + 1}): יש שדות חובה שלא מולאו`);
            }
          });
          
          // If we're currently validating child forms and some haven't been validated yet
          if (childFormsValidate && childForm.valid && childForm.valid.length < childForm.children.length) {
            errors.push(`${childFormName}: יש לוודא שכל השדות החובה מולאו`);
          }
        }
      });
    }
    
    return errors;
  };

  const generateFieldErrorMessage = (field: any, fieldName: string): string => {
    // Handle general validation errors based on field type
    if (field.required) {
      if (field.typeId === ElementTypeIds.options) {
        return `${fieldName}: יש לבחור אפשרות`;
      } else if (field.typeId === ElementTypeIds.date) {
        return `${fieldName}: יש להזין תאריך תקף`;
      } else if (field.typeId === ElementTypeIds.time) {
        return `${fieldName}: יש להזין שעה תקפה`;
      } else if (field.typeId === ElementTypeIds.number) {
        if (field.minValue !== undefined || field.maxValue !== undefined) {
          let rangeText = "";
          if (field.minValue !== undefined && field.maxValue !== undefined) {
            rangeText = ` (בין ${field.minValue} ל-${field.maxValue})`;
          } else if (field.minValue !== undefined) {
            rangeText = ` (מינימום ${field.minValue})`;
          } else if (field.maxValue !== undefined) {
            rangeText = ` (מקסימום ${field.maxValue})`;
          }
          return `${fieldName}: יש להזין מספר תקף${rangeText}`;
        } else {
          return `${fieldName}: יש להזין מספר תקף`;
        }
      } else if (field.typeId === ElementTypeIds.file) {
        return `${fieldName}: יש להעלות קובץ`;
      } else if (field.typeId === ElementTypeIds.list) {
        return `${fieldName}: יש להוסיף פריט אחד לפחות`;
      } else if (field.validationRegex) {
        return `${fieldName}: הפורמט אינו תקין`;
      } else {
        return `${fieldName}: שדה זה הינו חובה`;
      }
    } else {
      // Field is not required but has validation errors (e.g., regex, format)
      if (field.validationRegex) {
        return `${fieldName}: הפורמט אינו תקין`;
      } else if (field.typeId === ElementTypeIds.time) {
        return `${fieldName}: פורמט השעה אינו תקין`;
      } else if (field.typeId === ElementTypeIds.number) {
        return `${fieldName}: פורמט המספר אינו תקין`;
      } else {
        return `${fieldName}: הערך אינו תקין`;
      }
    }
  };

  return {
    generateValidationErrorMessages,
  };
};
