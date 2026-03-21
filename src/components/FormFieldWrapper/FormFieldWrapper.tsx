import React, { ReactNode } from "react";
import { FORM_ELEMENTS } from "../../utils/interfaces";
import { DragIndicator } from "@mui/icons-material";
import {
  Box,
  FormControlLabel,
  Grid,
  IconButton,
  Switch,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { FORM_ELEMENT_ICONS } from "../FORM_ELEMENT_ICONS";
import { CustomIcon } from "../../theme/icons";
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { FormFieldDto } from "../../types/shared";

type FormFieldWrapperExtra = {
  parentFieldId?: string;
  fieldIcon?: string;
  fieldName?: string;
};

type Props = {
  formField: FormFieldDto;
  allFormFields: FormFieldDto[];
  showRequiredToggle?: boolean;
  onFieldDelete: () => void;
  onToggleRequired: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children: ReactNode;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
};

const getFieldExtra = (field: FormFieldDto): FormFieldWrapperExtra =>
  (field.extra as FormFieldWrapperExtra | undefined) ?? {};

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
  const formFieldExtra = getFieldExtra(formField);

  const defaultField = FORM_ELEMENTS[formField.fieldType];

  const fieldIcon =
    formFieldExtra.fieldIcon && FORM_ELEMENT_ICONS[formFieldExtra.fieldIcon]
      ? formFieldExtra.fieldIcon
      : defaultField?.icon || Object.keys(FORM_ELEMENT_ICONS)[0];

  const fieldName = formFieldExtra.fieldName || defaultField?.name || "";

  function isParentOfChildren() {
    return allFormFields.some((field) => getFieldExtra(field).parentFieldId === formField.id);
  }

  function getTooltipForConnectedFields() {
    const connectedField = "שדה זה מקושר לשדות הבאים:";
    const fields = allFormFields
      .filter((field) => getFieldExtra(field).parentFieldId === formField.id)
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
            {FORM_ELEMENT_ICONS[fieldIcon]}
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
            control={<Switch checked={formField.isRequired} onChange={onToggleRequired} />}
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
