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

### 4. Responses Page Layout
- **Search Bar Repositioning**: Moved the response search bar from the middle of the second line to the left side of the third line (next to view management).
- **Sync Column Refinement**: Replaced the large `CloudUploadIcon` with a small, simple `CloudIcon` in the header.
- **Sync Column Alignment**: Re-aligned the sync header and row status icons to the left (sticking to the opposite side of standard data) for better visual distinction.

### 5. System Consistency
- **Navbar Stabilization**: Set navbar to `position: static` and standardized container heights (`100%`) to eliminate layout "jumping" between pages.
- **Background Standardization**: Updated the Form Editor background color to `#F1F5F9` to match the rest of the application.
- **Layout Padding**: Standardized side padding for the Form Editor to `24px`.
- **Typography Consistency**: Ensured custom styled buttons (like "Create New Form") explicitly inherit the system-wide font family.

## Verification Results
- [x] Main page is non-scrollable.
- [x] Tables show a grabbable horizontal scrollbar.
- [x] Tables do not show a vertical scrollbar.
- [x] Empty section names in Form Editor show a placeholder and are re-editable.
- [x] Cards in the main page are clipped at the top row during scroll.
- [x] Responses page search bar is correctly positioned on the third line next to views.
- [x] Navbar does not jump when navigating between Home and Form Editor.
- [x] Form Editor background matches the Main Page background.
- [x] "Create New Form" button uses the correct system font.


