import { ResponseForm } from "../utils/interfaces";

export type saveResponse = (
  formFieldsByIdMap: Map<string, any>,
  formFieldsValuesMap: Map<string, any>,
) => Promise<ResponseForm | ResponseForm[]>;
