import React, { useEffect, useState } from "react";
import { Switch } from "@mui/material";
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
  const resolveEffectiveValue = () =>
    typeof value === "boolean" ? value : defaultValue === CheckboxInitialValType.CHECKED;

  const [isChecked, setIsChecked] = useState<boolean>(resolveEffectiveValue());

  useEffect(() => {
    setIsChecked(resolveEffectiveValue());
  }, [value, defaultValue]);

  const onChangeSwitchHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setIsChecked(newValue);
    onChangeHandler(newValue);
  };

  return (
    <StyledFormControl isTabularEdit={isTabularEdit}>
      {!isTabularEdit && <StyledLabel>{label}</StyledLabel>}
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
        label=""
      />
    </StyledFormControl>
  );
};

export default CustomSwitch;
