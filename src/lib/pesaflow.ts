import { API_BASE_URL } from "./api";
import {
  FileUploadTypes,
  type ECitizenCheckoutFields,
  type ECitizenCheckoutSession,
} from "../types/registration";

const TENANT_ID = (import.meta.env.VITE_API_TENANT_ID as string | undefined)?.trim() || "ACA";

const PAYMENT_API_BASE =
  (import.meta.env.VITE_PAYMENT_API_BASE as string | undefined)?.replace(/\/$/, "") ||
  API_BASE_URL;

/**
 * Pesaflow iframe POST params only (Integration Spec §3).
 * Do NOT send payment_gateway_id or other backend-only keys.
 */
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

/** Spec: clientMSISDN is BigInt e.g. 254722222222 */
export function toKenyaMsisdn(raw: string | number | undefined | null): string {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("254") && digits.length >= 12) return digits;
  if (digits.startsWith("0") && digits.length >= 10) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}

/** Spec: notificationURL must be a full URL (HTTPS). */
export function ensureHttpsUrl(raw: string | undefined | null): string {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

/**
 * Normalize initiate-checkout fields to what Pesaflow iframe accepts.
 * (notificationURL / clientMSISDN are not part of secureHash — safe to fix client-side.)
 */
export function toPesaflowFormFields(
  fields: Record<string, unknown>,
): ECitizenCheckoutFields {
  const out: Record<string, string> = {};
  for (const key of PESAFLOW_FORM_KEYS) {
    const value = fields[key];
    if (value === undefined || value === null) continue;
    if (key === "clientMSISDN") {
      out[key] = toKenyaMsisdn(value as string | number);
      continue;
    }
    if (key === "notificationURL") {
      out[key] = ensureHttpsUrl(String(value));
      continue;
    }
    out[key] = String(value);
  }
  return out as ECitizenCheckoutFields;
}

/**
 * Build a temporary POST form, submit into the named iframe, then remove it.
 */
export function submitCheckoutToFrame(
  url: string,
  fields: Record<string, unknown>,
  frameName = "paymentFrame",
) {
  // Always re-sanitize at submit time so extras never reach Pesaflow.
  const safeFields = toPesaflowFormFields(fields);

  console.log("[pesaflow] iframe form POST", {
    url,
    target: frameName,
    fields: { ...safeFields },
    droppedKeys: Object.keys(fields).filter((k) => !(k in safeFields)),
  });

  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;
  form.target = frameName;
  form.style.display = "none";

  Object.entries(safeFields).forEach(([key, value]) => {
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
  const body = {
    amount: input.amount,
    email: input.email,
    idNumber: input.idNumber,
    phone: input.phone,
    name: input.name,
    itemDescription: input.itemDescription,
    ...(input.currency ? { currency: input.currency } : {}),
    ...(callbackURL ? { callbackURL } : {}),
  };
  const endpoint = `${PAYMENT_API_BASE}/ecitizen/initiate-checkout`;
  console.log("[pesaflow] initiate-checkout request", { url: endpoint, body });

  const res = await fetch(endpoint, {
    method: "POST",
    headers: paymentHeaders(),
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as InitiateCheckoutResponse;
  console.log("[pesaflow] initiate-checkout response", {
    status: res.status,
    url: data?.url,
    fields: data?.fields,
  });
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
  title: string;
  email: string;
  fullName: string;
  phoneNo: string;
  userType: string;
  country: string;
  city: string;
  extraData: {
    dietary: any; 
    accessibility: any;
    jobTitle: string;
    organisation: string;
    engagementID: null | string | number;

    sponsorPackage: {
      id: string | number;
      name: string;
    } | Record<string, never>; 

    ticket: {
      amount: number;
      currency: string;
    }; 

    eCitizen: {
      reference: string;
      currency: string;
      invoiceRef: string;
    };
  }

};

/** Finalize registration after the user completes payment in the iframe. */
export async function signupAfterPayment(
  input: SignupIsippeInput,
  files: File[] = [],
) {

  const formData = new FormData();
  const fields: [string, string | Blob][] = [];

  for (const key in input) {
    const value = input[key as keyof SignupIsippeInput];

    if (value === undefined || value === null) continue;

    if (value instanceof File || value instanceof Blob) {
      fields.push([key, value]);
    } else if (typeof value === "object") {
      fields.push([key, JSON.stringify(value)]);
    } else {
      fields.push([key, String(value)]);
    }
  }

  const name = input.userType==='sponsor'? FileUploadTypes.Logo : FileUploadTypes.Avatar;
  fields.forEach(([key, value]) => formData.append(key, value));
  files.forEach((file) => formData.append(name, file, file.name));

  const headers = paymentHeaders();
  delete (headers as Record<string, string>)["Content-Type"];
  delete (headers as Record<string, string>)["content-type"];

  const res = await fetch(`${PAYMENT_API_BASE}/signup-isippe`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || "Registration failed after payment.");
  }

  return data;
}
