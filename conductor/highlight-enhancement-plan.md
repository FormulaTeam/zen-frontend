# Implementation Plan: Semantic Highlighting for Forms Search

## Objective
Enhance the Forms search experience by adding semantic highlighting to search results. The highlighting will cover the Form ID, Form Name, and Form Description, supporting exact, partial, and case-insensitive matches for multiple independent search terms.

## Key Files & Context
- `src/components/SharedStyled.tsx`: Add the central `HighlightedText` styled component.
- `src/utils/highlighting.tsx`: Create a reusable utility that handles multi-term regex building and highlighting.
- `src/pages/MainPage/MainPage.tsx`: Update the component to pass the current `searchValue` down to each `FormCard`.
- `src/components/FormCard/FormCard.tsx`: Update to receive `searchValue`, apply the highlighting utility to Name and Description, and display the Form ID (with highlighting) right after the form name in a smaller, muted style.

## Implementation Steps

1.  **Centralize Highlighting Style:** [DONE]
    -   Add `export const HighlightedText = styled("mark")({ backgroundColor: "#fff59d", color: "inherit", padding: 0, borderRadius: "2px" });` to `src/components/SharedStyled.tsx`.

2.  **Create Multi-term Highlighting Utility:** [DONE]
    -   Create `src/utils/highlighting.tsx` containing a `highlightText` function.
    -   To ensure non-consecutive words are highlighted correctly, the function will split the `searchQuery` by whitespace, escape each individual word, and join them with `|` to create a regex that matches *any* of the words independently (using `gi` flags).
    -   It will map over the split text and wrap matches in the `<HighlightedText>` component.

3.  **Update `MainPage.tsx`:** [DONE]
    -   In the `formsData.map` loop, pass the `searchValue` prop to the `FormCard` component.

4.  **Update `FormCard.tsx`:** [DONE]
    -   Add `searchValue` to the component's props interface.
    -   **Form Name:** Wrap `form.name` with the `highlightText` utility inside the `<ItemTitle>` component.
    -   **Form ID:** Add a new `<Typography>` element right after the `<ItemTitle>` (inside a parent flex container) to display the ID (e.g., `#1234` or just `1234`). It will have a smaller font size and muted color (e.g., `text.secondary`). Apply `highlightText` to it.
    -   **Form Description:** Wrap `form.description` with the `highlightText` utility inside the `<ItemDescription>` component.

5.  **Refactor Existing Highlighting (Optional/Cleanup):** [DONE]
    -   The central `HighlightedText` style is now available in `SharedStyled.tsx`. `ResponsesPage` already uses an identical style, ensuring consistency.

## Verification & Testing
- Search for a single term (e.g., "leave") and verify it's highlighted in names and descriptions.
- Search for multiple terms (e.g., "leave request") and verify both "leave" and "request" are highlighted independently, regardless of their order.
- Search for a Form ID number and verify the new ID element appears next to the name and is highlighted.
- Verify that case-insensitive matches work correctly for English characters.
- Verify that Hebrew text highlights correctly.
- Ensure the layout of `FormCard` remains intact when text is highlighted or truncated.