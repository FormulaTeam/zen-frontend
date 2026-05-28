# Scrollbar and UI Refinements

## Overview
This task involved removing scrollbars from the entire system while preserving them for data tables, locking the main page scrolling, and fixing a bug in the Form Editor.

## Changes

### 1. Scrollbar Management
- **Global Hiding**: Hidden scrollbars for all elements using `*::-webkit-scrollbar` with zero dimensions and `scrollbar-width: none`.
- **Table Preservation**: Explicitly re-enabled and styled horizontal scrollbars for MUI `DataGrid` and `TableContainer` components (16px height for better interactivity).
- **Vertical Scrollbar**: Hidden the vertical scrollbar in the Responses table.

### 2. Main Page UI
- **Scroll Locking**: Locked `html`, `body`, and the main router container (`Router.tsx`) with `overflow: hidden` to prevent page-level scrolling.
- **Card Clipping**: Adjusted `MainPage` layout to ensure scrolling cards are clipped at the top row's initial position, preventing overlap with the header.
- **Header Opaque**: Set a background color for the main page header area to cleanly obscure scrolling content.

### 3. Form Editor Fixes
- **Section Rename Bug**: Added a visible placeholder ("מקטע ללא שם") for empty section names to ensure they remain clickable and editable.
- **Placeholder Styling**: Added italicized and greyed-out styling for the empty section title placeholder.

## Verification Results
- [x] Main page is non-scrollable.
- [x] Tables show a grabbable horizontal scrollbar.
- [x] Tables do not show a vertical scrollbar.
- [x] Empty section names in Form Editor show a placeholder and are re-editable.
- [x] Cards in the main page are clipped at the top row during scroll.
