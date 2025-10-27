import { Form } from "../../utils/interfaces";

const toLower = (v: any) => (v == null ? "" : String(v).toLowerCase());

export const filterForms = (forms: Form[], query: any): Form[] => {
  if (!query || Object.keys(query).length === 0) return forms;

  return forms.filter((form) => {
    // deleted filter
    if (query.deleted !== undefined) {
      const hasDeleted = !!(form as any).deleted;
      if (typeof query.deleted === "boolean" && query.deleted !== hasDeleted) return false;
      if (query.deleted.$exists !== undefined && query.deleted.$exists !== hasDeleted) return false;
    }

    // shared with users
    if (query.users?.$in) {
      const upns = Array.isArray(query.users.$in) ? query.users.$in.map(toLower) : [];
      const hasUser =
        Array.isArray(form.users) && form.users.some((u) => upns.includes(toLower(u.upn)));
      if (!hasUser) return false;
    }

    // created_by
    if (query.created_by) {
      if (typeof query.created_by === "string") {
        if (!toLower(form.created_by).includes(toLower(query.created_by))) return false;
      } else if (query.created_by.$regex) {
        if (!toLower(form.created_by).includes(toLower(query.created_by.$regex))) return false;
      } else if (query.created_by.$ne) {
        if (toLower(form.created_by).includes(toLower(query.created_by.$ne))) return false;
      }
    }

    // $or (search by name / description / id)
    if (query.$or && Array.isArray(query.$or)) {
      const orMatched = query.$or.some((cond: any) => {
        if (cond.name?.$regex) return toLower(form.name).includes(toLower(cond.name.$regex));
        if (cond.description?.$regex)
          return toLower(form.description).includes(toLower(cond.description.$regex));
        if (cond.id != null) return Number(form.id) === Number(cond.id);
        return false;
      });
      if (!orMatched) return false;
    }

    // form_id $in
    if (query.form_id?.$in) {
      const ids = query.form_id.$in.map((x: any) => Number(x));
      if (!ids.includes(Number(form.id))) return false;
    }

    return true;
  });
};
