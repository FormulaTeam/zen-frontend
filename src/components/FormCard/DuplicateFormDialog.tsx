import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { FormMetadataSchema } from "@pages/FormEditor/schemas/metadata";
import type { DuplicateFormSelections } from "@pages/FormEditor/utils/duplicateForm";

const DUPLICATE_SUFFIX = " העתק";
const FIELDS_DEPENDENCY_HINT = "ניתן לבחור לאחר הוספת שדות בשכפול";
const selectedInputSx = {
  backgroundColor: "#F1F5F9",
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#FFFFFF",
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#CAD5E2",
      borderWidth: "2px",
    },
  },
  "& .MuiFormHelperText-root": {
    backgroundColor: "#F1F5F9",
    margin: "4px 0 0",
    paddingInline: "14px",
  },
};

const initialSelections: DuplicateFormSelections = {
  name: true,
  description: true,
  permissions: true,
  fields: true,
  conditions: true,
  colors: true,
};

const checklistSelectionKeys: Array<keyof DuplicateFormSelections> = [
  "permissions",
  "fields",
  "conditions",
  "colors",
];

type DuplicateFormDialogProps = {
  open: boolean;
  formName: string;
  formDescription?: string | null;
  onClose: () => void;
  onDuplicateError?: (error: unknown) => void;
  onDuplicate: (params: {
    selections: DuplicateFormSelections;
    duplicateName: string;
    duplicateDescription: string;
  }) => Promise<void>;
};

const checklistItems: Array<{
  key: keyof DuplicateFormSelections;
  label: string;
  description: string;
  dependsOnFields?: boolean;
}> = [
    {
      key: "permissions",
      label: "הרשאות",
      description: "משתמשים והרשאות גישה לטופס יועתקו לטופס החדש.",
    },
    {
      key: "fields",
      label: "שדות ומקטעים",
      description: "כל השדות והמקטעים יועתקו לטופס החדש.",
    },
    {
      key: "conditions",
      label: "התניות",
      description: "התניות יועתקו יחד עם השדות הרלוונטיים בלבד.",
      dependsOnFields: true,
    },
    {
      key: "colors",
      label: "צבעים",
      description: "חוקי צבע ותצוגה בטבלה יועתקו לטופס החדש.",
      dependsOnFields: true,
    },
  ];

