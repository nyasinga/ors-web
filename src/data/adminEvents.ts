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
};

/** Manage Events table — from isippe3-manage-events-pure-html-responsive */
export const managedEvents: ManagedEvent[] = [
  {
    id: "isippe-3",
    name: "ISIPPE-3",
    subtitle: "3rd International Symposium on Intellectual Property Protection...",
    dateLabel: "12 – 14 Nov 2026",
    daysLabel: "Thu – Sat",
    venue: "KICC, Nairobi",
    type: "Conference",
    registered: 532,
    capacity: 600,
    status: "Upcoming",
    barTone: "green",
  },
  {
    id: "pre-symposium-workshop",
    name: "Pre-Symposium Workshop",
    subtitle: "Capacity Building for IP Enforcement Agencies",
    dateLabel: "10 – 11 Nov 2026",
    daysLabel: "Tue – Wed",
    venue: "KICC, Nairobi",
    type: "Workshop",
    registered: 210,
    capacity: 250,
    status: "Upcoming",
    barTone: "blue",
  },
  {
    id: "ip-policy-roundtable",
    name: "IP Policy Roundtable",
    subtitle: "Strengthening Regional Collaboration",
    dateLabel: "12 Nov 2026",
    daysLabel: "Thu",
    venue: "KICC, Nairobi",
    type: "Roundtable",
    registered: 120,
    capacity: 150,
    status: "Upcoming",
    barTone: "purple",
  },
  {
    id: "exhibition-showcase",
    name: "Exhibition Showcase",
    subtitle: "Innovations, Solutions and Partnerships",
    dateLabel: "12 – 14 Nov 2026",
    daysLabel: "Thu – Sat",
    venue: "KICC, Nairobi",
    type: "Exhibition",
    registered: 340,
    capacity: 500,
    status: "Upcoming",
    barTone: "orange",
  },
  {
    id: "digital-ip-webinar",
    name: "Digital IP Enforcement Webinar",
    subtitle: "Tools, Trends and Best Practices",
    dateLabel: "21 Sep 2026",
    daysLabel: "Mon",
    venue: "Online",
    type: "Webinar",
    registered: 420,
    capacity: 500,
    status: "Ongoing",
    barTone: "red",
  },
  {
    id: "trademark-training",
    name: "Trademark Examination Training",
    subtitle: "For National IP Offices",
    dateLabel: "05 – 07 Aug 2026",
    daysLabel: "Wed – Fri",
    venue: "KICC, Nairobi",
    type: "Training",
    registered: 95,
    capacity: 120,
    status: "Past",
    barTone: "blue",
  },
  {
    id: "legal-frameworks-seminar",
    name: "Legal Frameworks for IP Protection",
    subtitle: "Regional Perspectives and Case Studies",
    dateLabel: "15 Jun 2026",
    daysLabel: "Mon",
    venue: "Sarit Centre, Nairobi",
    type: "Seminar",
    registered: 180,
    capacity: 200,
    status: "Past",
    barTone: "purple",
  },
  {
    id: "stakeholder-forum",
    name: "Stakeholder Engagement Forum",
    subtitle: "Public-Private Partnerships",
    dateLabel: "20 May 2026",
    daysLabel: "Wed",
    venue: "Nairobi, Kenya",
    type: "Forum",
    registered: 250,
    capacity: 300,
    status: "Past",
    barTone: "green",
  },
];

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

export const draftProgrammeSessions = [
  {
    id: "s1",
    time: "09:00 AM – 09:30 AM (30 min)",
    title: "Official Opening Ceremony",
    description: "Welcome remarks and official opening of ISIPPE-3.",
    speakers: 3,
    place: "Tsavo Ballroom",
    badge: "Keynote",
    tone: "green" as const,
  },
  {
    id: "s2",
    time: "09:45 AM – 11:00 AM (75 min)",
    title: "Panel: Regional Collaboration Against Counterfeiting",
    description: "Cross-border enforcement strategies and shared intelligence.",
    speakers: 5,
    place: "Plenary Hall",
    badge: "Panel Discussion",
    tone: "purple" as const,
  },
  {
    id: "s3",
    time: "11:30 AM – 01:00 PM (90 min)",
    title: "Workshop: Digital Tools for IP Enforcement",
    description: "Hands-on session on monitoring platforms and case triage.",
    speakers: 2,
    place: "Amboseli Room",
    badge: "Workshop",
    tone: "orange" as const,
  },
];

