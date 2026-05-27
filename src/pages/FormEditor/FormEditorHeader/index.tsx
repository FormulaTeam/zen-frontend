import styles from "./style.module.css";
import { DEFAULT_ICON_NAME, formIconsNamesMap, getFormIconByName } from "@utils/utils";
import { Button, TextField, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from "@mui/material";
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
  const { formStructure, validateForm, setFormMetadata, checkHasChanges } = useFormStructureContext();
  const { handleSaveForm, handleExit, handleDiscardAndExit, isLoading } = useFormEditor(formStructure);

  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState<FormMetadata>({ title: "" });
  const [showPickIcon, setShowPickIcon] = useState(false);
  const [showAlertMsg, setShowAlertMsg] = useState(false);
  const [showValidationErrorsPopup, setShowValidationErrorsPopup] = useState(false);

  const { title, description, iconId, validationErrors } = formStructure.metadata;

  const onSaveClick = () => {
    const isValid = validateForm();
    if (isValid) {
      handleSaveForm();
    } else {
      setShowValidationErrorsPopup(true);
    }
  };

  const handleSaveAndExit = async () => {
    setShowAlertMsg(false);
    const isValid = validateForm();
    if (isValid) {
      await handleSaveForm();
      handleExit();
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
  }

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
      return <img src={IconComponent} alt="icon" className={styles.formIcon} onClick={() => setShowPickIcon(true)} />;
    }

    return (
      <div onClick={() => setShowPickIcon(true)} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
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

  const formMetadata: JSX.Element = isEditingMetadata ? (
    <div
      className={styles.editingMetadataText}
      onBlur={(e) => {
        // If the focus is moving to another element within the same editing group, don't save/close yet
        if (e.currentTarget.contains(e.relatedTarget)) {
          return;
        }
        handleSaveMetadata(null as any);
      }}
    >
      <SeamlessTitleInput
        autoFocus
        value={editedMetadata.title}
        inputProps={{
          maxLength: 60,
        }}
        placeholder={"שם הטופס"}
        error={!!validationErrors?.title}
        onChange={(e) => {
          const newVal = e.target.value.trimStart();
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
      <SeamlessDescriptionInput
        value={editedMetadata.description}
        inputProps={{
          maxLength: 255,
        }}
        placeholder={"תיאור"}
        error={!!validationErrors?.description}
        onChange={(e) => {
          const newVal = e.target.value.trimStart();
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
    </div>
  ) : (
    <Tooltip title="עריכת פרטי הטופס" placement="bottom-start">
      <MetadataContainer
        onClick={() => {
          setEditedMetadata({ title, description, iconId });
          setIsEditingMetadata(true);
        }}
      >
        <div className={`${styles.title} ${styles.titleWithMargin}`}>
          <OverflowTooltip title={title || "שם הטופס"} placement="top">
            <StyledTitleText variant={"h5"}>{title || "שם הטופס"}</StyledTitleText>
          </OverflowTooltip>
        </div>
        <OverflowTooltip title={description || "ללא תיאור"} placement="bottom">
          <StyledDescriptionText variant="subtitle1">{description ?? "ללא תיאור"}</StyledDescriptionText>
        </OverflowTooltip>

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
      <Button variant={"outlined"} color={"error"} onClick={onExitClick} disabled={isLoading}>יציאה</Button>
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
      }}
    >
      <ExitAlertMsgCloseIcon>
        <Close onClick={() => setShowAlertMsg(false)} />
      </ExitAlertMsgCloseIcon>
      <ExitAlertMsgDialogTitle>
        <ErrorIcon sx={{ fontSize: '5rem', color: 'red' }} />
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
        <Button variant="outlined" color="error" onClick={() => {
          setShowAlertMsg(false);
          handleDiscardAndExit();
        }}>
          יציאה ללא שמירה
        </Button>
      </ExitAlertMsgDialogActions>
    </Dialog>
  );

  const validationErrorsPopup = (
    showValidationErrorsPopup ? (
      <div style={{ position: 'fixed', top: 80, left: 0, right: 0, zIndex: 1300, display: 'flex', justifyContent: 'center' }}>
        <AlertMsg
          msg={["יש שגיאות בטופס. נא לתקן את השדות המסומנים באדום."]}
          closePopup={() => setShowValidationErrorsPopup(false)}
        />
      </div>
    ) : null
  );

  return (
    <div className={styles.header}>
      <div className={styles.headerStart}>
        {formIcon}
        <div className={styles.editingMetadata}>
          {formMetadata}
        </div>
      </div>
      <div className={styles.headerEnd}>
        {headerActionButtons}
      </div>
      {showPickIcon && (
        <IconsGrid
          onIconChange={onIconChange}
          onClosePickIcon={() => setShowPickIcon(false)}
        />
      )}

      {exitAlertMsg}
      {validationErrorsPopup}
    </div>
  );
}

export { FormEditorHeader };