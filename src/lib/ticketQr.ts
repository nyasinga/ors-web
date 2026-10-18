import QRCode from "qrcode";

/** Payload encoded in ticket QR codes — pass code preferred (check-in / login). */
export function ticketQrPayload(input: { passCode?: string; reference?: string }): string | null {
  const pass = String(input.passCode || "").replace(/\D/g, "").slice(0, 6);
  if (pass.length >= 6) return pass;
  const ref = String(input.reference || "").trim();
  return ref || null;
}

/**
 * Generate a high-contrast PNG data URL for a ticket QR.
 * Uses error-correction H and a quiet zone so phone cameras can read it reliably.
 */
export async function generateTicketQrDataUrl(payload: string, size = 280): Promise<string> {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: size,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}
