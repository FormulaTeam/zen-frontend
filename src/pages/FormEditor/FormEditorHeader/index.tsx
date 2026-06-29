import styles from "./style.module.css";
import { getFormIconByName } from "@utils/utils";
import {
  Button,
  CircularProgress,
  TextField,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  IconButton,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { FormMetadata, useFormStructureContext } from "../context/FormStructureContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { fieldType } from "formula-gear";
import { useFormEditor } from "../hooks/useFormEditor";
import IconsGrid from "../../../components/IconsGrid/IconsGrid";
import { OverflowTooltip } from "../../../components/OverflowTooltip";
import {
  MetadataContainer,
  StyledDescriptionText,
  StyledTitleText,
  SeamlessTitleInput,
  SeamlessDescriptionInput,
} from "./styled";
import { texts } from "@src/utils/texts";
import ValidationErrorsDialog, {
  type ValidationError,
} from "../../../components/BasePopup/ValidationErrorsDialog";
import UnsavedChangesDialog from "../../../components/BasePopup/UnsavedChangesDialog";
import { clearFormDraft } from "../utils/draftPersistence";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Save, LogOut } from "lucide-react";
import { FormMetadataSchema } from "../schemas/metadata";

type FormValidationResult = {
  isValid: boolean;
  fieldsValid: boolean;
  metadataErrors?: Record<string, string[] | undefined> | null;
  hasFields: boolean;
};

const METADATA_FIELD_LABELS: Record<string, string> = {
  title: "שם הטופס",
  description: "תיאור הטופס",
};

const DEFAULT_UNTITLED_FORM_TITLE = "טופס ללא שם";

const headerActionButtonBaseSx = {
  height: 50,
  borderRadius: "10px",
  backgroundColor: "#ffffff",
  color: "#1a1a24",
  border: "none",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
  textTransform: "none",
  fontWeight: 600,
  lineHeight: 1,
  transition: "background-color 160ms ease, box-shadow 160ms ease",

  "&:hover": {
    backgroundColor: "#ffffff",
    boxShadow: "0 6px 12px rgba(15, 23, 42, 0.08)",
  },

  "&.Mui-disabled": {
    backgroundColor: "#f8fafc",
    color: "#94a3b8",
    boxShadow: "none",
  },
};

const saveHeaderButtonSx = {
  ...headerActionButtonBaseSx,
  minWidth: 120,
  px: 3,
  gap: 1,
  fontSize: "0.95rem",
};

const exitHeaderButtonSx = {
  ...headerActionButtonBaseSx,
  width: 50,
  minWidth: 50,
  p: 0,
};

const collectValidationMessages = (validationNode: unknown): string[] => {
  const messages = new Set<string>();

  const visit = (node: unknown) => {
    if (!node) {
      return;
    }

    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    if (typeof node !== "object") {
      return;
    }

    const nodeAsRecord = node as Record<string, unknown>;
    const errors = nodeAsRecord.errors;

    if (Array.isArray(errors)) {
      errors
        .filter((error): error is string => typeof error === "string" && error.trim() !== "")
        .forEach((error) => messages.add(error));
    }

    const properties = nodeAsRecord.properties;

    if (properties && typeof properties === "object") {
      Object.values(properties).forEach(visit);
    }

    const items = nodeAsRecord.items;

    if (items && typeof items === "object") {
      Object.values(items).forEach(visit);
    }

    Object.entries(nodeAsRecord).forEach(([key, value]) => {
      if (key === "errors" || key === "properties" || key === "items") {
        return;
      }

      visit(value);
    });
  };

  visit(validationNode);

  return Array.from(messages);
};

