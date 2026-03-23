import { useParams } from "react-router-dom";
import { FormEditor } from "../FormEditor";
import { useGetForm } from "../../api";
import { FORM_EDITOR_MODE } from "../FormEditor/context/FormEditorContext";

export default function EditForm({ }) {
  const { id } = useParams();

  const { data: formToEdit, isLoading } = useGetForm({
    formId: id,
    config: {
      enabled: !!id,
    },
  });

  if (isLoading) {
    return null;
  }

  return <>
    {formToEdit && <FormEditor mode={FORM_EDITOR_MODE.EDIT} editedForm={formToEdit} />}
  </>;
}
