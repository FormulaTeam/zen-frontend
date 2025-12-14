import { useEffect, useState } from "react";
import CustomTextField from "./CustomTextField";
import { Box, Typography } from "@mui/material";
import { GenericFieldsProps } from "../../interfaces/GenericFieldsProps";

interface CustomLocationFieldProps extends GenericFieldsProps {
  latitudeError?: boolean;
  latitudeHelperText?: string | false;
  longitudeError?: boolean;
  longitudeHelperText?: string | false;
}
const CustomLocationField: React.FC<CustomLocationFieldProps> = ({
  label,
  required,
  value = { latitude: "", longitude: "" },
  onChange,
  onBlur,
  key,
  latitudeError,
  latitudeHelperText,
  longitudeError,
  longitudeHelperText,
}) => {
  const [latitude, setLatitude] = useState(value.latitude);
  const [longitude, setLongitude] = useState(value.longitude);

  useEffect(() => {
    onChange({ latitude, longitude });
  }, [latitude, longitude]);

  useEffect(() => {
    setLatitude(value.latitude);
    setLongitude(value.longitude);
  }, [value]);

  return (
    <Box display="flex" gap={2} width="100%">
      <CustomTextField
        key={key}
        label={label}
        required={required}
        value={latitude}
        onChange={(e) => setLatitude(e.target.value)}
        error={latitudeError}
        helperText={latitudeHelperText}
        onBlur={onBlur}
        endAdornment={<Typography variant="subtitle2">Y</Typography>}
      />
      <CustomTextField
        label={label}
        key={key + "-linkTxt"}
        required={required}
        value={longitude}
        onChange={(e) => setLongitude(e.target.value)}
        error={longitudeError}
        helperText={longitudeHelperText}
        onBlur={onBlur}
        endAdornment={<Typography variant="subtitle2">X</Typography>}
      />
    </Box>
  );
};

export default CustomLocationField;
