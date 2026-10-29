#!/usr/bin/env node
/**
 * PATCH official FAQs onto the live ISIPPE-3 engagement.
 *
 * Usage:
 *   SEED_EMAIL=... SEED_PASSWORD=... node scripts/seed-isippe-faqs.mjs
 *
 * Optional:
 *   SEED_API_BASE=https://ciprop.mustsacco.co.ke
 *   SEED_TENANT_ID=ACA
 *   SEED_ENGAGEMENT_ID=6ac9ff48e25a978dcd246e34
 */

import { isippeFaqs } from "./isippe-faqs.mjs";

const BASE = (process.env.SEED_API_BASE || "https://ciprop.mustsacco.co.ke").replace(/\/$/, "");
const TENANT = process.env.SEED_TENANT_ID || "ACA";
const EMAIL = process.env.SEED_EMAIL || "";
const PASSWORD = process.env.SEED_PASSWORD || "";
const ENGAGEMENT_ID = process.env.SEED_ENGAGEMENT_ID || "6ac9ff48e25a978dcd246e34";

if (!EMAIL || !PASSWORD) {
  console.error("Set SEED_EMAIL and SEED_PASSWORD");
  process.exit(1);
}

async function api(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "x-tenant-id": TENANT,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  console.log(`API ${BASE} tenant=${TENANT} engagement=${ENGAGEMENT_ID}`);

  const login = await api("/login", {
    method: "POST",
    body: { email: EMAIL, password: PASSWORD },
  });
  if (!login.ok || !login.data?.token) {
    console.error("Login failed:", login.status, login.data?.error || login.data);
    process.exit(2);
  }
  const token = login.data.token;
  console.log(`Logged in as ${login.data.fullName || login.data.email}`);

  // Live API rejects JSON PATCH (415) — use multipart like registration/engagement saves.
  const form = new FormData();
  form.append("faqs", JSON.stringify(isippeFaqs));
  const patchRes = await fetch(`${BASE}/engagements/${encodeURIComponent(ENGAGEMENT_ID)}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "x-tenant-id": TENANT,
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });
  const patchText = await patchRes.text();
  let patchData = null;
  try {
    patchData = patchText ? JSON.parse(patchText) : null;
  } catch {
    patchData = { raw: patchText };
  }
  if (!patchRes.ok) {
    console.error("PATCH failed:", patchRes.status, patchData?.error || patchData);
    process.exit(3);
  }

  const verify = await api(`/engagements/${encodeURIComponent(ENGAGEMENT_ID)}`, { token });
  const faqs = Array.isArray(verify.data?.faqs) ? verify.data.faqs : [];
  const itemCount = faqs.reduce((n, c) => n + (Array.isArray(c.items) ? c.items.length : 0), 0);
  console.log(
    JSON.stringify(
      {
        engagementID: verify.data?.engagementID,
        categories: faqs.map((c) => ({
          id: c.id,
          label: c.label,
          items: Array.isArray(c.items) ? c.items.length : 0,
        })),
        totalQuestions: itemCount,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
