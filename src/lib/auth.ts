import { apiRequest } from "./api";

const TOKEN_KEY = "ors_auth_token";
const USER_KEY = "ors_auth_user";
const REMEMBER_KEY = "ors_auth_remember";

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  emailVerified?: boolean;
  title?: string;
  channel?: string;
  fullName: string;
  userType: string;
  phoneNo?: string;
  completeSignup?: boolean;
  active?: string;
  dateCreated?: string;
  teams?: unknown[];
  companies?: unknown[];
  passwordVerified?: string;
  suspended?: string;
  loginAttempts?: number;
  twoFactorAttempts?: number;
};

export type LoginResponse = AuthUser & {
  token: string;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/login", {
    method: "POST",
    body: {
      email: payload.email.trim(),
      password: payload.password,
    },
  });
}

function storage(remember: boolean) {
  return remember ? localStorage : sessionStorage;
}

function wipeAuthKeys() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ors-auth-change"));
  }
}

function isUsableUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return Boolean(
    (typeof record.fullName === "string" && record.fullName.trim()) ||
      (typeof record.email === "string" && record.email.trim()) ||
      (typeof record.username === "string" && record.username.trim()),
  );
}

export function saveAuthSession(user: AuthUser, token: string, remember: boolean) {
  wipeAuthKeys();
  const store = storage(remember);
  store.setItem(TOKEN_KEY, token);
  store.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
  notifyAuthChange();
}

/** @deprecated Prefer saveAuthSession */
export function saveAuthToken(token: string, remember: boolean) {
  wipeAuthKeys();
  const store = storage(remember);
  store.setItem(TOKEN_KEY, token);
  localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
  notifyAuthChange();
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isUsableUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  wipeAuthKeys();
  notifyAuthChange();
}

export function clearAuthToken() {
  clearAuthSession();
}

export function wasRemembered(): boolean {
  return localStorage.getItem(REMEMBER_KEY) === "1";
}

/** Prefer API fullName; never invent mock account names. */
export function displayName(user: AuthUser | null | undefined, fallback = "—") {
  const name = user?.fullName?.trim() || user?.username?.trim() || user?.email?.trim();
  return name || fallback;
}

export function firstName(user: AuthUser | null | undefined, fallback = "there") {
  const name = user?.fullName?.trim() || user?.username?.trim() || "";
  if (!name) return fallback;
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length <= 2) return parts.join(" ");
  return parts[0];
}

export function roleLabel(user: AuthUser | null | undefined, fallback = "—") {
  const type = user?.userType?.trim().toLowerCase();
  if (!type) return fallback;
  if (type === "admin") return "Administrator";
  if (type === "superadmin" || type === "super_admin") return "Super Administrator";
  return type.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function initialsFrom(user: AuthUser | null | undefined) {
  const name = user?.fullName?.trim() || user?.username?.trim() || user?.email?.trim() || "";
  if (!name) return "—";
  const parts = name.includes("@")
    ? [name.split("@")[0]]
    : name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function formatPhone(phone?: string | null, fallback = "—") {
  const raw = phone?.trim();
  if (!raw) return fallback;
  if (raw.startsWith("+")) return raw;
  if (/^254\d{9}$/.test(raw)) {
    return `+${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6, 9)} ${raw.slice(9)}`;
  }
  if (/^\d{10,}$/.test(raw)) return `+${raw}`;
  return raw;
}

export function formatAccountDate(iso?: string | null, fallback = "—") {
  if (!iso) return fallback;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function isAccountActive(user: AuthUser | null | undefined) {
  if (!user) return false;
  return (user.active ?? "Y").toUpperCase() === "Y" && (user.suspended ?? "N").toUpperCase() !== "Y";
}

export function userEmail(user: AuthUser | null | undefined, fallback = "—") {
  return user?.email?.trim() || fallback;
}

export function userPhone(user: AuthUser | null | undefined, fallback = "—") {
  return formatPhone(user?.phoneNo, fallback);
}
