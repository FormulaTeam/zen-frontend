import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FieldTypeIds, Filter, FormField, NotificationTexts, Role } from "../utils/interfaces";
import {
  checkUserAccessForResponse,
  showErrorNotification,
  showSuccessNotification,
} from "../utils/utils";
import { deleteResponse, getForms, getResponses } from "../api";
import { User } from "../contexts/AuthContext";

type ChildFormProps = {
  formId: number;
  children: ChildFormChildProps[];
  saved?: boolean[];
  valid?: boolean[];
  shown?: boolean;
};

type ChildFormChildProps = FormField & {
  id?: number;
};

type UseChildFormsParams = {
  formFields: any;
  id?: string;
  formId?: string;
  saveAll: () => void;
  user: User;
  isSuperAdmin: boolean | null;
  roles: Role[];
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

export const useChildForms = ({
  formFields,
  id,
  formId,
  saveAll,
  user,
  roles = [],
  isSuperAdmin = false,
  copyMode = false,
}: UseChildFormsParams): UseChildFormsReturn => {
  const [childForms, setChildForms] = useState<ChildFormProps[]>([]);
  const [childFormsSaving, setChildFormsSaving] = useState(false);
  const [childFormsValidate, setChildFormsValidate] = useState(false);
  const navigate = useNavigate();
  // Initialize child forms based on formFields and response id
  useEffect(() => {
    let childrenIds = [
      ...new Set<number>(
        formFields
          .filter((child) => child.connectedFormId && child.typeId === FieldTypeIds.form)
          .map((child) => child.connectedFormId),
      ),
    ]; // Check user permissions for child forms
    const checkPermissions = async () => {
      if (childrenIds.length === 0) return;

      const filter: Filter = {
        query: { $or: childrenIds.map((id) => ({ id })) },
      };

      try {
        const formsResponse = await getForms(filter);

        for (const childId of childrenIds) {
          const form = formsResponse.find((f) => f.id === childId);

          if (!form) {
            setChildForms((prev) => prev.filter((f) => f.formId !== childId));
            continue; // Skip if form not found
          }

          const userRole = form.users?.find(
            (userRole) =>
              userRole.upn?.toLowerCase() === user.upn?.toLowerCase() ||
              userRole.id?.toLowerCase() === user.upn?.toLowerCase(),
          )?.role_id;

          if (!userRole) {
            setChildForms((prev) => prev.filter((f) => f.formId !== childId));
            continue; // Skip if no user role
          }
          const canCreateResponse = checkUserAccessForResponse(
            roles,
            false,
            null,
            form,
            user,
            isSuperAdmin,
          );

          if (!canCreateResponse) {
            setChildForms((prev) => prev.filter((f) => f.formId !== childId));
            continue; // Skip if user cannot create response
          }
        }
      } catch (error) {
        console.error("Error checking permissions for child forms:", error);
      }
    };

    if (!isSuperAdmin) checkPermissions(); //  no need to check permissions if super admin

    if (id) {
      try {
        const responses = childrenIds.map(async (childId) => {
          const response = await getResponses({ form_id: childId });
          const children = response
            .filter((res: any) => {
              // New structure: parentResponse is a string "formId;responseId"
              if (res.parentResponse && typeof res.parentResponse === 'string') {
                const [parentFormId, parentResponseId] = res.parentResponse.split(';');
                const matchById = parentResponseId === id || parentResponseId === String(id);
                const matchByFormId = parentFormId === formId || parentFormId === String(formId);
                return matchByFormId && matchById;
              }

              // Old structure: mainResponses array (keep for backward compatibility)
              if (Array.isArray(res.mainResponses) && id) {
                return res.mainResponses.some(
                  (p: any) => {
                    const matchById = p?.id === id || p?.id === Number(id);
                    const matchByIndex = String(p?.index) === String(id);
                    return matchById || matchByIndex;
                  }
                );
              }

              return false;
            })

            .map((res) => {
              const childField = formFields.find((field) => field.connectedFormId === childId);
              return { ...childField, id: res.id };
            });

          return {
            formId: childId,
            children,
            saved: [],
            valid: [],
            shown: children.length > 0, // Show child form only if it has children
          };
        });
        Promise.all(responses).then((ans) => {
          setChildForms((prev) =>
            ans.map((cf) => {
              const existing = prev.find((p) => p.formId === cf.formId);
              return {
                ...cf,
                shown: existing?.shown ?? cf.shown,
                saved: existing?.saved ?? cf.saved,
                valid: existing?.valid ?? cf.valid,
              };
            }),
          );
        });
      } catch (error) {
        console.error("Error fetching child forms:", error);
      }
    } else {
      const children = formFields
        .filter((field) => field.typeId === FieldTypeIds.form && field.connectedFormId)
        .map((field) => ({ ...field, shouldSave: true }));

      const newChildForms = childrenIds.map((id) => {
        const childForm = children.filter((child) => child.connectedFormId === id);
        return {
          formId: id,
          children: childForm || [],
          saved: [],
          valid: [],
          shown: false,
        };
      });

      setChildForms((prev) =>
        newChildForms.map((cf) => {
          const existing = prev.find((p) => p.formId === cf.formId);
          return {
            ...cf,
            shown: existing?.shown ?? cf.shown,
            saved: existing?.saved ?? cf.saved,
            valid: existing?.valid ?? cf.valid,
          };
        }),
      );
    }
  }, [formFields.length, id, isSuperAdmin, roles, user, formId]);

  // Handle child forms saving and validation
  useEffect(() => {
    if (childFormsSaving) {
      const shownForms = childForms.filter((cf) => cf.shown);

      const allSaved = shownForms.every((cf) => cf.saved?.every((s) => s === true));
      const allValidated = shownForms.every((cf) => cf.children?.length === cf.saved?.length);

      if (!allValidated) return;

      setChildFormsSaving(false);

      if (allSaved) {
        navigate(`/responses/${formId}`);
      } else {
        showErrorNotification(NotificationTexts.CreateResponseFailed);
      }
    } else if (childFormsValidate) {
      const shownForms = childForms.filter((cf) => cf.shown);

      const isValid = shownForms.every((cf) => cf.valid?.every((v) => v === true));
      const allValidated = shownForms.every((cf) => cf.children?.length === cf.valid?.length);

      if (!allValidated) return;

      setChildFormsValidate(false);

      if (isValid) {
        saveAll();
      } else {
        // Don't reset validation arrays immediately - let the parent component handle errors
        // The parent component will show validation popup and reset when needed
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

      // Handle API deletion for saved responses
      if (childToRemove?.id) {
        deleteResponse(childForm.formId!, childToRemove.id!)
          .then(() => {
            showSuccessNotification(NotificationTexts.DeletedSuccessfully);
          })
          .catch((error) => {
            showErrorNotification(NotificationTexts.DeletedFailed);
            console.error("Error deleting child form:", error);
          });
      }

      // Create new arrays for immutability
      childForm.children = [...childForm.children];
      childForm.saved = childForm.saved ? [...childForm.saved] : [];
      childForm.valid = childForm.valid ? [...childForm.valid] : [];

      // Remove from arrays
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
    if (childForms[index].shown) {
      setChildForms((prev) => {
        const newChildForms = [...prev];
        const childForm = newChildForms[index];
        if (childForm) {
          const fieldTemplate = formFields.find(
            (field) =>
              field.typeId === FieldTypeIds.form && field.connectedFormId === childForm.formId,
          );
          if (fieldTemplate) {
            // Create a unique copy with a new unique identifier for each instance
            const newChild = {
              ...fieldTemplate,
              uniqueId: `${fieldTemplate.uniqueId}-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
            };
            childForm.children.push(newChild);
          }
        }
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
        newChildForms[index] = { ...newChildForms[index], shown: true };
      }
      return newChildForms;
    });
  };

  const handleChildSaved = (index: number, success: boolean) => {
    setChildForms((prev) => {
      const newChildForms = [...prev];
      newChildForms[index].saved?.push(success);
      return newChildForms;
    });
  };

  const handleChildValid = (index: number, success: boolean) => {
    setChildForms((prev) => {
      const newChildForms = [...prev];
      newChildForms[index].valid?.push(success);
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