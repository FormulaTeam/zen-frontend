import styles from "./style.module.css";
import { getFormIconByName } from "@utils/utils";
import {
  Button,
  TextField,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { FormMetadata, useFormStructureContext } from "../context/FormStructureContext";
import { useState } from "react";
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
import ValidationErrorsDialog from "../../../components/BasePopup/ValidationErrorsDialog";
import UnsavedChangesDialog from "../../../components/BasePopup/UnsavedChangesDialog";

type FormValidationResult = {
  isValid: boolean;
  fieldsValid: boolean;
  metadataErrors?: Record<string, string[] | undefined> | null;
  hasFields: boolean;
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
  const [suggestedTitle, setSuggestedTitle] = useState("טופס ללא שם");
  const [saveOptionsAfterTitlePopup, setSaveOptionsAfterTitlePopup] = useState<{
    navigateToResponses?: boolean;
  }>({});

  const { title, description, iconId, validationErrors } = formStructure.metadata;

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

    if (setFormMetadata({ title: trimmedTitle })) {
      setShowUntitledFormPopup(false);
      setIsEditingMetadata(false);
      setEditedMetadata((prev) => ({ ...prev, title: trimmedTitle }));

      await handleSaveForm({
        ...saveOptionsAfterTitlePopup,
        title: trimmedTitle,
      });

      setSaveOptionsAfterTitlePopup({});
    }
  };

  const handleSaveAndExit = async () => {
    setShowAlertMsg(false);
    await runSaveFlow({ navigateToResponses: true });
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
        <IconComponent color="primary" style={{ fontSize: 40 }} />
      </div>
    );
  };

  const formIcon: JSX.Element = (
    <div className={styles.formIconWrapper}>
      <Tooltip title="לחץ על מנת לשנות אייקון">
        {isEditingMetadata ? renderIcon(editedMetadata.iconId) : renderIcon(iconId)}
      </Tooltip>
    </div>
  );

  const formMetadata: JSX.Element = (
    <Tooltip title={isEditingMetadata ? "" : "עריכת פרטי הטופס"} placement="bottom-start">
      <MetadataContainer
        className={isEditingMetadata ? styles.editingMetadataText : ""}
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
            setEditedMetadata({ title, description, iconId });
            setIsEditingMetadata(true);
          }
        }}>
        <div className={styles.title}>
          {isEditingMetadata ? (
            <SeamlessTitleInput
              autoFocus
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
              <StyledTitleText variant={"h5"}>{title || texts.heb.formNameLabel}</StyledTitleText>
            </OverflowTooltip>
          )}
        </div>

        {isEditingMetadata ? (
          <SeamlessDescriptionInput
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
            <StyledDescriptionText variant="subtitle1">
              {description ?? "ללא תיאור"}
            </StyledDescriptionText>
          </OverflowTooltip>
        )}

        <div className={styles.formErrorContainer}>
          {validationErrors?.title ? (
            <Typography variant="body2" color="error">
              {texts.heb.emptyFormAlert}
            </Typography>
          ) : null}
        </div>
      </MetadataContainer>
    </Tooltip>
  );

  const headerActionButtons: JSX.Element = (
    <>
      <Button variant="contained" color="primary" onClick={onSaveClick} disabled={isLoading}>
        {isLoading ? "שומר..." : "שמירה"}
      </Button>
      <Button variant="outlined" color="error" onClick={onExitClick} disabled={isLoading}>
        יציאה
      </Button>
    </>
  );

  const exitAlertMsg: JSX.Element | null = (
    <UnsavedChangesDialog
      open={showAlertMsg}
      onClose={() => setShowAlertMsg(false)}
      onSave={handleSaveAndExit}
      onDiscard={() => {
        setShowAlertMsg(false);
        handleDiscardAndExit();
      }}
      message="יש לך שינויים שלא נשמרו בטופס"
    />
  );

  const validationErrorsPopup = (
    <ValidationErrorsDialog
      open={showValidationErrorsPopup}
      onClose={() => setShowValidationErrorsPopup(false)}
      errors={[
        "נא לתקן את השדות המסומנים באדום",
        ...(Object.keys(formStructure.fields).length === 0 ? ["לא ניתן לשמור טופס ללא שדות"] : []),
      ]}
    />
  );

  const untitledFormDialog = (
    <Dialog open={showUntitledFormPopup} onClose={() => setShowUntitledFormPopup(false)}>
      <DialogTitle sx={{ textAlign: "center", pb: 1 }}>שם לטופס</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2, textAlign: "center" }}>
          נראה שלטופס אין עדיין שם. איך לקרוא לו?
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          label="שם הטופס"
          value={suggestedTitle}
          onChange={(e) => setSuggestedTitle(e.target.value.trimStart())}
          onBlur={(e) => setSuggestedTitle(e.target.value.trim())}
          variant="outlined"
          sx={{ mt: 1 }}
          inputProps={{
            maxLength: 60,
          }}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", gap: 1, pb: 3 }}>
        <Button onClick={() => setShowUntitledFormPopup(false)} variant="outlined">
          ביטול
        </Button>
        <Button
          onClick={handleAcceptSuggestedTitle}
          variant="contained"
          color="primary"
          disabled={!suggestedTitle.trim()}>
          שמירה
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
