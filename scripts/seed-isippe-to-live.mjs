#!/usr/bin/env node
/**
 * Seed / refresh the featured ISIPPE-3 engagement on the live API.
 *
 * Usage:
 *   SEED_EMAIL=... SEED_PASSWORD=... node scripts/seed-isippe-to-live.mjs
 *
 * Optional:
 *   SEED_API_BASE=https://ciprop.mustsacco.co.ke
 *   SEED_TENANT_ID=ACA
 *   SEED_ENGAGEMENT_ID=<existing id to PATCH>
 */

import { isippeFaqs as faqs } from "./isippe-faqs.mjs";

const BASE = (process.env.SEED_API_BASE || "https://ciprop.mustsacco.co.ke").replace(/\/$/, "");
const TENANT = process.env.SEED_TENANT_ID || "ACA";
const EMAIL = process.env.SEED_EMAIL || "";
const PASSWORD = process.env.SEED_PASSWORD || "";
const KNOWN_ID = process.env.SEED_ENGAGEMENT_ID || "6ac9ff48e25a978dcd246e34";

if (!EMAIL || !PASSWORD) {
  console.error("Set SEED_EMAIL and SEED_PASSWORD");
  process.exit(1);
}

function named(list) {
  return list.map((name) => ({ name }));
}

import { isippeProgramme as programme } from "./isippe-programme.mjs";


const speakers = [
  { id: "amina-yusuf", name: "Dr. Amina Yusuf", role: "Director General", org: "Intellectual Property Office", topic: "Future of IP Enforcement", roleLines: ["Director General", "Intellectual Property Office"], country: "Kenya", flag: "🇰🇪", category: "keynote", badge: "Keynote Speaker", photo: "/assets/speakers/amina-yusuf.jpg", bio: "Leading national efforts on IP protection and market surveillance." },
  { id: "daniel-meyer", name: "Prof. Daniel Meyer", role: "Professor of Law", org: "University of Global Studies", topic: "International IP Frameworks", roleLines: ["Professor of Law", "University of Global Studies"], country: "United Kingdom", flag: "🇬🇧", category: "keynote", badge: "Keynote Speaker", photo: "/assets/speakers/daniel-meyer.jpg", bio: "International frameworks for IP enforcement and capacity building." },
  { id: "kofi-mensah", name: "Mr. Kofi Mensah", role: "Executive Director", org: "African IP Organization", topic: "Regional Collaboration", roleLines: ["Executive Director", "African IP Organization"], country: "Ghana", flag: "🇬🇭", category: "keynote", badge: "Keynote Speaker", photo: "/assets/speakers/kofi-mensah.jpg", bio: "Regional collaboration on IP protection across Africa." },
  { id: "mei-lin-chen", name: "Dr. Mei Lin Chen", role: "Head of Policy", org: "World Intellectual Property Organization", topic: "Global IP Policy", roleLines: ["Head of Policy", "WIPO"], country: "Switzerland", flag: "🇨🇭", category: "keynote", badge: "Keynote Speaker", photo: "/assets/speakers/mei-lin-chen.jpg", bio: "Global IP policy and enforcement coordination." },
  { id: "david-mwangi", name: "Mr. David Mwangi", role: "Head of Enforcement", org: "Anti-Counterfeiting Authority", topic: "Market Surveillance", roleLines: ["Head of Enforcement", "Anti-Counterfeiting Authority"], country: "Kenya", flag: "🇰🇪", category: "panelist", badge: "Panelist", photo: "/assets/speakers/david-mwangi.jpg", bio: "Specialist in market surveillance and enforcement operations." },
  { id: "grace-ndlovu", name: "Ms. Grace Ndlovu", role: "IP Policy Expert", org: "Regional Trade Commission", topic: "Trade Policy", roleLines: ["IP Policy Expert", "Regional Trade Commission"], country: "South Africa", flag: "🇿🇦", category: "panelist", badge: "Panelist", photo: "/assets/speakers/grace-ndlovu.jpg", bio: "Trade policy and regional IP frameworks." },
  { id: "laura-smith", name: "Dr. Laura Smith", role: "Senior Research Fellow", org: "Global Innovation Institute", topic: "Innovation Dialogue", roleLines: ["Senior Research Fellow", "Global Innovation Institute"], country: "Canada", flag: "🇨🇦", category: "moderator", badge: "Moderator", photo: "/assets/speakers/laura-smith.jpg", bio: "Facilitates multi-stakeholder dialogue on innovation and IP." },
  { id: "kenji-tanaka", name: "Mr. Kenji Tanaka", role: "Director", org: "Asia IP Network", topic: "Brand Protection", roleLines: ["Director", "Asia IP Network"], country: "Japan", flag: "🇯🇵", category: "panelist", badge: "Panelist", photo: "/assets/speakers/kenji-tanaka.jpg", bio: "Cross-regional IP networks and brand protection." },
  { id: "rachel-okello", name: "Ms. Rachel Okello", role: "Deputy Director", org: "Ministry of Trade and Industry", topic: "Consumer Protection", roleLines: ["Deputy Director", "Ministry of Trade and Industry"], country: "Kenya", flag: "🇰🇪", category: "government", badge: "Government Representative", photo: "/assets/speakers/rachel-okello.jpg", bio: "Trade policy and consumer protection frameworks." },
  { id: "carlos-mendes", name: "Mr. Carlos Mendes", role: "IP Enforcement Advisor", org: "World Customs Organization", topic: "Border Enforcement", roleLines: ["IP Enforcement Advisor", "World Customs Organization"], country: "France", flag: "🇫🇷", category: "panelist", badge: "Panelist", photo: "/assets/speakers/carlos-mendes.jpg", bio: "Customs cooperation and border enforcement." },
  { id: "fatima-al-hassan", name: "Dr. Fatima Al-Hassan", role: "Senior Legal Counsel", org: "African Union", topic: "Continental Frameworks", roleLines: ["Senior Legal Counsel", "African Union"], country: "Kenya", flag: "🇰🇪", category: "panelist", badge: "Panelist", photo: "/assets/speakers/fatima-al-hassan.jpg", bio: "Continental legal frameworks for IP protection." },
  { id: "samuel-adei", name: "Mr. Samuel Adei", role: "Founder & CEO", org: "IP Innovation Hub", topic: "IP Commercialization", roleLines: ["Founder & CEO", "IP Innovation Hub"], country: "Ghana", flag: "🇬🇭", category: "panelist", badge: "Panelist", photo: "/assets/speakers/samuel-adei.jpg", bio: "Innovation hubs and practical IP commercialization." },
];