export const draftSpeakers = [
  {
    id: "sp1",
    name: "Dr. Amina Yusuf",
    role: "Director General, IP Office",
    org: "Kenya Copyright Board",
    topic: "Future of IP Enforcement",
  },
  {
    id: "sp2",
    name: "James Mwangi",
    role: "Senior Counsel",
    org: "Anti-Counterfeit Authority",
    topic: "Border Enforcement Models",
  },
  {
    id: "sp3",
    name: "Sarah Mensah",
    role: "Head of Brand Protection",
    org: "Global Brands Alliance",
    topic: "Industry Partnerships",
  },
];

export const draftSponsorshipPackages = [
  {
    id: "plat",
    name: "Platinum Sponsor",
    subtitle: "Premium visibility and exclusive opportunities",
    price: 1000000,
    availability: "3 / 5 Available",
    benefits: ["Logo on main stage backdrop", "Premium exhibition space", "Branding on event materials"],
    active: true,
    tone: "amber" as const,
  },
  {
    id: "gold",
    name: "Gold Sponsor",
    subtitle: "High visibility and strong brand presence",
    price: 500000,
    availability: "5 / 8 Available",
    benefits: ["Logo on event website", "Panel discussion slot", "Exhibition space"],
    active: true,
    tone: "yellow" as const,
  },
  {
    id: "silver",
    name: "Silver Sponsor",
    subtitle: "Good visibility and networking opportunities",
    price: 250000,
    availability: "8 / 10 Available",
    benefits: ["Logo on event website", "Exhibition space", "Mentions during event"],
    active: true,
    tone: "slate" as const,
  },
  {
    id: "bronze",
    name: "Bronze Sponsor",
    subtitle: "Supporting partner opportunities",
    price: 100000,
    availability: "Unlimited",
    benefits: ["Logo on event website", "Listing in event program", "Social media recognition"],
    active: true,
    tone: "orange" as const,
  },
];

export const draftTickets = [
  {
    id: "t1",
    name: "Early Bird",
    price: "KES 5,000",
    capacity: 100,
    period: "01 Nov 2026 – 30 Nov 2026",
    tone: "green" as const,
  },
  {
    id: "t2",
    name: "Regular",
    price: "KES 8,000",
    capacity: 300,
    period: "01 Dec 2026 – 10 Nov 2026",
    tone: "blue" as const,
  },
  {
    id: "t3",
    name: "VIP",
    price: "KES 15,000",
    capacity: 50,
    period: "01 Nov 2026 – 17 Nov 2026",
    tone: "orange" as const,
  },
];

export const eventDetail = {
  id: "isippe-3",
  name: "ACA Annual Conference 2026",
  theme: "Building a Safer, Authentic and Inclusive Marketplace.",
  status: "Published" as const,
  dates: "15 – 17 September 2026",
  time: "8:00 AM – 5:00 PM (EAT)",
  venue: "Kenyatta International Convention Centre (KICC), Nairobi, Kenya",
  mode: "In-Person",
  type: "Conference",
  category: "Business & Compliance",
  organizer: "Anti-Counterfeit Authority",
  email: "events@aca.go.ke",
  phone: "+254 700 123 456",
  description:
    "The ACA Annual Conference brings together regulators, industry, academia and enforcement agencies to strengthen intellectual property protection, combat counterfeiting, and promote authentic trade across Africa.",
  createdBy: "Leiney Ogeto",
  createdOn: "12 Jan 2026",
  lastUpdated: "20 Sep 2026",
  visibility: "Public",
  registration: "Open",
  payment: "Enabled",
  website: "https://isippe.aca.go.ke",
  twitter: "https://x.com/aca_kenya",
  facebook: "https://facebook.com/aca.kenya",
  linkedin: "https://linkedin.com/company/aca-kenya",
};

export const eventDetailKpis = [
  { label: "Total Registrations", value: "1,248", trend: "+12%", tone: "blue" as const },
  { label: "Confirmed Participants", value: "1,102", trend: "+18%", tone: "green" as const },
  { label: "Speakers", value: "28", trend: "+7%", tone: "purple" as const },
];

