import { AuthProvider } from "./contexts/AuthContext";
import { FormChangesProvider } from "./contexts/FormChangesContext";
import { SuperAdminProvider } from "./contexts/SuperAdminContext";
import AppRouter from "./Router";

function App() {
  return (
    <AuthProvider>
      <SuperAdminProvider>
        <FormChangesProvider>
          <AppRouter />
        </FormChangesProvider>
      </SuperAdminProvider>
    </AuthProvider>
  );
}
export default App;
