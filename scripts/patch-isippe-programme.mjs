#!/usr/bin/env node
/**
 * PATCH only engagement.programme for ISIPPE-3.
 * Keeps live days 1–2 (pre-events); replaces days 3–4 from isippe-programme.mjs.
 *
 * Usage:
 *   SEED_EMAIL=... SEED_PASSWORD=... node scripts/patch-isippe-programme.mjs
 */

import { writeFileSync } from "node:fs";
import { isippeProgrammeSymposium } from "./isippe-programme.mjs";

const BASE = (process.env.SEED_API_BASE || "https://ciprop.mustsacco.co.ke").replace(/\/$/, "");
const TENANT = process.env.SEED_TENANT_ID || "ACA";
const EMAIL = process.env.SEED_EMAIL || "";
const PASSWORD = process.env.SEED_PASSWORD || "";
const KNOWN_ID = process.env.SEED_ENGAGEMENT_ID || "6ac9ff48e25a978dcd246e34";

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
  console.log(`API ${BASE} tenant=${TENANT} id=${KNOWN_ID}`);

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

  const existing = await api(`/engagements/${encodeURIComponent(KNOWN_ID)}`, { token });
  if (!existing.ok || !existing.data?.engagementID) {
    console.error("Could not load engagement:", existing.status, existing.data);
    process.exit(3);
  }

  const live = existing.data;
  const prev = Array.isArray(live.programme) ? live.programme : [];
  const backupPath = `/tmp/isippe-programme-backup-${Date.now()}.json`;
  writeFileSync(backupPath, JSON.stringify(prev, null, 2));
  console.log(`Backed up ${prev.length} sessions → ${backupPath}`);

  const preEvents = prev.filter((row) => Number(row.day) === 1 || Number(row.day) === 2);
  const next = [...preEvents, ...isippeProgrammeSymposium];

  console.log(
    `Patching programme: keep ${preEvents.length} pre-event session(s); add ${isippeProgrammeSymposium.length} symposium session(s); total ${next.length}`,
  );

  // Live API rejects JSON PATCH (415) — multipart like FAQs / engagement saves.
  const form = new FormData();
  form.append("programme", JSON.stringify(next));
  const patchRes = await fetch(`${BASE}/engagements/${encodeURIComponent(KNOWN_ID)}`, {
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
    process.exit(4);
  }

  const verify = await api(`/engagements/${encodeURIComponent(KNOWN_ID)}`, { token });
  const programme = Array.isArray(verify.data?.programme) ? verify.data.programme : [];
  const byDay = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const row of programme) {
    const d = Number(row.day);
    if (byDay[d] != null) byDay[d] += 1;
  }

  console.log(
    JSON.stringify(
      {
        engagementID: verify.data?.engagementID,
        total: programme.length,
        byDay,
        day3Titles: programme.filter((r) => Number(r.day) === 3).map((r) => `${r.time} · ${r.title}`),
        day4Titles: programme.filter((r) => Number(r.day) === 4).map((r) => `${r.time} · ${r.title}`),
        backupPath,
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