export const eventDetailTabs = [
  { id: "overview", label: "Overview" },
  { id: "tickets", label: "Tickets" },
  { id: "participants", label: "Participants" },
  { id: "programme", label: "Programme" },
  { id: "speakers", label: "Speakers" },
  { id: "sponsors", label: "Sponsors" },
  { id: "exhibitors", label: "Exhibitors" },
  { id: "payments", label: "Payments" },
  { id: "communications", label: "Communications" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings" },
];

export const eventParticipants = [
  {
    name: "James Njoroge",
    type: "Delegate",
    org: "Kenya Copyright Board",
    status: "Confirmed" as const,
    date: "20 Sep",
  },
  {
    name: "Amina Mwangi",
    type: "Speaker",
    org: "University of Nairobi",
    status: "Confirmed" as const,
    date: "19 Sep",
  },
  {
    name: "Chen Wei",
    type: "Exhibitor",
    org: "Global Brands",
    status: "Pending" as const,
    date: "19 Sep",
  },
  {
    name: "Sarah Mensah",
    type: "Sponsor",
    org: "Brand Protect Ltd",
    status: "Confirmed" as const,
    date: "18 Sep",
  },
];

export const eventSchedule = [
  { day: "Sep 15", title: "Opening Ceremony", time: "09:00 – 09:45", place: "Plenary Hall" },
  { day: "Sep 15", title: "Keynote: Authentic Markets", time: "10:00 – 11:00", place: "Tsavo Ballroom" },
  { day: "Sep 16", title: "Panel: Regional Collaboration", time: "11:00 – 12:30", place: "Amboseli" },
  { day: "Sep 17", title: "Closing & Resolutions", time: "15:00 – 16:00", place: "Plenary Hall" },
];

export const participantMix = [
  { label: "Delegates", value: 62, color: "#0B45E0" },
  { label: "Speakers", value: 17, color: "#0B7A3B" },
  { label: "Exhibitors", value: 14, color: "#F59E0B" },
  { label: "Sponsors", value: 7, color: "#7C3AED" },
];

export const eventTickets = [
  { name: "Early Bird", price: "KES 60,000", sold: 180, capacity: 200, status: "Active" },
  { name: "Standard", price: "KES 70,000", sold: 320, capacity: 350, status: "Active" },
  { name: "VIP", price: "KES 120,000", sold: 32, capacity: 50, status: "Active" },
];

export const eventSponsors = [
  { name: "Safaricom", tier: "Platinum", value: "KES 1,000,000", status: "Confirmed" },
  { name: "KRA", tier: "Gold", value: "KES 500,000", status: "Confirmed" },
  { name: "Brand Protect", tier: "Silver", value: "KES 300,000", status: "Pending" },
];

export const eventMessages = [
  {
    id: "m1",
    subject: "Registration confirmation",
    audience: "All confirmed",
    sent: "18 Sep 2026",
    status: "Sent",
  },
  {
    id: "m2",
    subject: "Programme update — Day 2",
    audience: "Delegates",
    sent: "20 Sep 2026",
    status: "Sent",
  },
  {
    id: "m3",
    subject: "Venue access passes",
    audience: "Speakers & VIP",
    sent: "—",
    status: "Draft",
  },
];

export const eventReport = {
  title: "ACA Annual Conference 2026",
  theme: "Building a Safer, Authentic and Inclusive Marketplace",
  period: "15 – 17 September 2026",
  venue: "KICC, Nairobi",
  organizer: "Anti-Counterfeit Authority",
  generated: "30 September 2026, 10:15 AM",
  filename: "ACA_Event_Report.pdf",
  pages: 8,
  summary:
    "The conference achieved strong registration growth with healthy payment completion and broad regional participation.",
  kpis: [
    { label: "Total Registrations", value: "1,248" },
    { label: "Confirmed Participants", value: "1,102" },
    { label: "Speakers", value: "28" },
    { label: "Sponsors", value: "24" },
    { label: "Exhibitors", value: "15" },
    { label: "Total Revenue", value: "KES 2,740,000" },
  ],
  overview: [
    ["Event Name", "ACA Annual Conference 2026"],
    ["Theme", "Building a Safer, Authentic and Inclusive Marketplace"],
    ["Dates", "15 – 17 September 2026"],
    ["Venue", "KICC, Nairobi, Kenya"],
    ["Organized By", "Anti-Counterfeit Authority"],
  ],
  highlights: [
    "1,248 total registrations with 88% confirmation rate.",
    "KES 2,740,000 total revenue across ticket and sponsorship sales.",
    "Top participating countries: Kenya, Nigeria, South Africa, Uganda.",
    "28 confirmed speakers across plenary and breakout sessions.",
  ],
  sections: [
    { title: "Registration Trends", body: "Daily registrations peaked in the two weeks after early-bird launch, with a second spike following speaker announcements." },
    { title: "Payments", body: "Completed payments total KES 2,740,000 with strong M-Pesa and card completion rates." },
    { title: "Programme Engagement", body: "Opening ceremony and keynote sessions recorded the highest pre-event interest based on session selections." },
  ],
};

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
