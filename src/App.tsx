import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { FormChangesProvider } from "./contexts/FormChangesContext";
import { SuperAdminProvider } from "./contexts/SuperAdminContext";
import AppRouter from "./Router";
import { queryClient } from "./api/queryClient";
import { LicenseInfo } from "@mui/x-license-pro";
import { muiLicenseKey } from "./muiLicense";

function App() {
  LicenseInfo.setLicenseKey(muiLicenseKey);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SuperAdminProvider>
          <FormChangesProvider>
            <AppRouter />
          </FormChangesProvider>
        </SuperAdminProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
