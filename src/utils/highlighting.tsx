import React from "react";
import { HighlightedText } from "../components/SharedStyled";

/**
 * Escapes special characters for regex
 */
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Builds a regex that matches any of the words in the query independently.
 * Splits the query by whitespace and joins with |
 */
export const buildMultiTermRegex = (query: string): RegExp | null => {
  if (!query || !query.trim()) {
    return null;
  }

  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return null;

  const pattern = terms.map(escapeRegExp).join("|");
  return new RegExp(`(${pattern})`, "gi");
};

/**
 * Highlights text using the search query logic.
 * Splits by whitespace to highlight multiple non-consecutive terms.
 */
export const highlightText = (
  text: string | number | null | undefined,
  searchQuery: string | undefined,
): React.ReactNode => {
  if (text === null || text === undefined) return text;

  const stringText = String(text);
  const regex = searchQuery ? buildMultiTermRegex(searchQuery) : null;

  if (!regex) {
    return stringText;
  }

  const parts = stringText.split(regex);

  // If there's no match, split returns an array with one element
  if (parts.length === 1) {
    return stringText;
  }

  return parts
    .map((part, index) =>
      index % 2 === 1 ? <HighlightedText key={index}>{part}</HighlightedText> : part,
    )
    .filter((part) => part !== "");
};
