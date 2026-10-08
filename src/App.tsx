import { BrowserRouter } from "react-router-dom";
import { RegistrationProvider } from "./contexts/RegistrationContext";
import { AppRouter } from "./routes/AppRouter";

export default function App() {
  return (
    <BrowserRouter>
      <RegistrationProvider>
        <AppRouter />
      </RegistrationProvider>
    </BrowserRouter>
  );
}
