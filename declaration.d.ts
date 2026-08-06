// declaration.d.ts
declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

declare module "*.gif" {
  const value: string;
  export default value;
}

declare module "SP" {
  export const PermissionKind: any;
  // Add other declarations as needed
}

type AppEnvironment = "development" | "test" | "pre-production" | "production";

interface RuntimeEnv {
  REACT_APP_ENVIRONMENT: AppEnvironment;
  REACT_APP_API_URL: string;
  REACT_APP_KEYCLOAK_URL: string;
  REACT_MAX_PAYLOAD_SIZE_MB: number | string;
  REACT_APP_SUPPORT_CONTACT_URL: string;
  REACT_APP_SUPPORT_TICKET_URL: string;
}

interface Window {
  RUNTIME_ENV?: RuntimeEnv;
  hasUnsavedChanges?: boolean;
}
