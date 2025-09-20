import React from "react";
import { IconButton, Typography, useTheme, Tooltip, ClickAwayListener } from "@mui/material";
import BaseFormInput from "../BaseFormInput/BaseFormInput";
import { Check, Close, Edit, ExpandLess, ExpandMore } from "@mui/icons-material";
import { texts } from "../../utils/texts";
import { CustomIcon } from "../../theme/icons";
import { NOT_A_SECTION_ID } from "../../utils/sections/consts";
import { ActionsSection, HeaderContainer, TitleSection } from "./sections.styled";

interface SectionHeaderProps {
  draftValues: { name: string; description: string };
  setDraftValues: React.Dispatch<React.SetStateAction<{ name: string; description: string }>>;
  section: { id: string; name: string; description?: string; collapsed: boolean };
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  toggleCollapse: (sectionId: string) => void;
  anounceRemoveSection: (sectionId: string) => void;
  handeValuesChange: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  draftValues,
  setDraftValues,
  section,
  isEditing,
  setIsEditing,
  toggleCollapse,
  anounceRemoveSection,
  handeValuesChange,
}) => {
  const theme = useTheme();

  // Prevent auto-save when clicking on buttons
  const handleClickAway = (event: MouseEvent | TouchEvent) => {
    const target = event.target as HTMLElement;
    // Check if the click is on a button in the current location
    if (target?.closest("button")) {
      return; // Don't auto-save if clicked on a button
    }
    handeValuesChange();
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <HeaderContainer>
        <TitleSection>
          {isEditing ? (
            <BaseFormInput
              autoFocus
              value={draftValues.name === texts.heb.undefinedSection ? "" : draftValues.name}
              placeholder={texts.heb.undefinedSection}
              onChange={(e) =>
                setDraftValues((prev) => ({
                  name: e.target.value,
                  description: prev.description,
                }))
              }
              variant="standard"
            />
          ) : (
            <Typography onClick={() => setIsEditing(!isEditing)}>
              {section.id !== NOT_A_SECTION_ID && !section.name
                ? texts.heb.undefinedSection
                : section.name}
            </Typography>
          )}

          {isEditing ? (
            <>
              <Tooltip title={texts.heb.confirmEdit}>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handeValuesChange();
                  }}
                  size="small">
                  <Check />
                </IconButton>
              </Tooltip>
              <Tooltip title={texts.heb.cancelEdit}>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(false);
                    setDraftValues({
                      name: section.name,
                      description: section.description || "",
                    });
                  }}
                  size="small">
                  <Close />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Tooltip title={texts.heb.editSection}>
              <IconButton onClick={() => setIsEditing(!isEditing)} size="small">
                <Edit />
              </IconButton>
            </Tooltip>
          )}
        </TitleSection>

        <ActionsSection>
          <Tooltip title={section.collapsed ? texts.heb.expand : texts.heb.collapse}>
            <IconButton onClick={() => toggleCollapse(section.id)}>
              {section.collapsed ? <ExpandMore /> : <ExpandLess />}
            </IconButton>
          </Tooltip>

          <Tooltip title={texts.heb.deleteSection}>
            <IconButton onClick={() => anounceRemoveSection(section.id)} color="error">
              <CustomIcon iconName="delete" forcePointer />
            </IconButton>
          </Tooltip>
        </ActionsSection>
      </HeaderContainer>
    </ClickAwayListener>
  );
};

export default SectionHeader;
