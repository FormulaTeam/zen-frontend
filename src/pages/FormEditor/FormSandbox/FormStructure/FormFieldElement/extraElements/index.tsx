import { TimeFieldExtra } from "./TimeFieldExtra";
import { DateFieldExtra } from "./DateFieldExtra";
import { FieldTypeIds, FormFieldTypeId } from "../../../../../../utils/interfaces";
import { FC } from "react";
import { FormFieldExtra } from "../../../../schemas";
import { LocationFieldExtra } from "./LocationFieldExtra";
import { NumberFieldExtra } from "./NumberFieldExtra";
import { CheckboxFieldExtra } from "./CheckboxFieldExtra";

type ExtraElementProps<K extends FormFieldTypeId> = {
  extra: FormFieldExtra<K>;
  disabled: boolean;
};

function getExtraElement<T extends FormFieldTypeId>(typeId: T, extra: FormFieldExtra<T> | undefined = {}, disabled: boolean) {
  switch (typeId) {
    case FieldTypeIds.options:
      return null;
    case FieldTypeIds.date:
      return <DateFieldExtra extra={extra} disabled={disabled} />;
    case FieldTypeIds.time:
      return <TimeFieldExtra extra={extra} disabled={disabled} />;
    case FieldTypeIds.location:
      return <LocationFieldExtra extra={extra} disabled={disabled} />;
    case FieldTypeIds.checkbox:
      return <CheckboxFieldExtra  extra={extra} disabled={disabled} />;
    case FieldTypeIds.number:
      return <NumberFieldExtra extra={extra} disabled={disabled} />;
    case FieldTypeIds.linkedForm:
      return null;
    default:
      return null;
  }
}

export type { ExtraElementProps };
export { getExtraElement };