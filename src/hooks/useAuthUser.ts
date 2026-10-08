import { useSyncExternalStore } from "react";
import { getAuthUser, type AuthUser } from "../lib/auth";

const USER_KEY = "ors_auth_user";

let cachedRaw: string | null | undefined;
let cachedUser: AuthUser | null = null;

function readCachedUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  if (raw === cachedRaw) return cachedUser;
  cachedRaw = raw;
  cachedUser = getAuthUser();
  return cachedUser;
}

function subscribe(onStoreChange: () => void) {
  const notify = () => {
    cachedRaw = undefined;
    onStoreChange();
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === USER_KEY || e.key === null) notify();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("ors-auth-change", notify);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("ors-auth-change", notify);
  };
}

function getServerSnapshot(): AuthUser | null {
  return null;
}

/** Live auth user from session/local storage (set on login). */
export function useAuthUser() {
  return useSyncExternalStore(subscribe, readCachedUser, getServerSnapshot);
}
