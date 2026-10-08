import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./i18n";
import "./index.css";
import "./styles/home.css";
import "./styles/venue.css";
import "./styles/sponsorship.css";
import "./styles/speakers.css";
import "./styles/programme.css";
import "./styles/faq.css";
import "./styles/about.css";
import "./styles/registration.css";
import "./styles/login.css";
import "./styles/participant-login.css";
import "./styles/participant-dashboard.css";
import "./styles/admin-dashboard.css";
import "./styles/admin-events.css";
import "./styles/responsive-shared.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
