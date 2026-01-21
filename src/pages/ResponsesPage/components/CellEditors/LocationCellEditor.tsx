import React, { useEffect, useState } from "react";
import { Box, TextField } from "@mui/material";
import { LocationValue } from "@utils/interfaces";
import { utmRegex, wktLatitudeRegexY, wktLongitudeRegexX, preventEnterKeyNavigation } from "@utils/utils";
import { styled } from "@mui/material/styles";

const LocationEditorRoot = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "8px",
});

const LocationErrorText = styled("div")(({ theme }) => ({
    color: theme.palette.error.main,
    fontSize: "0.75rem",
    marginTop: 4,
}));

const LocationInputProps = {
    disableUnderline: true,
    sx: {
        fontSize: "1rem",
        padding: "4px 8px",
    },
};

interface LocationCellEditorProps {
    value: LocationValue;
    onChange: (value: LocationValue, isValid?: boolean) => void;
    coordinateType?: string;
    isRequired?: boolean;
    errorMessage?: string;
}

export const LocationCellEditor: React.FC<LocationCellEditorProps> = ({
    value,
    onChange,
    coordinateType = "WKT",
    isRequired = false,
    errorMessage,
}) => {
    const [latitude, setLatitude] = useState(value?.x || "");
    const [longitude, setLongitude] = useState(value?.y || "");
    const [latitudeError, setLatitudeError] = useState(false);
    const [longitudeError, setLongitudeError] = useState(false);

    useEffect(() => {
        setLatitude(value?.x || "");
        setLongitude(value?.y || "");
    }, [value]);

    const validateLatitude = (val: string): boolean => {
        if (val === "" && !isRequired) return true;
        if (coordinateType === "UTM") return utmRegex.test(val);
        if (coordinateType === "WKT") return wktLatitudeRegexY.test(val);
        return true;
    };

    const validateLongitude = (val: string): boolean => {
        if (val === "" && !isRequired) return true;
        if (coordinateType === "UTM") return utmRegex.test(val);
        if (coordinateType === "WKT") return wktLongitudeRegexX.test(val);
        return true;
    };

    const handleLatitudeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newLatitude = event.target.value;
        setLatitude(newLatitude);
        setLatitudeError(!validateLatitude(newLatitude));
        const isValid = validateLatitude(newLatitude) && validateLongitude(longitude) && !(isRequired && (newLatitude === "" || longitude === ""));
        onChange({ x: newLatitude, y: longitude }, isValid);
    };

    const handleLongitudeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newLongitude = event.target.value;
        setLongitude(newLongitude);
        setLongitudeError(!validateLongitude(newLongitude));
        const isValid = validateLatitude(latitude) && validateLongitude(newLongitude) && !(isRequired && (latitude === "" || newLongitude === ""));
        onChange({ x: latitude, y: newLongitude }, isValid);
    };

    const getPlaceholder = (isLatitude: boolean) => {
        if (coordinateType === "UTM") {
            return isLatitude ? "Y (דוגמה: 500000)" : "X (דוגמה: 200000)";
        }
        return isLatitude ? "Y (דוגמה: 31.5)" : "X (דוגמה: 34.8)";
    };

    return (
        <LocationEditorRoot>
            <TextField
                fullWidth
                placeholder={getPlaceholder(true)}
                value={latitude}
                onChange={handleLatitudeChange}
                onKeyDown={(e) => preventEnterKeyNavigation(e)}
                error={latitudeError}
                helperText={latitudeError ? "ערך לא תקין" : ""}
                variant="standard"
                autoFocus
                InputProps={LocationInputProps}
            />
            <TextField
                fullWidth
                placeholder={getPlaceholder(false)}
                value={longitude}
                onChange={handleLongitudeChange}
                onKeyDown={(e) => preventEnterKeyNavigation(e)}
                error={longitudeError}
                helperText={longitudeError ? "ערך לא תקין" : ""}
                variant="standard"
                InputProps={LocationInputProps}
            />
            {errorMessage && (
                <LocationErrorText>{errorMessage}</LocationErrorText>
            )}
        </LocationEditorRoot>
    );
};
