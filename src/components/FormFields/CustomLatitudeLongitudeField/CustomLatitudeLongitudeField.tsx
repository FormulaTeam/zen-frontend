import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { LocationValue, LocationValueError } from "../../../utils/interfaces";
import classes from "./CustomLatitudeLongitudeField.module.scss";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";
import { utmRegex, wktLatitudeRegexY, wktLongitudeRegexX } from "../../../utils/utils";

type CustomLatitudeLongitudeFieldProps = {
  value: LocationValue;
  isDisabled: boolean;
  onChangeHandler: (value: any, valid: LocationValueError | null) => void;
  isValid: LocationValueError;
  isRequired: boolean;
  label: string;
  coordinateType?: string;
  isTabularEdit?: boolean;
};

const CustomLatitudeLongitudeField: React.FC<CustomLatitudeLongitudeFieldProps> = ({
  value,
  isDisabled,
  onChangeHandler,
  isValid,
  label,
  isRequired,
  coordinateType,
  isTabularEdit = false,
}) => {
  const [latitude, setLatitude] = useState(value?.x || "");
  const [latitudeIsValid, setLatitudeIsValid] = useState(true);

  const [longitude, setLongitude] = useState(value?.y || "");
  const [longitudeIsValid, setLongitudeIsValid] = useState(true);

  useEffect(() => {
    setLatitudeIsValid(isValid.x);
    setLongitudeIsValid(isValid.y);
  }, [isValid]);

  const onChangeLatitudeInputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLatitude(event?.target.value);
    if (event?.target.value === "" && !isRequired) {
      setLatitudeIsValid(true);
      return;
    }
    if (coordinateType === "UTM" && !utmRegex.test(event?.target.value)) {
      setLatitudeIsValid(false);
      return;
    } else {
      setLatitudeIsValid(true);
    }

    if (coordinateType === "WKT" && !wktLatitudeRegexY.test(event?.target.value)) {
      setLatitudeIsValid(false);
      return;
    } else {
      setLatitudeIsValid(true);
    }
  };

  const onChangeLongitudeInputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLongitude(event?.target.value);
    if (event?.target.value === "" && !isRequired) {
      setLongitudeIsValid(true);
      return;
    }
    if (coordinateType === "UTM" && !utmRegex.test(event?.target.value)) {
      setLongitudeIsValid(false);
      return;
    } else {
      setLongitudeIsValid(true);
    }
    if (coordinateType === "WKT" && !wktLongitudeRegexX.test(event?.target.value)) {
      setLongitudeIsValid(false);
      return;
    } else {
      setLongitudeIsValid(true);
    }
  };

  useEffect(() => {
    onChangeHandler({ x: latitude, y: longitude }, { x: latitudeIsValid, y: longitudeIsValid });
  }, [latitude, longitude]);

  return (
    <div className={classes["location-text-field-container"]} style={isTabularEdit ? { display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' } : {}}>
      <Box sx={isTabularEdit ? { width: '100%' } : {}}>
        <BaseFieldInput
          isTabularEdit={isTabularEdit}
          fullWidth={true}
          label={isTabularEdit ? "" : label}
          key={"latitude"}
          required={isRequired}
          value={latitude}
          onChange={onChangeLatitudeInputHandler}
          error={!latitudeIsValid}
          helperText={
            (
              !coordinateType || coordinateType === "UTM"
                ? !latitudeIsValid && "יש להזין שדה עם 6 ספרות בלבד"
                : coordinateType === "WKT"
                ? !latitudeIsValid && "יש להזין מספר בסגנון 34.242342342"
                : " "
            )
          }
          disabled={isDisabled}
          adornment={isTabularEdit ? undefined : "Y"}
          size={isTabularEdit ? "small" : undefined}
          placeholder={isTabularEdit ? "Y" : undefined}
        />
      </Box>

      <Box sx={isTabularEdit ? { width: '100%' } : {}}>
        <BaseFieldInput
          isTabularEdit={isTabularEdit}
          fullWidth={true}
          label={isTabularEdit ? "" : " "}
          value={longitude}
          key={"longitude"}
          onChange={onChangeLongitudeInputHandler}
          error={!longitudeIsValid}
          helperText={
            (
              !coordinateType || coordinateType === "UTM"
                ? !longitudeIsValid && "יש להזין שדה עם 6 ספרות בלבד"
                : coordinateType === "WKT"
                ? !longitudeIsValid && "יש להזין מספר בסגנון 31.235345345"
                : " "
            )
          }
          disabled={isDisabled}
          adornment={isTabularEdit ? undefined : "X"}
          size={isTabularEdit ? "small" : undefined}
          placeholder={isTabularEdit ? "X" : undefined}
        />
      </Box>
    </div>
  );
};

export default CustomLatitudeLongitudeField;
