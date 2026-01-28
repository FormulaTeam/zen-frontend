import React, { useEffect, useMemo, useState } from "react";
import classes from "./LinkTextField.module.scss";
import { LinkValidity, LinkValue } from "../../../utils/interfaces";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";

type LinkTextFieldProps = {
  value: LinkValue | null;
  isDisabled: boolean;
  onChangeHandler: (value: LinkValue, valid: { link: boolean; linkTxt: boolean } | null) => void;
  isValid: LinkValidity;
  isRequired: boolean;
  label: string;
  isTabularEdit?: boolean;
  onBlur?: (part?: "link" | "linkTxt") => void;
  touched?: boolean;
};

const LinkTextField: React.FC<LinkTextFieldProps> = ({
  value,
  isDisabled,
  onChangeHandler,
  isValid = { link: true, linkTxt: true },
  label,
  isRequired,
  isTabularEdit = false,
  onBlur,
  touched = false,
}) => {
  const [url, setUrl] = useState(value?.link ?? "");
  const [previewText, setPreviewText] = useState(value?.linkTxt ?? "");

  useEffect(() => {
    setUrl(value?.link ?? "");
    setPreviewText(value?.linkTxt ?? "");
  }, [value?.link, value?.linkTxt]);

  // Push value up whenever local inputs change
  useEffect(() => {
    onChangeHandler({ link: url, linkTxt: previewText }, { link: true, linkTxt: true });
  }, [url, previewText]);

  const v: LinkValidity = useMemo(() => {
    if (isValid && typeof isValid === "object" && "link" in isValid && "linkTxt" in isValid) {
      return isValid as LinkValidity;
    }
    return { link: true, linkTxt: true };
  }, [isValid]);

  const showUrlError = touched && v.link === false;
  const showTxtError = touched && v.linkTxt === false;

  const urlHelper = showUrlError ? v.linkMsg || " " : " ";
  const txtHelper = showTxtError ? v.linkTxtMsg || " " : " ";

  const handleBlur = (part: "link" | "linkTxt") => {
    onBlur?.(part);
    onChangeHandler({ link: url, linkTxt: previewText }, { link: true, linkTxt: true });
  };

  return (
    <div className={classes["link-text-field-container"]}>
      <BaseFieldInput
        isTabularEdit={isTabularEdit}
        fullWidth
        className={classes["url-input"]}
        label={isTabularEdit ? "" : `${label} `}
        placeholder="https://example.co.il"
        required={isRequired}
        value={url}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
        onBlur={() => handleBlur("link")}
        error={showUrlError}
        helperText={urlHelper}
        disabled={isDisabled}
        size={isTabularEdit ? "medium" : undefined}
      />

      <BaseFieldInput
        isTabularEdit={isTabularEdit}
        fullWidth
        label={"טקסט להיפר-קישור"}
        required={false}
        value={previewText}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPreviewText(e.target.value)}
        onBlur={() => handleBlur("linkTxt")}
        error={showTxtError}
        helperText={txtHelper}
        disabled={isDisabled}
        size={isTabularEdit ? "medium" : undefined}
      />
    </div>
  );
};

export default LinkTextField;
