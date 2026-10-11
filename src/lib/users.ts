import type { AuthUser } from "./auth";
import { apiRequest } from "./api";
import { getValidAuthToken } from "./auth";

function authToken() {
  return getValidAuthToken();
}

/** Current authenticated profile from the API. */
export async function getMe() {
  return apiRequest<AuthUser>("/me", { token: authToken() });
}

/** Tenant users list (may be empty depending on API permissions). */
export async function listUsers() {
  return apiRequest<AuthUser[]>("/users", { token: authToken() });
}

/** Best-effort password update — backend may not expose this route yet. */
export async function changePassword(payload: {
  oldPassword: string;
  newPassword: string;
}) {
  return apiRequest<unknown>("/users/change-password", {
    method: "POST",
    token: authToken(),
    body: payload,
  });
}
