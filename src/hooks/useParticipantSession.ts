import { useSyncExternalStore } from "react";
import {
  getParticipantSession,
  PARTICIPANT_AUTH_CHANGE_EVENT,
  type ParticipantSession,
} from "../lib/participantAuth";

const SESSION_KEY = "ors_participant_session";

let cachedRaw: string | null | undefined;
let cachedSession: ParticipantSession | null = null;

function readCachedSession(): ParticipantSession | null {
  const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
  if (raw === cachedRaw) return cachedSession;
  cachedRaw = raw;
  cachedSession = getParticipantSession();
  return cachedSession;
}

function subscribe(onStoreChange: () => void) {
  const notify = () => {
    cachedRaw = undefined;
    onStoreChange();
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === SESSION_KEY || e.key === null) notify();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(PARTICIPANT_AUTH_CHANGE_EVENT, notify);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PARTICIPANT_AUTH_CHANGE_EVENT, notify);
  };
}

function getServerSnapshot(): ParticipantSession | null {
  return null;
}

/** Live participant session from session/local storage. */
export function useParticipantSession() {
  return useSyncExternalStore(subscribe, readCachedSession, getServerSnapshot);
}
