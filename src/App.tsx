import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./contexts/AuthContext";
import { FormChangesProvider } from "./contexts/FormChangesContext";
import { SuperAdminProvider } from "./contexts/SuperAdminContext";
import AppRouter from "./Router";
import { queryClient } from "./api/queryClient";
import { LicenseInfo } from "@mui/x-license-pro";
import { muiLicenseKey } from "./muiLicense";

function App() {
  LicenseInfo.setLicenseKey(muiLicenseKey);
  const isProd = (window as any).RUNTIME_ENV?.REACT_APP_IS_PROD ?? false;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SuperAdminProvider>
          <FormChangesProvider>
            <AppRouter />
          </FormChangesProvider>
        </SuperAdminProvider>
      </AuthProvider>
      {/* React Query Devtools - only shows when not in production */}
      {!isProd && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
