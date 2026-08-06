const fs = require("fs");
const path = require("path");

const ALLOWED_ENVIRONMENTS = [
  "development",
  "pre-production",
  "production",
  "test",
];

const parseEnvironment = (value) => {
  if (ALLOWED_ENVIRONMENTS.includes(value)) {
    return value;
  }

  console.warn(
    `Invalid REACT_APP_ENVIRONMENT value \"${value}\". Falling back to \"development\".`
  );
  return "development";
};

const envVars = {
  REACT_APP_ENVIRONMENT: parseEnvironment(process.env.REACT_APP_ENVIRONMENT),
  REACT_APP_API_URL: process.env.REACT_APP_API_URL || "http://localhost:3000",
  REACT_APP_KEYCLOAK_URL: process.env.REACT_APP_KEYCLOAK_URL || "",
  REACT_MAX_PAYLOAD_SIZE_MB: process.env.REACT_MAX_PAYLOAD_SIZE_MB || 1,
  REACT_APP_SUPPORT_CONTACT_URL: process.env.REACT_APP_SUPPORT_CONTACT_URL || "",
  REACT_APP_SUPPORT_TICKET_URL: process.env.REACT_APP_SUPPORT_TICKET_URL || "",
};

const envFilePath = path.join(__dirname, "runtime-env.js");
const content = `window.RUNTIME_ENV = ${JSON.stringify(envVars)};`;

console.log(
  "Writing runtime environment variables to runtime-env.js:",
  content
); // For debugging
fs.writeFileSync(envFilePath, content);
