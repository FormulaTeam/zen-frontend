# Redesign Share Popup (UserPicker)

## Objective
Redesign the form sharing popup (`UserPicker`) to align with the system's modern theme. This involves removing legacy SCSS, eliminating fixed pixel widths, utilizing standard MUI components (Dialog, Avatar, Switch, CircularProgress), and ensuring responsive, clean typography.

## Key Files & Context
- `src/components/UserPicker/UserPicker.tsx`: Main dialog container.
- `src/components/UserPicker/UserPickerContent.tsx`: User search autocomplete and list of shared users.
- `src/components/UserPicker/SharedUser.tsx`: Individual shared user row.
- `src/components/UserPicker/PublicFormSection.tsx`: Public form toggle section.
- `src/components/UserPicker/styled.ts` & `publicForm.styled.ts`: Styled components to be updated.

## Implementation Steps

### 1. Update `UserPicker.tsx` (Main Dialog Container)
- Remove `BasePopup` and import standard MUI dialog components (`Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`, `Button`, `IconButton`, `Tooltip`, `Typography`, `Box`, `useTheme`).
- Implement a responsive `Dialog` (`maxWidth="sm"`, `fullWidth`).
- Add a close button (`IconButton` with `CloseIcon`) in the top right corner.
- Format the `DialogTitle` with a "Share" or "Group" icon and clear typography.
- Move the 'MainButton' (Save) and 'CancelButton' logic into `DialogActions`.

### 2. Update `UserPickerContent.tsx` (Search & List)
- Remove `react-loading` and `male` image imports.
- Replace `ReactLoading` with MUI's `CircularProgress`.
- Replace the `UserAvatar` (which used `man4.png`) with an MUI `Avatar` displaying the user's initials (e.g., from `displayName` or `upn`).
- Remove fixed widths (like `425px`) from `Container`, `UsersList`, `CreatorContainer`, and `SharedUserContainer` in `styled.ts`, allowing them to span `100%` of their parent container.

### 3. Update `SharedUser.tsx`
- Replace the `UserAvatar` (`man4.png`) with an MUI `Avatar` component showing initials.
- Ensure the layout flexes gracefully instead of relying on fixed widths.

### 4. Update `PublicFormSection.tsx` (Public Toggle)
- Replace `Checkbox` with an MUI `Switch` component.
- Adjust `publicForm.styled.ts` to ensure the layout supports the Switch and looks consistent with the rest of the new design.

### 5. Cleanup `styled.ts`
- Remove all references to `width: 425px` or `width: 600px`.
- Ensure flexbox is used efficiently (`width: 100%`, `gap`, `align-items`).

## Verification & Testing
- Open a form's context menu and click "Share" (שיתוף טופס).
- Verify the dialog opens with the new responsive UI.
- Confirm the user search field spans the correct width and looks like standard MUI inputs.
- Ensure added users and the creator appear with MUI Avatars (with initials).
- Toggle the "Public Form" switch and verify it works and looks correct.
- Save changes and verify payload and closing behavior remain intact.
