import { generateLicense } from "@mui/x-license-pro";

export const muiLicenseKey = generateLicense({
  expiryDate: new Date(9999, 0, 0, 0, 0, 0),
  licensingModel: "perpetual",
  orderNumber: "MUI-69",
  scope: "pro",
});
