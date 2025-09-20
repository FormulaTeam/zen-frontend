import React, { useState, useMemo, useRef } from "react";
import { Dialog, TextField, Grid, Button } from "@mui/material";
import * as Icons from "@mui/icons-material";
import { IconsGridWrapper, IconsGridContainer, GridIcon, DialogActionWrapper } from "./styled";
import { hebrewKeywordsMap } from "../../utils/hebrewKeywordsMap";

// Props interface for the icon picker component
interface Props {
  onIconChange: (selectedIcon: string | null) => void;
  onClosePickIcon: () => void;
}

// Filters all MUI icons to only include those ending in "Outlined"
const ALL_ICONS = Object.keys(Icons).filter((name) => name.endsWith("Outlined"));

/**
 * Normalizes Hebrew strings to enable consistent matching in search logic.
 *
 * In this code, we compare the user’s search input with Hebrew keyword mappings or icon names.
 * To ensure accurate matching:
 * - Diacritics (nikud) are removed to avoid mismatches between marked and unmarked characters.
 * - Final-form letters are converted to their standard form since they represent the same letter
 *   but are treated as different characters in code-level string comparisons.
 */
const normalize = (str: string) =>
  str
    .toLowerCase()
    .replace(/[\u05C1\u05C2\u05B0-\u05BD\u05BF-\u05C5\u05C7]/g, "") // Remove nikud
    .replace(/[\u05DA]/g, "כ") // ך => כ
    .replace(/[\u05DD]/g, "מ") // ם => מ
    .replace(/[\u05DF]/g, "נ") // ן => נ
    .replace(/[\u05E3]/g, "פ") // ף => פ
    .replace(/[\u05E5]/g, "צ"); // ץ => צ

/**
 * A MUI dialog component for picking outlined icons with support for:
 * - Infinite scroll
 * - Hebrew and English search
 * - Keyword matching via `hebrewKeywordsMap`
 */
export default function MuiIconsPicker({ onIconChange, onClosePickIcon }: Props) {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null); // Selected icon name
  const [query, setQuery] = useState(""); // Current search input
  const [visibleCount, setVisibleCount] = useState(100); // Number of icons to render
  const containerRef = useRef<HTMLDivElement>(null); // Ref for scroll container

  /**
   * Memoized result of filtering icons based on the query:
   * 1. Search against Hebrew keywords (mapped manually).
   * 2. Fallback to filtering MUI icon names if no Hebrew match is found.
   */
  const resolvedQuery = useMemo(() => {
    const normalizedQuery = normalize(query);
    const matchedIcons = new Set<string>();

    for (const [hebrewKey, iconNames] of Object.entries(hebrewKeywordsMap)) {
      const normalizedHebrew = normalize(hebrewKey);
      if (
        normalizedHebrew.includes(normalizedQuery) ||
        normalizedQuery.includes(normalizedHebrew)
      ) {
        iconNames.forEach((icon) => matchedIcons.add(icon));
      }
    }

    // Fallback to English/Latin name search if no Hebrew match found
    if (matchedIcons.size === 0 && normalizedQuery) {
      ALL_ICONS.forEach((iconName) => {
        if (normalize(iconName).includes(normalizedQuery)) {
          matchedIcons.add(iconName);
        }
      });
    }

    return [...matchedIcons];
  }, [query]);

  // Controls the subset of icons currently shown (for infinite scroll)
  const iconsToShow = useMemo(
    () => resolvedQuery.slice(0, visibleCount),
    [resolvedQuery, visibleCount],
  );

  /**
   * Increments the visible icon count when user scrolls to the bottom
   */
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      setVisibleCount((prev) => prev + 50);
    }
  };

  /**
   * Saves the selected icon and closes the dialog
   */
  const handleSave = () => {
    onIconChange(selectedIcon);
    onClosePickIcon();
  };

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={onClosePickIcon}>
      <IconsGridWrapper>
        {/* Search Input */}
        <TextField
          placeholder="חיפוש..."
          fullWidth
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisibleCount(100); // Reset scroll position on new query
          }}
          sx={{ mb: 2 }}
        />

        {/* Icon Grid with Infinite Scroll */}
        <IconsGridContainer container spacing={2} onScroll={handleScroll} ref={containerRef}>
          {iconsToShow.map((iconName) => {
            const IconComponent = Icons[iconName as keyof typeof Icons];
            if (!IconComponent) return null;

            return (
              <Grid key={iconName} sx={{ textAlign: "center" }}>
                <GridIcon
                  selected={selectedIcon === iconName}
                  onClick={() => setSelectedIcon(iconName)}>
                  <IconComponent />
                </GridIcon>
              </Grid>
            );
          })}
        </IconsGridContainer>

        {/* Dialog Action Buttons */}
        <DialogActionWrapper>
          <Button variant="contained" disabled={!selectedIcon} onClick={handleSave}>
            שמירה
          </Button>
          <Button variant="outlined" onClick={onClosePickIcon}>
            ביטול
          </Button>
        </DialogActionWrapper>
      </IconsGridWrapper>
    </Dialog>
  );
}
