/** ACA bank + M-Pesa paybill instructions for registration payments. */

export const ACA_BANK_DETAILS = [
  { label: "Account Name:", value: "ANTI COUNTERFEIT AGENCY" },
  { label: "Bank:", value: "KENYA COMMERCIAL BANK" },
  { label: "Branch:", value: "Kipande House" },
  { label: "Account No.:", value: "1119056322" },
  { label: "Bank code:", value: "01" },
  { label: "Branch code:", value: "101" },
  { label: "Swift code:", value: "KCBLKENX005" },
] as const;

/** Lipa Na M-Pesa Paybill for deposits to the ACA collection account. */
export const ACA_MPESA_PAYBILL = "522522";

export function mpesaAccountNumber(ticketRef?: string | null): string {
  const ref = String(ticketRef || "").trim();
  return ref || "your ticket / invoice reference";
}