const sponsors = [
  {
    id: "platinum",
    name: "Platinum Sponsor",
    subtitle: "Maximum visibility and strategic engagement opportunities.",
    price: 1000000,
    availability: "Open",
    benefits: [
      "Name featured in the official event title (ISIPPE-3 presented by XXXX)",
      "Keynote introduction or a 10-minute speaking slot",
      "Two panelist slots for the sessions relevant to your organisation",
      "Premium main-stage or entrance booth placement",
      "8–10 complimentary ISIPPE-3 tickets",
      "A host of pre-event, at the event and post-event benefits",
    ],
    active: true,
    tone: "amber",
    tier: "Platinum",
  },
  {
    id: "gold",
    name: "Gold Sponsor",
    subtitle: "High visibility and extensive engagement opportunities.",
    price: 500000,
    availability: "Open",
    benefits: [
      "Large logo placement on main event signage and website",
      "Two panelist slots for the session relevant to your organisation",
      "Dedicated social media feature posts and email blast mention",
      "Standard high-traffic booth space or exhibition table",
      "6 complimentary ISIPPE-3 tickets",
    ],
    active: true,
    tone: "yellow",
    tier: "Gold",
  },
  {
    id: "silver",
    name: "Silver Sponsor",
    subtitle: "Enhanced visibility and engagement opportunities.",
    price: 300000,
    availability: "Open",
    benefits: [
      "Medium logo on shared digital banners and printed programme",
      "One panellist slot for the session relevant to your organisation",
      "Social media shout-out and website directory link",
      "4 complimentary ISIPPE-3 tickets",
    ],
    active: true,
    tone: "slate",
    tier: "Silver",
  },
  {
    id: "bronze",
    name: "Bronze Sponsor",
    subtitle: "Brand exposure and networking opportunities.",
    price: 150000,
    availability: "Open",
    benefits: [
      "Small logo text recognition on the event website",
      "One panelist slot for the session relevant to your organisation",
      "Verbal recognition during opening remarks",
      "2 complimentary ISIPPE-3 tickets",
    ],
    active: true,
    tone: "orange",
    tier: "Bronze",
  },
];

