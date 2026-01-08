import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFormById, getResponses } from "../api";
import { FieldTypeIds, Form, ResponseForm, Role } from "../utils/interfaces";
import { PERMISSION_TYPES, getUserRole } from "../utils/utils";
import { prioritizePermissions } from "../utils/formFieldsResponses";
import { IPath } from "../types/enums/global.enums";
import { hasPermissionToSeeForm } from "../utils/forms";

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
    setPermissionTypes: (types: number[]) => void,
    setCurrentFilter: (filter: any) => void,
    getResponsesForCurrentPage: (form: any, permissionTypes: number[]) => void,
    setFirstRun: (val: boolean) => void,
    setLoading: (val: boolean) => void,
  ) => {
    console.log("[INIT FORM DATA] STARTED");
    console.log("[INIT FORM DATA] id:", id);
    console.log("[INIT FORM DATA] roles:", roles);
    console.log("[INIT FORM DATA] user:", user);
    console.log("[INIT FORM DATA] isSuperAdmin:", isSuperAdmin);

    if (!id) {
      console.log("[INIT FORM DATA] fuck off");
      return;
    }

    const formId = parseInt(id);
    console.log("[INIT FORM DATA] Parsed formId:", formId);

    try {
      const form = await getFormById(formId);
      console.log("[INIT FORM DATA] getFormById result:", form);

      if (!form) {
        console.error("[INIT FORM DATA] Form not found, navigating to ERROR");
        throw new Error("Form not found");
      }

      if (isSuperAdmin) {
        console.log("[INIT FORM DATA] User is SUPER ADMIN, setting full permissions");
        const allPermissions = Object.values(PERMISSION_TYPES);
        console.log("[INIT FORM DATA] allPermissions:", allPermissions);
        setPermissionTypes(allPermissions);
        setForm(form);
        setCurrentFilter({ form_id: form.id });
        getResponsesForCurrentPage(form, allPermissions);

        if (form.fields.some((f) => f.typeId === FieldTypeIds.form)) {
          console.log("[INIT FORM DATA] Form has fields with typeId FORM");
          setResponsesWithChildren([]);
          form.fields.forEach((field) => {
            if (field.typeId === FieldTypeIds.form) {
              console.log("[INIT FORM DATA] Processing child form field:", field);
              getResponses({
                form_id: field.connectedFormId,
              })
                .then((res) => {
                  console.log(
                    `[INIT FORM DATA] getResponses for child formId ${field.connectedFormId} result:`,
                    res,
                  );
                  if (res) {
                    setResponsesWithChildren((prev) => [...prev, ...res]);
                  }
                })
                .catch((error) => {
                  console.error("[INIT FORM DATA] Error fetching responses for child form:", error);
                });

              getFormById(field.connectedFormId)
                .then((childForm) => {
                  console.log("[INIT FORM DATA] getFormById for child form result:", childForm);
                  if (childForm) {
                    setChildrenForms((prev) => {
                      if (!prev.some((item) => item.id === childForm.id)) {
                        console.log(
                          "[INIT FORM DATA] Adding child form to childrenForms:",
                          childForm,
                        );
                        return [...prev, childForm];
                      }
                      return prev;
                    });
                  }
                })
                .catch((error) => {
                  console.error("[INIT FORM DATA] Error fetching child form:", error);
                });
            }
          });
        }
        setFirstRun(false);
        setLoading(false);
        console.log("[INIT FORM DATA] Finished SUPER ADMIN flow");
        return;
      }

      const fullAccessRole = roles.find(
        (role) => role.permission_types.length === Object.keys(PERMISSION_TYPES).length,
      );
      console.log("[INIT FORM DATA] fullAccessRole:", fullAccessRole);

      let userRole: number | undefined | null = null;
      let userSpecificPermissions: number[] = [];

      // Try to get user role, but don't fail if user is not assigned to form
      try {
        userRole = getUserRole(form.users, user, isSuperAdmin, fullAccessRole?.role_id ?? null);
        console.log("[INIT FORM DATA] userRole:", userRole);

        const roleObj = roles.find((r) => r.role_id === userRole);
        console.log("[INIT FORM DATA] roleObj:", roleObj);
        userSpecificPermissions = roleObj?.permission_types || [];
      } catch (error) {
        console.log("[INIT FORM DATA] User not assigned to form:", error);
        // User is not assigned to form, but might still have access if form is public
        userSpecificPermissions = [];
      }

      let publicFormPermissions: number[] = [];

      console.log("[INIT FORM DATA] user specific permissions:", userSpecificPermissions);

      // בדיקה אם הטופס פומבי ויש הרשאות פומביות
      if (form?.isPublic && form?.formPermission?.role_id) {
        const publicRole = roles.find((r) => r.role_id === form.formPermission?.role_id);
        console.log("[INIT FORM DATA] publicRole found:", publicRole);

        if (publicRole) {
          publicFormPermissions = publicRole.permission_types || [];
          console.log("[INIT FORM DATA] public permissions:", publicFormPermissions);
        }
      }

      const finalPermissions = prioritizePermissions(
        userSpecificPermissions,
        publicFormPermissions,
      );
      console.log("[INIT FORM DATA] final merged permissions:", finalPermissions);

      setPermissionTypes(finalPermissions);

      if (hasPermissionToSeeForm(finalPermissions)) {
        console.log("[INIT FORM DATA] User has permission to see form");
        setForm(form);

        if (form.fields.some((f) => f.typeId === FieldTypeIds.form)) {
          console.log("[INIT FORM DATA] Form has fields with typeId FORM");
          setResponsesWithChildren([]);
          form.fields.forEach((field) => {
            if (field.typeId === FieldTypeIds.form) {
              console.log("[INIT FORM DATA] Processing child form field:", field);
              getResponses({
                form_id: field.connectedFormId,
                query: {
                  parentResponse: { $regex: `${form.id};` },
                },
              })
                .then((res) => {
                  console.log(
                    `[INIT FORM DATA] getResponses for child formId ${field.connectedFormId} result:`,
                    res,
                  );
                  if (res) {
                    setResponsesWithChildren((prev) => [...prev, ...res]);
                  }
                })
                .catch((error) => {
                  console.error("[INIT FORM DATA] Error fetching responses for child form:", error);
                });

              getFormById(field.connectedFormId)
                .then((childForm) => {
                  console.log("[INIT FORM DATA] getFormById for child form result:", childForm);
                  if (childForm) {
                    setChildrenForms((prev) => {
                      if (!prev.some((item) => item.id === childForm.id)) {
                        console.log(
                          "[INIT FORM DATA] Adding child form to childrenForms:",
                          childForm,
                        );
                        return [...prev, childForm];
                      }
                      return prev;
                    });
                  }
                })
                .catch((error) => {
                  console.error("[INIT FORM DATA] Error fetching child form:", error);
                });
            }
          });
        }

        setCurrentFilter({ form_id: form.id });
        getResponsesForCurrentPage(form, finalPermissions);
        setFirstRun(false);
        setLoading(false);
      } else {
        console.error(
          "[INIT FORM DATA] User does not have permission to see form, navigating ERROR",
        );
        navigate(IPath.ERROR, { replace: true });
      }
    } catch (error) {
      console.error("[INIT FORM DATA] Caught error in try-catch:", error);
      navigate(IPath.ERROR, { replace: true });
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
