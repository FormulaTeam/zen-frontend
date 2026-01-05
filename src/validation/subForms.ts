import { getFormById } from "../api";
import { Form, FormField, FieldTypeIds } from "../utils/interfaces";

export interface SubFormsById {
  [formId: number]: Form;
}

const collectSubFormIds = (fields: FormField[]): number[] => {
  const ids: number[] = [];

  fields.forEach((field) => {
    const isSubFormField = field.typeId === FieldTypeIds.form;
    const hasConnectedId = typeof field.connectedFormId === "number";

    if (isSubFormField && hasConnectedId) {
      ids.push(field.connectedFormId as number);
    }
  });

  const unique: number[] = [];
  ids.forEach((id) => {
    if (!unique.includes(id)) unique.push(id);
  });

  return unique;
};

export const fetchSubFormsRecursively = async (
  rootFields: FormField[],
  existing: SubFormsById = {},
): Promise<SubFormsById> => {
  const fetchedIds: number[] = Object.keys(existing).map((k) => Number(k));
  const queue: number[] = collectSubFormIds(rootFields);

  while (queue.length > 0) {
    const currentId = queue.shift();

    if (typeof currentId === "number" && !existing[currentId] && !fetchedIds.includes(currentId)) {
      fetchedIds.push(currentId);

      const subForm = await getFormById(currentId);

      if (subForm && Array.isArray(subForm.fields)) {
        existing[currentId] = subForm;

        const nestedIds = collectSubFormIds(subForm.fields);

        nestedIds.forEach((nid) => {
          const alreadyHave = !!existing[nid];
          const alreadyQueued = queue.includes(nid);
          const alreadyFetched = fetchedIds.includes(nid);

          if (!alreadyHave && !alreadyQueued && !alreadyFetched) {
            queue.push(nid);
          }
        });
      }
    }
  }

  return existing;
};
