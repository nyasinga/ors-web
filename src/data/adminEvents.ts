export type EventStatus = "Upcoming" | "Ongoing" | "Past" | "Draft";
export type EventType =
  | "Conference"
  | "Workshop"
  | "Training"
  | "Seminar"
  | "Summit"
  | "Exhibition"
  | "Webinar"
  | "Roundtable"
  | "Forum"
  | "Others";

export type ManagedEvent = {
  id: string;
  name: string;
  subtitle: string;
  dateLabel: string;
  daysLabel: string;
  venue: string;
  type: EventType;
  registered: number;
  capacity: number;
  status: EventStatus;
  barTone: "green" | "blue" | "purple" | "orange" | "red";
  /** Shown on the public homepage when true (only one at a time). */
  isFeatured?: boolean;
};

export const eventTypeOptions = [
  {
    id: "Conference",
    title: "Conference",
    description: "Large formal event with multiple sessions, speakers and delegates.",
    tone: "blue" as const,
  },
  {
    id: "Workshop",
    title: "Workshop",
    description: "Hands-on training with smaller groups and interactive sessions.",
    tone: "purple" as const,
  },
  {
    id: "Training",
    title: "Training",
    description: "Capacity building and skills development event.",
    tone: "green" as const,
  },
  {
    id: "Seminar",
    title: "Seminar",
    description: "Educational session focused on a specific topic or theme.",
    tone: "red" as const,
  },
  {
    id: "Summit",
    title: "Summit",
    description: "High-level gathering of leaders and experts.",
    tone: "orange" as const,
  },
  {
    id: "Exhibition",
    title: "Exhibition",
    description: "Showcase of products, services and innovations.",
    tone: "yellow" as const,
  },
  {
    id: "Others",
    title: "Others",
    description: "Any other type of event not listed above.",
    tone: "purple" as const,
  },
] as const;

export const createWizardSteps = [
  { id: 1, label: "Event Type", description: "Choose type" },
  { id: 2, label: "Basic Details", description: "Event information" },
  { id: 3, label: "Date & Venue", description: "When and where" },
  { id: 4, label: "Program & Sessions", description: "Schedule and content" },
  { id: 5, label: "Registration", description: "Tickets and access" },
  { id: 6, label: "Media & Publish", description: "Branding and go-live" },
];

export const eventDetailTabs = [
  { id: "overview", label: "Overview" },
  { id: "participants", label: "Participants" },
  { id: "tickets", label: "Tickets" },
  { id: "programme", label: "Programme" },
  { id: "speakers", label: "Speakers" },
  { id: "sponsors", label: "Sponsors" },
  { id: "exhibitors", label: "Exhibitors" },
  { id: "faqs", label: "FAQs" },
  { id: "venue", label: "Venue" },
  { id: "communications", label: "Communications" },
  { id: "payments", label: "Payments" },
  { id: "settings", label: "Settings" },
] as const;

export const reportContentItems = [
  "Event overview",
  "Registration statistics",
  "Ticket sales and revenue",
  "Participant breakdown",
  "Programme attendance",
  "Speakers and sponsors",
  "Payment methods",
  "Daily registration trend",
];
