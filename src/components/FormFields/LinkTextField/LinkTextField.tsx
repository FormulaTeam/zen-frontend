import React, { useEffect, useState } from "react";
import classes from "./LinkTextField.module.scss";
import { LinkValue, LinkValueError } from "../../../utils/interfaces";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";
import FieldErrorText from "../FieldErrorText/FieldErrorText";

type FieldErrorDisplay = {
  message?: string;
  detail?: string;
};

type LinkTextFieldProps = {
  value: LinkValue | null;
  isDisabled: boolean;
  onChangeHandler: (value: LinkValue) => void;
  onBlurHandler?: () => void;
  errors?: LinkValueError | null;
  errorDetail?: FieldErrorDisplay | null;
  isRequired: boolean;
  label: string;
  isTabularEdit?: boolean;
};

const getMatchingDetail = (
  message: string | undefined,
  errorDetail?: FieldErrorDisplay | null,
): string | undefined => {
  if (!message || !errorDetail?.detail) {
    return undefined;
  }

  if (!errorDetail.message || errorDetail.message === message) {
    return errorDetail.detail;
  }

  return undefined;
};

const LinkTextField: React.FC<LinkTextFieldProps> = ({
  value,
  isDisabled,
  onChangeHandler,
  onBlurHandler,
  errors,
  errorDetail,
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

  const linkMessage = errors?.link ?? errors?.general;
  const linkTextMessage = errors?.linkTxt;

  const linkDetail = getMatchingDetail(linkMessage, errorDetail);
  const linkTextDetail = getMatchingDetail(linkTextMessage, errorDetail);

  return (
    <div className={classes["link-text-field-container"]}>
      <BaseFieldInput
        isTabularEdit={isTabularEdit}
        fullWidth={true}
        className={classes["url-input"]}
        label={isTabularEdit ? "" : `${label} `}
        placeholder="https://example.co.il"
        required={isRequired}
        value={url}
        onChange={handleUrlChange}
        onBlur={onBlurHandler}
        error={Boolean(linkMessage)}
        helperText={<FieldErrorText message={linkMessage} detail={linkDetail} />}
        disabled={isDisabled}
        size={isTabularEdit ? "medium" : undefined}
      />

      <BaseFieldInput
        isTabularEdit={isTabularEdit}
        fullWidth={true}
        label={isTabularEdit ? "" : "טקסט להיפר-קישור"}
        required={false}
        value={previewText}
        onChange={handlePreviewTextChange}
        onBlur={onBlurHandler}
        error={Boolean(linkTextMessage)}
        helperText={<FieldErrorText message={linkTextMessage} detail={linkTextDetail} />}
        disabled={isDisabled}
        size={isTabularEdit ? "medium" : undefined}
      />
    </div>
  );
};

export default LinkTextField;
