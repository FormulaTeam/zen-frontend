import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { LocationValue, LocationValueError } from "../../../utils/interfaces";
import classes from "./CustomLatitudeLongitudeField.module.scss";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";
import { utmRegex, wktLatitudeRegexY, wktLongitudeRegexX,latitudeRegexX,latitudeRegexY } from "../../../utils/utils";

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
  coordinateType="UTM",
  isTabularEdit = false,
}) => {

  const [coords, setCoords] = useState<LocationValue>({
    x: value?.x || "",
    y: value?.y || "",
  });

  const [valid, setValid] = useState<LocationValueError>({
    x: true,
    y: true,
  });

  useEffect(() => {
    setValid(isValid);
  }, [isValid]);

  const validateField = (name: "x" | "y", val: string): boolean => {    
    if (val === "" && !isRequired) return true;

    if (coordinateType === "UTM") {
      return name === "x" ? latitudeRegexX.test(val) : latitudeRegexY.test(val);
    }

    if (coordinateType === "WKT") {
      return name === "x" 
        ? wktLongitudeRegexX.test(val) 
        : wktLatitudeRegexY.test(val);
    }

    return true;
  };

  const onChangeHandlerInput = (
    event: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>,
    field: "x" | "y"
  ) => {
    const val = event.target.value;

    setCoords(prev => ({ ...prev, [field]: val }));

    const isFieldValid = validateField(field, val);

    setValid(prev => ({ ...prev, [field]: isFieldValid }));
  };

  useEffect(() => {
    onChangeHandler(coords, valid);
  }, [coords]);
  

  return (
    <div
      className={classes["location-text-field-container"]}
      style={isTabularEdit ? { display: "flex", flexDirection: "column", gap: "4px", width: "100%" } : {}}
    >
      {/* Y FIELD */}
      <Box sx={isTabularEdit ? { width: "100%" } : {}}>
        <BaseFieldInput
          isTabularEdit={isTabularEdit}
          fullWidth
          label={isTabularEdit ? "" : label}
          required={isRequired}
          value={coords.y}
          onChange={(e) => onChangeHandlerInput(e, "y")}
          error={!valid.y}
          helperText={isRequired && !coords.y ? "שדה זה הינו חובה":
            coordinateType === "WKT"
              ? (!valid.y && "יש להזין מספר בין 90- ל90 בפורמט עשרוני תקין")
              : (!valid.y && "חייב להכין מספר בין 0–10,000,000")
          }
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
          value={coords.x}
          required={isRequired}
          onChange={(e) => onChangeHandlerInput(e, "x")}
          error={!valid.x}
          helperText={isRequired && !coords.x ? "שדה זה הינו חובה" :
            coordinateType === "WKT"
              ? (!valid.x && "יש להזין מספר בין 180- ל180 בפורמט עשרוני תקין")
              : (!valid.x && "חייב להכיל 6 ספרות תקינות (100000–900000)")
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
