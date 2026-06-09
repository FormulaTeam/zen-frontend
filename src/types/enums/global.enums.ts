export enum IPath {
  HOME = "/",
  COMEBACK = "/comeback",
  DASHBOARD = "/dashboard",
  ERROR = "/error",

  FORM_CREATE = "/form/create",
  FORM_EDIT = "/form/edit/:id",
  DELETED_FORMS = "/deleted-forms",

  RESPONSES = "/responses/:id",
  RESPONSE_CREATE = "/response/create/:formId",
  RESPONSE_CREATE_COPY = "/response/create/:formId/:id",
  RESPONSE_EDIT = "/response/edit/:formId/:id",
  RESPONSE_VIEW = "/response/view/:formId/:id",

  DOWNLOAD_FILE = "/download/:formId/:responseId/:fileId/:fileName",
  DOWNLOAD_FILE_LEGACY = "/download/:formId/:fileName",
}

export enum IOperationEndpoint {
  CREATE = "/create",
  EDIT = "/edit",
}
