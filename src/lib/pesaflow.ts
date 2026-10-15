import { API_BASE_URL } from "./api";
import type {
  ECitizenCheckoutFields,
  ECitizenCheckoutSession,
} from "../types/registration";

const TENANT_ID = (import.meta.env.VITE_API_TENANT_ID as string | undefined)?.trim() || "ACA";

const PAYMENT_API_BASE =
  (import.meta.env.VITE_PAYMENT_API_BASE as string | undefined)?.replace(/\/$/, "") ||
  API_BASE_URL;

/** Official Pesaflow iframe POST keys — drop extras like payment_gateway_id. */
const PESAFLOW_FORM_KEYS = [
  "apiClientID",
  "serviceID",
  "billDesc",
  "currency",
  "billRefNumber",
  "clientMSISDN",
  "clientName",
  "clientIDNumber",
  "clientEmail",
  "callBackURLONSuccess",
  "amountExpected",
  "notificationURL",
  "secureHash",
  "format",
  "sendSTK",
] as const;

export function toPesaflowFormFields(
  fields: Record<string, unknown>,
): ECitizenCheckoutFields {
  const out: Record<string, string> = {};
  for (const key of PESAFLOW_FORM_KEYS) {
    const value = fields[key];
    if (value === undefined || value === null) continue;
    out[key] = String(value);
  }
  return out as ECitizenCheckoutFields;
}

/**
 * Build a temporary POST form, submit into the named iframe, then remove it.
 * Matches the Pesaflow iframe checkout pattern.
 */
export function submitCheckoutToFrame(
  url: string,
  fields: Record<string, unknown>,
  frameName = "paymentFrame",
) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;
  form.target = frameName;
  form.style.display = "none";

  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = String(value ?? "");
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  form.remove();
}

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

export type InitiateCheckoutInput = {
  amount: string;
  email: string;
  idNumber: string;
  phone: string;
  name: string;
  itemDescription: string;
  currency?: string;
  callbackURL?: string;
};

type InitiateCheckoutResponse = ECitizenCheckoutSession & {
  error?: { message?: string };
  fields?: Record<string, unknown>;
};

/** Start eCitizen checkout — returns iframe POST url + fields. */
export async function initiateEcitizenCheckout(input: InitiateCheckoutInput) {
  const callbackURL = input.callbackURL || frontendCallbackUrl();
  const res = await fetch(`${PAYMENT_API_BASE}/ecitizen/initiate-checkout`, {
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
  const data = (await res.json()) as InitiateCheckoutResponse;
  if (!res.ok || !data?.url || !data?.fields) {
    throw new Error(data?.error?.message || "Failed to initialize eCitizen payment.");
  }
  const fields = toPesaflowFormFields(data.fields);
  if (!fields.billRefNumber) {
    throw new Error(data?.error?.message || "Failed to initialize eCitizen payment.");
  }
  return { url: data.url, fields };
}

/** @deprecated Use initiateEcitizenCheckout */
export const createEcitizenInvoice = initiateEcitizenCheckout;

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