const tickets = [
  { id: "early-bird", name: "Early Bird Registration", price: "KES 60,000 / USD 470", capacity: 800, period: "Up to 31 October 2026", tone: "green" },
  { id: "late", name: "Late Registration", price: "KES 70,000 / USD 510", capacity: 400, period: "1 to 18 November 2026", tone: "blue" },
];

const venueHighlights = [
  { id: "vh1", icon: "MapPin", title: "Beachfront Location", text: "Mombasa Continental Resort, Shanzu Beach, Mombasa" },
  { id: "vh2", icon: "Users", title: "World-Class Facilities", text: "Modern conference and exhibition spaces" },
  { id: "vh3", icon: "Shield", title: "Secure & Accessible", text: "High security and easy access for delegates" },
  { id: "vh4", icon: "Wifi", title: "Modern Amenities", text: "High-speed internet and full support services" },
];

const venueSpaces = [
  { id: "vs1", name: "Plenary Hall", text: "Main hall for opening, closing and high-level plenary sessions.", capacity: "Capacity: 1,000+ delegates", image: "/assets/venue-plenary-hall.jpg" },
  { id: "vs2", name: "Breakout Rooms", text: "Parallel thematic sessions and workshops.", capacity: "Capacity: 100 – 300 delegates", image: "/assets/venue-breakout-rooms.jpg" },
  { id: "vs3", name: "Exhibition Area", text: "Showcase innovations, solutions and services.", capacity: "Capacity: 50+ exhibitors", image: "/assets/venue-exhibition-area.jpg" },
  { id: "vs4", name: "Meeting Rooms", text: "Bilateral meetings and side events.", capacity: "Capacity: 20 – 50 delegates", image: "/assets/venue-meeting-rooms.jpg" },
];

