/** Shared public programme / speaker types (content comes from the engagements API). */

export type ProgrammeSessionAccess = "open" | "closed_door" | "invite_only";

export type ProgrammeSession = {
  id: string;
  day: number;
  time: string;
  title: string;
  type: string;
  tone: "blue" | "red" | "green" | "neutral" | "purple" | "orange";
  /** Attendance restriction shown beside type when not open. */
  access?: ProgrammeSessionAccess;
  accessLabel?: string;
  speakers: string;
  speakerLines?: string[];
  venue: string;
  venueSub?: string;
  venueImage: string;
};

export type SpeakerCategory = "keynote" | "panelist" | "moderator" | "government";
