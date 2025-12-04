import React, { useEffect, useState } from "react";
import { CustomInputFormFieldProps } from "../../../utils/interfaces";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";

interface CustomNumberFieldProps extends CustomInputFormFieldProps {
  value: any;
  numberType?: string;
  minValue?: number;
  maxValue?: number;
  isTabularEdit?: boolean;
}

const CustomNumberField: React.FC<CustomNumberFieldProps> = ({
  value="",
  isDisabled,
  onChangeHandler,
  isValid,
  label,
  isRequired,
  numberType,
  minValue,
  maxValue,
  isTabularEdit = false,
}) => {
  const initialErrorMessage = "נדרש להזין מספר";
  const integerErrorMessage = "חובה להזין מספר שלם";
  const floatErrorMessage = "חובה להזין מספר עשרוני";
  const numberMustBeBetweenNumber =
    minValue && !maxValue
      ? `המספר חייב להיות גדול מ- ${minValue}`
      : !minValue && maxValue
      ? `המספר חייב להיות קטן מ- ${maxValue}`
      : `המספר חייב להיות גדול מ- ${minValue} וקטן מ- ${maxValue}`;

  const [inputValue, setInputValue] = useState(value);
  const [errorMessage, setErrorMessage] = useState(isRequired ? initialErrorMessage : "");
  const [fieldIsValid, setFieldIsValid] = useState<boolean>(isValid);

  const integerRegex = /^-?\d+$/;
  const floatRegex = /^-?\d+\.\d+$/;

  useEffect(() => {
    setFieldIsValid(isValid);

    if (!isValid) {
      triggerValidationViolation(errorMessage || initialErrorMessage);
    }
  }, [isValid]);

  const resetValidationHandler = () => {
    setFieldIsValid(true);
    setErrorMessage("");
  };

  const triggerValidationViolation = (errorMessage: string) => {
    setFieldIsValid(false);
    setErrorMessage(errorMessage);
  };

  const onInputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setInputValue(value);

    const isInteger = numberType === "integer";
    const isDouble = numberType === "double";
    const isValidFormat = isInteger
      ? integerRegex.test(value)
      : isDouble
      ? floatRegex.test(value) || integerRegex.test(value)
      : false;

    const isEmpty = value === "";
    if (isEmpty) {
      if (isRequired) {
        triggerValidationViolation(initialErrorMessage);
        onChangeHandler("", false);
      } else {
        resetValidationHandler();
        onChangeHandler("", true);
      }
      return;
    }
    if (!isValidFormat) {
      triggerValidationViolation(isInteger ? integerErrorMessage : floatErrorMessage);
      onChangeHandler(value, false);
      return;
    }

    const numericValue = isInteger ? parseInt(value, 10) : parseFloat(value);

    if (
      (minValue !== undefined && numericValue < minValue) ||
      (maxValue !== undefined && numericValue > maxValue)
    ) {
      triggerValidationViolation(numberMustBeBetweenNumber);
      onChangeHandler(numericValue, false);
      return;
    }

    resetValidationHandler();
    onChangeHandler(numericValue, true);
  };

  return (
    <BaseFieldInput
      isTabularEdit={isTabularEdit}
      fullWidth={true}
      label={isTabularEdit ? "" : label}
      disabled={isDisabled}
      value={inputValue}
      error={!fieldIsValid}
      helperText={(!fieldIsValid && errorMessage) || " "}
      required={isRequired}
      onChange={onInputChangeHandler}
      size={isTabularEdit ? "medium" : undefined}
      dir="ltr"
      sx={{
        ...(isTabularEdit && {
          '& .MuiInputBase-root': {
            fontSize: '1rem',
            minHeight: '40px',
            display: 'flex',
            alignItems: 'center',
            '&::before': {
              border: 'none',
            },
            '&::after': {
              border: 'none',
            },
            '&:hover:not(.Mui-disabled)::before': {
              border: 'none',
            },
          },
          '& .MuiInputBase-input': {
            textAlign: 'center',
            padding: '8px 12px',
          },
          '& .MuiFormLabel-root': {
            display: 'none'
          },
          '& .MuiFormHelperText-root': {
            fontSize: '0.85rem',
            margin: '4px 0 0 0',
            lineHeight: '1.2',
            minHeight: 'auto',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }
        })
      }}
    />
  );
};

export default CustomNumberField;
