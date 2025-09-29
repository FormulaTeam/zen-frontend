import { RESERVED_FIELD_NAMES } from "../../consts/form";

export interface UserData {
  upn: string;
  userName: string;
}

export interface ErrorMessageType {
  key: string;
  message: string;
  fieldId: string;
}

export type ReservedFieldName = (typeof RESERVED_FIELD_NAMES)[number];
