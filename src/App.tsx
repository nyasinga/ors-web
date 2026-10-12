import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./components/ui/Toast";
import { RegistrationProvider } from "./contexts/RegistrationContext";
import { AppRouter } from "./routes/AppRouter";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <RegistrationProvider>
          <AppRouter />
        </RegistrationProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
