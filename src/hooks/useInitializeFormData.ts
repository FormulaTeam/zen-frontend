import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFormById, getResponses } from "../api";
import { FieldTypeIds, Filter, Form, ResponseForm, Role } from "../utils/interfaces";
import { PERMISSION_TYPES, getUserRole } from "../utils/utils";
import { prioritizePermissions } from "../utils/formFieldsResponses";
import { IPath } from "../types/enums/global.enums";
import { hasPermissionToSeeForm } from "../utils/forms";

// RESUME FROM HERE
export const useInitializeFormData = () => {
  const [responsesHaveParents, setResponsesHaveParents] = useState(false);
  const [responsesWithChildren, setResponsesWithChildren] = useState<ResponseForm[]>([]);
  const [childrenForms, setChildrenForms] = useState<Form[]>([]);
  const navigate = useNavigate();

  const initializeFormData = async (
    id: string | undefined,
    roles: Role[],
    user: any,
    isSuperAdmin: boolean,
    setForm: (form: any) => void,
    setCurrentFilter: (filter: Filter) => void,
    getResponsesForCurrentPage: (form: any) => void,
    setFirstRun: (val: boolean) => void,
    setLoading: (val: boolean) => void,
  ) => {
    if (!id) {
      return;
    }

    const formId = parseInt(id);

    try {
      const form = await getFormById(formId);

      if (!form) {
        throw new Error("Form not found");
      }

      if (isSuperAdmin) {
        // const allPermissions = Object.values(PERMISSION_TYPES);
        setForm(form);
        setCurrentFilter({ form_id: form.id });
        // getResponsesForCurrentPage(form);

        if (form.fields.some((f) => f.typeId === FieldTypeIds.form)) {
          setResponsesWithChildren([]);
          form.fields.forEach((field) => {
            if (field.typeId === FieldTypeIds.form) {
              getResponses({
                form_id: field.connectedFormId,
                query: {
                  parentResponse: { $regex: `${form.id};` },
                },
              })
                .then((res) => {
                  if (res) {
                    setResponsesWithChildren((prev) => [...prev, ...res]);
                  }
                })
                .catch((error) => {});

              getFormById(field.connectedFormId)
                .then((childForm) => {
                  if (childForm) {
                    setChildrenForms((prev) => {
                      if (!prev.some((item) => item.id === childForm.id)) {
                        return [...prev, childForm];
                      }
                      return prev;
                    });
                  }
                })
                .catch((error) => {});
            }
          });
        }
        setFirstRun(false);
        setLoading(false);
        return;
      }

      const fullAccessRole = roles.find(
        (role) => role.permission_types.length === Object.keys(PERMISSION_TYPES).length,
      );

      let userRole: number | undefined | null = null;
      let userSpecificPermissions: number[] = [];

      // Try to get user role, but don't fail if user is not assigned to form
      try {
        userRole = getUserRole(form.users, user, isSuperAdmin, fullAccessRole?.role_id ?? null);

        const roleObj = roles.find((r) => r.role_id === userRole);
        userSpecificPermissions = roleObj?.permission_types || [];
      } catch (error) {
        // User is not assigned to form, but might still have access if form is public
        userSpecificPermissions = [];
      }

      let publicFormPermissions: number[] = [];

      // בדיקה אם הטופס פומבי ויש הרשאות פומביות
      if (form?.isPublic && form?.formPermission?.role_id) {
        const publicRole = roles.find((r) => r.role_id === form.formPermission?.role_id);

        if (publicRole) {
          publicFormPermissions = publicRole.permission_types || [];
        }
      }
      const finalPermissions = prioritizePermissions(
        userSpecificPermissions,
        publicFormPermissions,
      );

      if (hasPermissionToSeeForm(finalPermissions)) {
        setForm(form);

        if (form.fields.some((f) => f.typeId === FieldTypeIds.form)) {
          setResponsesWithChildren([]);
          form.fields.forEach((field) => {
            if (field.typeId === FieldTypeIds.form) {
              getResponses({
                form_id: field.connectedFormId,
                query: {
                  parentResponse: { $regex: `${form.id};` },
                },
              })
                .then((res) => {
                  if (res) {
                    setResponsesWithChildren((prev) => [...prev, ...res]);
                  }
                })
                .catch((error) => {});

              getFormById(field.connectedFormId)
                .then((childForm) => {
                  if (childForm) {
                    setChildrenForms((prev) => {
                      if (!prev.some((item) => item.id === childForm.id)) {
                        return [...prev, childForm];
                      }
                      return prev;
                    });
                  }
                })
                .catch((error) => {});
            }
          });
        }

        setCurrentFilter({ form_id: form.id });
        getResponsesForCurrentPage(form);
        setFirstRun(false);
        setLoading(false);
      } else {
        // navigate(IPath.ERROR, { replace: true });
      }
    } catch (error) {
      // navigate(IPath.ERROR, { replace: true });
      console.error("Error initializing form data:=======", error);
    }
  };

  return {
    initializeFormData,
    responsesHaveParents,
    setResponsesHaveParents,
    childrenForms,
    setChildrenForms,
    responsesWithChildren,
    setResponsesWithChildren,
  };
};
