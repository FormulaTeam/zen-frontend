import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { LocationValue, LocationValueError } from "../../../utils/interfaces";
import classes from "./CustomLatitudeLongitudeField.module.scss";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";
import FieldErrorText from "../FieldErrorText/FieldErrorText";

type FieldErrorDisplay = {
  message?: string;
  detail?: string;
};

type CustomLatitudeLongitudeFieldProps = {
  value: LocationValue;
  isDisabled: boolean;
  onChangeHandler: (value: LocationValue) => void;
  onBlurHandler?: () => void;
  errors?: LocationValueError | null;
  errorDetail?: FieldErrorDisplay | null;
  isRequired: boolean;
  label: string;
  locationFormat?: "utm" | "wkt";
  isTabularEdit?: boolean;
};

const CustomLatitudeLongitudeField: React.FC<CustomLatitudeLongitudeFieldProps> = ({
  value,
  isDisabled,
  onChangeHandler,
  onBlurHandler,
  errors,
  errorDetail,
  label,
  isRequired,
  locationFormat = "utm",
  isTabularEdit = false,
}) => {
  const [yValue, setYValue] = useState(value?.y || "");
  const [xValue, setXValue] = useState(value?.x || "");

  const locationPlaceholder = locationFormat === "wkt" ? "34.781256" : "123456";

  useEffect(() => {
    setYValue(value?.y || "");
    setXValue(value?.x || "");
  }, [value?.x, value?.y]);

  const handleYChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextY = event.target.value;
    setYValue(nextY);
    onChangeHandler({ x: xValue, y: nextY });
  };

  const handleXChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextX = event.target.value;
    setXValue(nextX);
    onChangeHandler({ x: nextX, y: yValue });
  };

  const shouldShowGeneralOnBoth = !errors?.x && !errors?.y && !!errors?.general;

  const yMessage = errors?.y || (shouldShowGeneralOnBoth ? errors?.general : undefined);
  const xMessage = errors?.x || (shouldShowGeneralOnBoth ? errors?.general : undefined);

  return (
    <div
      className={classes["location-text-field-container"]}
      style={
        isTabularEdit ? { display: "flex", flexDirection: "column", gap: "4px", width: "100%" } : {}
      }>
      <Box sx={isTabularEdit ? { width: "100%" } : {}}>
        <BaseFieldInput
          isTabularEdit={isTabularEdit}
          fullWidth={true}
          label={isTabularEdit ? "" : label}
          required={isRequired}
          value={yValue}
          onChange={handleYChange}
          onBlur={onBlurHandler}
          error={Boolean(yMessage)}
          helperText={<FieldErrorText message={yMessage} detail={errorDetail?.detail} />}
          disabled={isDisabled}
          adornment={isTabularEdit ? undefined : "Y"}
          size={isTabularEdit ? "small" : undefined}
          placeholder={isTabularEdit ? `Y - ${locationPlaceholder}` : locationPlaceholder}
        />
      </Box>

      <Box sx={isTabularEdit ? { width: "100%" } : {}}>
        <BaseFieldInput
          isTabularEdit={isTabularEdit}
          fullWidth={true}
          label={isTabularEdit ? "" : " "}
          value={xValue}
          onChange={handleXChange}
          onBlur={onBlurHandler}
          error={Boolean(xMessage)}
          helperText={<FieldErrorText message={xMessage} detail={errorDetail?.detail} />}
          disabled={isDisabled}
          adornment={isTabularEdit ? undefined : "X"}
          size={isTabularEdit ? "small" : undefined}
          placeholder={isTabularEdit ? `X - ${locationPlaceholder}` : locationPlaceholder}
        />
      </Box>
    </div>
  );
};

export default CustomLatitudeLongitudeField;
