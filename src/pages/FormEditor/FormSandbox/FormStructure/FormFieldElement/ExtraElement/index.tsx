import {
  CheckboxFieldExtra,
  DateFieldExtra,
  LinkedFormFieldExtra,
  LocationFieldExtra,
  NumberFieldExtra, OptionsFieldExtra,
  TimeFieldExtra,
} from "./elements";
import { FieldTypeIds, FormFieldTypeId } from "../../../../../../utils/interfaces";
import { FormFieldExtra, SpecificFormFieldData, FormFieldData } from "../../../../schemas/fields";
import styles from "../style.module.css";
import { ReactElement } from "react";
import { $ZodErrorTree } from "zod/v4/core";

type SetExtra<T extends FormFieldTypeId> = <D extends SpecificFormFieldData<T>>(extra: Partial<D["extra"]>) => void;

type ExtraElementProps<T extends FormFieldTypeId> = {
  extra: FormFieldExtra<T>;
  onChange: SetExtra<T>;
  onDataChange?: (data: Partial<FormFieldData>) => void;
  disabled: boolean;

  validationErrors?: any;
};

type Props<T extends FormFieldTypeId> = ExtraElementProps<T> & {
  typeId: T,
  fieldId: string,
};

function ExtraElement<T extends FormFieldTypeId>(props: Props<T>) {
  const { typeId, onDataChange, ...restProps } = props;
  let extraElement: ReactElement;

  switch (typeId) {
    case FieldTypeIds.options:
      extraElement = <OptionsFieldExtra onDataChange={onDataChange as any} {...restProps as any} />;
      break;
    case FieldTypeIds.date:
      extraElement = <DateFieldExtra {...restProps as any} />;
      break;
    case FieldTypeIds.time:
      extraElement = <TimeFieldExtra {...restProps as any} />;
      break;
    case FieldTypeIds.location:
      extraElement = <LocationFieldExtra {...restProps as any} />;
      break;
    case FieldTypeIds.checkbox:
      extraElement = <CheckboxFieldExtra {...restProps as any} />;
      break;
    case FieldTypeIds.number:
      extraElement = <NumberFieldExtra {...restProps as any} />;
      break;
    case FieldTypeIds.linkedForm:
      extraElement = <LinkedFormFieldExtra {...restProps as any} />;
      break;
    default:
      return null;
  }

  return (
    <div className={styles.extraData}>
      {extraElement}
    </div>
  );
}

export type { ExtraElementProps };
export { ExtraElement };