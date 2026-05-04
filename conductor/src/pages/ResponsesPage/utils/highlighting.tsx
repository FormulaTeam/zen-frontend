import React from "react";
import { HighlightedText } from "../styled";

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const buildSearchRegex = (query: string): RegExp | null => {
  if (!query || !query.trim()) {
    return null;
  }

  const trimmed = query.trim();

  // 1. Check for boolean "כן"
  if (trimmed === "כן") {
    return /(כן|\btrue\b|\b1\b|\byes\b)/gi;
  }

  // 2. Check for boolean "לא"
  if (trimmed === "לא") {
    return /(לא|\bfalse\b|\b0\b|\bno\b)/gi;
  }

  // 3. Check for date (DD.MM or DD.MM.YY or DD.MM.YYYY with any separator)
  const dateMatch = trimmed.match(/^(\d{1,2})[\.\/\-](\d{1,2})(?:[\.\/\-](\d{2}|\d{4}))?$/);
  if (dateMatch) {
    const d = parseInt(dateMatch[1], 10);
    const m = parseInt(dateMatch[2], 10);
    const y = dateMatch[3];

    // Valid days and months check
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12) {
      const dPattern = `0?${d}`;
      const mPattern = `0?${m}`;
      const separator = '[\\.\\/\\-]';

      let yPattern = '';
      if (y) {
        if (y.length === 2) {
          yPattern = `(?:20)?${y}`; // Assumes 20xx for 2-digit years
        } else {
          yPattern = y;
        }
        return new RegExp(`(${dPattern}${separator}${mPattern}${separator}${yPattern})`, 'gi');
      } else {
        return new RegExp(`(${dPattern}${separator}${mPattern})`, 'gi');
      }
    }
  }

  // 4. Default fallback
  return new RegExp(`(${escapeRegExp(trimmed)})`, 'gi');
};

export const highlightTextUtil = (
  text: string | number | null | undefined,
  searchQuery: string | undefined
): React.ReactNode => {
  if (text === null || text === undefined) return text;
  
  const stringText = String(text);
  const regex = searchQuery ? buildSearchRegex(searchQuery) : null;

  if (!regex) {
    return stringText;
  }

  const parts = stringText.split(regex);

  if (parts.length === 1) {
    return stringText;
  }

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <HighlightedText key={index}>{part}</HighlightedText>
        ) : (
          part
        )
      )}
    </>
  );
};
