export enum IPath {
  HOME = "/forms",
  COMEBACK = "/comeback",
  DASHBOARD = "/dashboard",
  ERROR = "/error",

  FORM_CREATE = "/forms/new",
  FORM_EDIT = "/forms/:formId/edit",
  DELETED_FORMS = "/forms/trash",

  RESPONSES = "/forms/:formId/responses",
  RESPONSE_CREATE = "/forms/:formId/responses/new",
  RESPONSE_CREATE_COPY = "/forms/:formId/responses/:responseId/copy",
  RESPONSE_EDIT = "/forms/:formId/responses/:responseId/edit",
  RESPONSE_VIEW = "/forms/:formId/responses/:responseId",

  DOWNLOAD_FILE = "/download/:formId/:responseId/:fileId/:fileName",
}

export enum IOperationEndpoint {
  CREATE = "/create",
  EDIT = "/edit",
}
