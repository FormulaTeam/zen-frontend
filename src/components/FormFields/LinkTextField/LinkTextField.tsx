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
  const [urlIsValid, setUrlIsValid] = useState(true);
  const [previewIsValid, setPreviewIsValid] = useState(true);

  const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6})([/\w .-]*)*\/?$/i;

  const onChangeUrlInputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event?.target.value);
    if (event?.target.value !== "" && !urlRegex.test(event?.target.value)) {
      setUrlIsValid(false);
      return;
    }
    setUrlIsValid(true);
  };

  const onChangePreviewTextInputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreviewText(event?.target.value);
    setPreviewIsValid(true);
  };

  useEffect(() => {
    setUrlIsValid(isValid.link);
    setPreviewIsValid(isValid.linkTxt);
  }, [isValid]);

  useEffect(() => {
    onChangeHandler(
      { link: url, linkTxt: previewText },
      { link: urlIsValid, linkTxt: previewIsValid },
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
        error={!urlIsValid}
        helperText={(!urlIsValid && "היפר-קישור לא תקין") || " "}
        disabled={isDisabled}
        size={isTabularEdit ? "medium" : undefined}
      />

      <BaseFieldInput
        isTabularEdit={isTabularEdit}
        fullWidth={true}
        label={isTabularEdit ? "" : "טקסט להיפר-קישור"}
        required={isRequired}
        value={previewText}
        onChange={onChangePreviewTextInputHandler}
        error={!previewIsValid}
        helperText={(!previewIsValid && "שדה זה הינו חובה") || " "}
        disabled={isDisabled}
        size={isTabularEdit ? "medium" : undefined}
      />
    </div>
  );
};

export default LinkTextField;