function buildPayload(user) {
  const themeNames = [
    "AUTOMOTIVE SPARE PARTS",
    "AGRICULTURE",
    "ENERGY, ELECTRICALS AND ELECTRONICS",
    "PHARMACEUTICALS AND MEDICAL EQUIPMENT",
    "ALCOHOL AND TOBACCO",
  ];
  return {
    engagementType: "symposium",
    engagementName: "ISIPPE-3 — 3rd International Symposium on Intellectual Property Protection and Enforcement",
    category: "legal",
    overallTheme:
      "Stepping Up the Fight Against Counterfeiting to Safeguard Public Health and Safety",
    shortDescription:
      "ISIPPE-3: An International symposium by the Anti-Counterfeit Authority together with the Ministry of Investments, Trade and Industry (MITI). Theme: Stepping Up the Fight Against Counterfeiting to Safeguard Public Health and Safety. 16–19 November 2026, Mombasa Continental Resort, Mombasa (pre-events 16–17 Nov; symposium 18–19 Nov).",
    description:
      "The 3rd International Symposium on Intellectual Property Protection and Enforcement (ISIPPE-3) brings together policymakers, regulators, industry leaders, academia, and practitioners to advance effective strategies for combating counterfeiting, piracy and other forms of intellectual property (IP) infringement.\n\nOrganised by the Anti-Counterfeit Authority (ACA) in cooperation with the Ministry of Investments, Trade and Industry (MITI), Kenya, ISIPPE-3 will provide a unique platform for knowledge sharing, policy dialogue and practical solutions towards a safer, more innovative and inclusive global marketplace.\n\nPre-event activities (16–17 November) include the BCOCC meeting, brand/product knowledge training, and destruction of counterfeit goods. The main symposium runs 18–19 November 2026.",
    audience: "mixed",
    tone: "professional",
    language: "en",
    tags: ["ISIPPE-3", "ACA"],
    // Full programme window: pre-events 16–17 Nov + symposium 18–19 Nov
    startDate: "2026-11-16T05:00:00.000Z",
    endDate: "2026-11-19T17:00:00.000Z",
    allDay: false,
    timezone: "Africa/Nairobi",
    mode: "in-person",
    venue: "Mombasa Continental Resort",
    venueAddress: "Serena Road, Near Serena Hotel, Shanzu Beach, Off Mombasa Malindi Road, Mombasa, Kenya",
    city: "Mombasa",
    country: "KE",
    capacity: 1200,
    status: "published",
    visibility: "public",
    isPublished: true,
    isFeatured: true,
    publishedAt: new Date().toISOString(),
    registrationEnabled: true,
    registrationEndDate: "2026-11-18T00:00:00.000Z",
    approvalRequired: false,
    waitlistEnabled: true,
    registrationLimit: 1200,
    paymentEnabled: true,
    paymentMethods: ["mpesa", "card", "bank_transfer"],
    currency: "KES",
    themes: named(themeNames),
    objectives: named([
      "Facilitate dialogue on emerging IP trends and enforcement challenges.",
      "Share best practices and case studies from different jurisdictions.",
      "Promote multi-stakeholder collaboration to strengthen IP protection.",
      "Support policies and initiatives that foster innovation, trade and economic growth.",
    ]),
    programme,
    speakers,
    sponsors,
    tickets,
    faqs,
    venueHighlights,
    venueSpaces,
    websiteUrl: "https://www.aca.go.ke",
    contactName: user.fullName || "Super Admin",
    contactEmail: user.email || EMAIL,
    contactPhone: user.phoneNo || "254708392212",
    createdBy: user.id || user.email,
    ownerID: user.id,
  };
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
  console.log(`API ${BASE} tenant=${TENANT}`);

  const login = await api("/login", {
    method: "POST",
    body: { email: EMAIL, password: PASSWORD },
  });
  if (!login.ok || !login.data?.token) {
    console.error("Login failed:", login.status, login.data?.error || login.data);
    process.exit(2);
  }
  const { token, ...user } = login.data;
  console.log(`Logged in as ${user.fullName || user.email}`);

  const payload = buildPayload(user);

  // Prefer PATCH known/featured event; else create.
  let targetId = KNOWN_ID;
  const existing = await api(`/engagements/${encodeURIComponent(KNOWN_ID)}`, { token });
  if (existing.ok && existing.data?.engagementID) {
    targetId = String(existing.data.engagementID);
    console.log(`Updating existing engagement ${targetId}`);
    const patch = await api(`/engagements/${encodeURIComponent(targetId)}`, {
      method: "PATCH",
      token,
      body: payload,
    });
    if (!patch.ok) {
      console.error("PATCH failed:", patch.status, patch.data?.error || patch.data);
      process.exit(3);
    }
  } else {
    console.log(`Known id unavailable (${existing.status}); creating new engagement`);
    const created = await api("/engagements", { method: "POST", token, body: payload });
    if (!created.ok) {
      console.error("POST failed:", created.status, created.data?.error || created.data);
      process.exit(4);
    }
    targetId = String(created.data.engagementID || "");
    console.log(`Created engagement ${targetId}`);
  }

  // Unfeature others (best-effort), keep this one featured.
  const list = await api(
    `/engagements?filter=${encodeURIComponent(JSON.stringify({ where: { isFeatured: true }, limit: 20 }))}`,
    { token },
  );
  if (list.ok && Array.isArray(list.data)) {
    for (const row of list.data) {
      const id = String(row.engagementID || "");
      if (id && id !== targetId) {
        await api(`/engagements/${encodeURIComponent(id)}`, {
          method: "PATCH",
          token,
          body: { isFeatured: false },
        });
      }
    }
  }
  await api(`/engagements/${encodeURIComponent(targetId)}`, {
    method: "PATCH",
    token,
    body: { isFeatured: true, isPublished: true, status: "published", visibility: "public" },
  });

  const verify = await api(`/engagements/${encodeURIComponent(targetId)}`, { token });
  const v = verify.data || {};
  console.log(
    JSON.stringify(
      {
        engagementID: v.engagementID,
        engagementName: v.engagementName,
        venue: v.venue,
        city: v.city,
        startDate: v.startDate,
        endDate: v.endDate,
        isFeatured: v.isFeatured,
        isPublished: v.isPublished,
        tickets: (v.tickets || []).map((t) => ({ name: t.name, price: t.price })),
        programme: (v.programme || []).length,
        speakers: (v.speakers || []).length,
        sponsors: (v.sponsors || []).length,
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
