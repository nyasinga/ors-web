export type ParticipationType = "delegate" | "speaker" | "sponsor" | "virtual";

/** Values accepted by POST /ticketing (and signup) as `userType`. */
export const TICKETING_USER_TYPES = [
  "delegate",
  "exhibitor",
  "speaker",
  "participant",
  "sponsor",
] as const;

export type TicketingUserType = (typeof TICKETING_USER_TYPES)[number];

/**
 * Map UI participation type (or any raw ticket type) to an API `userType`.
 * `virtual` → `participant` (not in the backend allow-list).
 */
export function toTicketingUserType(
  raw?: string | null,
  fallback: TicketingUserType = "delegate",
): TicketingUserType {
  const v = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (v === "virtual" || v === "virtual_participant" || v === "online") return "participant";
  if (v === "exhibitor" || v === "sponsor_exhibitor") return "exhibitor";
  if ((TICKETING_USER_TYPES as readonly string[]).includes(v)) {
    return v as TicketingUserType;
  }
  return fallback;
}

export const participationTypes = [
  {
    id: "delegate" as const,
    title: "Delegate",
    description: "Attend the full conference sessions and networking events.",
    categoryBlurb: "For government officials, industry leaders, researchers and practitioners.",
    accent: "navy",
    includes: [
      "Access to all keynote and technical sessions",
      "Refreshments and lunch",
      "Conference materials and resources",
      "Access to post-event resources",
      "Networking opportunities",
      "Certificate of participation",
      "Entry to exhibition area",
    ],
  },
  {
    id: "speaker" as const,
    title: "Speaker",
    description: "Present insights, research or case studies.",
    categoryBlurb: "For confirmed speakers or those submitting abstracts.",
    accent: "red",
    includes: [
      "Speaking slot coordination",
      "Access to all keynote and technical sessions",
      "Speaker lounge access",
      "Conference materials and resources",
      "Networking opportunities",
      "Certificate of contribution",
    ],
  },
  {
    id: "sponsor" as const,
    title: "Sponsor / Exhibitor",
    description: "Showcase your organisation and explore partnership opportunities.",
    categoryBlurb: "For organisations showcasing solutions and seeking partnerships.",
    accent: "green",
    includes: [
      "Package benefits by sponsorship tier",
      "Exhibition space options",
      "Brand visibility across materials",
      "Delegate passes as per package",
      "Networking access",
      "Recognition in programme materials",
    ],
  },
  {
    id: "virtual" as const,
    title: "Virtual Participant",
    description: "Join online and access selected sessions.",
    categoryBlurb: "For online attendees with access to selected sessions.",
    accent: "navy",
    includes: [
      "Live stream access to selected sessions",
      "Selected session recordings",
      "Digital conference materials",
      "Online networking rooms",
      "Certificate of participation",
      "Platform support",
    ],
  },
];