function DuplicateFormDialog({
  open,
  formName,
  formDescription,
  onClose,
  onDuplicateError,
  onDuplicate,
}: DuplicateFormDialogProps) {
  const [selections, setSelections] = useState<DuplicateFormSelections>(initialSelections);
  const [duplicateName, setDuplicateName] = useState(`${formName}${DUPLICATE_SUFFIX}`);
  const [duplicateDescription, setDuplicateDescription] = useState(formDescription ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [descriptionTouched, setDescriptionTouched] = useState(false);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setSelections(initialSelections);
    setDuplicateName(`${formName}${DUPLICATE_SUFFIX}`);
    setDuplicateDescription(formDescription ?? "");
    setIsSubmitting(false);
    setNameTouched(false);
    setDescriptionTouched(false);
  }, [formDescription, formName, open]);

  const allMainItemsSelected = useMemo(
    () => checklistSelectionKeys.every((key) => selections[key]),
    [selections],
  );

  const hasChecklistSelection = checklistSelectionKeys.some((key) => selections[key]);

  const nameValidation = FormMetadataSchema.shape.title.safeParse(duplicateName);
  const shouldShowNameError = nameTouched && !nameValidation.success;
  const nameError = shouldShowNameError
    ? nameValidation.error.issues[0]?.message
    : "";
  const descriptionValidation = FormMetadataSchema.shape.description.safeParse(
    duplicateDescription.trim() || undefined,
  );
  const shouldShowDescriptionError =
    descriptionTouched
    && duplicateDescription.trim() !== ""
    && !descriptionValidation.success;
  const descriptionError = shouldShowDescriptionError
    ? descriptionValidation.error.issues[0]?.message
    : "";
  const hasMetadataValidationError = !nameValidation.success || !descriptionValidation.success;

  const updateSelection = (key: keyof DuplicateFormSelections, checked: boolean) => {
    setSelections((prev) => {
      if (key === "fields" && !checked) {
        return {
          ...prev,
          fields: false,
          conditions: false,
          colors: false,
        };
      }

      return {
        ...prev,
        [key]: checked,
      };
    });
  };

  const toggleAll = (checked: boolean) => {
    setSelections(
      checked
        ? initialSelections
        : {
          name: true,
          description: true,
          permissions: false,
          fields: false,
          conditions: false,
          colors: false,
        },
    );
  };

  const handleDuplicate = async () => {
    if (hasMetadataValidationError) {
      setNameTouched(true);
      setDescriptionTouched(true);
      return;
    }

    setIsSubmitting(true);

    try {
      await onDuplicate({
        selections,
        duplicateName: duplicateName.trim(),
        duplicateDescription: duplicateDescription.trim(),
      });


    } catch (err) {
      if (onDuplicateError) {
        onDuplicateError(err);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "8px",
          p: 1,
          width: "min(960px, calc(100vw - 48px))",
          backgroundColor: "#F1F5F9",
          border: "1px solid #E2E8F0",
        },
      }}>
      <IconButton
        aria-label="סגירה"
        onClick={onClose}
        disabled={isSubmitting}
        sx={{ position: "absolute", right: 12, top: 12, width: 32, height: 32, p: 0.5 }}>
        <CloseIcon sx={{ fontSize: 20 }} />
      </IconButton>

      <DialogTitle sx={{ px: 5, pb: 0 }}>
        <Typography sx={{ textAlign: "center", fontSize: '30px !important', fontWeight: 700, color: "#020618" }}>
          שכפול טופס
        </Typography>
        <Typography sx={{ fontSize: 16, color: "#64748b", mt: 1, fontWeight: 400 }}>
          הטופס החדש ייווצר על בסיס הטופס הקיים, בהתאם לרכיבי הטופס שנבחרו לשכפול.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 5, pt: '20px !important' }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5 }}>
          <Box>
            <Typography sx={{ mb: 1, fontSize: '1.1rem !important', fontWeight: 500, color: "#020618" }}>
              שם הטופס
            </Typography>
            <TextField
              value={duplicateName}
              onChange={(event) => {
                setDuplicateName(event.target.value.trimStart());
                setSelections((prev) => ({ ...prev, name: true }));
              }}
              onBlur={() => setNameTouched(true)}
              error={shouldShowNameError}
              helperText={nameError || " "}
              disabled={isSubmitting}
              inputProps={{ maxLength: 60 }}
              sx={selectedInputSx}
              fullWidth
            />
          </Box>
          <Box>
            <Typography sx={{ mb: 1, fontSize: '1.1rem !important', fontWeight: 500, color: "#020618" }}>
              תיאור הטופס
            </Typography>
            <TextField
              value={duplicateDescription}
              onChange={(event) => {
                setDuplicateDescription(event.target.value.trimStart());
                setSelections((prev) => ({ ...prev, description: true }));
              }}
              onBlur={() => setDescriptionTouched(true)}
              error={shouldShowDescriptionError}
              helperText={descriptionError || " "}
              placeholder="מלא תיאור טופס"
              disabled={isSubmitting}
              inputProps={{ maxLength: 255 }}
              sx={selectedInputSx}
              fullWidth
            />
          </Box>
        </Box>

        <Box sx={{ borderBottom: "1px solid #E2E8F0", py: 2, mb: 2 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "32px 180px 1fr", gap: 1.5, alignItems: "center" }}>
            <Checkbox
              checked={allMainItemsSelected}
              indeterminate={!allMainItemsSelected && hasChecklistSelection}
              onChange={(event) => toggleAll(event.target.checked)}
              disabled={isSubmitting}
              sx={{ p: 0 }}
            />
            <Typography sx={{ fontWeight: 500, fontSize: '1.2rem !important', color: "#020618" }}>
              בחר את כל הרכיבים
            </Typography>
          </Box>
        </Box>

        {checklistItems.map((item) => {
          const disabled = item.dependsOnFields && !selections.fields;
          const checkbox = (
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 24,
              }}>
              <Checkbox
                checked={selections[item.key]}
                onChange={(event) => updateSelection(item.key, event.target.checked)}
                disabled={disabled || isSubmitting}
                sx={{ p: 0 }}
              />
            </Box>
          );
          const control = (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "32px 130px 1fr",
                gap: 1.5,
                py: 0.8,
                opacity: disabled ? 0.55 : 1,
                alignItems: "center",
              }}>
              {disabled ? (
                <Tooltip
                  title={FIELDS_DEPENDENCY_HINT}
                  placement="top"
                  arrow
                  slotProps={{
                    popper: {
                      modifiers: [
                        {
                          name: "offset",
                          options: {
                            offset: [28, -4],
                          },
                        },
                      ],
                    },
                  }}>
                  {checkbox}
                </Tooltip>
              ) : (
                checkbox
              )}
              <Typography
                sx={{
                  fontSize: '1.2rem !important',
                  fontWeight: 500,
                  color: "#020618",
                  whiteSpace: "nowrap",
                }}>
                {item.label}
              </Typography>
              <Typography sx={{ fontSize: '1.2rem !important', color: "#64748b", lineHeight: 1.35 }}>
                {item.description}
              </Typography>
            </Box>
          );

          return <React.Fragment key={item.key}>{control}</React.Fragment>;
        })}

        <Divider sx={{ mt: 2.5, mb: 2.5, borderColor: "#E2E8F0" }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#62748E" }}>
          <InfoOutlinedIcon fontSize="small" />
          <Typography sx={{ fontSize: 15 }}>נתוני תגובות לא יועתקו בטופס החדש.</Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "flex-end", px: 4, pb: 3, gap: 1 }}>
        <Button sx={{ color: '#0F172B', outline: '1px solid #E2E8F0 !important', px: 3, backgroundColor: "#FFFFFF" }} onClick={onClose} disabled={isSubmitting}>
          ביטול
        </Button>

        <Button
          variant="contained"
          onClick={handleDuplicate}
          disabled={isSubmitting || hasMetadataValidationError}
          sx={{ minWidth: 112, fontWeight: 700 }}>
          {isSubmitting ? <CircularProgress size={18} color="inherit" /> : "שכפול טופס"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DuplicateFormDialog;