function FormEditorHeader() {
  const { formStructure, validateForm, setFormMetadata, checkHasChanges } =
    useFormStructureContext();
  const { handleSaveForm, handleExit, handleDiscardAndExit, isLoading } =
    useFormEditor(formStructure);

  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState<FormMetadata>({ title: "" });
  const [showPickIcon, setShowPickIcon] = useState(false);
  const [showAlertMsg, setShowAlertMsg] = useState(false);
  const [showValidationErrorsPopup, setShowValidationErrorsPopup] = useState(false);
  const [showUntitledFormPopup, setShowUntitledFormPopup] = useState(false);
  const [suggestedTitle, setSuggestedTitle] = useState(DEFAULT_UNTITLED_FORM_TITLE);
  const [saveOptionsAfterTitlePopup, setSaveOptionsAfterTitlePopup] = useState<{
    navigateToResponses?: boolean;
  }>({});
  const [isMetadataHovered, setIsMetadataHovered] = useState(false);
  const [focusTarget, setFocusTarget] = useState<"title" | "description">("title");
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const descriptionInputRef = useRef<HTMLInputElement | null>(null);

  const { title, description, iconId, validationErrors } = formStructure.metadata;

  useEffect(() => {
    if (isEditingMetadata) {
      if (focusTarget === "description") {
        descriptionInputRef.current?.focus();
      } else {
        titleInputRef.current?.focus();
      }
    }
  }, [isEditingMetadata, focusTarget]);

  useEffect(() => {
    if (title === "נפל לך הקליפס") {
      window.dispatchEvent(new CustomEvent("toggle-easter-egg", { detail: { active: true } }));
    } else {
      window.dispatchEvent(new CustomEvent("toggle-easter-egg", { detail: { active: false } }));
    }

    return () => {
      window.dispatchEvent(new CustomEvent("toggle-easter-egg", { detail: { active: false } }));
    };
  }, [title]);

  const normalizeValidationResult = (
    result: boolean | Partial<FormValidationResult>,
  ): FormValidationResult => {
    if (typeof result === "boolean") {
      return {
        isValid: result,
        fieldsValid: result,
        metadataErrors: formStructure.metadata.validationErrors ?? {},
        hasFields: Object.keys(formStructure.fields).length > 0,
      };
    }

    return {
      isValid: result.isValid ?? false,
      fieldsValid: result.fieldsValid ?? result.isValid ?? false,
      metadataErrors: result.metadataErrors ?? {},
      hasFields: result.hasFields ?? Object.keys(formStructure.fields).length > 0,
    };
  };

  const validationPopupErrors = useMemo<ValidationError[]>(() => {
    const errors: ValidationError[] = [];

    const fieldValues = Object.values(formStructure.fields);

    if (fieldValues.length === 0) {
      errors.push({
        message: "לא ניתן לשמור טופס ללא שדות",
      });
    } else if (fieldValues.length > 0 && fieldValues.every((field) => field.data?.typeId === fieldType.Form)) {
      errors.push({
        message: "לא ניתן לשמור טופס המכיל שדות מסוג 'טופס מקושר' בלבד",
      });
    }

    Object.entries(formStructure.metadata.validationErrors ?? {}).forEach(
      ([fieldName, messages]) => {
        messages
          ?.filter(
            (message): message is string => typeof message === "string" && message.trim() !== "",
          )
          .forEach((message) => {
            errors.push({
              fieldName: METADATA_FIELD_LABELS[fieldName] ?? fieldName,
              message,
            });
          });
      },
    );

    Object.values(formStructure.fields).forEach((field) => {
      const fieldMessages = collectValidationMessages(field.validationErrors);

      fieldMessages.forEach((message) => {
        errors.push({
          fieldName: field.data.displayName || field.data.name || "שדה ללא שם",
          message,
        });
      });
    });

    return errors.length > 0
      ? errors
      : [
        {
          message: "נא לתקן את השדות המסומנים באדום",
        },
      ];
  }, [formStructure.fields, formStructure.metadata.validationErrors, formStructure.sections]);

  const runSaveFlow = async (options?: { navigateToResponses?: boolean }) => {
    const { isValid, fieldsValid, metadataErrors, hasFields } = normalizeValidationResult(
      validateForm() as boolean | Partial<FormValidationResult>,
    );

    if (isValid) {
      await handleSaveForm(options);
      return;
    }

    if (!fieldsValid || !hasFields) {
      setShowValidationErrorsPopup(true);
      return;
    }

    const metadataErrorKeys = Object.keys(metadataErrors || {});
    const hasOtherMetadataErrors = metadataErrorKeys.some((key) => key !== "title");

    if (hasOtherMetadataErrors) {
      setShowValidationErrorsPopup(true);
      return;
    }

    if (metadataErrors?.title && title.trim() === "") {
      const defaultTitle = DEFAULT_UNTITLED_FORM_TITLE;
      setFormMetadata({ title: defaultTitle });
      setSuggestedTitle(defaultTitle);
      setSaveOptionsAfterTitlePopup(options ?? {});
      setShowUntitledFormPopup(true);
      return;
    }

    setShowValidationErrorsPopup(true);
  };

  const onSaveClick = () => {
    void runSaveFlow();
  };

  const handleAcceptSuggestedTitle = async () => {
    const trimmedTitle = suggestedTitle.trim();

    if (!trimmedTitle) {
      return;
    }

    const nextMetadata = {
      id: formStructure.metadata.id,
      title: trimmedTitle,
      description,
      iconId,
    };

    setFormMetadata({ title: trimmedTitle });

    if (!FormMetadataSchema.safeParse(nextMetadata).success) {
      return;
    }

    setShowUntitledFormPopup(false);
    setIsEditingMetadata(false);
    setEditedMetadata((prev) => ({ ...prev, title: trimmedTitle }));

    await handleSaveForm({
      ...saveOptionsAfterTitlePopup,
      title: trimmedTitle,
    });

    setSaveOptionsAfterTitlePopup({});
  };

  const handleSaveAndExit = async () => {
    setShowAlertMsg(false);
    await runSaveFlow({ navigateToResponses: true });
  };

  const [logoNavigateCallback, setLogoNavigateCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    const handleLogoClick = (e: Event) => {
      if (checkHasChanges()) {
        e.preventDefault();
        setShowAlertMsg(true);
        setLogoNavigateCallback(() => (e as CustomEvent).detail.navigate);
      }
    };

    window.addEventListener("logo-click", handleLogoClick);
    return () => window.removeEventListener("logo-click", handleLogoClick);
  }, [checkHasChanges]);

  const handleDiscard = () => {
    setShowAlertMsg(false);

    if (logoNavigateCallback) {
      clearFormDraft(formStructure.metadata.id);
      logoNavigateCallback();
      setLogoNavigateCallback(null);
      return;
    }

    handleDiscardAndExit();
  };

  const handleSave = async () => {
    setShowAlertMsg(false);

    const { isValid, fieldsValid, metadataErrors, hasFields } = normalizeValidationResult(
      validateForm() as boolean | Partial<FormValidationResult>,
    );

    if (isValid) {
      await handleSaveForm();
      if (logoNavigateCallback) {
        logoNavigateCallback();
        setLogoNavigateCallback(null);
      }
      return;
    }

    if (!fieldsValid || !hasFields || metadataErrors) {
      setShowValidationErrorsPopup(true);
    }
  };

  const onExitClick = () => {
    if (checkHasChanges()) {
      setShowAlertMsg(true);
    } else {
      handleExit();
    }
  };

  const onIconChange = (newIcon: string | null): void => {
    if (newIcon) {
      setFormMetadata({ iconId: newIcon });

      if (isEditingMetadata) {
        setEditedMetadata((prev) => ({ ...prev, iconId: newIcon }));
      }
    }

    setShowPickIcon(false);
  };

  const handleSaveMetadata = (): void => {
    const trimmedMetadata: FormMetadata = {
      ...editedMetadata,
      title: editedMetadata.title.trim(),
      description: editedMetadata.description?.trim(),
    };

    if (setFormMetadata(trimmedMetadata)) {
      setEditedMetadata(trimmedMetadata);
      setIsEditingMetadata(false);
    }
  };

  const handleCancelMetadataEdit = (): void => {
    setEditedMetadata({ title, description, iconId });
    setIsEditingMetadata(false);
  };

  const renderIcon = (id: string | null | undefined) => {
    const IconComponent = getFormIconByName(id ?? undefined);

    if (typeof IconComponent === "string") {
      return (
        <img
          src={IconComponent}
          alt="icon"
          className={styles.formIcon}
          onClick={() => setShowPickIcon(true)}
        />
      );
    }

    return (
      <div
        onClick={() => setShowPickIcon(true)}
        style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
        <IconComponent color="primary" style={{ fontSize: 56 }} />
      </div>
    );
  };

  const formIcon: JSX.Element = (
    <div
      className={`${styles.formIconWrapper} ${isEditingMetadata ? styles.formIconWrapperEditing : ""}`}>
      <Tooltip title="לחץ על מנת לשנות אייקון">
        {isEditingMetadata ? renderIcon(editedMetadata.iconId) : renderIcon(iconId)}
      </Tooltip>
    </div>
  );

  const formMetadata: JSX.Element = (
    <Tooltip title={isEditingMetadata ? "" : "עריכת פרטי הטופס"} placement="bottom-start">
      <MetadataContainer
        className={isEditingMetadata ? styles.editingMetadataText : ""}
        onMouseEnter={() => setIsMetadataHovered(true)}
        onMouseLeave={() => setIsMetadataHovered(false)}
        onBlur={(e) => {
          if (e.currentTarget.contains(e.relatedTarget)) {
            return;
          }

          if (isEditingMetadata) {
            handleSaveMetadata();
          }
        }}
        onClick={() => {
          if (!isEditingMetadata) {
            setFocusTarget("title");
            setEditedMetadata({ title, description, iconId });
            setIsEditingMetadata(true);
          }
        }}>
        <div className={styles.title}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              maxWidth: "100%",
              direction: "rtl",
            }}>
            <div
              style={{
                minWidth: 0,
                maxWidth: "100%",
              }}>
              {isEditingMetadata ? (
                <SeamlessTitleInput
                  inputRef={titleInputRef}
                  value={editedMetadata.title}
                  inputProps={{
                    maxLength: 60,
                  }}
                  placeholder={texts.heb.formNameLabel}
                  error={!!validationErrors?.title}
                  onChange={(e) => {
                    setEditedMetadata((prev) => ({
                      ...prev,
                      title: e.target.value.trimStart(),
                    }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveMetadata();
                    } else if (e.key === "Escape") {
                      handleCancelMetadataEdit();
                    }
                  }}
                />
              ) : (
                <OverflowTooltip title={title || texts.heb.formNameLabel} placement="top">
                  <StyledTitleText
                    variant="h5"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFocusTarget("title");
                      setEditedMetadata({ title, description, iconId });
                      setIsEditingMetadata(true);
                    }}>
                    {title || texts.heb.formNameLabel}
                  </StyledTitleText>
                </OverflowTooltip>
              )}
            </div>

            <EditOutlinedIcon
              sx={{
                fontSize: 21,
                color: validationErrors?.title
                  ? "error.main"
                  : isEditingMetadata
                    ? "primary.main"
                    : "text.secondary",
                opacity:
                  validationErrors?.title || isEditingMetadata || isMetadataHovered ? 0.85 : 0.38,
                transform:
                  validationErrors?.title || isEditingMetadata || isMetadataHovered
                    ? "translateX(0)"
                    : "translateX(2px)",
                transition: "opacity 140ms ease, transform 140ms ease, color 140ms ease",
                flexShrink: 0,
                mt: "2px",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {isEditingMetadata ? (
          <SeamlessDescriptionInput
            inputRef={descriptionInputRef}
            value={editedMetadata.description}
            inputProps={{
              maxLength: 255,
            }}
            placeholder="תיאור"
            error={!!validationErrors?.description}
            onChange={(e) => {
              setEditedMetadata((prev) => ({
                ...prev,
                description: e.target.value.trimStart(),
              }));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveMetadata();
              } else if (e.key === "Escape") {
                handleCancelMetadataEdit();
              }
            }}
          />
        ) : (
          <OverflowTooltip title={description || "ללא תיאור"} placement="bottom">
            <StyledDescriptionText
              variant="subtitle1"
              onClick={(e) => {
                e.stopPropagation();
                setFocusTarget("description");
                setEditedMetadata({ title, description, iconId });
                setIsEditingMetadata(true);
              }}>
              {description ?? "ללא תיאור"}
            </StyledDescriptionText>
          </OverflowTooltip>
        )}

        {(validationErrors?.title || validationErrors?.description) && (
          <div className={styles.formErrorContainer}>
            {validationErrors?.title ? (
              <Typography variant="body2" color="error">
                {validationErrors.title[0]}
              </Typography>
            ) : null}
            {validationErrors?.description ? (
              <Typography variant="body2" color="error">
                {validationErrors.description[0]}
              </Typography>
            ) : null}
          </div>
        )}
      </MetadataContainer>
    </Tooltip>
  );

  const headerActionButtons: JSX.Element = (
    <>
      <Button onClick={onSaveClick} disabled={isLoading} disableElevation sx={saveHeaderButtonSx}>
        {isLoading ? (
          <CircularProgress size={18} color="inherit" />
        ) : (
          <Save size={22} strokeWidth={2.4} />
        )}

        <span>{isLoading ? "שומר..." : "שמירה"}</span>
      </Button>

      <Tooltip title="יציאה">
        <span>
          <Button
            onClick={onExitClick}
            disabled={isLoading}
            disableElevation
            aria-label="יציאה"
            sx={exitHeaderButtonSx}>
            <LogOut size={24} strokeWidth={2.4} />
          </Button>
        </span>
      </Tooltip>
    </>
  );

  const exitAlertMsg: JSX.Element | null = (
    <UnsavedChangesDialog
      open={showAlertMsg}
      onClose={() => setShowAlertMsg(false)}
      onSave={handleSave}
      onDiscard={handleDiscard}
      message="יש לך שינויים שלא נשמרו בטופס"
    />
  );

  const validationErrorsPopup = (
    <ValidationErrorsDialog
      open={showValidationErrorsPopup}
      onClose={() => setShowValidationErrorsPopup(false)}
      errors={validationPopupErrors}
    />
  );

  const untitledFormDialog = (
    <Dialog
      open={showUntitledFormPopup}
      onClose={() => setShowUntitledFormPopup(false)}
      PaperProps={{
        className: styles.untitledFormDialogPaper,
      }}>
      <IconButton
        aria-label="סגירה"
        onClick={() => setShowUntitledFormPopup(false)}
        className={styles.untitledFormDialogCloseButton}>
        <CloseRoundedIcon className={styles.untitledFormDialogCloseIcon} />
      </IconButton>

      <DialogTitle className={styles.untitledFormDialogTitle}>
        <Typography className={styles.untitledFormDialogTitleText}>שם לטופס</Typography>
      </DialogTitle>

      <DialogContent className={styles.untitledFormDialogContent}>
        <DialogContentText className={styles.untitledFormDialogDescription}>
          הטופס נותר ללא שם. איך נקרא לו?
        </DialogContentText>

        <TextField
          autoFocus
          fullWidth
          placeholder="שם הטופס"
          value={suggestedTitle}
          onChange={(e) => {
            const nextVal = e.target.value.trimStart();
            setSuggestedTitle(nextVal);
            setFormMetadata({ title: nextVal });
          }}
          onBlur={(e) => setSuggestedTitle(e.target.value.trim())}
          variant="outlined"
          error={!!validationErrors?.title}
          inputProps={{
            maxLength: 60,
          }}
          className={styles.untitledFormTextField}
        />
        <div className={styles.untitledFormPopupErrorContainer}>
          {validationErrors?.title && (
            <Typography variant="body2" color="error" className={styles.untitledFormPopupErrorText}>
              {validationErrors.title[0]}
            </Typography>
          )}
        </div>
      </DialogContent>

      <DialogActions className={styles.untitledFormDialogActions}>
        <Button
          onClick={handleAcceptSuggestedTitle}
          variant="contained"
          disableElevation
          disabled={!suggestedTitle.trim()}
          className={styles.untitledFormSaveButton}>
          שמירה
        </Button>

        <Button
          onClick={() => setShowUntitledFormPopup(false)}
          variant="outlined"
          disableElevation
          className={styles.untitledFormCancelButton}>
          ביטול
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <div className={styles.header}>
      <div className={styles.headerStart}>
        {formIcon}
        <div className={styles.editingMetadata}>{formMetadata}</div>
      </div>
      <div className={styles.headerEnd}>{headerActionButtons}</div>

      {showPickIcon && (
        <IconsGrid onIconChange={onIconChange} onClosePickIcon={() => setShowPickIcon(false)} />
      )}

      {untitledFormDialog}
      {exitAlertMsg}
      {validationErrorsPopup}
    </div>
  );
}

export { FormEditorHeader };
