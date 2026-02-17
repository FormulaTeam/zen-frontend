import { FormField } from "./tableViews.types";

export interface ViewFormBase {
  id: string;
  name: string;
  fields: FormField[];
}

export interface ViewUserBase {
  upn?: string;
  firstName?: string;
  lastName?: string;
}
