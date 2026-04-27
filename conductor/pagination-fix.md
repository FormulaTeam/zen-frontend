# Pagination Robustness Strategy

## Issue
Rapidly clicking "Previous" allows the UI to fire a query for a page "before" the first page. This occurs because React Query's `keepPreviousData` causes `pageInfo` to remain stale (from page 2) while the fetch for page 1 is in flight. Consequently, the UI still sees `hasPreviousPage: true` during the transition, allowing the user to click again before the state syncs, bypassing the logical guards.

## Solution
1. **Sync `isPlaceholderData`**: In `useFormLoader.ts`, we must extract `isPlaceholderData` from the `useGetResponsesRows` hook and logically OR it with `isRowsFetching` when setting `isRowsLoading` in the store. This ensures the table and pagination buttons treat the placeholder state as an active loading state.
2. **Strict Guard Enhancements**: Continue enforcing the synchronous `transitionInProgress` ref and `isNavigating` state to provide immediate UI feedback and absolute zero-latency request blocking.
3. **Cursor Validation**: Ensure the `pageNumber` is correctly tracked as the absolute source of truth for the "First Page" state (`pageNumber <= 1`), completely overriding the potentially stale network-provided `hasPreviousPage` flag during rapid transitions.

## Implementation Steps
1. Modify `useFormLoader.ts` to sync `isPlaceholderData`.
2. Apply changes and test via `npm run build` / `tsc`.