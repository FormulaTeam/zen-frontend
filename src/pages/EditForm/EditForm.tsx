import { useParams } from "react-router-dom";
import CreateForm from "../CreateForm/CreateForm";
import { useEffect, useState } from "react";
import { getFormById } from "../../api";
import { Form } from "../../utils/interfaces";

export default function EditForm({ user }) {
  const { id } = useParams();
  const [formToEdit, setFormToEdit] = useState<Form | null>(null);

  useEffect(() => {
    if (id) {
      getFormById(Number(id)).then((form) => {
        if (form) {
          setFormToEdit(form);
        }
      });
    }
  }, []);

  return <>{formToEdit && <CreateForm currentUser={user} formToEdit={formToEdit} />}</>;
}
