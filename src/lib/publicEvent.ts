import type { ProgrammeSession } from "../data/publicContent";
import { countryDisplayName } from "../data/countries";
import type { Engagement, EngagementProgrammeSession, EngagementSponsor } from "../types/engagement";
import { engagementSpeakerToCard, type SpeakerCardData } from "../components/speakers/SpeakerCard";
import { apiRequest } from "./api";
import {
  asFaqs,
  asProgramme,
  asSpeakers,
  asSponsors,
  asStringList,
  asTickets,
  asVenueHighlights,
  asVenueSpaces,
  classificationLabel,
  EVENT_AUDIENCE_OPTIONS,
  formatModeLabel,
} from "./engagements";
import type {
  EngagementFaqCategory,
  EngagementVenueHighlight,
  EngagementVenueSpace,
} from "../types/engagement";

const FEATURED_CACHE_KEY = "featured-public";

const engagementCache = new Map<string, Engagement>();
const engagementInflight = new Map<string, Promise<Engagement>>();

function filterQuery(filter: Record<string, unknown>) {
  return `?filter=${encodeURIComponent(JSON.stringify(filter))}`;
}

/** Drop cached public engagement after admin content edits. */
export function clearPublicEngagementCache(_id?: string) {
  engagementCache.clear();
  engagementInflight.clear();
}

async function fetchEngagementById(id: string) {
  return apiRequest<Engagement>(`/engagements/${encodeURIComponent(id)}`);
}

type ListAttempt = { rows: Engagement[]; ok: boolean; error?: unknown };

async function listPublicCandidates(where?: Record<string, unknown>, limit = 25): Promise<ListAttempt> {
  try {
    const rows = await apiRequest<Engagement[]>(
      `/engagements${filterQuery({
        ...(where ? { where } : {}),
        order: "startDate DESC",
        limit,
      })}`,
    );
    return { rows: Array.isArray(rows) ? rows : [], ok: true };
  } catch (error) {
    return { rows: [], ok: false, error };
  }
}

function isPubliclyListed(engagement: Engagement) {
  const visibility = String(engagement.visibility || "public").toLowerCase();
  if (visibility === "private") return false;
  const status = String(engagement.status || "").toLowerCase();
  // Never treat drafts / cancelled / archived as the public registration event.
  if (status === "draft" || status === "cancelled" || status === "archived" || status === "completed") {
    return false;
  }
  return (
    engagement.isPublished === true ||
    status === "published" ||
    status === "ongoing"
  );
}

/** Pick a published public engagement only — never fall back to a draft. */
function pickPublicId(rows: Engagement[]) {
  const listed = rows.filter(isPubliclyListed);
  if (!listed.length) return null;
  const featured = listed.find((row) => row.isFeatured === true);
  const hit = featured || listed[0];
  return hit?.engagementID ? String(hit.engagementID) : null;
}

function listFailureMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "Could not reach the engagements API.";
}

/**
 * Resolve the single event shown on the public site / registration.
 * Prefer featured **and** published; otherwise the latest published public event.
 * Never fall back to a draft — even if a draft still has isFeatured=true.
 */
export async function resolvePublicEngagementId(): Promise<string> {
  const attempts: ListAttempt[] = [];

  // Featured first, but pickPublicId still requires published/ongoing.
  const featured = await listPublicCandidates({ isFeatured: true });
  attempts.push(featured);
  const featuredId = pickPublicId(featured.rows);
  if (featuredId) return featuredId;

  const published = await listPublicCandidates({
    or: [{ isPublished: true }, { status: "published" }, { status: "ongoing" }],
  });
  attempts.push(published);
  const publishedId = pickPublicId(published.rows);
  if (publishedId) return publishedId;

  // Last resort: scan recent engagements client-side (filter APIs can be unreliable).
  const recent = await listPublicCandidates(undefined, 50);
  attempts.push(recent);
  const recentId = pickPublicId(recent.rows);
  if (recentId) return recentId;

  const lastError = [...attempts].reverse().find((a) => !a.ok)?.error;
  if (attempts.every((a) => !a.ok) && lastError) {
    throw new Error(listFailureMessage(lastError));
  }

  throw new Error("No published public event is available to display.");
}

