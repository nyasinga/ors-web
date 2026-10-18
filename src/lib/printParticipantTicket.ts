import { API_BASE_URL, TENANT_ID } from "./api";

export type PrintableParticipant = {
  id?: string;
  name: string;
  type: string;
  org?: string;
  email?: string;
  status?: string;
  passCode?: string;
};

export type PrintableEventInfo = {
  name: string;
  dates?: string;
  venue?: string;
  city?: string;
};

/**
 * Fetch the official event-pass PDF as a blob URL for iframe preview / print.
 * Caller must revoke the URL when done (`URL.revokeObjectURL`).
 * @see https://ciprop.mustsacco.co.ke/explorer/#/EngagementTicketController/EngagementTicketController.getEventPass
 */
export async function fetchEventPassPdfUrl(passCode: string): Promise<{ url: string; passCode: string }> {
  const code = String(passCode || "").replace(/\D/g, "").slice(0, 6);
  if (code.length < 6) {
    throw new Error("This participant has no ticket pass code to print.");
  }

  const url = `${API_BASE_URL}/ticketing/${encodeURIComponent(code)}/event-pass?tenant-id=${encodeURIComponent(TENANT_ID)}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/pdf",
      "x-tenant-id": TENANT_ID,
    },
  });

  if (!res.ok) {
    throw new Error(`Could not load event pass (${res.status}).`);
  }

  const blob = await res.blob();
  return {
    url: URL.createObjectURL(blob),
    passCode: code,
  };
}

/** @deprecated Prefer fetchEventPassPdfUrl + iframe modal. */
export async function openEventPassPdf(passCode: string) {
  const { url } = await fetchEventPassPdfUrl(passCode);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    const link = document.createElement("a");
    link.href = url;
    link.download = `ticket-${passCode}.pdf`;
    link.click();
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Open a print-friendly Event Pass window and trigger the browser print dialog.
 */
export function printParticipantTicket(
  participant: PrintableParticipant,
  event: PrintableEventInfo,
) {
  const registrationId = participant.id?.trim() || `REG-${Date.now()}`;
  const venueLine = [event.venue, event.city].filter(Boolean).join(", ");
  const qrSrc = `${window.location.origin}/assets/qr-ticket.png`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Event Pass — ${escapeHtml(participant.name)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      color: #101620;
      background: #fff;
    }
    .pass {
      max-width: 420px;
      margin: 0 auto;
      border: 1px solid #d7e5f5;
      border-radius: 12px;
      padding: 24px;
    }
    h1 {
      margin: 0 0 4px;
      font-size: 18px;
      font-weight: 800;
      color: #09165f;
    }
    .event {
      margin: 0 0 16px;
      font-size: 12px;
      color: #5a6881;
    }
    .qr-wrap {
      display: grid;
      place-items: center;
      width: 160px;
      height: 160px;
      margin: 0 auto 16px;
      border: 1px solid #e0e9f3;
      border-radius: 8px;
      background: #fff;
    }
    .qr-wrap img {
      width: 128px;
      height: 128px;
      image-rendering: pixelated;
    }
    .meta {
      font-size: 12px;
      line-height: 1.45;
    }
    .meta dt {
      margin: 0;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #687aa0;
    }
    .meta dd {
      margin: 0 0 10px;
      font-weight: 600;
      color: #16327e;
    }
    .hint {
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px dashed #d7e5f5;
      font-size: 11px;
      color: #5a6881;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
      .pass { border: none; max-width: none; }
    }
  </style>
</head>
<body>
  <article class="pass">
    <h1>Event Pass</h1>
    <p class="event">${escapeHtml(event.name || "Event")}${event.dates ? ` · ${escapeHtml(event.dates)}` : ""}</p>
    <div class="qr-wrap">
      <img src="${qrSrc}" alt="Event pass QR code" />
    </div>
    <dl class="meta">
      <dt>Registration ID</dt>
      <dd>${escapeHtml(registrationId)}</dd>
      <dt>Full Name</dt>
      <dd>${escapeHtml(participant.name)}</dd>
      <dt>Participant Type</dt>
      <dd>${escapeHtml(participant.type || "—")}</dd>
      <dt>Organisation</dt>
      <dd>${escapeHtml(participant.org || "—")}</dd>
      ${participant.email ? `<dt>Email</dt><dd>${escapeHtml(participant.email)}</dd>` : ""}
      ${venueLine ? `<dt>Venue</dt><dd>${escapeHtml(venueLine)}</dd>` : ""}
    </dl>
    <p class="hint">Present this pass at the registration counter to collect your badge.</p>
  </article>
  <script>
    window.onload = function () {
      window.focus();
      window.print();
    };
  </script>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=480,height=720");
  if (!printWindow) {
    throw new Error("Pop-up blocked — allow pop-ups to print tickets.");
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
