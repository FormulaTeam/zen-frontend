# Form Field Schema Migration Plan

## Objective
Migrate form field schema properties to the new structure across the frontend codebase, strictly adhering to the "After" schema without legacy fallbacks. This includes using the new centralized constants exported from `formula-gear` instead of magic strings.

## Scope & Impact
- **Time Field**: `includeSeconds` -> `timePrecision` (`timePrecision.Seconds` | `timePrecision.Minutes`)
- **Date Field**: `includeTime` -> `dateType` (`dateType.Datetime` | `dateType.Date`)
- **Number Field**: `numberType` (`numberType.Integer` | `numberType.Decimal`), `min`, `max`
- **Options Field**: 
  - `multiSelect` -> `selectionMode` (`selectionMode.Multiple` | `selectionMode.Single`)
  - `controllingOptionsFieldId` -> `linkedOptionsFieldId`
  - `defaultOptionId` -> `defaultValue` (always array)
- **Location Field**: `locationFormat` (`locationFormat.Utm` | `locationFormat.Wkt`)
- **Form Field**: `connectedFormId` -> `linkedFormId`
- **Default Values**: 
  - Date: `dateDefaultValue.CurrentDate` | `dateDefaultValue.CurrentDateTime`
  - Time: `timeDefaultValue.CurrentTime`

## Implementation Steps

### 1. Zod Schemas (`src/pages/FormEditor/schemas/fields/`) [DONE]
- Updated `timeSchema.ts`, `dateSchema.ts`, `numberSchema.ts`, `optionsSchema.ts`, and `locationSchema.ts` to strictly validate the new properties using centralized constants.

### 2. Form Editor UI (`src/pages/FormEditor/FormSandbox/FormStructure/FormFieldElement/ExtraElement/elements/`) [DONE]
- Updated `TimeFieldExtra.tsx`, `DateFieldExtra.tsx`, `NumberFieldExtra.tsx`, `LocationFieldExtra.tsx`, and `OptionsFieldExtra` to use centralized constants and remove legacy fallbacks.

### 3. Core Rendering & Editors [DONE]
- **FormFieldRenderer (`src/components/Responses/FormFieldRenderer.tsx`)**: Replaced all magic strings and legacy fallbacks with centralized constants.
- **Cell Editors & Display (`src/pages/ResponsesPage/hooks/` & `components/CellEditors/`)**: Updated `useCellDisplay.tsx`, `OptionsCellEditor.tsx`, `DateCellEditor.tsx`, `TimeCellEditor.tsx`, and `NumberCellEditor.tsx`.

### 4. State & Hooks [DONE]
- **useResponseState (`src/hooks/useResponseState.ts`)**: Updated default value resolution and validation mapping.
- **useTableColumns (`src/hooks/useTableColumns.tsx`)**: Updated date/time display logic.
- **useFormFieldLogic (`src/hooks/useFormFieldLogic.ts`)**: Updated multiSelect and dependency logic.
- **useConnectedFormOptions (`src/hooks/useConnectedFormOptions.ts`)**: Updated linked form/field ID resolution.

## Verification
1. Created new fields and verified their "extra" properties are correctly saved in the new format.
2. Successfully rendered and edited updated field types in a form response page.
3. Verified saving responses respects the new schema configurations.
4. Run project build (`npm run build`) and verified it passes without errors.
