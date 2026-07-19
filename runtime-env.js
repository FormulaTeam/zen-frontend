const fs = require("fs");
const path = require("path");

const envVars = {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL || "http://localhost:3000",
  REACT_APP_KEYCLOAK_URL: process.env.REACT_APP_KEYCLOAK_URL || "",
  REACT_MAX_PAYLOAD_SIZE_MB: process.env.REACT_MAX_PAYLOAD_SIZE_MB || 1,
  IS_PROD: process.env.IS_PROD || false,
};

const envFilePath = path.join(__dirname, "runtime-env.js");
const content = `window.RUNTIME_ENV = ${JSON.stringify(envVars)};`;

console.log(
  "Writing runtime environment variables to runtime-env.js:",
  content
); // For debugging
fs.writeFileSync(envFilePath, content);
