import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fieldType } from "formula-gear";
import type { FormDto, FormFieldDto, ResponseDto, UserRoleDto } from "../types/shared";
import { NotificationTexts } from "../utils/interfaces";
import { showErrorNotification, showSuccessNotification } from "../utils/utils";
import { deleteResponse, getForms, getResponses } from "../api";
import { User } from "../contexts/AuthContext";

type ChildFormChildProps = FormFieldDto & {
  responseId?: string;
  instanceKey: string;
};

type ChildFormProps = {
  formId: number;
  children: ChildFormChildProps[];
  saved: boolean[];
  valid: boolean[];
  shown: boolean;
};

type UseChildFormsParams = {
  formFields: FormFieldDto[];
  id?: string;
  formId?: string;
  saveAll: () => void | Promise<void>;
  user: User;
  isSuperAdmin: boolean | null;
  roles: UserRoleDto[];
  copyMode?: boolean;
};

type UseChildFormsReturn = {
  childForms: ChildFormProps[];
  setChildForms: React.Dispatch<React.SetStateAction<ChildFormProps[]>>;
  childFormsSaving: boolean;
  setChildFormsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  childFormsValidate: boolean;
  setChildFormsValidate: React.Dispatch<React.SetStateAction<boolean>>;
  handleAddChildForm: (index: number) => void;
  handleChildSaved: (index: number, success: boolean) => void;
  handleChildValid: (index: number, success: boolean) => void;
  handleRemoveChildForm: (parentIndex: number, childIndex: number) => void;
  handleShowChildForm: (index: number) => void;
};

type LegacyLinkedResponse = ResponseDto & {
  parentResponse?: unknown;
  mainResponses?: Array<{ id?: string; index?: number | string }>;
};

const getFieldExtra = (field: FormFieldDto): Record<string, unknown> =>
  typeof field.extra === "object" && field.extra !== null
    ? (field.extra as Record<string, unknown>)
    : {};

const getConnectedFormId = (field: FormFieldDto): number | undefined => {
  const connectedFormId = getFieldExtra(field).connectedFormId;

  return typeof connectedFormId === "number" ? connectedFormId : undefined;
};

const isConnectedFormField = (field: FormFieldDto): boolean =>
  field.fieldType === fieldType.Form && typeof getConnectedFormId(field) === "number";

