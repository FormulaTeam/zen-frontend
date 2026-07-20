import React from "react";
import { HighlightedText } from "../components/SharedStyled";

/**
 * Escapes special characters for regex
 */
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const buildTermPattern = (term: string): string => {
  const escaped = escapeRegExp(term);
  const lowerTerm = term.toLowerCase();

  // Boolean aliases in Hebrew/English.
  if (["כן", "true"].includes(lowerTerm)) {
    return "(?:(?<![א-ת])כן(?![א-ת])|\\btrue\\b)";
  }
  if (["לא", "false"].includes(lowerTerm)) {
    return "(?:(?<![א-ת])לא(?![א-ת])|\\bfalse\\b)";
  }

  // Flexible date-like token matching: allow slash/dot/dash and optional leading zeros.
  if (/\d[./-]\d/.test(term)) {
    return escaped
      .replace(/\\\.|\\\/|\\-/g, "[./-]")
      .replace(/(\d+)/g, "0*$1");
  }

  return escaped;
};

/**
 * Builds a regex that matches any of the words in the query independently.
 * Supports:
 * 1. Boolean mappings (כן/לא)
 * 2. Flexible date formats (DD.MM, DD/MM/YY, etc.) with interchangeable separators
 */
export const buildSearchRegex = (query: string): RegExp | null => {
  if (!query || !query.trim()) {
    return null;
  }

  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return null;

  const pattern = terms
    .map((term) => buildTermPattern(term))
    .join("|");

  return new RegExp(`(${pattern})`, "gi");
};

/**
 * Highlights text using the search query logic.
 * Uses a robust loop approach and ensures ALL terms are present before highlighting (AND logic).
 */
export const highlightText = (
  text: string | number | null | undefined,
  searchQuery: string | undefined,
): React.ReactNode => {
  if (text === null || text === undefined) return text;

  const stringText = String(text);
  const regex = searchQuery ? buildSearchRegex(searchQuery) : null;

  if (!regex || !searchQuery) {
    return stringText;
  }

  // 1. Verify AND Logic: All terms must be present in the text to trigger any highlighting.
  // This matches the backend's new multi-term search behavior.
  const terms = searchQuery.trim().split(/\s+/).filter(Boolean);
  const allTermsPresent = terms.every((term) => {
    const termRegex = new RegExp(buildTermPattern(term), "gi");
    return termRegex.test(stringText);
  });

  if (!allTermsPresent) {
    return stringText;
  }

  // 2. Special case for boolean words
  if (stringText === "כן" || stringText === "לא") {
    const isFullMatch = new RegExp(`^${regex.source}$`, "i").test(stringText);
    if (!isFullMatch) {
      return stringText;
    }
  }

  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex index because it's global
  regex.lastIndex = 0;

  while ((match = regex.exec(stringText)) !== null) {
    const index = match.index;
    const matchedText = match[0];

    // Add text before match
    if (index > lastIndex) {
      result.push(stringText.slice(lastIndex, index));
    }

    // Add highlighted match
    result.push(
      <HighlightedText key={index}>{matchedText}</HighlightedText>
    );

    lastIndex = index + matchedText.length;

    // Prevent infinite loops on zero-width matches
    if (match[0].length === 0) {
      regex.lastIndex++;
    }
  }

  // Add remaining text
  if (lastIndex < stringText.length) {
    result.push(stringText.slice(lastIndex));
  }

  return result.length > 0 ? result : stringText;
};
