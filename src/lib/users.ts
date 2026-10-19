import type { AuthUser } from "./auth";
import { apiRequest, ApiError } from "./api";
import { getValidAuthToken } from "./auth";

function authToken() {
  return getValidAuthToken();
}

export type UserProfileUpdate = {
  fullName?: string;
  email?: string;
  phoneNo?: string;
  title?: string;
  language?: string;
  country?: string;
  city?: string;
  userType?: string;
};

export type CreateUserInput = {
  fullName: string;
  email: string;
  phoneNo: string;
  password?: string;
  userType?: string;
  username?: string;
  title?: string;
};

/** Current authenticated profile from the API. */
export async function getMe() {
  return apiRequest<AuthUser>("/me", { token: authToken() });
}

/**
 * Update the signed-in user's profile.
 * Uses PATCH /change-me with application/json (OpenAPI).
 * PATCH /me has no request-body media type and rejects bodies with 415.
 */
export async function updateMe(payload: UserProfileUpdate) {
  await apiRequest<unknown>("/change-me", {
    method: "PATCH",
    token: authToken(),
    body: payload,
  });
  try {
    return await getMe();
  } catch {
    // change-me returns 204 with no body — merge locally if /me is unavailable
    return payload as AuthUser;
  }
}

/** Tenant users list (may be empty depending on API permissions). */
export async function listUsers() {
  return apiRequest<AuthUser[]>("/users", { token: authToken() });
}

/**
 * Create a tenant user (admin) via POST /users (application/json).
 * Falls back to public POST /signup if create is forbidden.
 */
export async function createUser(input: CreateUserInput) {
  const body = {
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    phoneNo: input.phoneNo.trim(),
    ...(input.password ? { password: input.password } : {}),
    ...(input.userType ? { userType: input.userType } : {}),
    ...(input.username ? { username: input.username.trim() } : {}),
    ...(input.title ? { title: input.title } : {}),
  };

  try {
    return await apiRequest<AuthUser>("/users", {
      method: "POST",
      token: authToken(),
      body,
    });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 0;
    if (status === 401 || status === 403 || status === 404 || status === 405) {
      return apiRequest<AuthUser>("/signup", {
        method: "POST",
        body,
      });
    }
    throw err;
  }
}

/** Update a user by id (PATCH /users/{id}, application/json). */
export async function updateUser(id: string, payload: UserProfileUpdate) {
  return apiRequest<AuthUser>(`/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    token: authToken(),
    body: payload,
  });
}

/** Best-effort password update (application/json). */
export async function changePassword(payload: {
  oldPassword: string;
  newPassword: string;
}) {
  try {
    return await apiRequest<unknown>("/change-logged-in-password", {
      method: "POST",
      token: authToken(),
      body: payload,
    });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 0;
    if (status === 404) {
      return apiRequest<unknown>("/users/change-password", {
        method: "POST",
        token: authToken(),
        body: payload,
      });
    }
    throw err;
  }
}
