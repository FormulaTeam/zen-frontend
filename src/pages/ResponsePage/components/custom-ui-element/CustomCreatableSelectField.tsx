import { IconButton, InputAdornment, Tooltip, Typography, useTheme } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomTextField from "./CustomTextField";
import { GenericFieldsProps } from "../../interfaces/GenericFieldsProps";

type ListItem = {
  index: number;
  value: string;
};

const CustomCreatableSelectField: React.FC<GenericFieldsProps> = ({
  value,
  onChange,
  label,
  required,
  error,
  helperText,
}) => {
  const theme = useTheme();

  const [inputValue, setInputValue] = useState("");
  const [listValues, setListValues] = useState<string[]>(value || []);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      onPlusClickHandler();
    }
  };

  // const onPlusClickHandler = () => {
  //   if (inputValue.trim() === "") {
  //     return;
  //   }
  //   setListValues((prev) => [...prev, inputValue]);
  //   setInputValue("");
  // };

  // const onDeleteListItemClickHandler = (item: ListItem) => {
  //   const newListValueArray = listValues.filter((listItem, index) => index !== item.index);
  //   setListValues(newListValueArray);
  // };

  // useEffect(() => {
  //   onChange(listValues);
  // }, [listValues]);
  const onPlusClickHandler = () => {
    if (inputValue.trim() === "") return;
    setListValues((prev) => {
      const next = [...prev, inputValue];
      onChange(next);
      return next;
    });
    setInputValue("");
  };

  const onDeleteListItemClickHandler = (item: ListItem) => {
    setListValues((prev) => {
      const next = prev.filter((_, i) => i !== item.index);
      onChange(next);
      return next;
    });
  };

  useEffect(() => {
    setListValues(value);
  }, [value]);

  return (
    <div className="multi-value-input-container">
      <CustomTextField
        label={label}
        ref={inputRef}
        required={required}
        value={inputValue}
        onKeyDown={handleKeyUp}
        onChange={(event) => setInputValue(event.target.value)}
        error={!!error}
        helperText={helperText}
        endAdornment={
          <InputAdornment position="end">
            <IconButton onClick={onPlusClickHandler} edge="end">
              <AddIcon />
            </IconButton>
          </InputAdornment>
        }
      />
      {listValues && listValues.length > 0 && (
        <ul
          className="multi-input-field-list-items"
          style={{
            backgroundColor: theme.darkPaper,
          }}>
          {listValues.map((value, index) => {
            return (
              <li key={index}>
                <Tooltip title={value}>
                  <Typography>{value}</Typography>
                </Tooltip>
                <div>
                  <IconButton onClick={() => onDeleteListItemClickHandler({ index, value })}>
                    <DeleteIcon />
                  </IconButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CustomCreatableSelectField;
