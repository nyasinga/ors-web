export const adminKpis = [
  {
    label: "Total Registrations",
    value: "532",
    trend: "↑ 12%",
    tone: "blue" as const,
    spark: [28, 32, 30, 38, 42, 40, 48, 52, 50, 58, 62, 70],
  },
  {
    label: "Confirmed Delegates",
    value: "412",
    trend: "↑ 18%",
    tone: "green" as const,
    spark: [22, 26, 30, 28, 34, 38, 42, 40, 48, 52, 56, 60],
  },
  {
    label: "Speakers",
    value: "48",
    trend: "↑ 7%",
    tone: "purple" as const,
    spark: [18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 42],
  },
  {
    label: "Sponsors & Exhibitors",
    value: "40",
    trend: "↑ 10%",
    tone: "orange" as const,
    spark: [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36],
  },
];

export const paymentSummary = [
  { label: "Total Revenue", value: "KES 1,245,000", trend: "↑ 14%", up: true, tone: "blue" as const },
  { label: "Completed", value: "KES 980,000", trend: "↑ 18%", up: true, tone: "green" as const },
  { label: "Pending", value: "KES 210,000", trend: "↓ 6%", up: false, tone: "orange" as const },
  { label: "Failed", value: "KES 55,000", trend: "↓ 25%", up: false, tone: "red" as const },
];

export const paymentMethods = [
  { label: "M-Pesa", value: 55, color: "#0B45E0" },
  { label: "Card", value: 25, color: "#0B7A3B" },
  { label: "Bank Transfer", value: 12, color: "#38BDF8" },
  { label: "Other", value: 8, color: "#7C3AED" },
];

/** Daily-ish bars for Sep 01–30 (design density) */
export const paymentBars = [
  { day: "Sep 01", completed: 90, pending: 35 },
  { day: "Sep 03", completed: 110, pending: 40 },
  { day: "Sep 05", completed: 140, pending: 50 },
  { day: "Sep 07", completed: 160, pending: 45 },
  { day: "Sep 09", completed: 180, pending: 55 },
  { day: "Sep 11", completed: 210, pending: 60 },
  { day: "Sep 13", completed: 200, pending: 70 },
  { day: "Sep 15", completed: 230, pending: 80 },
  { day: "Sep 17", completed: 250, pending: 65 },
  { day: "Sep 19", completed: 270, pending: 70 },
  { day: "Sep 21", completed: 290, pending: 55 },
  { day: "Sep 23", completed: 310, pending: 60 },
  { day: "Sep 25", completed: 300, pending: 50 },
  { day: "Sep 27", completed: 330, pending: 45 },
  { day: "Sep 30", completed: 350, pending: 40 },
];

export const upcomingEvents = [
  {
    month: "NOV",
    day: "12",
    title: "Opening Ceremony",
    time: "09:00 – 10:30",
    place: "Plenary Hall",
    status: "Published" as const,
  },
  {
    month: "NOV",
    day: "12",
    title: "Keynote: The Future of IP Enforcement",
    time: "11:00 – 12:00",
    place: "Plenary Hall",
    status: "Published" as const,
  },
  {
    month: "NOV",
    day: "13",
    title: "Panel: Combating Counterfeiting in Africa",
    time: "14:00 – 15:30",
    place: "Conference Room A",
    status: "Draft" as const,
  },
  {
    month: "NOV",
    day: "14",
    title: "Closing Session & Resolutions",
    time: "16:00 – 17:00",
    place: "Plenary Hall",
    status: "Draft" as const,
  },
];

export const recentRegistrations = [
  {
    name: "James Njoroge",
    initials: "JN",
    org: "Kenya Copyright Board",
    type: "Government",
    status: "Confirmed" as const,
    date: "Sep 30",
    color: "bg-blue",
  },
  {
    name: "Amina Mwangi",
    initials: "AM",
    org: "University of Nairobi",
    type: "Academia",
    status: "Confirmed" as const,
    date: "Sep 30",
    color: "bg-green",
  },
  {
    name: "Thabo Khumalo",
    initials: "TK",
    org: "SA IP Office",
    type: "Government",
    status: "Pending" as const,
    date: "Sep 29",
    color: "bg-orange-500",
  },
  {
    name: "David Ochieng",
    initials: "DO",
    org: "Tech Innovations Ltd",
    type: "Industry",
    status: "Confirmed" as const,
    date: "Sep 29",
    color: "bg-navy",
  },
  {
    name: "Emily Lawson",
    initials: "EL",
    org: "WIPO",
    type: "International",
    status: "Confirmed" as const,
    date: "Sep 28",
    color: "bg-purple-600",
  },
];

export const topCountries = [
  { name: "Kenya", count: 180, flag: "🇰🇪" },
  { name: "Nigeria", count: 52, flag: "🇳🇬" },
  { name: "South Africa", count: 46, flag: "🇿🇦" },
  { name: "Uganda", count: 38, flag: "🇺🇬" },
  { name: "Tanzania", count: 34, flag: "🇹🇿" },
  { name: "Ghana", count: 28, flag: "🇬🇭" },
  { name: "USA", count: 20, flag: "🇺🇸" },
  { name: "UK", count: 18, flag: "🇬🇧" },
  { name: "Other", count: 92, flag: "🌍" },
];

export const participantPass = {
  name: "Leiney Ogeto",
  fullName: "Leiney M. Ogeto",
  registrationId: "ISIPPE3-DEL-2026-0452",
  type: "Delegate",
  organisation: "Slicksales Limited",
  fee: "KES 60,000",
  paymentRef: "ECITIZEN-20260920-123456",
  status: "Confirmed",
};

export const participantSessions = [
  {
    id: "1",
    time: "09:00 – 10:30",
    title: "Opening Ceremony",
    place: "Main Auditorium, KICC",
    badge: "Plenary",
    tone: "blue" as const,
  },
  {
    id: "2",
    time: "11:00 – 12:30",
    title: "Global Trends in Intellectual Property Enforcement",
    place: "Main Auditorium, KICC",
    badge: "Plenary",
    tone: "blue" as const,
  },
  {
    id: "3",
    time: "14:00 – 15:30",
    title: "Policy and Legal Frameworks",
    place: "Conference Room A",
    badge: "Session",
    tone: "green" as const,
  },
  {
    id: "4",
    time: "16:00 – 17:30",
    title: "Technology and Innovation in IP Protection",
    place: "Conference Room B",
    badge: "Session",
    tone: "green" as const,
  },
];
