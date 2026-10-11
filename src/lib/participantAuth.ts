/**
 * Participant session helpers.
 * Until a participant auth API exists, login creates a local session after
 * client-side pass-code / QR validation. Swap `participantLogin` body for a
 * real API call when the endpoint is ready — keep the same session shape.
 */

const TOKEN_KEY = "ors_participant_token";
const SESSION_KEY = "ors_participant_session";
const REMEMBER_KEY = "ors_participant_remember";
const CHANGE_EVENT = "ors-participant-auth-change";

export type ParticipantSession = {
  id: string;
  fullName: string;
  email?: string;
  passCodeHint?: string;
  method: "passcode" | "qr";
  /** Provisional local token until the API issues a real one */
  token: string;
  signedInAt: string;
};

export type ParticipantLoginInput = {
  passCode?: string;
  viaQr?: boolean;
  remember?: boolean;
};

function storage(remember: boolean) {
  return remember ? localStorage : sessionStorage;
}

function wipeKeys() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

function isSession(value: unknown): value is ParticipantSession {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.token === "string" &&
    row.token.trim().length > 0 &&
    typeof row.fullName === "string" &&
    row.fullName.trim().length > 0 &&
    (row.method === "passcode" || row.method === "qr")
  );
}

export function saveParticipantSession(session: ParticipantSession, remember: boolean) {
  wipeKeys();
  const store = storage(remember);
  store.setItem(TOKEN_KEY, session.token);
  store.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
  notify();
}

export function clearParticipantSession() {
  wipeKeys();
  localStorage.removeItem(REMEMBER_KEY);
  notify();
}

export function getParticipantToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getParticipantSession(): ParticipantSession | null {
  const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** True when a usable participant session is present. */
export function hasParticipantSession(): boolean {
  return Boolean(getParticipantToken() && getParticipantSession());
}

/**
 * Participant sign-in.
 * TODO: replace local validation with API verification (pass code / QR).
 */
export async function participantLogin(input: ParticipantLoginInput): Promise<ParticipantSession> {
  const passCode = (input.passCode || "").replace(/\D/g, "").slice(0, 6);
  const viaQr = Boolean(input.viaQr);

  if (!viaQr && passCode.length < 6) {
    throw new Error("Enter the 6-digit pass code from your email");
  }

  // Placeholder for future:
  // return apiRequest<ParticipantSession>("/participant-login", { method: "POST", body: { passCode, viaQr } });

  const session: ParticipantSession = {
    id: `participant-${Date.now()}`,
    fullName: viaQr ? "Registered Participant" : "ISIPPE Participant",
    email: undefined,
    passCodeHint: passCode ? `${passCode.slice(0, 2)}••••` : undefined,
    method: viaQr ? "qr" : "passcode",
    token: `local-participant.${viaQr ? "qr" : "pass"}.${Date.now()}`,
    signedInAt: new Date().toISOString(),
  };

  saveParticipantSession(session, Boolean(input.remember));
  return session;
}

export function participantDisplayName(session: ParticipantSession | null | undefined, fallback = "Participant") {
  return session?.fullName?.trim() || fallback;
}

export function participantInitials(session: ParticipantSession | null | undefined) {
  const name = participantDisplayName(session, "");
  if (!name) return "P";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export { CHANGE_EVENT as PARTICIPANT_AUTH_CHANGE_EVENT };
