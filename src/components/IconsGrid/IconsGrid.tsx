import React, { useState, useMemo } from "react";
import { Dialog, Grid, Button, TextField } from "@mui/material";
import { GridIcon, StyledDialogTitle, SearchContainer, StyledDialogContent, StyledDialogActions, GridIconContainer, IconImage } from "./styled";
import { formIconsNamesMap, DEFAULT_ICON_NAME } from "../../utils/utils";
import { hebrewKeywordsMap } from "../../utils/hebrewKeywordsMap";

interface Props {
  onIconChange: (selectedIcon: string | null) => void;
  onClosePickIcon: () => void;
}

export default function MuiIconsPicker({ onIconChange, onClosePickIcon }: Props) {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filteredIcons = useMemo(() => {
    const allIcons = Array.from(formIconsNamesMap.entries()).filter(([iconName]) => iconName !== DEFAULT_ICON_NAME);
    if (!query.trim()) return allIcons;

    const lowerQuery = query.toLowerCase();

    return allIcons.filter(([iconName]) => {
      const nameStr = String(iconName);
      // Search in english name
      if (nameStr.toLowerCase().includes(lowerQuery)) return true;

      // Search in hebrew mapped names
      const hebrewTerms = hebrewKeywordsMap[nameStr] || [];
      return hebrewTerms.some(term => term.includes(lowerQuery));
    });
  }, [query]);


  const handleSave = () => {
    onIconChange(selectedIcon);
    onClosePickIcon();
  };

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={onClosePickIcon}>
      <StyledDialogTitle>בחירת אייקון</StyledDialogTitle>

      <SearchContainer>
        <TextField
          placeholder="חיפוש לפי שם או מילת מפתח..."
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </SearchContainer>

      <StyledDialogContent>
        <Grid container>
          {filteredIcons.map(([iconName, iconSrc]) => (
            <Grid key={iconName}>
              <GridIconContainer>
                <GridIcon
                  selected={selectedIcon === iconName}
                  onClick={() => setSelectedIcon(String(iconName))}>
                  <IconImage src={iconSrc} alt={String(iconName)} />
                </GridIcon>
              </GridIconContainer>
            </Grid>
          ))}
        </Grid>
      </StyledDialogContent>

      <StyledDialogActions>
        <Button variant="contained" disabled={!selectedIcon} onClick={handleSave}>
          שמירה
        </Button>
        <Button variant="outlined" onClick={onClosePickIcon}>
          ביטול
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
}
