import { API_BASE_URL } from "./api";
import type { ECitizenPayload } from "../types/registration";

const TENANT_ID = (import.meta.env.VITE_API_TENANT_ID as string | undefined)?.trim() || "ACA";

const PAYMENT_API_BASE =
  (import.meta.env.VITE_PAYMENT_API_BASE as string | undefined)?.replace(/\/$/, "") ||
  API_BASE_URL;

/** Current page URL for eCitizen `callbackURL`. */
export function frontendCallbackUrl() {
  const fromEnv = (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined)?.trim();
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined" && window.location?.href) {
    return window.location.href;
  }
  return "";
}

function paymentHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-tenant-id": TENANT_ID,
  };
}

export type CreateInvoiceInput = {
  amount: string;
  email: string;
  idNumber: string;
  phone: string;
  name: string;
  itemDescription: string;
  currency?: string;
  callbackURL?: string;
};

export type CreateInvoiceResult = ECitizenPayload & {
  billRefNumber: string;
  error?: { message?: string };
};

/** Create eCitizen invoice payload for the Pesaflow iframe. */
export async function createEcitizenInvoice(input: CreateInvoiceInput) {
  const callbackURL = input.callbackURL || frontendCallbackUrl();
  const res = await fetch(`${PAYMENT_API_BASE}/ecitizen/create-invoice`, {
    method: "POST",
    headers: paymentHeaders(),
    body: JSON.stringify({
      amount: input.amount,
      email: input.email,
      idNumber: input.idNumber,
      phone: input.phone,
      name: input.name,
      itemDescription: input.itemDescription,
      ...(input.currency ? { currency: input.currency } : {}),
      ...(callbackURL ? { callbackURL } : {}),
    }),
  });
  const data = (await res.json()) as CreateInvoiceResult;
  if (!res.ok || !data?.billRefNumber) {
    throw new Error(data?.error?.message || "Failed to initialize eCitizen payment.");
  }
  return data;
}

export type SignupIsippeInput = Record<string, unknown> & {
  email: string;
  fullName: string;
  phoneNo: string;
  userType: string;
  invoiceRef: string;
};

/** Finalize registration after the user completes payment in the iframe. */
export async function signupAfterPayment(input: SignupIsippeInput) {
  const res = await fetch(`${PAYMENT_API_BASE}/signup-isippe`, {
    method: "POST",
    headers: paymentHeaders(),
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(data?.error?.message || "Registration failed after payment.");
  }
  return data;
}
