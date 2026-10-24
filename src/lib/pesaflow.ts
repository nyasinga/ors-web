import { API_BASE_URL } from "./api";
import {
  FileUploadTypes,
  type ECitizenCheckoutFields,
  type ECitizenCheckoutSession,
} from "../types/registration";
import { SHOW_ECITIZEN_IFRAME } from "./paymentMode";

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
  "callBackURLOnSuccess",
  "amountExpected",
  "notificationURL",
  "secureHash",
  "format",
  "sendSTK",
  "pictureURL"
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
    if (key === "notificationURL" || key==="callBackURLOnSuccess") {
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
  if (!SHOW_ECITIZEN_IFRAME) {
    console.warn("[pesaflow] submitCheckoutToFrame skipped — eCitizen is disabled");
    return;
  }
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
  if (!SHOW_ECITIZEN_IFRAME) {
    throw new Error("eCitizen checkout is disabled. Use bank transfer instead.");
  }
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

export type CreateRegistrationInvoiceResult = {
  url: string;
  reference: string;
  amount?: number;
  currency?: string;
  raw: Record<string, unknown>;
  ticket?: Record<string, unknown>;
  ticketID?: string;
  token?: string;
  isBlobUrl?: boolean;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function pickInvoiceUrl(data: Record<string, unknown>): string {
  const ticket = asRecord(data.ticket);
  const nested = asRecord(data.invoice) || asRecord(data.data) || asRecord(data.result);
  const candidates = [
    data.invoiceUrl,
    data.invoice_url,
    data.pdfUrl,
    data.pdf_url,
    data.downloadUrl,
    data.download_url,
    data.url,
    ticket?.invoiceUrl,
    ticket?.invoice_url,
    ticket?.pdfUrl,
    nested?.invoiceUrl,
    nested?.invoice_url,
    nested?.pdfUrl,
    nested?.url,
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      const s = value.trim();
      if (/^https?:\/\//i.test(s) || s.startsWith("blob:")) return s;
    }
  }
  return "";
}

function pickInvoiceReference(
  data: Record<string, unknown>,
  fallback: string,
): string {
  const ticket = asRecord(data.ticket);
  const nested = asRecord(data.invoice) || asRecord(data.data) || asRecord(data.result);
  const candidates = [
    data.billRefNumber,
    data.invoiceRef,
    data.invoice_ref,
    data.reference,
    data.receiptNo,
    ticket?.reference,
    ticket?.invoiceRef,
    nested?.billRefNumber,
    nested?.reference,
    nested?.invoiceRef,
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return fallback;
}

function pickTicketId(signup: Record<string, unknown>): string {
  const ticket = asRecord(signup.ticket);
  return pickString(
    ticket?.ticketID,
    ticket?.id,
    signup.ticketID,
    signup.ticketId,
  );
}

function pickSignupToken(signup: Record<string, unknown>): string {
  const user = asRecord(signup.user);
  const ticket = asRecord(signup.ticket);
  return pickString(
    signup.token,
    signup.accessToken,
    signup.access_token,
    signup.jwt,
    user?.token,
    ticket?.token,
  );
}

/**
 * GET /ticketing/{ticketID}/invoice
 * JWT is optional — signup-isippe often returns no token; public fetch still works.
 * Returns a view/download URL (remote HTTPS or local blob: for PDF bytes).
 */
export async function fetchTicketInvoice(
  ticketID: string,
  token?: string | null,
): Promise<{ url: string; isBlobUrl: boolean; raw?: Record<string, unknown> }> {
  const id = ticketID.trim();
  if (!id) throw new Error("Ticket ID is required to load the invoice.");

  const endpoint = `${PAYMENT_API_BASE}/ticketing/${encodeURIComponent(id)}/invoice`;
  console.log("[pesaflow] ticket invoice request", { url: endpoint, hasToken: Boolean(token?.trim()) });

  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/pdf, application/json",
      "x-tenant-id": TENANT_ID,
      ...(token?.trim() ? { Authorization: `Bearer ${token.trim()}` } : {}),
    },
  });

  const contentType = (res.headers.get("content-type") || "").toLowerCase();

  if (!res.ok) {
    let message = `Could not load invoice (${res.status}).`;
    try {
      const errBody = (await res.json()) as { error?: { message?: string }; message?: string };
      message = errBody?.error?.message || errBody?.message || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  if (contentType.includes("application/pdf") || contentType.includes("octet-stream")) {
    const blob = await res.blob();
    return { url: URL.createObjectURL(blob), isBlobUrl: true };
  }

  const data = (await res.json()) as Record<string, unknown>;
  console.log("[pesaflow] ticket invoice response", data);
  const url = pickInvoiceUrl(data);
  if (!url) {
    throw new Error("Invoice endpoint returned no download URL.");
  }
  return { url, isBlobUrl: url.startsWith("blob:"), raw: data };
}

/**
 * Create registration after Details, then load invoice.
 * 1) POST /signup-isippe (returns flat ticket — often no JWT)
 * 2) GET /ticketing/{ticketID}/invoice
 */
export async function createRegistrationInvoice(
  input: SignupIsippeInput,
  files: File[] = [],
  fallbackReference = "",
): Promise<CreateRegistrationInvoiceResult> {
  const data = (await signupAfterPayment(input, files)) as Record<string, unknown>;
  // signup-isippe may return `{ ticket }` or the ticket fields at the root.
  const ticket = asRecord(data.ticket) || (data.ticketID ? data : undefined);
  const ticketID = pickTicketId(data);
  const token = pickSignupToken(data) || undefined;

  if (!ticketID) {
    throw new Error("Registration succeeded but no ticket ID was returned.");
  }

  const invoice = await fetchTicketInvoice(ticketID, token);
  const reference = pickInvoiceReference(
    { ...data, ...(ticket || {}), ...(invoice.raw || {}) },
    fallbackReference,
  );
  if (!reference) {
    throw new Error("Invoice reference missing from server response.");
  }

  const amount =
    Number(ticket?.ticketPrice) ||
    Number(input.extraData?.ticket?.amount);
  return {
    url: invoice.url,
    reference,
    amount: Number.isFinite(amount) && amount > 0 ? amount : undefined,
    currency:
      pickString(ticket?.currency, input.extraData?.ticket?.currency) || "KES",
    raw: data,
    ticket,
    ticketID,
    token,
    isBlobUrl: invoice.isBlobUrl,
  };
}

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
      amount?: number;
      price?: number;
    } | Record<string, never>; 

    ticket: {
      amount: number;
      currency: string;
    };

    /** Bank / M-Pesa transaction reference entered by the registrant. */
    paymentReference?: string;

    /** Present only when eCitizen checkout is enabled. */
    eCitizen?: {
      reference: string;
      currency: string;
      invoiceRef: string;
    };
  };
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
    throw new Error(data?.error?.message || "Registration request failed.");
  }

  return data;
}