/** Fetch the featured public engagement (request-deduped + session-cached). */
export async function getPublicEngagement(id?: string) {
  const cacheKey = id?.trim() || FEATURED_CACHE_KEY;
  const hit = engagementCache.get(cacheKey);
  if (hit) {
    // Drop cached drafts so registration cannot reuse a stale draft engagement.
    if (!id?.trim() && !isPubliclyListed(hit)) {
      engagementCache.delete(cacheKey);
      if (hit.engagementID) engagementCache.delete(String(hit.engagementID));
    } else {
      return hit;
    }
  }

  const pending = engagementInflight.get(cacheKey);
  if (pending) return pending;

  const request = (async () => {
    const resolvedId = id?.trim() || (await resolvePublicEngagementId());
    const data = await fetchEngagementById(resolvedId);
    if (!id?.trim() && !isPubliclyListed(data)) {
      throw new Error("No published public event is available to display.");
    }
    engagementCache.set(cacheKey, data);
    engagementCache.set(resolvedId, data);
    return data;
  })().finally(() => {
    engagementInflight.delete(cacheKey);
  });

  engagementInflight.set(cacheKey, request);
  return request;
}

function countryLabel(code?: string) {
  return countryDisplayName(code);
}

function ordinalDay(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n}st`;
  if (mod10 === 2 && mod100 !== 12) return `${n}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${n}rd`;
  return `${n}th`;
}

function formatPublicDates(startIso?: string, endIso?: string) {
  if (!startIso) return "—";
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : start;
  if (Number.isNaN(start.getTime())) return "—";
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
  if (Number.isNaN(end.getTime()) || start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString("en-GB", opts);
  }
  const sameMonth =
    start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${start.getDate()} – ${end.getDate()} ${start.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    })}`;
  }
  return `${start.toLocaleDateString("en-GB", opts)} – ${end.toLocaleDateString("en-GB", opts)}`;
}

