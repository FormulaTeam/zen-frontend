import { Info } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { CustomFormField, FormField } from "../../utils/interfaces";
import BaseFormInput from "../BaseFormInput/BaseFormInput";
import { useEffect } from "react";
import ErrorMessage from "../CreateForm/ErrorMessage";

type Props = {
  formField: Partial<FormField & CustomFormField>;
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
  useEffect(() => {
    handleErrorMessage(
      fieldNameError
        ? formField.name?.toLowerCase() === "id"
          ? "לא ניתן להשתמש בערך זה לשם פנימי"
          : "ניתן להזין רק אותיות באנגלית!"
        : "",
      "general",
      formField.uniqueId || "",
    );
  }, [fieldNameError, formField.name]);

  return (
    <>
      {formField.shouldSyncToMetro !== false && (
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
