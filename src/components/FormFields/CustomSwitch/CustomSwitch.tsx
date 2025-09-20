import React, { useEffect, useState } from "react";
import {  Switch } from "@mui/material";
import { StyledFormControl, StyledFormControlLabel, StyledLabel } from "./styled";
import { CheckboxInitialValType } from "../../../types/enums/formFields.enums";

type CustomSwitchProps = {
  value: boolean;
  isDisabled: boolean;
  onChangeHandler: (value: boolean) => void;
  label: string;
  defaultValue?: string;
  isTabularEdit?: boolean;
};

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  value,
  isDisabled,
  onChangeHandler,
  label,
  defaultValue,
  isTabularEdit = false,
}) => {
  const [isChecked, setIsChecked] = useState<boolean>(
    value ?? defaultValue === CheckboxInitialValType.CHECKED,
  );

  const onChangeSwitchHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setIsChecked(newValue);
    onChangeHandler(newValue);
  };

  useEffect(() => {
    const effectiveValue = value ?? defaultValue === CheckboxInitialValType.CHECKED;
    setIsChecked(effectiveValue);
    onChangeHandler(effectiveValue);
  }, [value, defaultValue]);

  return (
    <StyledFormControl isTabularEdit={isTabularEdit}>
      <StyledFormControlLabel
        isTabularEdit={isTabularEdit}
        control={
          <Switch
            checked={isChecked}
            onChange={onChangeSwitchHandler}
            disabled={isDisabled}
            size={isTabularEdit ? "small" : "medium"}
          />
        }
        label={isTabularEdit ? "" : label}
        labelPlacement="start"
        dir="rtl"
      />
    </StyledFormControl>
  );
};

export default CustomSwitch;
