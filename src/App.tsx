import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
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
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AppRouter />
            </BrowserRouter>
          </FormChangesProvider>
        </SuperAdminProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
