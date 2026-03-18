import { Box, Button, ClickAwayListener, IconButton, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import BaseFormInput from "../BaseFormInput/BaseFormInput";
import IconsGrid from "../IconsGrid/IconsGrid";
import { formIconsNamesMap, DEFAULT_ICON_NAME } from "@utils/utils";
import { CaptionError, DisplayRow, EditDetailsBox, InputRow, ToolbarContainer } from "./styled";
import { ErrorMessageType } from "../../types/interfaces/forms.types";
import { Img } from "../FormCard/styled";
import { CustomIcon } from "@theme/icons";

type Props = {
  exit: () => void;
  title: string;
  description: string;
  showTitleError: boolean;
  formIconName: string;
  onTitleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  validateTitle: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onTitleBlur?: () => void;
  onDescriptionChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onDescriptionBlur?: () => void;
  onIconChange: (iconName: string | null) => void;
  hasUnsavedChanges?: boolean;
  saveForm: (exit: boolean) => void;
  announceUnsavedChanges?: () => void;
  errorMessage?: ErrorMessageType;
  setShowTitleRedText: (show: boolean) => void;
  savedSuccess: boolean;
};

export default function TopToolbar({
  exit,
  title,
  description,
  showTitleError,
  formIconName,
  onTitleChange,
  validateTitle,
  onTitleBlur = () => { },
  onDescriptionChange,
  onDescriptionBlur = () => { },
  onIconChange,
  hasUnsavedChanges = false,
  announceUnsavedChanges = () => { },
  errorMessage,
  saveForm,
  setShowTitleRedText,
  savedSuccess = false,
}: Props) {
  const [editDetails, setEditDetails] = useState(false);
  const [showPickIcon, setShowPickIcon] = useState(false);

  /**
   * Handles paste events for an input field.
   * Prevents pasting any text that includes non-Hebrew characters.
   *
   * - If the pasted text contains only Hebrew letters and spaces, it allows the paste and hides the red error text.
   * - If the pasted text includes any non-Hebrew characters, the paste is blocked and an error indicator is shown.
   *
   * @param e - The clipboard paste event
   */
  const onPasteHandler = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    const hebrewRegex = /^[\u0590-\u05FF\s]{1,}$/;
    if (!hebrewRegex.test(pastedText)) {
      e.preventDefault();
      setShowTitleRedText(true);
    } else {
      setShowTitleRedText(false);
    }
  };

  return (
    <ToolbarContainer>
      <EditDetailsBox>
        <ClickAwayListener
          mouseEvent="onMouseUp"
          onClickAway={() => editDetails && setEditDetails(false)}>
          <Box id="edit-details-container">
            {editDetails ? (
              <InputRow sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <div>
                  <Img
                    src={
                      formIconsNamesMap.get(formIconName) || formIconsNamesMap.get(DEFAULT_ICON_NAME)
                    }
                    style={{ maxWidth: "60px", cursor: "pointer" }}
                    onClick={() => setShowPickIcon(true)}
                  />
                </div>
                <Box>
                  <BaseFormInput
                    fullWidth
                    value={title}
                    label="שם טופס"
                    onChange={onTitleChange}
                    onKeyDown={validateTitle}
                    onPaste={onPasteHandler}
                    onBlur={onTitleBlur}
                    error={showTitleError || !!errorMessage?.message}
                    helperText={
                      showTitleError
                        ? "ניתן להזין רק אותיות בעברית!"
                        : errorMessage?.message ||
                        (!title?.trim() && "יש להזין שם עם לפחות חמש אותיות בעברית")
                    }
                    autoFocus
                    sx={{ mb: 1 }}
                  />

                  <BaseFormInput
                    fullWidth
                    value={description || ""}
                    onChange={onDescriptionChange}
                    onBlur={onDescriptionBlur}
                    placeholder="ללא תיאור"
                  />
                </Box>
              </InputRow>
            ) : (
              <DisplayRow>
                <Img
                  src={
                    formIconsNamesMap.get(formIconName) || formIconsNamesMap.get(DEFAULT_ICON_NAME)
                  }
                  style={{ maxWidth: "60px", cursor: "pointer" }}
                  onClick={() => setShowPickIcon(true)}
                />
                <Box>
                  <Typography variant="h5">
                    {title || "שם הטופס"}
                    <Tooltip title="עריכת פרטי הטופס">
                      <IconButton onClick={() => setEditDetails(true)}>
                        <CustomIcon iconName="edit" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                  <Typography variant="subtitle1">{description || "ללא תיאור"}</Typography>
                  {errorMessage?.message && (
                    <CaptionError variant="caption">
                      {showTitleError ? "ניתן להזין רק אותיות בעברית!" : errorMessage.message}
                    </CaptionError>
                  )}
                </Box>
              </DisplayRow>
            )}
          </Box>
        </ClickAwayListener>
      </EditDetailsBox>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Tooltip title="שמור את הטופס והמשך לעבוד">
          <Button variant="outlined" onClick={() => saveForm(false)}>
            שמירה
          </Button>
        </Tooltip>
        <Tooltip title={hasUnsavedChanges ? "יש שינויים שלא נשמרו, האם לצאת?" : "יציאה מהטופס"}>
          <Button
            color="error"
            variant="outlined"
            onClick={hasUnsavedChanges && !savedSuccess ? announceUnsavedChanges : exit}>
            יציאה
          </Button>
        </Tooltip>
      </Box>

      {showPickIcon && (
        <IconsGrid onIconChange={onIconChange} onClosePickIcon={() => setShowPickIcon(false)} />
      )}
    </ToolbarContainer>
  );
}
