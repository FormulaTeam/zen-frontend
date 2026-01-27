import React, { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import classes from "./CustomLatitudeLongitudeField.module.scss";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";
import { LocationValue } from "../../../utils/interfaces";
import { LocationValidity } from "../../../hooks/useResponseState";

type CustomLatitudeLongitudeFieldProps = {
  value: LocationValue | undefined | null;
  isDisabled: boolean;
  onChangeHandler: (value: any, valid: any) => void;
  isValid: any;
  isRequired: boolean;
  label: string;
  coordinateType?: string;
  isTabularEdit?: boolean;

  touched?: boolean;
  onBlur?: (part: "x" | "y") => void;

  errorMessage?: string;
};

const normalize = (xRaw: string, yRaw: string) => {
  const x = (xRaw ?? "").trim();
  const y = (yRaw ?? "").trim();
  const bothEmpty = x === "" && y === "";
  return bothEmpty ? undefined : { x, y };
};

const CustomLatitudeLongitudeField: React.FC<CustomLatitudeLongitudeFieldProps> = ({
  value,
  isDisabled,
  onChangeHandler,
  isValid,
  label,
  isRequired,
  isTabularEdit = false,
  touched = false,
  onBlur,
}) => {
  const [coords, setCoords] = useState<{ x: string; y: string }>(() => ({
    x: value?.x ?? "",
    y: value?.y ?? "",
  }));

  useEffect(() => {
    setCoords({
      x: value?.x ?? "",
      y: value?.y ?? "",
    });
  }, [value?.x, value?.y]);

  const v: LocationValidity = useMemo(() => {
    if (isValid && typeof isValid === "object" && "x" in isValid && "y" in isValid) {
      return isValid as LocationValidity;
    }
    return { x: true, y: true };
  }, [isValid]);

  const showXError = touched && v.x === false;
  const showYError = touched && v.y === false;

  const xHelper = showXError ? v.xMsg || " " : " ";
  const yHelper = showYError ? v.yMsg || " " : " ";

  const pushUp = (nextCoords: { x: string; y: string }) => {
    const normalized = normalize(nextCoords.x, nextCoords.y);
    onChangeHandler(normalized, true);
  };

  const onChange = (field: "x" | "y") => (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;

    setCoords((prev) => {
      const next = { ...prev, [field]: val };
      pushUp(next);
      return next;
    });
  };

  const handleBlur = (part: "x" | "y") => {
    onBlur?.(part);
    onChangeHandler(normalize(coords.x, coords.y), true);
  };

  return (
    <div
      className={classes["location-text-field-container"]}
      style={
        isTabularEdit ? { display: "flex", flexDirection: "column", gap: "4px", width: "100%" } : {}
      }>
      {/* Y FIELD */}
      <Box sx={isTabularEdit ? { width: "100%" } : {}}>
        <BaseFieldInput
          isTabularEdit={isTabularEdit}
          fullWidth
          label={isTabularEdit ? "" : label}
          required={isRequired}
          value={coords.y}
          onChange={onChange("y")}
          onBlur={() => handleBlur("y")}
          error={showYError}
          helperText={yHelper}
          disabled={isDisabled}
          adornment={isTabularEdit ? undefined : "Y"}
          size={isTabularEdit ? "small" : undefined}
          placeholder={isTabularEdit ? "Y" : undefined}
        />
      </Box>

      {/* X FIELD */}
      <Box sx={isTabularEdit ? { width: "100%" } : {}}>
        <BaseFieldInput
          isTabularEdit={isTabularEdit}
          fullWidth
          label={isTabularEdit ? "" : " "}
          required={isRequired}
          value={coords.x}
          onChange={onChange("x")}
          onBlur={() => handleBlur("x")}
          error={showXError}
          helperText={xHelper}
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
