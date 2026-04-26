import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fieldType } from "formula-gear";
import type { FormDto, FormFieldDto, ResponseDto, UserRoleDto } from "../types/shared";
import { NotificationTexts } from "../utils/interfaces";
import { showErrorNotification, showSuccessNotification } from "../utils/utils";
import { deleteResponse, getForms, getResponses, getResponseById } from "../api";
import { User } from "../contexts/AuthContext";

type ChildFormChildProps = FormFieldDto & {
  responseId?: string;
  instanceKey: string;
};

type ChildFormProps = {
  formId: number;
  children: ChildFormChildProps[];
  saved: Array<boolean | undefined>;
  valid: Array<boolean | undefined>;
  shown: boolean;
};

type UseChildFormsParams = {
  formFields: FormFieldDto[];
  id?: string;
  formId?: string;
  saveAll: () => void | Promise<void>;
  user: User;
  isSuperAdmin: boolean | null;
  copyMode?: boolean;
  onSaveComplete?: (allSaved: boolean) => void;
  onValidateComplete?: (isValid: boolean) => void;
};

type UseChildFormsReturn = {
  childForms: ChildFormProps[];
  setChildForms: React.Dispatch<React.SetStateAction<ChildFormProps[]>>;
  childFormsSaving: boolean;
  setChildFormsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  childFormsValidate: boolean;
  setChildFormsValidate: React.Dispatch<React.SetStateAction<boolean>>;
  handleAddChildForm: (index: number) => void;
  handleChildSaved: (index: number, success: boolean, childIndex?: number) => void;
  handleChildValid: (index: number, success: boolean, childIndex?: number) => void;
  handleRemoveChildForm: (parentIndex: number, childIndex: number) => void;
  handleShowChildForm: (index: number) => void;
};


const getFieldExtra = (field: FormFieldDto): Record<string, unknown> =>
  typeof field.extra === "object" && field.extra !== null
    ? (field.extra as Record<string, unknown>)
    : {};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const getConnectedFormId = (field: FormFieldDto): number | undefined => {
  const linkedFormId = getFieldExtra(field).linkedFormId;
  return toNumber(linkedFormId);
};

const isConnectedFormField = (field: FormFieldDto): boolean =>
  field.fieldType === fieldType.Form && getConnectedFormId(field) !== undefined;

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

const isAllHandled = (results: Array<boolean | undefined>, childCount: number) =>
  Array.from({ length: childCount }).every((_, index) => typeof results[index] === "boolean");

const isAllTrue = (results: Array<boolean | undefined>, childCount: number) =>
  Array.from({ length: childCount }).every((_, index) => results[index] === true);

