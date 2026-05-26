# Infinite Update Loop Fix Plan

## Objective
Fix the `Maximum update depth exceeded` error that occurs during ref detachment and state updates in the React render cycle, which was inadvertently triggered or exposed by recent highlighting enhancements.

## Root Cause Analysis
The stack trace (`safelyDetachRef` -> `commitDeletionEffectsOnFiber` -> `dispatchSetState` -> `ref.current`) indicates that a functional ref is calling a state setter during the unmount (commit) phase, triggering a continuous update loop. 

This usually happens when MUI's `Tooltip` and `useForkRef` are combined with conditional rendering. In `src/components/OverflowTooltip/index.tsx`, the component conditionally wraps `clonedChild` in a `<Tooltip>` only when `isOverflowing` is true:
```tsx
return isOverflowing ? <Tooltip>{clonedChild}</Tooltip> : clonedChild;
```
In highly dynamic environments like MUI DataGrid cells (where `OverflowTooltip` is used extensively via `useCellDisplay`), this conditional wrapping causes the child node to constantly unmount and remount as it's moved in and out of the `Tooltip`. This continuously detaches and re-attaches MUI's internal refs, which, under certain layout/highlighting conditions, causes a recursive state update loop in the commit phase.

## Implementation Steps

### 1. Stabilize `OverflowTooltip` (Critical Fix)
Refactor `src/components/OverflowTooltip/index.tsx` to ensure the DOM structure and ref hierarchy remain completely stable, regardless of the `isOverflowing` state.
- **Change:** Always render the `<Tooltip>` component wrapping the `clonedChild`.
- **Change:** Instead of conditionally rendering the `Tooltip`, dynamically disable its interactive listeners (`disableHoverListener`, `disableFocusListener`, `disableTouchListener`) when `isOverflowing` is false.
- **Benefit:** This prevents the child from being unmounted/remounted, completely eliminating the ref detachment loop.

### 2. Optimize `highlightTextUtil`
Refactor `src/pages/ResponsesPage/utils/highlighting.tsx` to be as transparent as possible to parent styling and ref mechanisms.
- **Change:** Instead of returning a `React.Fragment` (`<>...</>`), return a flattened array of nodes.
- **Change:** Filter out empty string matches before returning to reduce the number of empty DOM text nodes in the DataGrid cells.

## Verification
- Search for various terms (including dates and booleans) in the Responses table.
- Verify that the table filters and highlights correctly without crashing or freezing.
- Verify that tooltips still only appear when cell text overflows its container.