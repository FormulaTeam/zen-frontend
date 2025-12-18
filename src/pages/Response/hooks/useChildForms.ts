import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FieldTypeIds, Filter, FormField, NotificationTexts, Role } from "../../../utils/interfaces";
import {
  checkUserAccessForResponse,
  showErrorNotification,
  showSuccessNotification,
} from "../../../utils/utils";
import { deleteResponse, getForms, getResponses } from "../../../api";
import { User } from "../../../contexts/AuthContext";

type ChildFormProps = {
  formId: number;
  children: ChildFormChildProps[];
  saved?: boolean[];
  valid?: boolean[];
  shown?: boolean;
};

type ChildFormChildProps = FormField & {
  id?: number;
  valid?: boolean;
};

type UseChildFormsParams = {
  formFields: any;
  id?: string;
  formId?: string;
  saveAll: () => void;
  user: User;
  isSuperAdmin: boolean | null;
  roles: Role[];
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
  handleChildValid: (uniqueId: string, success: boolean) => void;
  handleRemoveChildForm: (uniqueId: string, childIndex: number) => void;
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
}: UseChildFormsParams): UseChildFormsReturn => {
  const [childForms, setChildForms] = useState<ChildFormProps[]>([]);
  const [childFormsSaving, setChildFormsSaving] = useState(false);
  const [childFormsValidate, setChildFormsValidate] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    if (childFormsValidate) {
      const shownForms = childForms.filter((cf) => cf.shown);

      const val = shownForms.flatMap((cf) =>
        cf.children?.map((c) => c.valid),
      );
      const allValid = val.every((v) => v === true);
      if (allValid) {
        saveAll();
      }
      setChildFormsValidate(false);
    }
  }, [childFormsValidate, childForms]);

  const checkPermissions = async (childrenIds: number[]) => {
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
  // Initialize child forms based on formFields and response id
  useEffect(() => {
    let childrenIds = [
      ...new Set<number>(
        formFields
          .filter((child) => child.connectedFormId && child.typeId === FieldTypeIds.form)
          .map((child) => child.connectedFormId),
      ),
    ];


    if (!isSuperAdmin) checkPermissions(childrenIds); //  no need to check permissions if super admin

    if (id) {
      try {
        const responses = childrenIds.map(async (childId) => {
          const response = await getResponses({ form_id: childId });
          const children = response
            .filter((res) => {
              if (typeof res.parentResponse === "string" && res.parentResponse.includes(";")) {
                const parentIds = res.parentResponse.split(";");
                return parentIds[1] === id;
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
            shown: true, // Show child form by default if response exists
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
    }
    else {
      const children = formFields
        .filter((field) => field.typeId === FieldTypeIds.form && field.connectedFormId)
        .map((field) => ({ ...field, shouldSave: true }));

      const newChildForms = childrenIds.map((id) => {
        const childForm = children.filter((child) => child.connectedFormId === id);
        childForm.forEach((c) => {
          c.valid = false;
        });
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
  }, [formFields.length, id, roles, user, formId]);

  useEffect(() => {
    if (childFormsSaving) {
      const shownForms = childForms.filter((cf) => cf.shown);

      const allSaved = shownForms.every((cf) => cf.saved?.every((s) => s === true));///
      const allValidated = shownForms.every((cf) => cf.children?.length === cf.saved?.length);


      if (!allValidated) return;

      setChildFormsSaving(false);

      if (allSaved) {
        navigate(`/responses/${formId}`);
      } else {
        showErrorNotification(NotificationTexts.CreateResponseFailed);
      }
    }
  }, [childForms, childFormsSaving]);

  const handleRemoveChildForm = (uniqueId: string, childIndex: number) => {
    let formIdToDelete: number | undefined = undefined;
    let idToDelete: number | undefined = undefined;

    setChildForms((prevChildForms) => {
      const currentChildFormIndex = prevChildForms.findIndex((cf) => cf.children.some((c) => c.uniqueId === uniqueId));
      const currentChildForm = prevChildForms[currentChildFormIndex];
      const childToRemove = currentChildForm.children[childIndex];

      if (!childToRemove) {
        return prevChildForms;
      }
      if (childToRemove.id && currentChildForm.formId) {
        formIdToDelete = currentChildForm.formId;
        idToDelete = childToRemove.id;
      }

      const newChildForms = [...prevChildForms];
      if (newChildForms[currentChildFormIndex].children.length > 0) {
        newChildForms[currentChildFormIndex].children.splice(childIndex, 1);
      }

      if (formIdToDelete && idToDelete) {
        deleteResponse(formIdToDelete, idToDelete);
      }
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
            const newChild = {
              ...fieldTemplate,
              uniqueId: `${fieldTemplate.uniqueId}-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              valid: true,
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
        newChildForms[index].children.forEach((c) => {
          c.valid = false;
        });
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

  const handleChildValid = (uniqueId: string, success: boolean) => {
    setChildForms((prev) => {
      const newChildForms = [...prev];
      newChildForms.forEach((cf) => {
        cf.children.forEach((c) => {
          if (c.uniqueId === uniqueId) {
            c.valid = success;
          }
        });
      });
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
