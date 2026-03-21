import { useParams } from "react-router-dom";
import CreateForm from "../CreateForm/CreateForm";
import { useEffect, useState } from "react";
import { getFormById } from "../../api";
import type { FormDto } from "../../types/shared";

export default function EditForm({ user }) {
  const { id } = useParams();
  const [formToEdit, setFormToEdit] = useState<FormDto | null>(null);

  useEffect(() => {
    if (id) {
      getFormById(Number(id)).then((form) => {
        if (form) {
          setFormToEdit(form);
        }
      });
    }
  }, [id]);

  return <>{formToEdit && <CreateForm currentUser={user} formToEdit={formToEdit} />}</>;
}
