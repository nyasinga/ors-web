import type { ECitizenPayload } from "../types/registration";

const PAYMENT_API_BASE =
  (import.meta.env.VITE_PAYMENT_API_BASE as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:3000";

export type CreateInvoiceInput = {
  amount: string;
  email: string;
  idNumber: string;
  phone: string;
  name: string;
  itemDescription: string;
};

export type CreateInvoiceResult = ECitizenPayload & {
  billRefNumber: string;
  error?: { message?: string };
};

export async function createPesaflowInvoice(input: CreateInvoiceInput) {
  const res = await fetch(`${PAYMENT_API_BASE}/api/v1/pesaflow/create-invoice`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as CreateInvoiceResult;
  if (!res.ok || !data?.billRefNumber) {
    throw new Error(data?.error?.message || "Failed to initialize eCitizen payment.");
  }
  return data;
}

export async function checkPesaflowStatus(invoiceRef: string) {
  const res = await fetch(
    `${PAYMENT_API_BASE}/api/v1/pesaflow/check-status?invoiceRef=${encodeURIComponent(invoiceRef)}`,
    { headers: { Accept: "application/json" } },
  );
  const data = (await res.json()) as { status?: string; error?: { message?: string } };
  if (!res.ok) {
    throw new Error(data?.error?.message || "Failed to verify payment status.");
  }
  return data;
}

export type SignupIsippeInput = Record<string, unknown> & {
  userType: string;
  invoiceRef: string;
};

export async function signupAfterPayment(input: SignupIsippeInput) {
  const res = await fetch(`${PAYMENT_API_BASE}/signup-isippe`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(data?.error?.message || "Registration failed after payment.");
  }
  return data;
}