export const useChildForms = ({
  formFields,
  id,
  formId,
  saveAll,
  user,
  isSuperAdmin = false,
  copyMode = false,
  onSaveComplete,
  onValidateComplete,
}: UseChildFormsParams): UseChildFormsReturn => {
  const [childForms, setChildForms] = useState<ChildFormProps[]>([]);
  const [childFormsSaving, setChildFormsSaving] = useState(false);
  const [childFormsValidate, setChildFormsValidate] = useState(false);
  const navigate = useNavigate();

  const initializedUnsavedRef = useRef(false);
  const lastLoadedSavedParentRef = useRef<string | undefined>(undefined);
  const saveAllTriggeredRef = useRef(false);
  const validateCycleHandledRef = useRef(false);
  const saveCycleHandledRef = useRef(false);

  const connectedFields = useMemo(() => formFields.filter(isConnectedFormField), [formFields]);

  const childFormIds = useMemo(
    () => [...new Set(connectedFields.map((field) => getConnectedFormId(field)!))],
    [connectedFields],
  );

  useEffect(() => {
    if (!childFormsValidate) {
      validateCycleHandledRef.current = false;
      saveAllTriggeredRef.current = false;
    }
  }, [childFormsValidate]);

  useEffect(() => {
    if (!childFormsSaving) {
      saveCycleHandledRef.current = false;
    }
  }, [childFormsSaving]);

  useEffect(() => {
    const buildEmptyChildForms = () => {
      const nextChildForms = childFormIds.map((childFormId) => ({
        formId: childFormId,
        children: [] as ChildFormChildProps[],
        saved: [] as Array<boolean | undefined>,
        valid: [] as Array<boolean | undefined>,
        shown: false,
      }));

      setChildForms((prev) =>
        nextChildForms.map((nextChildForm) => {
          const existing = prev.find((item) => item.formId === nextChildForm.formId);

          return {
            ...nextChildForm,
            shown: existing?.shown ?? nextChildForm.shown,
            children: existing?.children ?? nextChildForm.children,
            saved: existing?.saved ?? nextChildForm.saved,
            valid: existing?.valid ?? nextChildForm.valid,
          };
        }),
      );
    };

    const loadChildForms = async () => {
      if (childFormIds.length === 0) {
        setChildForms([]);
        initializedUnsavedRef.current = false;
        lastLoadedSavedParentRef.current = undefined;
        return;
      }

      try {
        const formsResponse = (await getForms({
          query: { $or: childFormIds.map((childId) => ({ id: childId })) },
        })) as FormDto[];

        const availableChildFormIds = new Set(formsResponse.map((form) => form.id));

        if (!id || copyMode) {
          if (initializedUnsavedRef.current) {
            return;
          }

          const nextChildForms = childFormIds
            .filter((childFormId) => availableChildFormIds.has(childFormId))
            .map((childFormId) => ({
              formId: childFormId,
              children: [] as ChildFormChildProps[],
              saved: [] as Array<boolean | undefined>,
              valid: [] as Array<boolean | undefined>,
              shown: false,
            }));

          setChildForms((prev) =>
            nextChildForms.map((nextChildForm) => {
              const existing = prev.find((item) => item.formId === nextChildForm.formId);

              return {
                ...nextChildForm,
                shown: existing?.shown ?? nextChildForm.shown,
                children: existing?.children ?? nextChildForm.children,
                saved: existing?.saved ?? nextChildForm.saved,
                valid: existing?.valid ?? nextChildForm.valid,
              };
            }),
          );

          initializedUnsavedRef.current = true;
          return;
        }

        initializedUnsavedRef.current = false;

        if (lastLoadedSavedParentRef.current === id) {
          return;
        }

        const parentResponse = await getResponseById(Number(formId), id);
        const linkedChildResponses = parentResponse.childResponses ?? [];

          const childResponses = childFormIds
            .filter((childFormId) => availableChildFormIds.has(childFormId))
            .map((childFormId) => {
              const templateField = connectedFields.find(
                (field) => getConnectedFormId(field) === childFormId,
              );

              const matchingResponses = linkedChildResponses.filter(
                (response) => Number(response.formId) === Number(childFormId),
              );

              const children = templateField
                ? matchingResponses.map((response) => createChildInstance(templateField, response.id))
                : [];

              return {
                formId: childFormId,
                children,
                saved: [] as Array<boolean | undefined>,
                valid: [] as Array<boolean | undefined>,
                shown: children.length > 0,
              };
            });

        setChildForms((prev) =>
          childResponses.map((nextChildForm) => {
            const existing = prev.find((item) => item.formId === nextChildForm.formId);

            return {
              ...nextChildForm,
              shown: existing?.shown ?? nextChildForm.shown,
              children:
                existing?.children?.length && !nextChildForm.children.length
                  ? existing.children
                  : nextChildForm.children,
              saved: existing?.saved ?? nextChildForm.saved,
              valid: existing?.valid ?? nextChildForm.valid,
            };
          }),
        );

        lastLoadedSavedParentRef.current = id;
      } catch (error) {
        console.error("Error fetching child forms:", error);
        buildEmptyChildForms();
      }
    };

    void loadChildForms();
  }, [childFormIds, connectedFields, id, formId, isSuperAdmin, user, copyMode]);

  useEffect(() => {
    const runSaveAllOnce = async () => {
      if (saveAllTriggeredRef.current) {
        return;
      }

      saveAllTriggeredRef.current = true;
      await saveAll();
    };

    if (childFormsSaving) {
      if (saveCycleHandledRef.current) {
        return;
      }

      const shownForms = childForms.filter((childForm) => childForm.shown);
      const totalShownChildren = shownForms.reduce(
        (sum, childForm) => sum + childForm.children.length,
        0,
      );

      if (totalShownChildren === 0) {
        saveCycleHandledRef.current = true;
        setChildFormsSaving(false);

        if (onSaveComplete) {
          onSaveComplete(true);
          return;
        }

        navigate(`/responses/${formId}`);
        return;
      }

      const allHandled = shownForms.every((childForm) =>
        isAllHandled(childForm.saved, childForm.children.length),
      );

      if (!allHandled) {
        return;
      }

      saveCycleHandledRef.current = true;
      setChildFormsSaving(false);

      const allSaved = shownForms.every((childForm) =>
        isAllTrue(childForm.saved, childForm.children.length),
      );

      if (onSaveComplete) {
        onSaveComplete(allSaved);
        return;
      }

      if (allSaved) {
        navigate(`/responses/${formId}`);
      } else {
        showErrorNotification(NotificationTexts.CreateResponseFailed);
      }
    } else if (childFormsValidate) {
      if (validateCycleHandledRef.current) {
        return;
      }

      const shownForms = childForms.filter((childForm) => childForm.shown);
      const totalShownChildren = shownForms.reduce(
        (sum, childForm) => sum + childForm.children.length,
        0,
      );

      if (totalShownChildren === 0) {
        validateCycleHandledRef.current = true;
        setChildFormsValidate(false);

        if (onValidateComplete) {
          onValidateComplete(true);
          return;
        }

        void runSaveAllOnce();
        return;
      }

      const allHandled = shownForms.every((childForm) =>
        isAllHandled(childForm.valid, childForm.children.length),
      );

      if (!allHandled) {
        return;
      }

      validateCycleHandledRef.current = true;
      setChildFormsValidate(false);

      const isValid = shownForms.every((childForm) =>
        isAllTrue(childForm.valid, childForm.children.length),
      );

      if (onValidateComplete) {
        onValidateComplete(isValid);
        return;
      }

      if (isValid) {
        setChildForms((prev) =>
          prev.map((childForm) =>
            childForm.shown
              ? {
                ...childForm,
                saved: [],
              }
              : childForm,
          ),
        );

        void runSaveAllOnce();
      } else {
        console.log("Child form validation failed");
      }
    }
  }, [
    childForms,
    childFormsSaving,
    childFormsValidate,
    formId,
    navigate,
    onSaveComplete,
    onValidateComplete,
    saveAll,
  ]);

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
      childForm.saved.splice(childIndex, 1);
      childForm.valid.splice(childIndex, 1);

      newChildForms[parentIndex] = childForm;
      return newChildForms;
    });
  };

  const handleAddChildForm = (index: number) => {
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

      newChildForms[index] = {
        ...childForm,
        shown: true,
        children: [...childForm.children, createChildInstance(fieldTemplate)],
        saved: [...childForm.saved],
        valid: [...childForm.valid],
      };

      return newChildForms;
    });
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

  const handleChildSaved = (index: number, success: boolean, childIndex?: number) => {
    setChildForms((prev) => {
      const newChildForms = [...prev];
      const childForm = newChildForms[index];

      if (!childForm) {
        return prev;
      }

      const nextSaved = [...childForm.saved];

      if (typeof childIndex === "number") {
        nextSaved[childIndex] = success;
      } else {
        nextSaved.push(success);
      }

      newChildForms[index] = {
        ...childForm,
        saved: nextSaved,
      };

      return newChildForms;
    });
  };

  const handleChildValid = (index: number, success: boolean, childIndex?: number) => {
    setChildForms((prev) => {
      const newChildForms = [...prev];
      const childForm = newChildForms[index];

      if (!childForm) {
        return prev;
      }

      const nextValid = [...childForm.valid];

      if (typeof childIndex === "number") {
        nextValid[childIndex] = success;
      } else {
        nextValid.push(success);
      }

      newChildForms[index] = {
        ...childForm,
        valid: nextValid,
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
