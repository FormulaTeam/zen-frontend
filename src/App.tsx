import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./contexts/AuthContext";
import { FormChangesProvider } from "./contexts/FormChangesContext";
import { SuperAdminProvider } from "./contexts/SuperAdminContext";
import AppRouter from "./Router";
import { queryClient } from "./api/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SuperAdminProvider>
          <FormChangesProvider>
            <AppRouter />
          </FormChangesProvider>
        </SuperAdminProvider>
      </AuthProvider>
      {/*React Query Devtools - only shows in development*/}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
