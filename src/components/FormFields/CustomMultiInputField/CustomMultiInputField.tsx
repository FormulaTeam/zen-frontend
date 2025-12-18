import {
  IconButton,
  InputAdornment,
  Tooltip,
  Typography,
  useTheme,
  MenuItem,
  Box,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CheckIcon from "@mui/icons-material/Check";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import "./CustomMultiInputField.scss";
import { CustomInputFormFieldProps } from "../../../utils/interfaces";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";

type ListItem = {
  index: number;
  value: string;
};

interface CustomMultiInputFieldProps extends CustomInputFormFieldProps {
  value: any;
  isTabularEdit?: boolean;
}

const CustomMultiInputField: React.FC<CustomMultiInputFieldProps> = ({
  value,
  isDisabled,
  onChangeHandler,
  isValid,
  label,
  isRequired,
  isTabularEdit = false,
}) => {
  const theme = useTheme();

  const errorMessageNoInputText = "לא ניתן לשמור שדה ריק";

  const [inputValue, setInputValue] = useState("");
  const [listValues, setListValues] = useState<string[]>([]);

  const [isEditItemMode, setIsEditItemMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ListItem>();

  const [errorMessage, setErrorMessage] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSuccessIcon, setShowSuccessIcon] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const [showInputInTabular, setShowInputInTabular] = useState(false);

  const handleDropdownEdit = (value: string, index: number) => {
    setSelectedItem({ index, value });
    setIsEditItemMode(true);
    setInputValue(value);
    setDropdownOpen(false);
    setShowInputInTabular(true);
    setTimeout(() => {
      inputRef?.current?.focus();
    }, 100);
  };

  const handleDropdownDelete = (index: number) => {
    const newListValueArray = listValues.filter((_, i) => i !== index);
    setListValues(newListValueArray);
    setDropdownOpen(false);
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (isEditItemMode) {
        onSaveEditedListItemClickHandler();
      } else {
        onPlusClickHandler();
      }
    }
  };

  const onChangeValueHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const onPlusClickHandler = () => {
    if (inputValue.trim() === "") {
      setErrorMessage(errorMessageNoInputText);
      return;
    }
    setListValues((prev) => [...prev, inputValue]);
    setInputValue("");
    setErrorMessage("");

    if (isTabularEdit) {
      setShowSuccessIcon(true);
      setShowInputInTabular(false);
      setTimeout(() => {
        setShowSuccessIcon(false);
      }, 1000);
    }
  };

  const onSaveEditedListItemClickHandler = () => {
    if (selectedItem?.index === undefined) return;
    if (inputValue.trim() === "") {
      setErrorMessage(errorMessageNoInputText);
      return;
    }

    setListValues((prevListValues) =>
      prevListValues.map((item, index) => (index === selectedItem.index ? inputValue : item)),
    );

    setSelectedItem(undefined);
    setIsEditItemMode(false);
    setInputValue("");
    if (isTabularEdit) {
      setShowInputInTabular(false);
    }
    setErrorMessage("");
  };

  const onEditListItemClickHandler = (item: ListItem) => {
    setSelectedItem(item);
    setIsEditItemMode(true);
    setInputValue(item.value);
    inputRef?.current?.focus();
  };

  const onDeleteListItemClickHandler = (item: ListItem) => {
    const newListValueArray = listValues.filter((listItem, index) => index !== item.index);
    if (newListValueArray.length <= 0 && isRequired) {
      setErrorMessage("נדרש להזין לפחות ערך אחד");
    }
    setListValues(newListValueArray);
  };

  useEffect(() => {
    if (listValues.length <= 0 && isRequired) {
      !isValid && setErrorMessage("נדרש להזין לפחות ערך אחד");
    }
    onChangeHandler(listValues, errorMessage ? false : true);
  }, [listValues, errorMessage, isValid]);

  useEffect(() => {
    if (value && listValues.length === 0) {
      setListValues(value);
    }
  }, []);

  return (
    <div
      className="multi-value-input-container"
      style={{
        ...(isTabularEdit && {
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }),
      }}>
      <BaseFieldInput
        isTabularEdit={isTabularEdit}
        fullWidth={true}
        label={
          isTabularEdit && isEditItemMode
            ? ""
            : isTabularEdit && showInputInTabular
            ? ""
            : isTabularEdit
            ? ""
            : label
        }
        inputRef={inputRef}
        required={isRequired}
        value={inputValue}
        onChange={onChangeValueHandler}
        error={errorMessage ? true : false}
        helperText={errorMessage}
        disabled={isDisabled}
        onKeyUp={handleKeyUp}
        size={isTabularEdit ? "medium" : undefined}
        sx={{
          ...(isTabularEdit && {
            "& .MuiInputBase-root": {
              fontSize: "1rem",
              minHeight: "40px",
              display: "flex",
              alignItems: "center",
              "&::before": {
                border: "none",
              },
              "&::after": {
                border: "none",
              },
              "&:hover:not(.Mui-disabled)::before": {
                border: "none",
              },
            },
            "& .MuiInputBase-input": {
              textAlign: "center",
              padding: "8px 12px",
            },
            "& .MuiFormLabel-root": {
              display: "none",
            },
            "& .MuiFormHelperText-root": {
              fontSize: "0.85rem",
              margin: "4px 0 0 0",
              lineHeight: "1.2",
              minHeight: "auto",
              textAlign: "center",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            },
          }),
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <div style={{ display: "flex", alignItems: "center" }}>
                {!isDisabled && (
                  <IconButton
                    sx={{
                      p: 0,
                      ...(isTabularEdit && {
                        "& svg": { fontSize: "16px" },
                      }),
                    }}
                    onClick={isEditItemMode ? onSaveEditedListItemClickHandler : onPlusClickHandler}
                    edge="end">
                    {isEditItemMode ? (
                      <SaveIcon />
                    ) : showSuccessIcon && isTabularEdit ? (
                      <CheckIcon />
                    ) : (
                      <AddIcon />
                    )}
                  </IconButton>
                )}
                {isTabularEdit &&
                  listValues.length > 0 &&
                  !isEditItemMode &&
                  !showInputInTabular && (
                    <IconButton
                      size="small"
                      onClick={() => setDropdownOpen(true)}
                      sx={{
                        ml: 0.5,
                        "& svg": { fontSize: "16px" },
                      }}>
                      <KeyboardArrowDownIcon />
                    </IconButton>
                  )}
              </div>
            </InputAdornment>
          ),
        }}
        select={isTabularEdit && listValues.length > 0 && dropdownOpen}
        SelectProps={
          isTabularEdit && listValues.length > 0 && dropdownOpen
            ? {
                open: true,
                onClose: () => setDropdownOpen(false),
                MenuProps: {
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                    },
                  },
                },
              }
            : undefined
        }>
        {isTabularEdit &&
          listValues.length > 0 &&
          dropdownOpen &&
          listValues.map((value, index) => (
            <MenuItem key={index} value={value} onClick={() => setDropdownOpen(false)}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}>
                <span style={{ flex: 1, textAlign: "right" }}>{value}</span>
                <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDropdownEdit(value, index);
                    }}
                    sx={{ "& svg": { fontSize: "14px" } }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDropdownDelete(index);
                    }}
                    sx={{ "& svg": { fontSize: "14px" } }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </MenuItem>
          ))}
      </BaseFieldInput>

      {(!isTabularEdit || isEditItemMode) && (
        <ul
          className="multi-input-field-list-items"
          style={{
            backgroundColor: theme.darkPaper,
            ...(isTabularEdit && {
              maxHeight: "60px",
              overflowY: "auto",
              padding: "2px 0",
              margin: 0,
            }),
          }}>
          {listValues.length > 0 &&
            listValues.map((value, index) => {
              return (
                <li
                  key={index}
                  style={{
                    ...(isTabularEdit && {
                      minHeight: "24px",
                      padding: "2px 4px",
                      fontSize: "0.8rem",
                    }),
                  }}>
                  <Tooltip title={value}>
                    <Typography
                      className={selectedItem?.index === index ? "is-edit" : ""}
                      sx={{
                        ...(isTabularEdit && {
                          fontSize: "0.75rem",
                          lineHeight: 1.2,
                        }),
                      }}>
                      {value}
                    </Typography>
                  </Tooltip>

                  {!isDisabled && (
                    <div>
                      <IconButton
                        onClick={() => onEditListItemClickHandler({ index, value })}
                        sx={{
                          ...(isTabularEdit && {
                            padding: "2px",
                            "& svg": { fontSize: "14px" },
                          }),
                        }}>
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        onClick={() => onDeleteListItemClickHandler({ index, value })}
                        sx={{
                          ...(isTabularEdit && {
                            padding: "2px",
                            "& svg": { fontSize: "14px" },
                          }),
                        }}>
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  )}
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
};

export default CustomMultiInputField;
