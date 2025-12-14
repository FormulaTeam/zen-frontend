import { Box } from "@mui/material";
import CustomTextField from "./CustomTextField";
import { LinkValue } from "@utils/interfaces";
import { useEffect, useState } from "react";
import { GenericFieldsProps } from "../../interfaces/GenericFieldsProps";

interface CustomLinkFieldProps extends GenericFieldsProps {
  value: LinkValue;
  linkError?: boolean;
  linkHelperText?: string | false;
  linkTxtError?: boolean;
  linkTxtHelperText?: string | false;
}
const CustomLinkField: React.FC<CustomLinkFieldProps> = ({
  label,
  required,
  type = "text",
  value = { link: "", linkTxt: "" },
  onChange,
  linkError,
  linkHelperText,
  linkTxtError,
  linkTxtHelperText,
  onBlur,
  key,
}) => {
  const [link, setLink] = useState(value.link);
  const [linkTxt, setLinkTxt] = useState(value.linkTxt);

  useEffect(() => {
    onChange({ link, linkTxt });
  }, [link, linkTxt]);

  useEffect(() => {
    setLink(value.link);
    setLinkTxt(value.linkTxt);
  }, [value]);

  return (
    <Box display="flex" gap={2} width="100%">
      <CustomTextField
        key={key}
        label={label}
        required={required}
        type={type}
        value={link}
        onChange={(e) => setLink(e.target.value)}
        error={linkError}
        helperText={linkHelperText}
        onBlur={onBlur}
      />
      <CustomTextField
        key={key + "-linkTxt"}
        label={"טקסט להיפר-קישור"}
        required={required}
        type={type}
        value={linkTxt}
        onChange={(e) => setLinkTxt(e.target.value)}
        error={linkTxtError}
        helperText={linkTxtHelperText}
        onBlur={onBlur}
      />
    </Box>
  );
};

export default CustomLinkField;