export type SubmitTicketPaymentReferenceInput = {
  ticketID: string;
  /** Bank / M-Pesa transaction reference. */
  transactionReference: string;
  /** Proof of payment files (PDF / images). */
  files?: File[];
  token?: string | null;
};

/**
 * Submit payment reference + proof after bank transfer.
 * PATCH /ticketing/{ticketID}/reference (multipart supported).
 */
export async function submitTicketPaymentReference(
  input: SubmitTicketPaymentReferenceInput,
): Promise<Record<string, unknown>> {
  const ticketID = input.ticketID.trim();
  const transactionReference = input.transactionReference.trim();
  if (!ticketID) throw new Error("Ticket ID is required to submit payment proof.");
  if (!transactionReference) {
    throw new Error("Enter your bank / M-Pesa transaction reference.");
  }

  const formData = new FormData();
  formData.append("transactionReference", transactionReference);
  for (const file of input.files || []) {
    formData.append("proof", file, file.name);
  }

  const endpoint = `${PAYMENT_API_BASE}/ticketing/${encodeURIComponent(ticketID)}/reference`;
  console.log("[pesaflow] ticket reference request", {
    url: endpoint,
    transactionReference,
    files: (input.files || []).map((f) => f.name),
  });

  const headers = paymentHeaders();
  delete (headers as Record<string, string>)["Content-Type"];
  delete (headers as Record<string, string>)["content-type"];
  if (input.token?.trim()) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${input.token.trim()}`;
  }

  const res = await fetch(endpoint, {
    method: "PATCH",
    headers,
    body: formData,
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown> & {
    error?: { message?: string };
    message?: string;
  };
  console.log("[pesaflow] ticket reference response", { status: res.status, data });

  if (!res.ok) {
    throw new Error(
      data?.error?.message || data?.message || `Could not submit payment proof (${res.status}).`,
    );
  }

  return data;
}
