# Hazen Frontend - Dynamic Form Builder

Hazen is a comprehensive form management system that allows users to create, manage, and collect responses from dynamic forms. This React-based frontend provides an intuitive interface for building complex forms with various field types and conditional logic.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Form Field System](#form-field-system)
- [Adding a New Field Type](#adding-a-new-field-type)
- [Architecture](#architecture)
- [Development Guidelines](#development-guidelines)
- [Building for Production](#building-for-production)

## Overview

Hazen enables users to:

- Create dynamic forms with drag-and-drop interface
- Support multiple field types (text, date, location, file upload, etc.)
- Set up conditional field display logic
- Organize fields into sections
- Collect and manage form responses
- Export data in various formats
- Integrate with external systems

## Tech Stack

- **Framework**: React 18.3.1 with TypeScript
- **UI Library**: Material-UI (MUI) 7.0.2
- **State Management**: React Context API
- **Routing**: React Router DOM 6.26.0
- **Styling**: SCSS + Styled Components
- **Drag & Drop**: @hello-pangea/dnd
- **Charts**: Recharts 2.15.3
- **File Handling**: React Dropzone
- **Date/Time**: Day.js + MUI Date Pickers
- **HTTP Client**: Axios
- **Icons**: Material Icons

## Project Structure

```
src/
├── api/                    # API service layer
├── components/             # Reusable components
│   ├── FormFields/        # Custom form field components
│   ├── CreateForm/        # Form builder components
│   ├── Dashboard/         # Dashboard components
│   └── ...
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── pages/                 # Main page components
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions and interfaces
├── theme/                 # Theme configuration and icons
└── Router.tsx             # Application routing
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see hazen-hazen-api repo)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (if needed)
4. Start the development server:
   ```bash
   npm start
   ```

The application will open at [http://localhost:3001](http://localhost:3001)

## Available Scripts

### `npm start`

Runs the app in development mode on port 3001.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm run eject`

**Note: This is a one-way operation!** Removes the single build dependency and exposes all configuration files.

## Form Field System

Hazen supports multiple field types, each with specific properties and validation rules:

### Available Field Types

| Type ID | Name       | Description                | Component                      |
| ------- | ---------- | -------------------------- | ------------------------------ |
| 1       | Long Text  | Multi-line text input      | `CustomTextField`              |
| 2       | Small Text | Single-line text input     | `CustomTextField`              |
| 3       | Options    | Dropdown/Multi-select      | `CustomDropDownAutocomplete`   |
| 4       | Link       | Hyperlink with text        | `LinkTextField`                |
| 5       | Date       | Date picker                | `CustomDateTime`               |
| 6       | Hour       | Time picker                | `CustomTimePicker`             |
| 7       | Location   | Coordinate input (UTM/WKT) | `CustomLatitudeLongitudeField` |
| 8       | Checkbox   | Boolean toggle             | `CustomSwitch`                 |
| 9       | List       | Multi-value input          | `CustomMultiInputField`        |
| 10      | Number     | Numeric input              | `CustomNumberField`            |
| 11      | File       | File upload                | `CustomFileInputField`         |
| 12      | Form       | Nested form                | `FormInFormField`              |

### Field Properties

Each field supports:

- **Basic Properties**: name, display name, required flag, validation regex
- **Type-Specific Properties**: min/max values, options, multi-select, etc.
- **Conditional Logic**: Show/hide based on other field values
- **Section Organization**: Group fields into collapsible sections
- **Metro Sync**: Integration with external Metro system

## Adding a New Field Type

To add a new field type to the system, follow these steps:

### 1. Define the Field Type

Add the new field type to the constants:

```typescript
// src/utils/interfaces.ts
export const FieldTypeIds = {
  // ... existing types
  newFieldType: 13, // Use next available ID
} as const;
```

### 2. Add to Default Fields

```typescript
// src/utils/interfaces.ts
export const DEFAULT_FIELDS: DefaultField[] = [
  // ... existing fields
  {
    typeId: FieldTypeIds.newFieldType,
    name: "שם השדה החדש", // Hebrew name
    icon: "iconName", // Icon from FieldsIcons
    fieldType: FieldTypes.string, // Data type
  },
];
```

### 3. Create the Form Field Component

Create a new component in `src/components/FormFields/`:

```typescript
// src/components/FormFields/CustomNewField/CustomNewField.tsx
import React from "react";
import { CustomInputFormFieldProps } from "../../../utils/interfaces";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";

interface CustomNewFieldProps extends CustomInputFormFieldProps {
  value: any;
  // Add specific props for your field
}

const CustomNewField: React.FC<CustomNewFieldProps> = ({
  value,
  isDisabled,
  onChangeHandler,
  isValid,
  label,
  isRequired,
}) => {
  // Implement your field logic here

  return (
    <BaseFieldInput
      label={label}
      required={isRequired}
      value={value}
      onChange={(e) => onChangeHandler(e.target.value, true)}
      disabled={isDisabled}
      error={!isValid}
    />
  );
};

export default CustomNewField;
```

### 4. Add Icon Support

Add the icon to the icons system:

```typescript
// src/components/FieldsIcons.tsx
import { YourNewIcon } from "@mui/icons-material";

export const fieldsIcons: FieldsIcons = {
  // ... existing icons
  iconName: <YourNewIcon />,
};
```

### 5. Update Form Property Renderer

Add the new field to the form builder:

```typescript
// src/components/CreateForm/FormPropertyRenderer.tsx
export default function FormPropertyRenderer({ ...props }) {
  // ... existing code

  switch (formField.typeId) {
    // ... existing cases

    case FieldTypeIds.newFieldType:
      input = (
        <CustomNewField
        // Pass required props
        />
      );
      break;
  }
}
```

### 6. Update Response Renderer

Add support for displaying the field in responses:

```typescript
// src/components/Responses/FormFieldRenderer.tsx
export default function FormFieldRenderer({ ...props }) {
  // ... existing code

  switch (formField.typeId) {
    // ... existing cases

    case FieldTypeIds.newFieldType:
      input = (
        <CustomNewField
        // Configure for response display
        />
      );
      break;
  }
}
```

### 7. Update Preview Renderer

Add preview support:

```typescript
// src/components/FormFieldsPreviewRenderer/FormFieldsPreviewRenderer.tsx
function FormFieldsPreviewRenderer({ formField }) {
  switch (formField.typeId) {
    // ... existing cases

    case FieldTypeIds.newFieldType:
      return <CustomNewField /* preview props */ />;
  }
}
```

### 8. Add Styling (Optional)

Create SCSS module for styling:

```scss
// src/components/FormFields/CustomNewField/CustomNewField.module.scss
.custom-new-field {
  // Your styles here
}
```

### 9. Update Validation (Backend)

Ensure the backend API supports the new field type in validation and storage.

### 10. Add Field-Specific Configuration

If your field needs special configuration options, add them to the form builder:

```typescript
// Add configuration components in FormPropertyRenderer
case FieldTypeIds.newFieldType:
  input = (
    <>
      {getFormPropertyTitleTextField(formField, index)}
      <YourFieldConfigComponent
        formField={formField}
        setFormFields={setFormFields}
        // ... other props
      />
    </>
  );
  break;
```

## Architecture

### Context Providers

- **AuthContext**: User authentication and authorization
- **FormChangesContext**: Form builder state management
- **SuperAdminContext**: Super admin specific functionality

### Key Hooks

- **useCustomFormFields**: Manages custom field definitions
- **useFormValidation**: Handles form validation logic
- **useResponses**: Manages form response data

### Routing

The application uses React Router with protected routes based on user permissions.

## Development Guidelines

### Naming Conventions

- Components: PascalCase (`FormFieldWrapper`)
- Files: PascalCase for components, camelCase for utilities
- CSS Classes: kebab-case
- Constants: UPPER_SNAKE_CASE

### TypeScript

- Use strict typing throughout the application
- Define interfaces for all data structures
- Avoid `any` type when possible

### Styling

- Use SCSS modules for component-specific styles
- Follow Material-UI theme structure
- Support RTL (Right-to-Left) languages

### Accessibility

- Follow WCAG guidelines
- Use semantic HTML elements
- Provide proper ARIA labels

## Building for Production

### Docker Build Process

1. Verify nginx.conf has `listen 8080;`
2. Build Docker image:
   ```bash
   docker build -t hazen:1.4.0 .
   ```
3. Save image to tar file:
   ```bash
   docker save -o hazen-1.4.0.tar hazen:1.4.0
   ```
4. Create zip from tar file for deployment

### Environment Configuration

The application uses runtime environment configuration through `runtime-env.js` for deployment flexibility.

### Nginx Configuration

The production build uses Nginx to serve static files and proxy API requests. Configuration is defined in `nginx.conf`.

## Contributing

When contributing to the project:

1. Follow the established patterns for new field types
2. Update relevant documentation
3. Test thoroughly across different field combinations
4. Ensure backward compatibility with existing forms
5. Add proper TypeScript types for all new interfaces
