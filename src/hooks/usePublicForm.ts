import { useState, useEffect } from "react";
import { Form, Role } from "../utils/interfaces";
import { prioritizePermissions } from "../utils/formFieldsResponses";

interface UsePublicFormProps {
  form: Form;
  roles: Role[];
  onFormPermissionChange: (isPublic: boolean, formPermission: any) => void;
}

interface UsePublicFormReturn {
  isPublic: boolean;
  formPermission: any;
  togglePublicForm: () => void;
  handleLocalFormPermissionChange: (event: any, newValue: any) => void;
  publicFormPermissions: number[];
}

export const usePublicForm = ({
  form,
  roles,
  onFormPermissionChange,
}: UsePublicFormProps): UsePublicFormReturn => {
  // Local state management for public form
  const [isPublic, setIsPublic] = useState<boolean>(!!form.isPublic);
  const [formPermission, setFormPermission] = useState<any>(form.formPermission || null);

  // Update local state when form changes
  useEffect(() => {
    const newIsPublic = !!form.isPublic;
    setIsPublic(newIsPublic);

    const newFormPermission = form.formPermission || null;
    setFormPermission(newFormPermission);
  }, [form.isPublic, form.formPermission, form.id]);

  // Calculate public form permissions
  const publicFormPermissions: number[] = (() => {
    if (form.isPublic && form.formPermission?.role_id) {
      const publicRole = roles.find((r) => r.role_id === form.formPermission?.role_id);
      return publicRole?.permission_types || [];
    }
    return [];
  })();

  // Toggle public form state
  const togglePublicForm = () => {
    const newIsPublic = !isPublic;
    setIsPublic(newIsPublic);
    
    if (!newIsPublic) {
      setFormPermission(null); // If public is disabled, clear permission
      onFormPermissionChange(newIsPublic, undefined);
    } else {
      onFormPermissionChange(newIsPublic, formPermission);
    }
  };

  // Save selected permission
  const handleLocalFormPermissionChange = (event: any, newValue: any) => {
    if (newValue) {
      const newPermission = {
        role_id: newValue.role_id,
        roleName: newValue.roleName,
      };
      setFormPermission(newPermission);
      onFormPermissionChange(isPublic, newPermission);
    } else {
      // Reset permission (when clicking on RoleLabel)
      setFormPermission(null);
      onFormPermissionChange(isPublic, null);
    }
  };

  return {
    isPublic,
    formPermission,
    togglePublicForm,
    handleLocalFormPermissionChange,
    publicFormPermissions,
  };
};
