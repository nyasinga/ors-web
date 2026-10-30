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

const programmeRaw = [
  ["d1-1", 1, "08:00 – 09:00", "Registration and Networking Coffee", "Registration", "Main Lobby", "-", 0],
  ["d1-2", 1, "09:00 – 09:30", "Official Opening Ceremony", "Ceremony", "Tsavo Ballroom", "ACA Leadership, Government Representatives", 2],
  ["d1-3", 1, "09:30 – 10:30", "Keynote Address: The Future of IP Protection in Africa", "Keynote", "Tsavo Ballroom", "International Expert", 1],
  ["d1-4", 1, "10:30 – 11:00", "Health Break & Networking", "Break", "Exhibition Area", "-", 0],
  ["d1-5", 1, "11:00 – 12:30", "Panel Discussion: Combating Counterfeiting Through Regional Collaboration", "Panel", "Tsavo Ballroom", "Industry Leaders, Policy Makers", 2],
  ["d1-6", 1, "12:30 – 14:00", "Lunch Break", "Break", "Simba Restaurant", "-", 0],
  ["d1-7", 1, "14:00 – 15:30", "Roundtable: Emerging Technologies in IP Enforcement", "Roundtable", "Amboseli Room", "Experts & Stakeholders", 1],
  ["d1-8", 1, "15:30 – 16:00", "Coffee Break", "Break", "Exhibition Area", "-", 0],
  ["d1-9", 1, "16:00 – 17:30", "Case Studies: Successful IP Enforcement Initiatives in Africa", "Presentation", "Maasai Room", "Regional Experts", 1],
  ["d2-1", 2, "09:00 – 10:30", "Roundtable: Digital Tools for IP Protection", "Roundtable", "Amboseli Room", "Industry Leaders", 1],
  ["d2-2", 2, "10:30 – 11:00", "Networking Break", "Break", "Exhibition Area", "-", 0],
  ["d2-3", 2, "11:00 – 12:30", "Workshop: Investigating Online Counterfeit Markets", "Workshop", "Maasai Room", "Digital Enforcement Team", 1],
  ["d2-4", 2, "14:00 – 15:30", "Case Studies: Enforcement Success Stories", "Presentation", "Tsavo Ballroom", "National Agencies", 1],
  ["d2-5", 2, "16:00 – 17:00", "Industry Showcase & Partner Briefings", "Exhibition", "Exhibition Area", "Sponsors & Exhibitors", 1],
  ["d3-1", 3, "09:00 – 10:30", "Policy Dialogue: Harmonising Enforcement Frameworks", "Panel", "Tsavo Ballroom", "Policy Makers", 1],
  ["d3-2", 3, "11:00 – 12:30", "Breakout: Capacity Building for Enforcement Officers", "Workshop", "Amboseli Room", "Training Facilitators", 1],
  ["d3-3", 3, "14:00 – 15:00", "Closing Ceremony & Communiqué", "Ceremony", "Tsavo Ballroom", "ACA Leadership", 1],
];

const dayLabel = {
  1: "Day 1 · 16 Nov 2026",
  2: "Day 2 · 17 Nov 2026",
  3: "Day 3 · 18 Nov 2026",
};

const programme = programmeRaw.map(([id, day, time, title, typ, venue, speakers, n]) => ({
  id,
  title,
  description: `${dayLabel[day]} · ${typ}`,
  time: `Day ${day} · ${time}`,
  venue,
  place: venue,
  badge: typ,
  speakers: n || (speakers === "-" ? 0 : 1),
  day,
}));

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
  { id: "platinum", name: "Platinum Sponsor", subtitle: "Maximum visibility and strategic engagement opportunities.", price: 1000000, availability: "Open", benefits: ["Prime exhibition space", "Keynote speaking opportunity", "Branding across all event materials", "Multiple delegate passes (5)", "Dedicated networking opportunities", "Acknowledgement during event"], active: true, tone: "amber", tier: "Platinum" },
  { id: "gold", name: "Gold Sponsor", subtitle: "High visibility and extensive engagement opportunities.", price: 500000, availability: "Open", benefits: ["Prime exhibition space", "Keynote speaking opportunity", "Panel participation opportunity", "Branding across all event materials", "Multiple delegate passes (4)", "Dedicated networking opportunities"], active: true, tone: "yellow", tier: "Gold" },
  { id: "silver", name: "Silver Sponsor", subtitle: "Enhanced visibility and engagement opportunities.", price: 300000, availability: "Open", benefits: ["Prime exhibition space", "Panel participation opportunity", "Branding across all event materials", "Multiple delegate passes (3)", "Dedicated networking opportunities"], active: true, tone: "slate", tier: "Silver" },
  { id: "bronze", name: "Bronze Sponsor", subtitle: "Brand exposure and networking opportunities.", price: 150000, availability: "Open", benefits: ["Branding across website", "Multiple delegate passes (2)", "Delegate passes to social events", "Dedicated networking opportunities", "Acknowledgement during event"], active: true, tone: "orange", tier: "Bronze" },
];

const tickets = [
  { id: "early-bird", name: "Early Bird Registration", price: "KES 60,000 / USD 470", capacity: 800, period: "Up to 31 October 2026", tone: "green" },
  { id: "late", name: "Late Registration", price: "KES 70,000 / USD 510", capacity: 400, period: "1 to 18 November 2026", tone: "blue" },
];

const venueHighlights = [
  { id: "vh1", icon: "MapPin", title: "Beachfront Location", text: "PrideInn Flamingo Beach Resort & Spa, Shanzu Beach, Mombasa" },
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
    "ENERGY, ELECTRICALS AND ELECTRONIC",
    "PHARMACEUTICALS AND MEDICAL EQUIPMENT",
    "ALCOHOL AND TOBACCO",
  ];
  return {
    engagementType: "symposium",
    engagementName: "ISIPPE-3 — 3rd International Symposium on Intellectual Property Protection and Enforcement",
    category: "legal",
    shortDescription:
      "Strengthening Intellectual Property Protection across Africa and Beyond. PrideInn Flamingo, Mombasa · 16–18 November 2026.",
    description:
      "The 3rd International Symposium on Intellectual Property Protection and Enforcement (ISIPPE-3) brings together policymakers, regulators, industry leaders, academia, and practitioners to advance effective strategies for combating counterfeiting, piracy and other forms of intellectual property (IP) infringement.\n\nHosted by the Anti-Counterfeit Authority (ACA), ISIPPE-3 will provide a unique platform for knowledge sharing, policy dialogue and practical solutions towards a safer, more innovative and inclusive global marketplace.",
    audience: "mixed",
    tone: "professional",
    language: "en",
    tags: ["ISIPPE-3", "ACA"],
    startDate: "2026-11-16T06:00:00.000Z",
    endDate: "2026-11-18T15:00:00.000Z",
    allDay: false,
    timezone: "Africa/Nairobi",
    mode: "in-person",
    venue: "PrideInn Flamingo Beach Resort & Spa",
    venueAddress: "Shanzu Beach, Mombasa, Kenya",
    city: "Mombasa",
    country: "KE",
    capacity: 1200,
    status: "published",
    visibility: "public",
    isPublished: true,
    isFeatured: true,
    publishedAt: new Date().toISOString(),
    registrationEnabled: true,
    registrationEndDate: "2026-11-16T00:00:00.000Z",
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
