import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { LocationValue, LocationValueError } from "../../../utils/interfaces";
import classes from "./CustomLatitudeLongitudeField.module.scss";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";

type CustomLatitudeLongitudeFieldProps = {
  value: LocationValue;
  isDisabled: boolean;
  onChangeHandler: (value: LocationValue) => void;
  errors?: LocationValueError | null;
  isRequired: boolean;
  label: string;
  coordinateType?: string;
  isTabularEdit?: boolean;
};

const CustomLatitudeLongitudeField: React.FC<CustomLatitudeLongitudeFieldProps> = ({
  value,
  isDisabled,
  onChangeHandler,
  errors,
  label,
  isRequired,
  isTabularEdit = false,
}) => {
  const [yValue, setYValue] = useState(value?.y || "");
  const [xValue, setXValue] = useState(value?.x || "");

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
          error={Boolean(errors?.y || errors?.general)}
          helperText={errors?.y || errors?.general || " "}
          disabled={isDisabled}
          adornment={isTabularEdit ? undefined : "Y"}
          size={isTabularEdit ? "small" : undefined}
          placeholder={isTabularEdit ? "Y" : undefined}
        />
      </Box>

      <Box sx={isTabularEdit ? { width: "100%" } : {}}>
        <BaseFieldInput
          isTabularEdit={isTabularEdit}
          fullWidth={true}
          label={isTabularEdit ? "" : " "}
          value={xValue}
          onChange={handleXChange}
          error={Boolean(errors?.x || errors?.general)}
          helperText={errors?.x || errors?.general || " "}
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