/** Home-style dates: `18th – 19th November 2026`. */
export function formatPublicDatesShort(startIso?: string, endIso?: string) {
  if (!startIso) return "—";
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : start;
  if (Number.isNaN(start.getTime())) return "—";
  const monthYear = start.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  if (Number.isNaN(end.getTime()) || start.toDateString() === end.toDateString()) {
    return `${ordinalDay(start.getDate())} ${monthYear}`;
  }
  const sameMonth =
    start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${ordinalDay(start.getDate())} – ${ordinalDay(end.getDate())} ${monthYear}`;
  }
  const endLabel = end.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  return `${ordinalDay(start.getDate())} ${monthYear} – ${ordinalDay(end.getDate())} ${endLabel}`;
}

function daySpanCount(startIso?: string, endIso?: string) {
  if (!startIso) return 0;
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : start;
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.floor(ms / 86_400_000) + 1);
}

function homeBrand(engagement: Engagement | null) {
  const year = engagement?.startDate
    ? String(new Date(engagement.startDate).getFullYear())
    : String(new Date().getFullYear());
  const name = engagement?.engagementName?.trim() || "";
  if (!name) {
    return { mark: "", year, showLogo: false as const };
  }
  // Only show the ISIPPE medal logo when this engagement is actually an ISIPPE event.
  if (/isippe/i.test(name)) {
    return { mark: "ISIPPE", year, showLogo: true as const };
  }
  const mark = name.split(/[—–-]/)[0]?.trim().slice(0, 18) || name.slice(0, 18);
  return { mark, year, showLogo: false as const };
}

function homeSubtitle(engagementName?: string) {
  const name = (engagementName || "").trim();
  if (!name) return "";
  return name.replace(/^ISIPPE[- ]?\d*\s*[—–-]\s*/i, "").trim() || name;
}

function splitDescription(text?: string) {
  const raw = (text || "").trim();
  if (!raw) return [];
  const parts = raw
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length > 1) return parts;
  const sentences = raw.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [raw];
  if (sentences.length <= 2) return sentences;
  return [sentences.slice(0, Math.ceil(sentences.length / 2)).join(" "), sentences.slice(Math.ceil(sentences.length / 2)).join(" ")];
}

export type PublicAboutContent = {
  name: string;
  shortDescription: string;
  overviewParagraphs: string[];
  objectives: string[];
  audienceLabel: string;
  attendIntro: string;
  attendGroups: string[];
  themes: string[];
  venueTitle: string;
  venueCity: string;
  venueCountry: string;
  venueLine: string;
  modeLabel: string;
  datesLabel: string;
  cover: string;
  category?: string;
};

/** Empty shell when no engagement is loaded (avoids hard-coded demo copy). */
const EMPTY_ABOUT: PublicAboutContent = {
  name: "",
  shortDescription: "",
  overviewParagraphs: [],
  objectives: [],
  audienceLabel: "",
  attendIntro: "",
  attendGroups: [],
  themes: [],
  venueTitle: "",
  venueCity: "",
  venueCountry: "",
  venueLine: "",
  modeLabel: "",
  datesLabel: "",
  cover: "/assets/about-overview.jpg",
};

/** Map engagement record → About page content (this event only — no cross-event demo copy). */
export function engagementToAboutContent(engagement: Engagement | null): PublicAboutContent {
  if (!engagement) return EMPTY_ABOUT;

  const themes = asStringList(engagement.themes);
  const objectives = asStringList(engagement.objectives);
  const tags = asStringList(engagement.tags).filter(
    (t) => !/^(isippe|aca|aca kenya)$/i.test(t.trim()),
  );
  const audienceLabel = classificationLabel(
    EVENT_AUDIENCE_OPTIONS,
    engagement.audience,
    "Participants",
  );
  const overview =
    splitDescription(engagement.description).length > 0
      ? splitDescription(engagement.description)
      : engagement.shortDescription
        ? [engagement.shortDescription]
        : [];

  // Venue must come from this engagement — never inject another event's location.
  const venueTitle = engagement.venue?.trim() || "";
  const venueCity = engagement.city?.trim() || "";
  const venueCountry = countryLabel(engagement.country) || "";
  const venueLine = [venueTitle, venueCity, venueCountry].filter(Boolean).join(", ");

  const attendGroups =
    tags.length >= 2 ? tags.slice(0, 6) : themes.length ? themes : [];

  const name = engagement.engagementName?.trim() || "";

  return {
    name,
    shortDescription: engagement.shortDescription?.trim() || overview[0] || "",
    overviewParagraphs: overview,
    objectives,
    audienceLabel,
    attendIntro:
      engagement.shortDescription?.trim() ||
      (audienceLabel
        ? `This event welcomes a ${audienceLabel.toLowerCase()} focus.`
        : ""),
    attendGroups,
    themes,
    venueTitle,
    venueCity,
    venueCountry,
    venueLine,
    modeLabel: engagement.mode ? `${formatModeLabel(engagement.mode)} event` : "",
    datesLabel: formatPublicDates(engagement.startDate, engagement.endDate),
    cover: engagement.bannerImage || engagement.logo || EMPTY_ABOUT.cover,
    category: engagement.category,
  };
}

export type PublicHomeContent = {
  brandMark: string;
  brandYear: string;
  showBrandLogo: boolean;
  subtitle: string;
  datesLabel: string;
  cityLine: string;
  venueLine: string;
  intro: string;
  tagline: string;
  earlyBirdNote: string;
  aboutTitle: string;
  aboutBody: string;
  themes: string[];
  stats: {
    participants: string;
    speakers: string;
    days: string;
  };
  venueName: string;
  venueCityCountry: string;
  venueImageAlt: string;
};

const EMPTY_HOME: PublicHomeContent = {
  brandMark: "",
  brandYear: String(new Date().getFullYear()),
  showBrandLogo: false,
  subtitle: "",
  datesLabel: "",
  cityLine: "",
  venueLine: "",
  intro: "",
  tagline: "",
  earlyBirdNote: "",
  aboutTitle: "",
  aboutBody: "",
  themes: [],
  stats: { participants: "", speakers: "", days: "" },
  venueName: "",
  venueCityCountry: "",
  venueImageAlt: "Event venue",
};

/** Map engagement record → Home page hero / about content. */
export function engagementToHomeContent(engagement: Engagement | null): PublicHomeContent {
  if (!engagement) return EMPTY_HOME;

  const about = engagementToAboutContent(engagement);
  const brand = homeBrand(engagement);
  const speakers = asSpeakers(engagement.speakers);
  const tickets = asTickets(engagement.tickets);
  const themes = about.themes.slice(0, 5);
  const days = daySpanCount(engagement.startDate, engagement.endDate);
  const capacity = engagement.capacity || engagement.registrationLimit;

  const early =
    tickets.find((t) => /early/i.test(t.name)) ||
    tickets.find((t) => /early/i.test(t.period || ""));
  const earlyBirdNote = early
    ? `Early bird registration is now open.${early.period ? ` ${early.period}.` : ""}${early.price ? ` ${early.price}.` : ""}`
    : "";

  const cityLine = [about.venueCity, about.venueCountry].filter(Boolean).join(", ");
  const shortName = about.name.split(/[—–-]/)[0]?.trim() || about.name;
  const shortDesc = engagement.description?.trim() || "";
console.log(engagement);
  return {
    brandMark: brand.mark,
    brandYear: brand.year,
    showBrandLogo: brand.showLogo,
    subtitle: homeSubtitle(engagement.engagementName),
    datesLabel: formatPublicDatesShort(engagement.startDate, engagement.endDate),
    cityLine,
    venueLine: about.venueTitle,
    intro: shortDesc || about.overviewParagraphs[0] || "",
    tagline: shortDesc,
    earlyBirdNote,
    aboutTitle: shortName ? `About ${shortName}` : "About",
    aboutBody:
      engagement.description?.trim() || about.overviewParagraphs.join(" ") || "",
    themes,
    stats: {
      participants: capacity ? `${Number(capacity).toLocaleString("en-KE")}+` : "",
      speakers: speakers.length ? `${speakers.length}+` : "",
      days: days ? `${days} Day${days === 1 ? "" : "s"}` : "",
    },
    venueName: about.venueTitle,
    venueCityCountry: cityLine,
    venueImageAlt: [about.venueTitle, cityLine].filter(Boolean).join(", ") || "Event venue",
  };
}

export type PublicEventCopy = {
  name: string;
  brandLine: string;
  fullName: string;
  edition: string;
  dates: string;
  datesShort: string;
  city: string;
  venue: string;
  venueShort: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  year: number;
  referencePrefix: string;
};

export type PublicFeeTier = {
  earlyBird: {
    id: string;
    label: string;
    until: string;
    kes: number;
    usd: number;
  };
  late: {
    id: string;
    label: string;
    until: string;
    kes: number;
    usd: number;
  };
  active: "earlyBird" | "late";
};

function parseTicketAmounts(price?: string | number) {
  if (typeof price === "number" && Number.isFinite(price)) {
    return { kes: price, usd: 0 };
  }
  const text = String(price || "");
  const kesMatch = text.match(/KES\s*([\d,]+)/i);
  const usdMatch = text.match(/USD\s*([\d,]+)/i);
  const bare = text.match(/([\d,]+)/);
  return {
    kes: kesMatch
      ? Number(kesMatch[1].replace(/,/g, ""))
      : bare && !/usd/i.test(text)
        ? Number(bare[1].replace(/,/g, ""))
        : 0,
    usd: usdMatch ? Number(usdMatch[1].replace(/,/g, "")) : 0,
  };
}


/** Shared public chrome copy (hero meta, footer, login, registration). */
export function engagementToEventCopy(engagement: Engagement | null): PublicEventCopy {
  const year = new Date().getFullYear();
  if (!engagement) {
    return {
      name: "",
      brandLine: "",
      fullName: "",
      edition: "",
      dates: "",
      datesShort: "",
      city: "",
      venue: "",
      venueShort: "",
      tagline: "",
      supportEmail: "",
      supportPhone: "",
      year,
      referencePrefix: `EVENT-${year}`,
    };
  }

  const home = engagementToHomeContent(engagement);
  const about = engagementToAboutContent(engagement);
  const shortName = about.name.split(/[—–-]/)[0]?.trim() || about.name || "Event";
  const eventYear = Number(home.brandYear) || year;
  const venueShort =
    [about.venueTitle.split(/[,(]/)[0]?.trim() || about.venueTitle, about.venueCity]
      .filter(Boolean)
      .join(", ") || home.venueLine;

  return {
    name: shortName,
    brandLine: `${home.brandMark} ${home.brandYear}`.trim(),
    fullName: home.subtitle,
    edition: home.subtitle,
    dates: home.datesLabel,
    datesShort: home.datesLabel,
    city: home.cityLine,
    venue: home.venueLine,
    venueShort,
    tagline: home.tagline,
    supportEmail: engagement.contactEmail?.trim() || "",
    supportPhone: engagement.contactPhone?.trim() || "",
    year: eventYear,
    referencePrefix: `${shortName.replace(/\s+/g, "-").toUpperCase()}-${eventYear}`,
  };
}

const EMPTY_FEES: PublicFeeTier = {
  earlyBird: {
    id: "early-bird",
    label: "Early Bird Registration",
    until: "—",
    kes: 0,
    usd: 0,
  },
  late: {
    id: "late",
    label: "Late Registration",
    until: "—",
    kes: 0,
    usd: 0,
  },
  active: "earlyBird",
};

/** Registration fee tiers from engagement tickets (API only — no hard-coded prices). */
export function engagementToRegistrationFees(engagement: Engagement | null): PublicFeeTier {
  if (!engagement) return EMPTY_FEES;
  const tickets = asTickets(engagement.tickets);
  if (!tickets.length) return EMPTY_FEES;

  const early =
    tickets.find((t) => /early/i.test(t.name) || /early/i.test(t.period || "")) || tickets[0];
  const late =
    tickets.find(
      (t) =>
        t !== early &&
        (/late/i.test(t.name) || /late/i.test(t.period || "") || /standard|regular/i.test(t.name)),
    ) || tickets.find((t) => t !== early) || early;

  const earlyAmounts = parseTicketAmounts(early.price);
  const lateAmounts = parseTicketAmounts(late.price);

  return {
    earlyBird: {
      id: early.id || "early-bird",
      label: early.name || EMPTY_FEES.earlyBird.label,
      until: early.period || "—",
      kes: earlyAmounts.kes,
      usd: earlyAmounts.usd,
    },
    late: {
      id: late.id || "late",
      label: late.name || EMPTY_FEES.late.label,
      until: late.period || "—",
      kes: lateAmounts.kes,
      usd: lateAmounts.usd,
    },
    active: "earlyBird",
  };
}

export type PublicProgrammeDay = {
  id: string;
  label: string;
  sub: string;
  dayNumber?: number;
};

export type PublicSponsorPackage = {
  id: string;
  name: string;
  price: string;
  medal: string;
  description: string;
  button: string;
  benefits: string[];
  tierKey: string;
};

export type PublicVenueContent = {
  name: string;
  city: string;
  country: string;
  titleLines: [string, string];
  description: string;
  aboutParagraphs: string[];
  mapsUrl: string;
  websiteUrl?: string;
  datesLabel: string;
  modeLabel: string;
  shortName: string;
  highlights: EngagementVenueHighlight[];
  spaces: EngagementVenueSpace[];
};

const VENUE_IMAGES = {
  lobby: "/assets/programme/lobby.jpg",
  ballroom: "/assets/programme/ballroom.jpg",
  exhibition: "/assets/programme/exhibition.jpg",
  panel: "/assets/programme/panel.jpg",
  restaurant: "/assets/programme/restaurant.jpg",
  default: "/assets/programme/panel.jpg",
} as const;

const SPONSOR_MEDALS: Record<string, string> = {
  platinum: "/assets/sponsor-platinum.png",
  gold: "/assets/sponsor-gold.png",
  silver: "/assets/sponsor-silver.png",
  bronze: "/assets/sponsor-bronze.png",
};

function badgeTone(badge?: string): ProgrammeSession["tone"] {
  const value = (badge || "").toLowerCase();
  if (/ceremon|opening|closing/.test(value)) return "red";
  if (/keynote/.test(value)) return "green";
  if (/workshop|training/.test(value)) return "purple";
  if (/break|lunch|coffee|networking/.test(value)) return "neutral";
  if (/panel|discussion/.test(value)) return "blue";
  if (/exhibition|showcase/.test(value)) return "orange";
  return "blue";
}

function venueImageFor(venue?: string, badge?: string) {
  const hay = `${venue || ""} ${badge || ""}`.toLowerCase();
  if (/lobby|registration|reception/.test(hay)) return VENUE_IMAGES.lobby;
  if (/ballroom|plenary|tsavo|amphitheatre|amphitheater/.test(hay)) return VENUE_IMAGES.ballroom;
  if (/exhibition|expo/.test(hay)) return VENUE_IMAGES.exhibition;
  if (/restaurant|lunch|dinner|gala/.test(hay)) return VENUE_IMAGES.restaurant;
  if (/panel|breakout|room|workshop/.test(hay)) return VENUE_IMAGES.panel;
  return VENUE_IMAGES.default;
}

function sessionClock(session: EngagementProgrammeSession) {
  if (session.startTime && session.endTime) {
    return `${session.startTime} – ${session.endTime}`;
  }
  const raw = (session.time || "").trim();
  if (!raw) return "—";
  const match = raw.match(/(\d{1,2}:\d{2}\s*[–-]\s*\d{1,2}:\d{2})/);
  return match?.[1]?.replace(/\s*-\s*/, " – ") || raw;
}

function speakersLabel(session: EngagementProgrammeSession) {
  if (Array.isArray(session.speakerNames) && session.speakerNames.length) {
    return {
      speakers: session.speakerNames.join(", "),
      speakerLines: session.speakerNames,
    };
  }
  if (Array.isArray(session.speakers) && session.speakers.length) {
    return {
      speakers: session.speakers.join(", "),
      speakerLines: session.speakers.map(String),
    };
  }
  if (typeof session.speakers === "number" && session.speakers > 0) {
    return { speakers: `${session.speakers} speakers` };
  }
  return { speakers: "—" };
}

function dayNumberOf(session: EngagementProgrammeSession, index: number) {
  const raw = session.day;
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return Math.floor(raw);
  if (typeof raw === "string") {
    const n = Number.parseInt(raw.replace(/\D+/g, ""), 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  const fromTime = (session.time || "").match(/day\s*(\d+)/i);
  if (fromTime) return Number(fromTime[1]);
  return index + 1;
}

function formatDayLabel(startIso: string | undefined, dayNumber: number) {
  if (!startIso) return { date: `Day ${dayNumber}`, weekday: "" };
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return { date: `Day ${dayNumber}`, weekday: "" };
  const day = new Date(start);
  day.setUTCDate(start.getUTCDate() + (dayNumber - 1));
  return {
    date: day.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    weekday: day.toLocaleDateString("en-GB", { weekday: "long" }),
  };
}

function formatSponsorPrice(price: EngagementSponsor["price"], currency = "KES") {
  if (price == null || price === "") return "Contact us";
  if (typeof price === "number") {
    return `${currency} ${price.toLocaleString("en-KE")}`;
  }
  const text = String(price).trim();
  if (!text) return "Contact us";
  if (/^[A-Z]{3}\b/i.test(text) || /kes|usd|eur|gbp/i.test(text)) return text;
  const n = Number(text.replace(/,/g, ""));
  if (Number.isFinite(n)) return `${currency} ${n.toLocaleString("en-KE")}`;
  return text;
}

function sponsorTierKey(sponsor: EngagementSponsor) {
  const fromTier = (sponsor.tier || sponsor.id || sponsor.name || "").toLowerCase();
  if (/platinum/.test(fromTier)) return "platinum";
  if (/gold/.test(fromTier)) return "gold";
  if (/silver/.test(fromTier)) return "silver";
  if (/bronze/.test(fromTier)) return "bronze";
  return (sponsor.id || sponsor.name || "sponsor").toLowerCase().replace(/\s+/g, "-");
}

/** Speakers for the public Speakers page. */
export function engagementToPublicSpeakers(engagement: Engagement | null): SpeakerCardData[] {
  if (!engagement) return [];
  return asSpeakers(engagement.speakers).map(engagementSpeakerToCard);
}

/** Programme sessions + day filters for the public Programme page. */
export function engagementToPublicProgramme(engagement: Engagement | null): {
  days: PublicProgrammeDay[];
  sessions: ProgrammeSession[];
  dayMeta: Record<number, { date: string; weekday: string }>;
  venueLine: string;
} {
  const venueTitle = engagement?.venue?.trim() || "";
  const venueCity = engagement?.city?.trim() || "";
  const venueCountry = countryLabel(engagement?.country) || "";
  const venueLine = [venueTitle, venueCity, venueCountry].filter(Boolean).join(", ");
  const venueSub = engagement?.city?.trim() || venueTitle.split(/\s+/)[0] || "Venue";

  const source = asProgramme(engagement?.programme);
  const sessions: ProgrammeSession[] = source.map((session, index) => {
    const day = dayNumberOf(session, index);
    const type = session.badge?.trim() || "Session";
    const { speakers, speakerLines } = speakersLabel(session);
    return {
      id: session.id || `session-${index + 1}`,
      day,
      time: sessionClock(session),
      title: session.title,
      type,
      tone: badgeTone(type),
      speakers,
      speakerLines,
      venue: session.venue || session.place || venueTitle,
      venueSub,
      venueImage: venueImageFor(session.venue || session.place, type),
    };
  });

  const uniqueDays = [...new Set(sessions.map((s) => s.day))].sort((a, b) => a - b);
  const dayMeta: Record<number, { date: string; weekday: string }> = {};
  for (const day of uniqueDays) {
    dayMeta[day] = formatDayLabel(engagement?.startDate, day);
  }

  const days: PublicProgrammeDay[] = [
    { id: "all", label: "All Days", sub: "" },
    ...uniqueDays.map((day) => ({
      id: String(day),
      label: `Day ${day}`,
      sub: dayMeta[day]?.date || "",
      dayNumber: day,
    })),
  ];

  return { days, sessions, dayMeta, venueLine };
}

/** Sponsorship packages from engagement sponsors. */
export function engagementToPublicSponsors(
  engagement: Engagement | null,
): PublicSponsorPackage[] {
  const currency = engagement?.currency || "KES";
  return asSponsors(engagement?.sponsors)
    .filter((s) => s.active !== false)
    .map((sponsor) => {
      const tierKey = sponsorTierKey(sponsor);
      const name = sponsor.name.trim();
      return {
        id: sponsor.id || tierKey,
        name,
        price: formatSponsorPrice(sponsor.price, currency),
        medal: SPONSOR_MEDALS[tierKey] || SPONSOR_MEDALS.platinum,
        description:
          sponsor.subtitle?.trim() ||
          "Partner with this event and grow your brand visibility.",
        button: `Select ${name.includes("Sponsor") ? name : `${name} Package`}`,
        benefits: sponsor.benefits?.length
          ? sponsor.benefits
          : ["Brand visibility", "Networking opportunities", "Event acknowledgement"],
        tierKey,
      };
    });
}

/** Venue hero / about copy from this engagement only (empty when unset). */
export function engagementToPublicVenue(engagement: Engagement | null): PublicVenueContent {
  const about = engagementToAboutContent(engagement);
  const name = about.venueTitle;
  const city = about.venueCity;
  const country = about.venueCountry;
  const shortName = name.split(/[,(]/)[0]?.trim() || name;
  const mapsQuery = encodeURIComponent([name, city, country].filter(Boolean).join(", "));
  const mapsUrl =
    engagement?.mapUrl?.trim() ||
    (mapsQuery ? `https://maps.google.com/?q=${mapsQuery}` : "");
  const highlights = asVenueHighlights(engagement?.venueHighlights);
  const spaces = asVenueSpaces(engagement?.venueSpaces);

  const description =
    engagement?.shortDescription?.trim() ||
    (about.name && about.venueLine
      ? `${about.name} will be held at ${about.venueLine}.`
      : about.venueLine || "");

  const aboutParagraphs = [
    name
      ? `${name}${city ? `, located in ${city}` : ""}${country ? `, ${country}` : ""}${
          about.name ? `, hosts ${about.name}` : ""
        }.`
      : "",
    about.shortDescription,
  ].filter(Boolean);

  return {
    name,
    city,
    country,
    titleLines: [
      shortName || "Venue",
      [city, country].filter(Boolean).join(", ") || "Location to be announced",
    ],
    description: description || "Venue details will be published for this event soon.",
    aboutParagraphs,
    mapsUrl,
    websiteUrl: engagement?.websiteUrl?.trim() || undefined,
    datesLabel: about.datesLabel,
    modeLabel: about.modeLabel,
    shortName,
    highlights,
    spaces,
  };
}

/** Public FAQ categories from engagement only — no seeded catalog. */
export function engagementToPublicFaqs(engagement: Engagement | null): EngagementFaqCategory[] {
  if (!engagement) return [];
  return asFaqs(engagement.faqs);
}
