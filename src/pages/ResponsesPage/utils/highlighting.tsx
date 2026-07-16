import React from "react";
import { HighlightedText } from "../styled";

/**
 * Escapes special characters for regex
 */
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Builds a sophisticated search regex that supports:
 * 1. Boolean mappings (כן/לא)
 * 2. Flexible date formats (DD.MM, DD/MM/YY, etc.)
 * 3. Default text matching
 */
export const buildSearchRegex = (query: string): RegExp | null => {
  if (!query || !query.trim()) {
    return null;
  }

  const trimmed = query.trim();
  const trimmedLower = trimmed.toLowerCase();

  // 1. Check for boolean "כן" and its synonyms
  if (["כן", "true"].includes(trimmedLower)) {
    return /((?<![א-ת])כן(?![א-ת])|\btrue\b)/gi;
  }

  // 2. Check for boolean "לא" and its synonyms
  if (["לא", "false"].includes(trimmedLower)) {
    return /((?<![א-ת])לא(?![א-ת])|\bfalse\b)/gi;
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
      const separator = "[\\.\\/\\-]";

      if (y) {
        const yPattern = y.length === 2 ? `(?:20)?${y}` : y;
        return new RegExp(`(${dPattern}${separator}${mPattern}${separator}${yPattern})`, "gi");
      } else {
        return new RegExp(`(${dPattern}${separator}${mPattern})`, "gi");
      }
    }
  }

  // 4. Default fallback: escape regex and return
  return new RegExp(`(${escapeRegExp(trimmed)})`, "gi");
};

/**
 * Highlights text using the search query logic
 */
export const highlightTextUtil = (
  text: string | number | null | undefined,
  searchQuery: string | undefined,
  preComputedRegex?: RegExp | null,
): React.ReactNode => {
  if (text === null || text === undefined || text === "") return text;

  const stringText = String(text);
  if (!searchQuery || !searchQuery.trim()) {
    return stringText;
  }

  const regex = preComputedRegex !== undefined ? preComputedRegex : buildSearchRegex(searchQuery);

  if (!regex) {
    return stringText;
  }

  // If the text is exactly one of the boolean words, we only highlight if it's a full match.
  // This prevents searching for "ל" from highlighting the "ל" in the standalone word "לא".
  if (stringText === "כן" || stringText === "לא") {
    const isFullMatch = new RegExp(`^${regex.source}$`, "i").test(stringText);
    if (!isFullMatch) {
      return stringText;
    }
  }

  const parts = stringText.split(regex);

  // If there's no match, split returns an array with one element
  if (parts.length <= 1) {
    return stringText;
  }

  return parts
    .map((part, index) =>
      index % 2 === 1 ? <HighlightedText key={index}>{part}</HighlightedText> : part,
    )
    .filter((part) => part !== "");
};
