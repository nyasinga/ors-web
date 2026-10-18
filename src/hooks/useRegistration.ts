import { useContext } from "react";
import { RegistrationContext } from "../contexts/registrationShared";

export function useRegistration() {
  const ctx = useContext(RegistrationContext);
  if (!ctx) throw new Error("useRegistration must be used within RegistrationProvider");
  return ctx;
}
