import styles from "./style.module.css";
import { DEFAULT_ICON_NAME, formIconsNamesMap } from "@utils/utils";
import { Button, TextField, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from "@mui/material";
import { FormMetadata, useFormStructureContext } from "../context/FormStructureContext";
import { Check, Close, DriveFileRenameOutline, Error as ErrorIcon } from "@mui/icons-material";
import React, { useState } from "react";
import { useFormEditor } from "../hooks/useFormEditor";
import IconsGrid from "../../../components/IconsGrid/IconsGrid";
import { OverflowTooltip } from "../../../components/OverflowTooltip";
import { MetadataContainer, StyledDescriptionText, StyledTitleText } from "./styled";
import { texts } from "@src/utils/texts";

function FormEditorHeader() {
  const { formStructure, validateForm, setFormMetadata } = useFormStructureContext();
  const { handleSaveForm, handleExit, isLoading } = useFormEditor(formStructure);

  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState<FormMetadata>({ title: "" });
  const [showPickIcon, setShowPickIcon] = useState(false);
  const [showAlertMsg, setShowAlertMsg] = useState(false);

  const { title, description, iconId, validationErrors } = formStructure.metadata;

  const onSaveClick = () => {
    const isValid = validateForm();
    if (isValid) {
      handleSaveForm();
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
    setShowAlertMsg(true);
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

  const formIcon: JSX.Element = (
    <div className={styles.formIconWrapper}>
      {isEditingMetadata ? (
        <Tooltip title="לחץ על מנת לשנות אייקון">
          <img
            src={formIconsNamesMap.get(editedMetadata.iconId ?? "") || formIconsNamesMap.get(DEFAULT_ICON_NAME)}
            alt={"icon"}
            className={styles.formIcon}
            onClick={() => setShowPickIcon(true)}
          />
        </Tooltip>
      ) : (
        <Tooltip title="לחץ על מנת לשנות אייקון">
          <img
            src={formIconsNamesMap.get(iconId ?? "") || formIconsNamesMap.get(DEFAULT_ICON_NAME)}
            alt={"icon"}
            className={styles.formIcon}
            onClick={() => setShowPickIcon(true)}
          />
        </Tooltip>
      )}
    </div>
  );

  const formMetadata: JSX.Element = isEditingMetadata ? (
    <>
      <div className={styles.editingMetadataText}>
        <TextField
          value={editedMetadata.title}
          slotProps={{
            htmlInput: {
              className: styles.titleInput,
              maxLength: 60,
            },
          }}
          size={"medium"}
          placeholder={"שם הטופס"}
          error={!!validationErrors?.title}
          helperText={validationErrors?.title?.[0]}
          variant={"standard"}
          onChange={(e) => setEditedMetadata((prev) => ({ ...prev, title: e.target.value }))}
        />
        <TextField
          value={editedMetadata.description}
          slotProps={{
            htmlInput: {
              maxLength: 255,
            },
          }}
          placeholder={"תיאור"}
          error={!!validationErrors?.description}
          helperText={validationErrors?.description?.[0]}
          variant={"standard"}
          onChange={(e) => setEditedMetadata((prev) => ({
            ...prev,
            description: e.target.value,
          }))}
        />
      </div>
      <div>
        <Button className={styles.button} onClick={handleSaveMetadata}>
          <Check sx={{ fontSize: 20, color: "#308e63" }} />
        </Button>
        <Button className={styles.button} onClick={handleCancelMetadataEdit}>
          <Close sx={{ fontSize: 20, color: "#a54160" }} />
        </Button>
      </div>
    </>
  ) : (
    <MetadataContainer>
      <div className={`${styles.title} ${styles.titleWithMargin}`}>
        <>
          <OverflowTooltip title={title || "שם הטופס"} placement="top">
            <StyledTitleText variant={"h5"}>{title || "שם הטופס"}</StyledTitleText>
          </OverflowTooltip>
          <Tooltip title="עריכת פרטי הטופס">
            <Button className={styles.button}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(_) => {
                setEditedMetadata({ title, description, iconId });
                setIsEditingMetadata(true);
              }}>
              <DriveFileRenameOutline sx={{ fontSize: 25, color: "#506f9e" }} />
            </Button>
          </Tooltip>
        </>
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
  );

  const headerActionButtons: JSX.Element = (
    <>
      <Button variant={"contained"} color={"primary"} onClick={onSaveClick} disabled={isLoading}>
        {isLoading ? "שוומר..." : "שמירה"}
      </Button>
      <Button variant={"outlined"} color={"error"} onClick={onExitClick} disabled={isLoading}>יציאה</Button>
    </>
  );

  const exitAlertMsg: JSX.Element | null = (
    <Dialog
      open={showAlertMsg}
      onClose={() => setShowAlertMsg(false)}
      sx={{ direction: 'rtl' }}
      PaperProps={{
        style: {
          padding: '2% 5%',
          minHeight: '300px',
          width: '45vw',
          maxWidth: '600px',
          borderRadius: '20px',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'gray 0 0 10px 0',
          backgroundColor: '#f5f5f5',
        }
      }}
    >
      <Close
        onClick={() => setShowAlertMsg(false)}
        sx={{
          position: 'absolute',
          top: 15,
          right: 15,
          cursor: 'pointer',
        }}
      />
      <DialogTitle sx={{ textAlign: "center", pt: 0, pb: 1 }}>
        <ErrorIcon sx={{ fontSize: '5rem', color: 'red' }} />
      </DialogTitle>
      <DialogContent sx={{ pb: 1, padding: 0, textAlign: "center" }}>
        <DialogContentText sx={{ fontSize: "1.5rem", color: "inherit" }}>
          יש לך שינויים שלא נשמרו בטופס. האם ברצונך לשמור את השינויים?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", mt: 3, p: 0, gap: '10px', flexDirection: 'row-reverse' }}>
        <Button variant="outlined" onClick={() => setShowAlertMsg(false)}>
          ביטול
        </Button>
        <Button variant="contained" color="primary" onClick={handleSaveAndExit}>
          שמירה ויציאה
        </Button>
        <Button variant="contained" color="primary" onClick={() => {
          setShowAlertMsg(false);
          handleExit();
        }}>
          יציאה ללא שמירה
        </Button>
      </DialogActions>
    </Dialog>
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
    </div>
  );
}

export { FormEditorHeader };