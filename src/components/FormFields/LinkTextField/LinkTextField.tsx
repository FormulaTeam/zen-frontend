import React, { useEffect, useState } from "react";
import classes from "./LinkTextField.module.scss";
import { LinkValue, LinkValueError } from "../../../utils/interfaces";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";

type LinkTextFieldProps = {
  value: LinkValue | null;
  isDisabled: boolean;
  onChangeHandler: (value: LinkValue, valid: { link: boolean; linkTxt: boolean } | null) => void;
  isValid: LinkValueError;
  isRequired: boolean;
  label: string;
  isTabularEdit?: boolean;
};

const LinkTextField: React.FC<LinkTextFieldProps> = ({
  value,
  isDisabled,
  onChangeHandler,
  isValid = { link: true, linkTxt: true },
  label,
  isRequired,
  isTabularEdit = false,
}) => {
  const [url, setUrl] = useState(value?.link || "");
  const [previewText, setPreviewText] = useState(value?.linkTxt || "");
  const [fieldsIsValid, setFieldsIsValid] = useState(isValid);

  const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6})([/\w .-]*)*\/?$/i;

  const onChangeUrlInputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event?.target.value);
    const isValid = event?.target.value !== "" && urlRegex.test(event?.target.value);
    setFieldsIsValid((prev)=>({...prev,link: isValid}));
  };

  const onChangePreviewTextInputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreviewText(event?.target.value);
    setFieldsIsValid((prev)=>({...prev,linkTxt: event?.target.value ? true : false}));
  };

  useEffect(() => {
    onChangeHandler(
      { link: url, linkTxt: previewText },
      { link: fieldsIsValid.link, linkTxt: fieldsIsValid.linkTxt },
    );
  }, [url, previewText]);

  return (
    <div className={classes["link-text-field-container"]}>
      <BaseFieldInput
        isTabularEdit={isTabularEdit}
        fullWidth={true}
        className={classes["url-input"]}
        label={isTabularEdit ? "" : label + " "}
        placeholder="https://example.co.il"
        required={isRequired}
        value={url}
        onChange={onChangeUrlInputHandler}
        error={!fieldsIsValid.link}
        helperText={isRequired && !url ? "שדה זה הינו חובה" : !fieldsIsValid.link && "היפר-קישור לא תקין"}
        disabled={isDisabled}
        size={isTabularEdit ? "medium" : undefined}
      />

      <BaseFieldInput
        isTabularEdit={isTabularEdit}
        fullWidth={true}
        label={"טקסט להיפר-קישור"}
        required={isRequired}
        value={previewText}
        onChange={onChangePreviewTextInputHandler}
        error={!fieldsIsValid.linkTxt}
        helperText={!fieldsIsValid.linkTxt && "שדה זה הינו חובה"}
        disabled={isDisabled}
        size={isTabularEdit ? "medium" : undefined}
      />
    </div>
  );
};

export default LinkTextField;
