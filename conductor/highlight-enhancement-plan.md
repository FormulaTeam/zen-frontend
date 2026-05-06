# Objective

Enhance the search highlighting feature to intelligently format and highlight dates and boolean values (כן / לא), even when the input format differs from the displayed format. Also, ensure meta-columns are definitively excluded from highlighting.

# Key Files & Context

- `src/pages/ResponsesPage/utils/highlighting.tsx`: A new utility file to hold the sophisticated regex generation and highlighting logic.
- `src/pages/ResponsesPage/hooks/useCellDisplay.tsx`: Needs to be refactored to use the new `highlightTextUtil` instead of its inline logic.
- `src/pages/ResponsesPage/components/childForms/ChildResponseRow.tsx`: Needs to be refactored to use `highlightTextUtil` and MUST have the `highlightText` removed from the meta-columns (created, createdByName).
- `src/pages/ResponsesPage/components/ResponsesTable.tsx`: The inline `highlightText` function is no longer used for meta columns and should be removed.

# Implementation Steps

1. **Create Utility Function (`src/pages/ResponsesPage/utils/highlighting.tsx`)**:
   - Implement `buildSearchRegex(query: string): RegExp | null`
     - For "כן", return `/(כן|\btrue\b|\b1\b|\byes\b)/gi`
     - For "לא", return `/(לא|\bfalse\b|\b0\b|\bno\b)/gi`
     - For flexible dates, parse `(\d{1,2})[\.\/\-](\d{1,2})(?:[\.\/\-](\d{2}|\d{4}))?` and reconstruct a flexible regex using optional leading zeros and flexible separators.
     - Default to a standard escaped global regex.
   - Implement `highlightTextUtil(text, searchQuery)` that leverages the generated RegExp. Since the RegExp has exactly 1 capturing group, `split` will place the matched groups at odd indices (1, 3, 5...), which allows precise highlighting.

2. **Refactor `useCellDisplay.tsx`**:
   - Import `highlightTextUtil` and remove the inline `escapeRegExp` and `highlightText` functions.
   - Update all `highlightText(value)` calls to use the new utility `highlightTextUtil(value, searchQuery)`.

3. **Refactor `ChildResponseRow.tsx`**:
   - Import `highlightTextUtil` and remove the inline `highlightText` function.
   - Update `getResponseFieldStringValue` to use `highlightTextUtil(value, searchQuery)`.
   - **Crucial**: Remove `highlightText` wrappers from the `formatCreatedDate` and `response.createdByName` meta-columns at the bottom of the render function to adhere to the rule that meta-columns are NEVER highlighted.

4. **Refactor `ResponsesTable.tsx`**:
   - Remove the unused inline `highlightText` function and `escapeRegExp` completely, as it is no longer used (meta-columns should not be highlighted).
   - Remove `HighlightedText` from imports as it is unused.

# Verification & Testing

- **Date Matching**: Searching for "3.5", "03-05", or "03/05" should correctly highlight "03/05/2024" or "3.5.24" in date fields.
- **Boolean Matching**: Searching for "כן" should highlight "כן", "true", "yes", etc.
- **Meta Columns**: Verify that searching for an ID or a specific user's name does NOT highlight the text in the "ID", "Created By", or "Updated By" columns.
- **Build Verification**: Run `npm run build` to verify there are no TypeScript or compilation errors.