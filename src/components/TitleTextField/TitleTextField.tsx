import { Info } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { useEffect } from "react";
import BaseFormInput from "../BaseFormInput/BaseFormInput";
import ErrorMessage from "../CreateForm/ErrorMessage";
import { FormFieldDto } from "../../types/shared";

type TitleTextFieldExtra = {
  validationRegex?: string;
  shouldSyncToMetro?: boolean;
  fieldName?: string;
  fieldIcon?: string;
};

type Props = {
  formField: FormFieldDto;
  index: number;
  isNameValid: boolean;
  isDisplayNameValid: boolean;
  fieldNameError: boolean;
  handleOnBlur?: () => void;
  handleNameChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    prevName: string,
  ) => void;
  handleDisplayNameChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    prevName: string,
  ) => void;
  handleNameKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  handleErrorMessage: (message: string, field: string, fieldId: string) => void;
  displayErrorMessages: string[];
  innerErrorMessages: string[];
};

const getFieldExtra = (field: FormFieldDto): TitleTextFieldExtra =>
  (field.extra as TitleTextFieldExtra | undefined) ?? {};

export default function TitleTextField({
  formField,
  index,
  isNameValid,
  isDisplayNameValid,
  handleOnBlur = () => {},
  handleNameChange,
  handleDisplayNameChange,
  handleNameKeyDown,
  fieldNameError,
  handleErrorMessage,
  displayErrorMessages,
  innerErrorMessages,
}: Props) {
  const fieldExtra = getFieldExtra(formField);

  useEffect(() => {
    handleErrorMessage(
      fieldNameError
        ? formField.name?.toLowerCase() === "id"
          ? "לא ניתן להשתמש בערך זה לשם פנימי"
          : "ניתן להזין רק אותיות באנגלית!"
        : "",
      "general",
      formField.id || "",
    );
  }, [fieldNameError, formField.name, formField.id, handleErrorMessage]);

  return (
    <>
      {fieldExtra.shouldSyncToMetro !== false && (
        <>
          <BaseFormInput
            value={formField.name}
            name="title"
            label="שם פנימי"
            onChange={(e) => handleNameChange(e, index, formField.name || "")}
            onBlur={handleOnBlur}
            onKeyDown={handleNameKeyDown}
            sx={{ width: "80%" }}
            error={fieldNameError}
            InputProps={{
              endAdornment: (
                <Tooltip
                  title={
                    <span className="tooltip-span">
                      רק אותיות באנגלית ומקף תחתון '_' - כל דבר אחר (כולל רווחים) יביא לשגיאה
                    </span>
                  }>
                  <Info color="disabled" />
                </Tooltip>
              ),
            }}
          />
          {innerErrorMessages.map((msg, i) => (
            <ErrorMessage key={`name-${index}-${i}`} msg={msg} />
          ))}
        </>
      )}

      <BaseFormInput
        className={isDisplayNameValid ? "formField-textfield" : "formField-textfield-invalid"}
        value={formField.displayName}
        name="displayName"
        label="שם תצוגה"
        onChange={(e) => handleDisplayNameChange(e, index, formField.displayName || "")}
        onBlur={handleOnBlur}
        sx={{ width: "80%" }}
      />

      {displayErrorMessages.map((msg, i) => (
        <ErrorMessage key={`display-${index}-${i}`} msg={msg} />
      ))}
    </>
  );
}
