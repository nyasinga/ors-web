/** Shared public programme / speaker types (content comes from the engagements API). */

export type ProgrammeSession = {
  id: string;
  day: number;
  time: string;
  title: string;
  type: string;
  tone: "blue" | "red" | "green" | "neutral" | "purple" | "orange";
  speakers: string;
  speakerLines?: string[];
  venue: string;
  venueSub?: string;
  venueImage: string;
};

export type SpeakerCategory = "keynote" | "panelist" | "moderator" | "government";
