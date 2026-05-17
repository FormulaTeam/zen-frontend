import React from "react";
import { Chip, FormControl } from "@mui/material";
import { StatusCodes } from "http-status-codes";
import { useGetInfiniteFieldValues } from "../../api/responsesApi";
import {
    StyledAutocomplete,
    StyledFormHelperText,
    StyledInputLabel,
    StyledListbox,
    StyledTextField,
} from "../FormFields/CustomDropDownAutocomplete/styled";
import FieldErrorText from "../FormFields/FieldErrorText/FieldErrorText";

export const ConnectedDropDownAutocomplete = (props: any) => {
    const {
        connectedFormId,
        connectedFieldId,
        selectedValues,
        multipleOptions,
        isDisabled,
        label,
        isRequired,
        isTabularEdit,
        validationMessage,
        validationDetail,
        onChangeHandler,
        onBlurHandler,
    } = props;

    const [searchTerm, setSearchTerm] = React.useState("");

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
        useGetInfiniteFieldValues(connectedFormId, connectedFieldId, searchTerm);

    const isPermissionError: boolean =
        (error as any)?.response?.status === StatusCodes.FORBIDDEN;

    const availableOptions = React.useMemo(() => {
        const fetchedOptions =
            data?.pages.flatMap((page) => page.data.map((item: any) => String(item.value))) || [];
        const selectedArray = Array.isArray(selectedValues)
            ? selectedValues
            : [selectedValues].filter(Boolean);
        return [...new Set([...fetchedOptions, ...selectedArray])];
    }, [data, selectedValues]);

    const normalizedValue = multipleOptions
        ? Array.isArray(selectedValues)
            ? selectedValues
            : []
        : typeof selectedValues === "string"
            ? selectedValues
            : "";

    const handleListboxScroll = (event: React.UIEvent<HTMLUListElement>) => {
        const node = event.currentTarget;
        if (hasNextPage && !isFetchingNextPage && node.scrollTop + node.clientHeight >= node.scrollHeight - 10) {
            fetchNextPage();
        }
    };

    return (
        <FormControl fullWidth variant="standard" sx={{ gap: "6px" }}>
            {!isTabularEdit && (
                <StyledInputLabel
                    shrink
                    error={Boolean(validationMessage)}
                    required={isRequired}
                    id={`select-helper-label-${label}`}>
                    {label}
                </StyledInputLabel>
            )}
            <StyledAutocomplete
                disabled={isDisabled}
                multiple={multipleOptions}
                options={availableOptions}
                value={normalizedValue}
                loading={isLoading || isFetchingNextPage}
                noOptionsText={isPermissionError ? "אין לך הרשאה למקור האפשרויות" : "אין תוצאות"}
                filterOptions={(options: unknown[]) => options}
                onInputChange={(_event, value, reason) => {
                    if (reason === "input") setSearchTerm(value);
                    else if (reason === "clear") setSearchTerm("");
                }}
                onChange={(_event, newValue) => {
                    if (multipleOptions) {
                        onChangeHandler(Array.isArray(newValue) ? newValue : []);
                    } else {
                        onChangeHandler(typeof newValue === "string" ? newValue : "");
                    }
                }}
                onClose={() => {
                    setSearchTerm("");
                    onBlurHandler?.();
                }}
                getOptionLabel={(option: any) => String(option)}
                isOptionEqualToValue={(option: any, val: any) => option === val}
                size={isTabularEdit ? "small" : "medium"}
                slotProps={{
                    listbox: {
                        component: StyledListbox,
                        onScroll: handleListboxScroll,
                        sx: {
                            p: "6px",
                            "& .MuiAutocomplete-option": {
                                minHeight: "40px",
                                borderRadius: "8px",
                                px: "10px",
                                py: "7px",
                                fontSize: "0.95rem",
                                justifyContent: "flex-start",
                                '&[aria-selected="true"]': { fontWeight: 600 },
                            },
                        },
                    },
                    paper: {
                        sx: {
                            mt: "6px",
                            borderRadius: "12px",
                            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.14)",
                            border: "1px solid",
                            borderColor: "divider",
                            overflow: "hidden",
                        },
                    },
                    clearIndicator: { title: "" },
                    popupIndicator: { title: "" },
                }}
                sx={{
                    width: "100%",
                    "& .MuiAutocomplete-inputRoot": {
                        minHeight: isTabularEdit ? "40px" : "46px",
                        borderRadius: isTabularEdit ? "0" : "12px",
                        backgroundColor: isTabularEdit ? "transparent" : "background.paper",
                        border: isTabularEdit ? "none" : "1px solid",
                        borderColor: validationMessage ? "error.main" : "divider",
                        px: isTabularEdit ? "6px" : "12px",
                        py: multipleOptions ? "6px" : "0",
                        "&:before, &:after": { display: "none" },
                        "&:hover": {
                            borderColor: validationMessage ? "error.main" : "text.secondary",
                            backgroundColor: isTabularEdit ? "transparent" : "action.hover",
                        },
                        "&.Mui-focused": {
                            borderColor: validationMessage ? "error.main" : "primary.main",
                            boxShadow: validationMessage
                                ? "0 0 0 3px rgba(211, 47, 47, 0.12)"
                                : "0 0 0 3px rgba(25, 118, 210, 0.14)",
                            backgroundColor: "background.paper",
                        },
                        "&.Mui-disabled": {
                            backgroundColor: isTabularEdit ? "transparent" : "action.disabledBackground",
                            opacity: 0.75,
                        },
                    },
                    "& .MuiAutocomplete-input": {
                        textAlign: isTabularEdit ? "center" : "right",
                        fontSize: isTabularEdit ? "1rem" : "0.98rem",
                        color: "text.primary",
                        py: "8px !important",
                    },
                    "& .MuiAutocomplete-endAdornment": { left: "8px", right: "auto" },
                }}
                renderTags={(tagValue: any, getTagProps) =>
                    tagValue.map((option: string, index: number) => {
                        const { key, ...tagProps } = getTagProps({ index });
                        return (
                            <Chip
                                key={key}
                                label={option}
                                {...tagProps}
                                size={isTabularEdit ? "small" : "medium"}
                                sx={{
                                    borderRadius: "8px",
                                    fontSize: isTabularEdit ? "0.82rem" : "0.9rem",
                                    fontWeight: 500,
                                    height: isTabularEdit ? "24px" : "28px",
                                    backgroundColor: "action.selected",
                                    maxWidth: "140px",
                                    "& .MuiChip-label": { px: "8px", overflow: "hidden", textOverflow: "ellipsis" },
                                    "& .MuiChip-deleteIcon": { mx: "2px", fontSize: "18px" },
                                }}
                            />
                        );
                    })
                }
                renderInput={(params) => (
                    <StyledTextField
                        {...params}
                        required={isRequired}
                        error={Boolean(validationMessage)}
                        variant="standard"
                        onBlur={() => onBlurHandler?.()}
                    />
                )}
            />
            {!isTabularEdit && validationMessage && (
                <StyledFormHelperText
                    sx={{
                        minHeight: "18px",
                        mt: "2px",
                        mx: 0,
                        fontSize: "0.82rem",
                        lineHeight: 1.35,
                        color: "error.main",
                        textAlign: "right",
                    }}>
                    <FieldErrorText message={validationMessage} detail={validationDetail} />
                </StyledFormHelperText>
            )}
        </FormControl>
    );
};
