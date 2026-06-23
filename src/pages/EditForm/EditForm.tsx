import { useNavigate, useParams } from "react-router-dom";
import { FormEditor } from "../FormEditor";
import { useGetForm } from "../../api";
import { FORM_EDITOR_MODE } from "../FormEditor/context/FormEditorContext";
import { useEffect } from "react";
import { StatusCodes } from "http-status-codes";

export default function EditForm({ }) {
  const { formId } = useParams();
  const navigate = useNavigate();

  const { data: formToEdit, isLoading, error, isError } = useGetForm({
    formId: formId,
    config: {
      enabled: !!formId,
    },
  });

  useEffect(() => {
    if (isError) {
      navigate("/error", { replace: true });
    }
  }, [isError, navigate]);

  if (isLoading) {
    return null;
  }

  return <>
    {formToEdit && <FormEditor mode={FORM_EDITOR_MODE.EDIT} editedForm={formToEdit} />}
  </>;
}
