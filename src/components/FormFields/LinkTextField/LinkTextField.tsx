import React, { useEffect, useState } from "react";
import classes from "./LinkTextField.module.scss";
import { LinkValue, LinkValueError } from "../../../utils/interfaces";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";

type LinkTextFieldProps = {
  value: LinkValue | null;
  isDisabled: boolean;
  onChangeHandler: (value: LinkValue) => void;
  errors?: LinkValueError | null;
  isRequired: boolean;
  label: string;
  isTabularEdit?: boolean;
};

const LinkTextField: React.FC<LinkTextFieldProps> = ({
  value,
  isDisabled,
  onChangeHandler,
  errors,
  label,
  isRequired,
  isTabularEdit = false,
}) => {
  const [url, setUrl] = useState(value?.link || "");
  const [previewText, setPreviewText] = useState(value?.linkTxt || "");

  useEffect(() => {
    setUrl(value?.link || "");
    setPreviewText(value?.linkTxt || "");
  }, [value?.link, value?.linkTxt]);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextUrl = event.target.value;
    setUrl(nextUrl);
    onChangeHandler({
      link: nextUrl,
      linkTxt: previewText,
    });
  };

  const handlePreviewTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextPreviewText = event.target.value;
    setPreviewText(nextPreviewText);
    onChangeHandler({
      link: url,
      linkTxt: nextPreviewText,
    });
  };

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
        onChange={handleUrlChange}
        error={Boolean(errors?.link || errors?.general)}
        helperText={errors?.link || errors?.general || " "}
        disabled={isDisabled}
        size={isTabularEdit ? "medium" : undefined}
      />

      <BaseFieldInput
        isTabularEdit={isTabularEdit}
        fullWidth={true}
        label={isTabularEdit ? "" : "טקסט להיפר-קישור"}
        required={isRequired}
        value={previewText}
        onChange={handlePreviewTextChange}
        error={Boolean(errors?.linkTxt || errors?.general)}
        helperText={errors?.linkTxt || errors?.general || " "}
        disabled={isDisabled}
        size={isTabularEdit ? "medium" : undefined}
      />
    </div>
  );
};

export default LinkTextField;
