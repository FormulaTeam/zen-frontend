# Form Field Schema Migration Plan

## Objective
Migrate form field schema properties to the new structure across the frontend codebase, strictly adhering to the "After" schema without legacy fallbacks.

## Scope & Impact
- **Time Field**: `includeSeconds` -> `timePrecision` ("seconds" | "minutes")
- **Date Field**: `includeTime` -> `dateType` ("datetime" | "date")
- **Number Field**: (new) `numberType` ("integer" | "decimal"), `min`, `max` (Note: previously used `numberFormat`, switching to `numberType`)
- **Options Field**: 
  - `multiSelect` -> `selectionMode` ("multiple" | "single")
  - `controllingOptionsFieldId` -> `linkedOptionsFieldId`
  - `defaultOptionId` -> `defaultValue` (always array)
- **Location Field**: (new) `locationFormat` ("utm" | "wkt")
- **Form Field**: `connectedFormId` -> `linkedFormId`
- **Default Values**: 
  - Date: "currentDate" | "currentDateTime"
  - Time: "currentTime"

## Implementation Steps

### 1. Zod Schemas (`src/pages/FormEditor/schemas/fields/`)
- Update `timeSchema.ts`, `dateSchema.ts`, `numberSchema.ts`, `optionsSchema.ts`, `locationSchema.ts`, and `linkedFormSchema.ts` to strictly validate the new properties and enum values.

### 2. Form Editor UI (`src/pages/FormEditor/FormSandbox/FormStructure/FormFieldElement/ExtraElement/elements/`)
- Update `TimeFieldExtra.tsx`, `DateFieldExtra.tsx`, `NumberFieldExtra.tsx`, `OptionsFieldExtra` (and its subcomponents), `LocationFieldExtra.tsx`, and `LinkedFormFieldExtra.tsx` to read/write the new properties.
- Update UI controls (e.g., replace checkboxes with selects for enum values).

### 3. Core Rendering & Editors
- **FormFieldRenderer (`src/components/Responses/FormFieldRenderer.tsx`)**: Replace all legacy property reads with the new properties.
- **Cell Editors & Display (`src/pages/ResponsesPage/hooks/` & `components/CellEditors/`)**: Update `useCellDisplay.tsx`, `useCellEditors.tsx`, and `OptionsCellEditor.tsx`.
- **Custom Components (`src/components/FormFields/`)**: Update props for `CustomTimePicker`, `CustomDateTime`, etc.

### 4. State & Hooks
- **useResponseState (`src/hooks/useResponseState.ts`)**: Update default value resolution logic for Date, Time, and Options.
- **useResponseSave (`src/hooks/useResponseSave.ts`)**: Update payload preparation.
- **Other Hooks**: Search and replace in `useChildForms.ts`, `useFormFieldLogic.ts`, `useTableColumns.tsx`.

## Verification & Testing
1. Verify form creation in Form Editor saves the new schema properties.
2. Verify rendering of all updated field types in a form response page.
3. Verify saving responses respects the new schema configurations (e.g., multiple selections, number boundaries).
4. Run project build (`npm run build` or `tsc`) to catch any lingering type errors.
