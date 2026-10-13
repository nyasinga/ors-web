import type { Engagement } from "../types/engagement";
import { apiRequest } from "./api";
import {
  asStringList,
  classificationLabel,
  EVENT_AUDIENCE_OPTIONS,
  formatModeLabel,
} from "./engagements";

/** Featured public event — override with VITE_EVENT_ENGAGEMENT_ID. */
export const PUBLIC_EVENT_ID =
  (import.meta.env.VITE_EVENT_ENGAGEMENT_ID as string | undefined)?.trim() ||
  "6ac9ff48e25a978dcd246e34";

export async function getPublicEngagement(id = PUBLIC_EVENT_ID) {
  return apiRequest<Engagement>(`/engagements/${encodeURIComponent(id)}`);
}

function countryLabel(code?: string) {
  if (!code) return "";
  const map: Record<string, string> = {
    KE: "Kenya",
    UG: "Uganda",
    TZ: "Tanzania",
    RW: "Rwanda",
  };
  return map[code.toUpperCase()] || code;
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

const FALLBACK: PublicAboutContent = {
  name: "ISIPPE-3",
  shortDescription:
    "A global platform for dialogue, collaboration and practical solutions to strengthen intellectual property protection and enforcement.",
  overviewParagraphs: [
    "The 3rd International Symposium on Intellectual Property Protection and Enforcement (ISIPPE-3) brings together policymakers, regulators, industry leaders, academia, and practitioners to advance effective strategies for combating counterfeiting, piracy and other forms of intellectual property (IP) infringement.",
    "Hosted by the Anti-Counterfeit Authority (ACA), ISIPPE-3 will provide a unique platform for knowledge sharing, policy dialogue and practical solutions towards a safer, more innovative and inclusive global marketplace.",
  ],
  objectives: [
    "Facilitate dialogue on emerging IP trends and enforcement challenges.",
    "Share best practices and case studies from different jurisdictions.",
    "Promote multi-stakeholder collaboration to strengthen IP protection.",
    "Support policies and initiatives that foster innovation, trade and economic growth.",
  ],
  audienceLabel: "Mixed audience",
  attendIntro:
    "ISIPPE-3 is designed for professionals shaping intellectual property protection and enforcement across Africa and beyond.",
  attendGroups: [
    "Policymakers and regulators",
    "Industry leaders and rights holders",
    "Academia and researchers",
    "Enforcement and customs practitioners",
  ],
  themes: [
    "Intellectual Property",
    "Enforcement",
    "Policy",
    "Innovation",
    "Regional Collaboration",
  ],
  venueTitle: "Kenyatta International Convention Centre (KICC)",
  venueCity: "Nairobi",
  venueCountry: "Kenya",
  venueLine: "Kenyatta International Convention Centre (KICC), Nairobi, Kenya",
  modeLabel: "In-Person",
  datesLabel: "Dates to be confirmed",
  cover: "/assets/about-overview.jpg",
};

/** Map engagement record → About page content (with static fallbacks). */
export function engagementToAboutContent(engagement: Engagement | null): PublicAboutContent {
  if (!engagement) return FALLBACK;

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
        : FALLBACK.overviewParagraphs;

  const venueTitle = engagement.venue?.trim() || FALLBACK.venueTitle;
  const venueCity = engagement.city?.trim() || FALLBACK.venueCity;
  const venueCountry = countryLabel(engagement.country) || FALLBACK.venueCountry;
  const venueLine = [venueTitle, venueCity, venueCountry].filter(Boolean).join(", ");

  const attendGroups =
    tags.length >= 2
      ? tags.slice(0, 6)
      : themes.length
        ? themes
        : FALLBACK.attendGroups;

  return {
    name: engagement.engagementName?.trim() || FALLBACK.name,
    shortDescription:
      engagement.shortDescription?.trim() ||
      overview[0] ||
      FALLBACK.shortDescription,
    overviewParagraphs: overview,
    objectives: objectives.length ? objectives : FALLBACK.objectives,
    audienceLabel,
    attendIntro:
      engagement.shortDescription?.trim() ||
      `This event welcomes a ${audienceLabel.toLowerCase()} focus, bringing together stakeholders across the IP ecosystem.`,
    attendGroups,
    themes: themes.length ? themes : FALLBACK.themes,
    venueTitle,
    venueCity,
    venueCountry,
    venueLine,
    modeLabel: `${formatModeLabel(engagement.mode)} event`,
    datesLabel: formatPublicDates(engagement.startDate, engagement.endDate),
    cover: engagement.bannerImage || engagement.logo || FALLBACK.cover,
    category: engagement.category,
  };
}
