import React, { ReactNode } from "react";
import { FormField, DEFAULT_FIELDS } from "../../utils/interfaces";
import { DeleteOutline, DragIndicator } from "@mui/icons-material";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Switch,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import Card from "../Card";
import { fieldsIcons } from "../FieldsIcons";
import { fieldIcons, CustomIcon, icons } from "../../theme/icons";
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";

type Props = {
  formField: FormField;
  allFormFields: FormField[];
  showRequiredToggle?: boolean;
  onFieldDelete: () => void;
  onToggleRequired: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children: ReactNode;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
};

export default function FormFieldWrapper({
  formField,
  allFormFields,
  showRequiredToggle = true,
  onFieldDelete,
  onToggleRequired,
  children,
  dragHandleProps,
}: Props) {
  const theme = useTheme();

  // Find the default field using the typeId
  const defaultField = DEFAULT_FIELDS.find((field) => field.typeId === formField.typeId);

  // Get default icon if current icon is invalid or not set
  const fieldIcon =
    formField.fieldIcon && fieldsIcons[formField.fieldIcon]
      ? formField.fieldIcon
      : defaultField?.icon || Object.keys(fieldsIcons)[0];

  // Get default field name if not set
  const fieldName = formField.fieldName || defaultField?.name || "";

  function isParentOfChildren() {
    return allFormFields.some((field) => field.parentFieldId === formField.uniqueId);
  }

  function getTooltipForConnectedFields() {
    const connectedField = "שדה זה מקושר לשדות הבאים:";
    const fields = allFormFields
      .filter((field) => field.parentFieldId === formField.uniqueId)
      .map((field) => field.displayName)
      .join(", ");

    return `${connectedField} ${fields}`;
  }
  const style = {
    backgroundColor: theme.palette.background.paper,
    boxShadow: `0px 4px 20.4px 0px ${theme.palette.shadow}`,
    borderRadius: "8px",
    p: 1,
  };
  return (
    <Box
      sx={{
        gap: 2,
        display: "flex",
        height: "100%",
      }}>
      <Box
        sx={{
          ...style,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          p: 2,
        }}>
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
          color={theme.palette.text.disabled}>
          <Grid container direction="row" gap={0.5} alignItems="center" width="fit-content">
            {fieldsIcons[fieldIcon]}
            {fieldName}
          </Grid>
          <Grid>
            {isParentOfChildren() ? (
              <Tooltip title={getTooltipForConnectedFields()}>
                <IconButton>
                  <CustomIcon iconName="delete" />
                </IconButton>
              </Tooltip>
            ) : (
              <IconButton title="מחיקת שדה" onClick={onFieldDelete} color="error">
                <CustomIcon iconName="delete" forcePointer />
              </IconButton>
            )}
          </Grid>
        </Grid>
        {children}
        {showRequiredToggle && (
          <FormControlLabel
            label={<Typography variant="subtitle1">שדה חובה</Typography>}
            sx={{ alignSelf: "flex-end", color: theme.palette.text.secondary, mt: 1 }}
            control={<Switch checked={formField.required} onChange={onToggleRequired} />}
          />
        )}
      </Box>
      <Box sx={{ ...style }} {...dragHandleProps}>
        <Box
          sx={{
            backgroundColor: theme.palette.shadow,
            height: "100%",
            borderRadius: "8px",
            alignContent: "center",
          }}>
          <DragIndicator />
        </Box>
      </Box>
    </Box>
  );
}
