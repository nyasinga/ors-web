/** LoopBack Engagement model — /engagements */

export type EngagementType =
  | "conference"
  | "workshop"
  | "training"
  | "seminar"
  | "summit"
  | "exhibition"
  | "webinar"
  | "forum"
  | "symposium"
  | "meeting"
  | "other";

export type EngagementMode = "in_person" | "virtual" | "hybrid";

export type EngagementStatus =
  | "draft"
  | "published"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "archived";

export type EngagementVisibility = "public" | "private" | "unlisted";

export type EngagementAudience =
  | "general_public"
  | "professionals"
  | "businesses"
  | "government"
  | "academia"
  | "students"
  | "investors"
  | "industry"
  | "partners"
  | "members"
  | "mixed"
  | "other";

export type EngagementTone =
  | "professional"
  | "formal"
  | "academic"
  | "corporate"
  | "friendly"
  | "informative"
  | "inspirational"
  | "promotional"
  | "conversational"
  | "technical";

export type EngagementLanguage = "en" | "sw" | "fr" | "ar" | "es" | "pt" | "de" | "other";

export type EngagementPaymentMethod = "mpesa" | "card" | "bank_transfer" | "free";

export type EngagementCurrency = "KES" | "USD" | "EUR" | "GBP" | "ZAR" | "UGX" | "TZS" | "RWF";

export type EngagementProgrammeSession = {
  id?: string;
  day?: number | string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  time?: string;
  venue?: string;
  place?: string;
  badge?: string;
  speakers?: number | string[];
  speakerNames?: string[];
};

export type EngagementSpeaker = {
  id?: string;
  name: string;
  role?: string;
  org?: string;
  topic?: string;
  /** Display lines under the name (role / org). Falls back to role + org. */
  roleLines?: string[];
  country?: string;
  flag?: string;
  /** keynote | panelist | moderator | government — drives badge color */
  category?: string;
  /** Badge label override (e.g. "Keynote Speaker") */
  badge?: string;
  photo?: string;
  bio?: string;
};

export type EngagementSponsor = {
  id?: string;
  name: string;
  subtitle?: string;
  price?: number | string;
  availability?: string;
  benefits?: string[];
  active?: boolean;
  tone?: string;
  tier?: string;
};

export type EngagementTicket = {
  id?: string;
  name: string;
  price?: string;
  capacity?: number;
  period?: string;
  tone?: string;
};

export type Engagement = {
  engagementID?: string;
  engagementType: EngagementType;
  engagementName: string;
  category?: string;
  shortDescription?: string;
  description?: string;
  audience?: EngagementAudience;
  tone?: EngagementTone;
  language?: EngagementLanguage;
  tags?: string[];
  startDate: string;
  endDate: string;
  allDay?: boolean;
  timezone?: string;
  mode: EngagementMode;
  venue?: string;
  venueAddress?: string;
  city?: string;
  country?: string;
  capacity?: number;
  virtualLink?: string;
  mapUrl?: string;
  logo?: string;
  bannerImage?: string;
  galleryImages?: string[];
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;
  fontFamily?: string;
  status?: EngagementStatus;
  visibility?: EngagementVisibility;
  isPublished?: boolean;
  publishedAt?: string;
  registrationEnabled?: boolean;
  registrationStartDate?: string;
  registrationEndDate?: string;
  approvalRequired?: boolean;
  waitlistEnabled?: boolean;
  registrationLimit?: number;
  paymentEnabled?: boolean;
  paymentMethods?: EngagementPaymentMethod[] | string[];
  currency?: EngagementCurrency;
  themes?: string[] | unknown;
  objectives?: string[] | unknown;
  programme?: EngagementProgrammeSession[] | unknown;
  /** Nested on same Engagement record (flexible extension) */
  speakers?: EngagementSpeaker[] | unknown;
  sponsors?: EngagementSponsor[] | unknown;
  tickets?: EngagementTicket[] | unknown;
  websiteUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  aiGenerated?: boolean;
  aiGenerationPrompt?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  ownerID?: string;
  /** Optional aggregate if backend adds it later */
  registered?: number;
  [key: string]: unknown;
};

export type NewEngagement = Omit<Engagement, "engagementID">;

export type LoopbackCount = { count: number };

export type EngagementFilter = {
  where?: Record<string, unknown>;
  fields?: Record<string, boolean> | string[];
  order?: string | string[];
  limit?: number;
  skip?: number;
  offset?: number;
  include?: unknown[];
};