const createChildInstance = (
  fieldTemplate: FormFieldDto,
  responseId?: string,
): ChildFormChildProps => ({
  ...fieldTemplate,
  responseId,
  instanceKey: responseId
    ? `${fieldTemplate.id}-${responseId}`
    : `${fieldTemplate.id}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
});

const matchesParentResponse = (
  response: LegacyLinkedResponse,
  parentFormId?: string,
  parentResponseId?: string,
): boolean => {
  if (!parentFormId || !parentResponseId) {
    return false;
  }

  if (typeof response.parentResponse === "string") {
    const [linkedParentFormId, linkedParentResponseId] = response.parentResponse.split(";");

    return (
      linkedParentFormId === String(parentFormId) && linkedParentResponseId === parentResponseId
    );
  }

  if (Array.isArray(response.mainResponses)) {
    return response.mainResponses.some((parent) => {
      if (!parent) {
        return false;
      }

      return parent.id === parentResponseId || String(parent.index) === parentResponseId;
    });
  }

  return false;
};

export const useChildForms = ({
  formFields,
  id,
  formId,
  saveAll,
  user,
  roles: _roles = [],
  isSuperAdmin = false,
  copyMode = false,
}: UseChildFormsParams): UseChildFormsReturn => {
  const [childForms, setChildForms] = useState<ChildFormProps[]>([]);
  const [childFormsSaving, setChildFormsSaving] = useState(false);
  const [childFormsValidate, setChildFormsValidate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const connectedFields = formFields.filter(isConnectedFormField);
    const childFormIds = [...new Set(connectedFields.map((field) => getConnectedFormId(field)!))];

    const buildEmptyChildForms = () => {
      const nextChildForms = childFormIds.map((childFormId) => ({
        formId: childFormId,
        children: [] as ChildFormChildProps[],
        saved: [] as boolean[],
        valid: [] as boolean[],
        shown: false,
      }));

      setChildForms((prev) =>
        nextChildForms.map((nextChildForm) => {
          const existing = prev.find((item) => item.formId === nextChildForm.formId);

          return {
            ...nextChildForm,
            shown: existing?.shown ?? nextChildForm.shown,
            saved: existing?.saved ?? nextChildForm.saved,
            valid: existing?.valid ?? nextChildForm.valid,
          };
        }),
      );
    };

    const loadChildForms = async () => {
      if (childFormIds.length === 0) {
        setChildForms([]);
        return;
      }

      try {
        const formsResponse = (await getForms({
          query: { $or: childFormIds.map((childId) => ({ id: childId })) },
        })) as FormDto[];

        const availableChildFormIds = new Set(formsResponse.map((form) => form.id));

        if (!id || copyMode) {
          const nextChildForms = childFormIds
            .filter((childFormId) => availableChildFormIds.has(childFormId))
            .map((childFormId) => ({
              formId: childFormId,
              children: [] as ChildFormChildProps[],
              saved: [] as boolean[],
              valid: [] as boolean[],
              shown: false,
            }));

          setChildForms((prev) =>
            nextChildForms.map((nextChildForm) => {
              const existing = prev.find((item) => item.formId === nextChildForm.formId);

              return {
                ...nextChildForm,
                shown: existing?.shown ?? nextChildForm.shown,
                saved: existing?.saved ?? nextChildForm.saved,
                valid: existing?.valid ?? nextChildForm.valid,
              };
            }),
          );

          return;
        }

        const childResponses = await Promise.all(
          childFormIds
            .filter((childFormId) => availableChildFormIds.has(childFormId))
            .map(async (childFormId) => {
              const responses = (await getResponses({
                form_id: childFormId,
              })) as LegacyLinkedResponse[];

              const matchingResponses = responses.filter((response) =>
                matchesParentResponse(response, formId, id),
              );

              const templateField = connectedFields.find(
                (field) => getConnectedFormId(field) === childFormId,
              );

              const children = templateField
                ? matchingResponses.map((response) =>
                    createChildInstance(templateField, response.id),
                  )
                : [];

              return {
                formId: childFormId,
                children,
                saved: [] as boolean[],
                valid: [] as boolean[],
                shown: children.length > 0,
              };
            }),
        );

        setChildForms((prev) =>
          childResponses.map((nextChildForm) => {
            const existing = prev.find((item) => item.formId === nextChildForm.formId);

            return {
              ...nextChildForm,
              shown: existing?.shown ?? nextChildForm.shown,
              saved: existing?.saved ?? nextChildForm.saved,
              valid: existing?.valid ?? nextChildForm.valid,
            };
          }),
        );
      } catch (error) {
        console.error("Error fetching child forms:", error);
        buildEmptyChildForms();
      }
    };

    loadChildForms();
  }, [formFields, id, formId, isSuperAdmin, user, copyMode]);

  useEffect(() => {
    if (childFormsSaving) {
      const shownForms = childForms.filter((childForm) => childForm.shown);

      const allSaved = shownForms.every((childForm) =>
        childForm.saved.every((saved) => saved === true),
      );
      const allHandled = shownForms.every(
        (childForm) => childForm.children.length === childForm.saved.length,
      );

      if (!allHandled) {
        return;
      }

      setChildFormsSaving(false);

      if (allSaved) {
        navigate(`/responses/${formId}`);
      } else {
        showErrorNotification(NotificationTexts.CreateResponseFailed);
      }
    } else if (childFormsValidate) {
      const shownForms = childForms.filter((childForm) => childForm.shown);

      const isValid = shownForms.every((childForm) =>
        childForm.valid.every((valid) => valid === true),
      );
      const allHandled = shownForms.every(
        (childForm) => childForm.children.length === childForm.valid.length,
      );

      if (!allHandled) {
        return;
      }

      setChildFormsValidate(false);

      if (isValid) {
        void saveAll();
      } else {
        console.log("Child form validation failed");
      }
    }
  }, [childForms, childFormsSaving, childFormsValidate, formId, navigate, saveAll]);

  const handleRemoveChildForm = (parentIndex: number, childIndex: number) => {
    setChildForms((prevChildForms) => {
      const currentChildForm = prevChildForms[parentIndex];

      if (!currentChildForm || childIndex < 0 || childIndex >= currentChildForm.children.length) {
        return prevChildForms;
      }

      const newChildForms = [...prevChildForms];
      const childForm = { ...newChildForms[parentIndex] };
      const childToRemove = childForm.children[childIndex];

      if (childToRemove?.responseId) {
        deleteResponse(childForm.formId, childToRemove.responseId)
          .then(() => {
            showSuccessNotification(NotificationTexts.DeletedSuccessfully);
          })
          .catch((error) => {
            showErrorNotification(NotificationTexts.DeletedFailed);
            console.error("Error deleting child form:", error);
          });
      }

      childForm.children = [...childForm.children];
      childForm.saved = [...childForm.saved];
      childForm.valid = [...childForm.valid];

      childForm.children.splice(childIndex, 1);

      if (childForm.saved.length > childIndex) {
        childForm.saved.splice(childIndex, 1);
      }

      if (childForm.valid.length > childIndex) {
        childForm.valid.splice(childIndex, 1);
      }

      newChildForms[parentIndex] = childForm;
      return newChildForms;
    });
  };

  const handleAddChildForm = (index: number) => {
    if (childForms[index]?.shown) {
      setChildForms((prev) => {
        const newChildForms = [...prev];
        const childForm = newChildForms[index];

        if (!childForm) {
          return prev;
        }

        const fieldTemplate = formFields.find(
          (field) => isConnectedFormField(field) && getConnectedFormId(field) === childForm.formId,
        );

        if (!fieldTemplate) {
          return prev;
        }

        childForm.children = [...childForm.children, createChildInstance(fieldTemplate)];
        return newChildForms;
      });
    } else {
      handleShowChildForm(index);
    }
  };

  const handleShowChildForm = (index: number) => {
    setChildForms((prev) => {
      const newChildForms = [...prev];

      if (newChildForms[index]) {
        newChildForms[index] = {
          ...newChildForms[index],
          shown: true,
        };
      }

      return newChildForms;
    });
  };

  const handleChildSaved = (index: number, success: boolean) => {
    setChildForms((prev) => {
      const newChildForms = [...prev];
      const childForm = newChildForms[index];

      if (!childForm) {
        return prev;
      }

      newChildForms[index] = {
        ...childForm,
        saved: [...childForm.saved, success],
      };

      return newChildForms;
    });
  };

  const handleChildValid = (index: number, success: boolean) => {
    setChildForms((prev) => {
      const newChildForms = [...prev];
      const childForm = newChildForms[index];

      if (!childForm) {
        return prev;
      }

      newChildForms[index] = {
        ...childForm,
        valid: [...childForm.valid, success],
      };

      return newChildForms;
    });
  };

  return {
    childForms,
    setChildForms,
    childFormsSaving,
    setChildFormsSaving,
    childFormsValidate,
    setChildFormsValidate,
    handleAddChildForm,
    handleChildSaved,
    handleChildValid,
    handleRemoveChildForm,
    handleShowChildForm,
  };
};
