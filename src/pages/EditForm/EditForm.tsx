import { useNavigate, useParams } from "react-router-dom";
import { FormEditor } from "../FormEditor";
import { useGetForm } from "../../api";
import { FORM_EDITOR_MODE } from "../FormEditor/context/FormEditorContext";
import { useEffect } from "react";
import { permission } from "formula-gear";

export default function EditForm({ }) {
  const { formId } = useParams();
  const navigate = useNavigate();

  const { data: formToEdit, isLoading, isError } = useGetForm({
    formId: formId,
    includePermissions: true,
    config: {
      enabled: !!formId,
    },
  });

  const canEditForm = formToEdit?.permissions?.includes(permission.UpdateForm) ?? false;

  useEffect(() => {
    if (isError || (!isLoading && formToEdit && !canEditForm)) {
      navigate("/error", { replace: true });
    }
  }, [canEditForm, formToEdit, isError, isLoading, navigate]);

  if (isLoading || isError || !formToEdit || !canEditForm) {
    return null;
  }

  return <FormEditor mode={FORM_EDITOR_MODE.EDIT} editedForm={formToEdit} />;
}
