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
  FormControlLabel,
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
const FIELDS_DEPENDENCY_HINT = "זמין רק כאשר שדות נבחרים לשכפול";
const NO_SELECTION_ERROR = "לא נבחרו פריטים לשכפול.";

const initialSelections: DuplicateFormSelections = {
  name: true,
  description: true,
  permissions: true,
  fields: true,
  conditions: true,
  colors: true,
};

type DuplicateFormDialogProps = {
  open: boolean;
  formName: string;
  formDescription?: string | null;
  onClose: () => void;
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
      key: "name",
      label: "שם הטופס",
      description: "שם הטופס החדש ייטען לפי שם הטופס המקורי בתוספת \"העתק\".",
    },
    {
      key: "description",
      label: "תיאור",
      description: "תיאור הטופס המקורי יועתק לשדה התיאור בטופס החדש.",
    },
    {
      key: "permissions",
      label: "הרשאות",
      description: "משתמשים והרשאות גישה לטופס יועתקו לטופס החדש.",
    },
    {
      key: "fields",
      label: "שדות",
      description: "כל השדות והמבנה שלהם יועתקו לטופס החדש.",
    },
    {
      key: "conditions",
      label: "התניות",
      description: "חוקים שמציגים או מסתירים שדות לפי תשובות. התניות יועתקו יחד עם השדות הרלוונטיים בלבד.",
      dependsOnFields: true,
    },
    {
      key: "colors",
      label: "צבעים",
      description: "חוקי צבע ותצוגה בטבלה, חוקי צבע ותצוגה בטבלה יועתקו לטופס החדש.",
      dependsOnFields: true,
    },
  ];

