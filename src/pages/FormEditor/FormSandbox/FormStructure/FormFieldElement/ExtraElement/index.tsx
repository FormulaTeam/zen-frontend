import { CheckboxFieldExtra, DateFieldExtra, LocationFieldExtra, NumberFieldExtra, TimeFieldExtra } from "./elements";
import { FieldTypeIds, FormFieldTypeId } from "../../../../../../utils/interfaces";
import { FormFieldExtra, SpecificFormFieldData } from "../../../../schemas";
import styles from "../style.module.css";
import { ReactElement } from "react";
import { $ZodErrorTree } from "zod/v4/core";

type SetExtra<T extends FormFieldTypeId> = <D extends SpecificFormFieldData<T>>(extra: Partial<D["extra"]>) => void;

type ExtraElementProps<T extends FormFieldTypeId> = {
  extra: FormFieldExtra<T>;
  onChange: SetExtra<T>;
  disabled: boolean;

  validationErrors?: $ZodErrorTree<FormFieldExtra<T>>;
};

function ExtraElement<T extends FormFieldTypeId>(props: ExtraElementProps<T> & { typeId: T }) {
  const { typeId, ...restProps } = props;
  let extraElement: ReactElement;

  switch (typeId) {
    case FieldTypeIds.options:
      extraElement = <div />;
      break;
    case FieldTypeIds.date:
      extraElement = <DateFieldExtra {...restProps} />;
      break;
    case FieldTypeIds.time:
      extraElement = <TimeFieldExtra {...restProps} />;
      break;
    case FieldTypeIds.location:
      extraElement = <LocationFieldExtra {...restProps} />;
      break;
    case FieldTypeIds.checkbox:
      extraElement = <CheckboxFieldExtra {...restProps} />;
      break;
    case FieldTypeIds.number:
      extraElement = <NumberFieldExtra {...restProps} />;
      break;
    case FieldTypeIds.linkedForm:
      extraElement = <div />;
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