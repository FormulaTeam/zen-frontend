import styles from "./style.module.css";
import { DEFAULT_ICON_NAME, formIconsNamesMap, getFormIconByName } from "@utils/utils";
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
import { Check, Close, DriveFileRenameOutline, Error as ErrorIcon } from "@mui/icons-material";
import React, { useState } from "react";
import { useFormEditor } from "../hooks/useFormEditor";
import IconsGrid from "../../../components/IconsGrid/IconsGrid";
import { OverflowTooltip } from "../../../components/OverflowTooltip";
import {
  MetadataContainer,
  StyledDescriptionText,
  StyledTitleText,
  ExitAlertMsgDialog,
  ExitAlertMsgCloseIcon,
  ExitAlertMsgDialogTitle,
  ExitAlertMsgDialogContent,
  ExitAlertMsgDialogContentText,
  ExitAlertMsgDialogActions,
  SeamlessTitleInput,
  SeamlessDescriptionInput,
} from "./styled";
import { texts } from "@src/utils/texts";
import AlertMsg from "@components/AlertMsg/AlertMsg";

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

  const { title, description, iconId, validationErrors } = formStructure.metadata;

  const onSaveClick = () => {
    const { isValid, fieldsValid, metadataErrors, hasFields } = validateForm() as any;
    
    if (isValid) {
      handleSaveForm();
      return;
    }

    const titleError = metadataErrors.title;
    const isTitleMissingOnly = hasFields && fieldsValid && Object.keys(metadataErrors).length === 1 && !!titleError && title.trim() === "";

    if (isTitleMissingOnly) {
      setShowUntitledFormPopup(true);
    } else {
      setShowValidationErrorsPopup(true);
    }
  };

  const handleAcceptSuggestedTitle = async () => {
    const trimmedTitle = suggestedTitle.trim();
    if (setFormMetadata({ title: trimmedTitle })) {
      setShowUntitledFormPopup(false);
      // Pass the title directly to save to avoid race conditions with state
      handleSaveForm({ title: trimmedTitle });
    }
  };

  const handleSaveAndExit = async () => {
    setShowAlertMsg(false);
    const { isValid } = validateForm() as any;
    if (isValid) {
      await handleSaveForm();
      handleExit();
    } else {
      onSaveClick();
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

  const handleSaveMetadata = (e: React.MouseEvent<HTMLButtonElement>): void => {
    if (setFormMetadata(editedMetadata)) {
      setIsEditingMetadata(false);
    }
  };

  const handleCancelMetadataEdit = (e: React.MouseEvent<HTMLButtonElement>): void => {
    setFormMetadata({ title, description, iconId });
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
          handleSaveMetadata(null as any);
        }}
        onClick={() => {
          if (!isEditingMetadata) {
            setEditedMetadata({ title, description, iconId });
            setIsEditingMetadata(true);
          }
        }}
      >
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
                const newVal = e.target.value.replace(/[^\u0590-\u05FF\s]/g, "");
                setEditedMetadata((prev) => ({ ...prev, title: newVal }));
                setFormMetadata({ title: newVal });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveMetadata(null as any);
                } else if (e.key === "Escape") {
                  handleCancelMetadataEdit(null as any);
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
            placeholder={"תיאור"}
            error={!!validationErrors?.description}
            onChange={(e) => {
              const newVal = e.target.value.replace(/[^\u0590-\u05FF\s]/g, "");
              setEditedMetadata((prev) => ({
                ...prev,
                description: newVal,
              }));
              setFormMetadata({ description: newVal });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveMetadata(null as any);
              } else if (e.key === "Escape") {
                handleCancelMetadataEdit(null as any);
              }
            }}
          />
        ) : (
          <OverflowTooltip title={description || "ללא תיאור"} placement="bottom">
            <StyledDescriptionText variant="subtitle1">{description ?? "ללא תיאור"}</StyledDescriptionText>
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
      <Button variant={"contained"} color={"primary"} onClick={onSaveClick} disabled={isLoading}>
        {isLoading ? "שומר..." : "שמירה"}
      </Button>
      <Button variant={"outlined"} color={"error"} onClick={onExitClick} disabled={isLoading}>
        יציאה
      </Button>
    </>
  );

  const exitAlertMsg: JSX.Element | null = (
    <Dialog
      open={showAlertMsg}
      onClose={() => setShowAlertMsg(false)}
      slotProps={{
        paper: {
          component: ExitAlertMsgDialog,
        },
      }}>
      <ExitAlertMsgCloseIcon>
        <Close onClick={() => setShowAlertMsg(false)} />
      </ExitAlertMsgCloseIcon>
      <ExitAlertMsgDialogTitle>
        <ErrorIcon sx={{ fontSize: "5rem", color: "red" }} />
      </ExitAlertMsgDialogTitle>
      <ExitAlertMsgDialogContent>
        <ExitAlertMsgDialogContentText>
          יש לך שינויים שלא נשמרו בטופס. האם ברצונך לשמור את השינויים?
        </ExitAlertMsgDialogContentText>
      </ExitAlertMsgDialogContent>
      <ExitAlertMsgDialogActions>
        <Button variant="outlined" onClick={() => setShowAlertMsg(false)}>
          ביטול
        </Button>
        <Button variant="contained" color="primary" onClick={handleSaveAndExit}>
          שמירה ויציאה
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            setShowAlertMsg(false);
            handleDiscardAndExit();
          }}>
          יציאה ללא שמירה
        </Button>
      </ExitAlertMsgDialogActions>
    </Dialog>
  );

  const validationErrorsPopup = showValidationErrorsPopup ? (
    <div
      style={{
        position: "fixed",
        top: 80,
        left: 0,
        right: 0,
        zIndex: 1300,
        display: "flex",
        justifyContent: "center",
      }}>
      <AlertMsg
        msg={[
          "יש שגיאות בטופס. נא לתקן את השדות המסומנים באדום.",
          ...(Object.keys(formStructure.fields).length === 0
            ? ["לא ניתן לשמור טופס ללא שדות."]
            : []),
        ]}
        closePopup={() => setShowValidationErrorsPopup(false)}
      />
    </div>
  ) : null;

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
          onChange={(e) => setSuggestedTitle(e.target.value.replace(/[^\u0590-\u05FF\s]/g, ""))}
          variant="outlined"
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", gap: 1, pb: 3 }}>
        <Button onClick={() => setShowUntitledFormPopup(false)} variant="outlined">
          ביטול
        </Button>
        <Button onClick={handleAcceptSuggestedTitle} variant="contained" color="primary">
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