function DuplicateFormDialog({
  open,
  formName,
  formDescription,
  onClose,
  onDuplicate,
}: DuplicateFormDialogProps) {
  const [selections, setSelections] = useState<DuplicateFormSelections>(initialSelections);
  const [duplicateName, setDuplicateName] = useState(`${formName}${DUPLICATE_SUFFIX}`);
  const [duplicateDescription, setDuplicateDescription] = useState(formDescription ?? "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setSelections(initialSelections);
    setDuplicateName(`${formName}${DUPLICATE_SUFFIX}`);
    setDuplicateDescription(formDescription ?? "");
    setError("");
    setIsSubmitting(false);
  }, [formDescription, formName, open]);

  const allMainItemsSelected = useMemo(
    () => Object.values(selections).every(Boolean),
    [selections],
  );

  const nameValidation = FormMetadataSchema.shape.title.safeParse(duplicateName);
  const nameError = duplicateName.trim() !== "" && !nameValidation.success
    ? nameValidation.error.issues[0]?.message
    : "";

  const updateSelection = (key: keyof DuplicateFormSelections, checked: boolean) => {
    setError("");
    setSelections((prev) => {
      if (key === "fields" && !checked) {
        return {
          ...prev,
          fields: false,
          conditions: false,
          colors: false,
        };
      }

      if (key === "name" && !checked) {
        setDuplicateName("");
      }

      if (key === "description" && !checked) {
        setDuplicateDescription("");
      }

      return {
        ...prev,
        [key]: checked,
      };
    });
  };

  const toggleAll = (checked: boolean) => {
    setError("");
    setSelections(
      checked
        ? initialSelections
        : {
          name: false,
          description: false,
          permissions: false,
          fields: false,
          conditions: false,
          colors: false,
        },
    );
  };

  const handleDuplicate = async () => {
    setError("");

    if (!Object.values(selections).some(Boolean)) {
      setError(NO_SELECTION_ERROR);
      return;
    }

    if (!nameValidation.success) {
      setError(nameValidation.error.issues[0]?.message ?? "שם הטופס אינו תקין");
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
      setError("לא ניתן היה לשכפל את הטופס. נסו שוב.");
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
        },
      }}>
      <IconButton
        aria-label="סגירה"
        onClick={onClose}
        disabled={isSubmitting}
        sx={{ position: "absolute", left: 12, top: 12 }}>
        <CloseIcon />
      </IconButton>

      <DialogTitle sx={{ textAlign: "center", pb: 0 }}>
        <Typography sx={{ fontSize: '30px !important', fontWeight: 700, color: "#020618" }}>
          שכפול טופס
        </Typography>
        <Typography sx={{ fontSize: 16, color: "#64748b", mt: 1, fontWeight: 400 }}>
          הטופס החדש ייווצר על בסיס הטופס הקיים. ניתן לבחור אם לכלול את הנתונים או רק את המבנה.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 4, pt: 3 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 4 }}>
          <TextField
            label="שם הטופס"
            value={duplicateName}
            onChange={(event) => {
              setDuplicateName(event.target.value.trimStart());
              setSelections((prev) => ({ ...prev, name: true }));
              setError("");
            }}
            error={!!nameError || error === nameError}
            helperText={nameError}
            disabled={isSubmitting}
            inputProps={{ maxLength: 60 }}
            fullWidth
          />
          <TextField
            label="תיאור הטופס"
            value={duplicateDescription}
            onChange={(event) => {
              setDuplicateDescription(event.target.value.trimStart());
              setSelections((prev) => ({ ...prev, description: true }));
              setError("");
            }}
            disabled={isSubmitting}
            inputProps={{ maxLength: 255 }}
            fullWidth
          />
        </Box>

        <Box sx={{ borderBottom: "1px solid #d8e2ef", pb: 1.5, mb: 1 }}>
          <FormControlLabel
            label={<Typography sx={{ fontWeight: 600 }}>בחר את כל הרכיבים</Typography>}
            control={
              <Checkbox
                checked={allMainItemsSelected}
                indeterminate={!allMainItemsSelected && Object.values(selections).some(Boolean)}
                onChange={(event) => toggleAll(event.target.checked)}
                disabled={isSubmitting}
              />
            }
          />
        </Box>

        {checklistItems.map((item) => {
          const disabled = item.dependsOnFields && !selections.fields;
          const control = (
            <FormControlLabel
              key={item.key}
              sx={{
                display: "grid",
                gridTemplateColumns: "auto 130px 1fr",
                gap: 1.5,
                mx: 0,
                py: 1.1,
                opacity: disabled ? 0.55 : 1,
                alignItems: "center",
              }}
              label={
                <>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#020618" }}>
                    {item.label}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: "#64748b", lineHeight: 1.5 }}>
                    {item.description}
                  </Typography>
                </>
              }
              control={
                <Checkbox
                  checked={selections[item.key]}
                  onChange={(event) => updateSelection(item.key, event.target.checked)}
                  disabled={disabled || isSubmitting}
                />
              }
            />
          );

          return (
            <React.Fragment key={item.key}>
              {disabled ? (
                <Tooltip title={FIELDS_DEPENDENCY_HINT} placement="top">
                  <Box>{control}</Box>
                </Tooltip>
              ) : (
                control
              )}
              {item.key !== "colors" && <Divider />}
            </React.Fragment>
          );
        })}

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 3, color: "#64748b" }}>
          <InfoOutlinedIcon fontSize="small" />
          <Typography sx={{ fontSize: 15 }}>נתוני תגובות לא יועתקו בטופס החדש.</Typography>
        </Box>

        {error && (
          <Typography sx={{ color: "error.main", mt: 2, fontSize: 14, fontWeight: 500 }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "flex-end", px: 4, pb: 3, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
          ביטול
        </Button>

        <Button
          variant="contained"
          onClick={handleDuplicate}
          disabled={isSubmitting}
          sx={{ minWidth: 112, fontWeight: 700 }}>
          {isSubmitting ? <CircularProgress size={18} color="inherit" /> : "שכפול טופס"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DuplicateFormDialog;
