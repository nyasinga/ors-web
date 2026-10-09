export const settingsTabs = [
  { id: "general", label: "General" },
  { id: "account", label: "Account & Profile" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
  { id: "integrations", label: "Integrations" },
  { id: "appearance", label: "Appearance" },
  { id: "system", label: "System" },
] as const;

export const securityPanels = [
  { id: "password", label: "Password" },
  { id: "2fa", label: "Two-Factor Authentication" },
  { id: "access", label: "Access Control" },
  { id: "sessions", label: "Active Sessions" },
  { id: "login", label: "Login Security" },
  { id: "data", label: "Data Security" },
] as const;

export const accountInfo = {
  fullName: "Leiney Ogeto",
  email: "admin@aca.go.ke",
  phone: "+254 721 564 198",
  role: "Administrator",
  created: "12 Jan 2024",
  lastLogin: "20 Sep 2026, 10:24 AM",
  organization: "Anti Counterfeit Authority",
  timezone: "(GMT+03:00) Nairobi",
  language: "English (Kenya)",
  currency: "Kenyan Shilling (KES)",
  dateFormat: "DD/MM/YYYY (31/12/2026)",
  timeFormat: "24 Hour (13:00)",
  firstDay: "Monday",
};

export const settingsUsers = [
  {
    name: "Leiney Ogeto",
    initials: "LO",
    email: "admin@aca.go.ke",
    role: "Administrator",
    status: "Active" as const,
    lastLogin: "20 Sep 2026, 09:14",
    roleTone: "blue" as const,
  },
  {
    name: "John Mwangi",
    initials: "JM",
    email: "john.mwangi@aca.go.ke",
    role: "Event Manager",
    status: "Active" as const,
    lastLogin: "19 Sep 2026, 16:21",
    roleTone: "purple" as const,
  },
  {
    name: "Grace Wambui",
    initials: "GW",
    email: "grace.wambui@aca.go.ke",
    role: "Finance",
    status: "Active" as const,
    lastLogin: "18 Sep 2026, 11:02",
    roleTone: "orange" as const,
  },
  {
    name: "David Kimani",
    initials: "DK",
    email: "david.kimani@aca.go.ke",
    role: "Viewer",
    status: "Inactive" as const,
    lastLogin: "10 Sep 2026, 08:45",
    roleTone: "neutral" as const,
  },
];

export const rolePermissions = [
  {
    role: "Administrator",
    tone: "blue" as const,
    description: "Full system access",
    users: 2,
    permissions: "All modules and settings",
  },
  {
    role: "Event Manager",
    tone: "purple" as const,
    description: "Manage events and registrations",
    users: 4,
    permissions: "Events, Programme, Speakers",
  },
  {
    role: "Finance",
    tone: "orange" as const,
    description: "Payments and reports",
    users: 2,
    permissions: "Payments, Reports",
  },
  {
    role: "Support",
    tone: "green" as const,
    description: "Messages and participant help",
    users: 3,
    permissions: "Messages, Participants",
  },
  {
    role: "Viewer",
    tone: "neutral" as const,
    description: "Read-only access",
    users: 1,
    permissions: "Dashboards only",
  },
];

export const activeSessions = [
  {
    device: "Chrome on macOS",
    location: "Nairobi, Kenya",
    ip: "105.27.12.44",
    lastActive: "Now",
    current: true,
  },
  {
    device: "Safari on iPhone",
    location: "Nairobi, Kenya",
    ip: "105.27.18.90",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    device: "Edge on Windows",
    location: "Mombasa, Kenya",
    ip: "41.90.64.12",
    lastActive: "Yesterday",
    current: false,
  },
];

export const integrations = [
  {
    id: "gcal",
    name: "Google Calendar",
    category: "Productivity",
    connected: true,
    account: "leiney@aca.go.ke",
    sync: ["Sync new events", "Sync session schedules"],
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    category: "Productivity",
    connected: true,
    account: "leiney@aca.go.ke",
    sync: ["Sync invitations", "Sync reminders"],
  },
  {
    id: "zoom",
    name: "Zoom",
    category: "Productivity",
    connected: true,
    account: "events@aca.go.ke",
    sync: ["Create meeting links", "Sync attendees"],
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    category: "Communication",
    connected: false,
    account: "",
    sync: [],
  },
  {
    id: "youtube",
    name: "YouTube",
    category: "Communication",
    connected: false,
    account: "",
    sync: [],
  },
  {
    id: "mpesa",
    name: "M-Pesa",
    category: "Payments",
    connected: true,
    account: "••••••••9182",
    sync: [],
  },
  {
    id: "ecitizen",
    name: "eCitizen",
    category: "Payments",
    connected: true,
    account: "••••••••4410",
    sync: [],
  },
  {
    id: "smtp",
    name: "SMTP Email",
    category: "Email",
    connected: true,
    account: "noreply@aca.go.ke",
    sync: [],
  },
];

/** Screen G Payments — from aca_payments_dashboard HTML */
export const paymentKpis = [
  {
    label: "Total Revenue",
    value: "KES 4,250,000",
    meta: "↑ 12%",
    metaSub: "vs last update",
    tone: "green" as const,
  },
  {
    label: "Participant Tickets",
    value: "KES 2,780,000",
    meta: "65% of total",
    metaSub: "",
    tone: "purple" as const,
  },
  {
    label: "Sponsorships",
    value: "KES 1,200,000",
    meta: "28% of total",
    metaSub: "",
    tone: "orange" as const,
  },
  {
    label: "Exhibitor Fees",
    value: "KES 270,000",
    meta: "6% of total",
    metaSub: "",
    tone: "blue" as const,
  },
];

export const revenueBySource = [
  { label: "Participant Tickets", value: 65, color: "#0755f5", amount: "2,780,000" },
  { label: "Sponsorships", value: 28, color: "#08a66a", amount: "1,200,000" },
  { label: "Exhibitor Fees", value: 6, color: "#ffb31a", amount: "270,000" },
  { label: "Other (Workshops, Meals etc.)", value: 2, color: "#a000e8", amount: "100,000" },
];

export const paymentMethodsBars = [
  { label: "M-Pesa", value: 52, amount: "2,210,000", color: "#10b981" },
  { label: "Card (Stripe)", value: 28, amount: "1,190,000", color: "#0755f5" },
  { label: "Bank Transfer", value: 15, amount: "640,000", color: "#9333ea" },
  { label: "PayPal", value: 5, amount: "210,000", color: "#0ea5e9" },
];

export const paymentStatusBars = [
  { label: "Completed", value: 92, tone: "green" as const, color: "#10b981" },
  { label: "Pending", value: 6, tone: "orange" as const, color: "#f59e0b" },
  { label: "Failed", value: 2, tone: "red" as const, color: "#ef4444" },
];

export const revenueBreakdown = [
  {
    source: "Participant Tickets",
    amount: "2,780,000",
    pct: "65%",
    tx: 278,
    status: "Completed",
    iconTone: "text-blue-600",
  },
  {
    source: "Sponsorships",
    amount: "1,200,000",
    pct: "28%",
    tx: 12,
    status: "Completed",
    iconTone: "text-amber-500",
  },
  {
    source: "Exhibitor Fees",
    amount: "270,000",
    pct: "6%",
    tx: 18,
    status: "Completed",
    iconTone: "text-orange-500",
  },
  {
    source: "Workshops & Add-ons",
    amount: "75,000",
    pct: "2%",
    tx: 25,
    status: "Completed",
    iconTone: "text-purple-600",
  },
  {
    source: "Meals & Social Events",
    amount: "25,000",
    pct: "1%",
    tx: 10,
    status: "Completed",
    iconTone: "text-purple-600",
  },
];

export const revenueBreakdownTotal = {
  amount: "4,250,000",
  pct: "100%",
  tx: 343,
};

export type PaymentTxStatus = "Completed" | "Pending" | "Failed" | "Refunded";

export const paymentTransactions: Record<
  "recent" | "pending" | "failed" | "refunds",
  {
    id: string;
    datetime: string;
    reference: string;
    payer: string;
    source: string;
    amount: string;
    method: string;
    status: PaymentTxStatus;
  }[]
> = {
  recent: [
    {
      id: "r1",
      datetime: "17 Nov 2026, 02:34 PM",
      reference: "TKT-2026-0015",
      payer: "John Mwangi",
      source: "Participant Ticket",
      amount: "10,000",
      method: "M-Pesa",
      status: "Completed",
    },
    {
      id: "r2",
      datetime: "17 Nov 2026, 11:12 AM",
      reference: "SP-2026-0003",
      payer: "Safaricom PLC",
      source: "Sponsorship",
      amount: "500,000",
      method: "Bank Transfer",
      status: "Completed",
    },
    {
      id: "r3",
      datetime: "16 Nov 2026, 04:21 PM",
      reference: "EXH-2026-0008",
      payer: "TechSolutions Ltd",
      source: "Exhibitor Fee",
      amount: "150,000",
      method: "Card (Stripe)",
      status: "Completed",
    },
  ],
  pending: [
    {
      id: "p1",
      datetime: "17 Nov 2026, 03:05 PM",
      reference: "TKT-2026-0019",
      payer: "Mary Wanjiru",
      source: "Participant Ticket",
      amount: "15,000",
      method: "M-Pesa",
      status: "Pending",
    },
    {
      id: "p2",
      datetime: "17 Nov 2026, 01:20 PM",
      reference: "SP-2026-0007",
      payer: "KenInvest",
      source: "Sponsorship",
      amount: "250,000",
      method: "Bank Transfer",
      status: "Pending",
    },
  ],
  failed: [
    {
      id: "f1",
      datetime: "17 Nov 2026, 10:15 AM",
      reference: "TKT-2026-0012",
      payer: "Peter Otieno",
      source: "Participant Ticket",
      amount: "10,000",
      method: "Card (Stripe)",
      status: "Failed",
    },
  ],
  refunds: [
    {
      id: "rf1",
      datetime: "16 Nov 2026, 09:45 AM",
      reference: "REF-2026-0002",
      payer: "Amina Hassan",
      source: "Participant Ticket",
      amount: "5,000",
      method: "M-Pesa",
      status: "Refunded",
    },
  ],
};

/** @deprecated prefer paymentTransactions */
export const recentPayments = paymentTransactions.recent;

export const revenueTrendPeriods = {
  Daily: {
    labels: ["15 Nov", "16 Nov", "17 Nov"],
    datasets: [
      [400000, 1150000, 1850000],
      [200000, 600000, 1000000],
      [0, 180000, 420000],
      [0, 120000, 250000],
    ],
  },
  Weekly: {
    labels: ["Week 1", "Week 2", "Week 3"],
    datasets: [
      [600000, 1350000, 1850000],
      [200000, 600000, 1000000],
      [50000, 220000, 420000],
      [25000, 130000, 250000],
    ],
  },
  Monthly: {
    labels: ["Jul", "Aug", "Sep"],
    datasets: [
      [850000, 1800000, 2780000],
      [300000, 700000, 1200000],
      [80000, 160000, 270000],
      [20000, 60000, 100000],
    ],
  },
} as const;

export const revenueTrendSeries = [
  { key: "tickets" as const, label: "Participant Tickets", color: "#0755f5" },
  { key: "sponsorships" as const, label: "Sponsorships", color: "#08a66a" },
  { key: "exhibitors" as const, label: "Exhibitor Fees", color: "#ff9f00" },
  { key: "other" as const, label: "Other", color: "#a000e8" },
];

/** Legacy daily count series — kept for any older imports */
export const revenueTrend = [
  { day: "15 Nov", tickets: 400000, sponsorships: 200000, exhibitors: 0, other: 0 },
  { day: "16 Nov", tickets: 1150000, sponsorships: 600000, exhibitors: 180000, other: 120000 },
  { day: "17 Nov", tickets: 1850000, sponsorships: 1000000, exhibitors: 420000, other: 250000 },
];

export const sessionSummary = [
  { label: "Total Sessions", value: "12", trend: "+20%", tone: "green" as const },
  { label: "Active Devices", value: "4", trend: "0%", tone: "neutral" as const },
  { label: "New Devices", value: "3", trend: "+50%", tone: "orange" as const },
  { label: "Suspicious", value: "0", trend: "-100%", tone: "red" as const },
];

export const sessionDeviceMix = [
  { label: "Desktop", value: 42, color: "#0B45E0" },
  { label: "Mobile", value: 42, color: "#0B7A3B" },
  { label: "Tablet", value: 8, color: "#7C3AED" },
  { label: "Other", value: 8, color: "#94A3B8" },
];

export const loginActivity = [
  { day: "14 Sep", value: 4 },
  { day: "15 Sep", value: 7 },
  { day: "16 Sep", value: 5 },
  { day: "17 Sep", value: 9 },
  { day: "18 Sep", value: 6 },
];

/** Screen H Messages — from aca_messages_dashboard HTML */
export const messageKpis = [
  {
    label: "Total Recipients",
    value: "3,245",
    trend: "↑ 12%",
    tone: "blue" as const,
    sparkFill: "#dcecff",
    sparkStroke: "#1768ff",
    sparkPath: "M0 39 L12 34 L22 35 L35 26 L46 25 L60 16 L70 20 L83 11 L100 1",
  },
  {
    label: "Messages Sent",
    value: "12",
    trend: "↑ 33%",
    tone: "green" as const,
    sparkFill: "#dcfce7",
    sparkStroke: "#08b968",
    sparkPath: "M0 40 L12 35 L22 37 L35 28 L46 29 L60 18 L70 20 L83 11 L100 1",
  },
  {
    label: "Delivered",
    value: "2,980",
    trend: "↑ 92%",
    tone: "orange" as const,
    sparkFill: "#ffefd6",
    sparkStroke: "#ff9e1b",
    sparkPath: "M0 40 L12 36 L22 29 L35 32 L46 20 L58 24 L70 12 L83 15 L100 1",
  },
  {
    label: "Link Clicks",
    value: "642",
    trend: "↑ 21%",
    tone: "purple" as const,
    sparkFill: "#f2ddff",
    sparkStroke: "#b026ff",
    sparkPath: "M0 40 L12 35 L22 37 L35 27 L46 29 L60 17 L70 20 L83 10 L100 1",
  },
];

export const messageFolders = [
  { id: "all", label: "All Messages", count: 24 },
  { id: "unread", label: "Unread", count: 3, badge: "red" as const },
  { id: "sent", label: "Sent", count: 12 },
  { id: "scheduled", label: "Scheduled", count: 4 },
  { id: "drafts", label: "Drafts", count: 2 },
  { id: "templates", label: "Templates", count: 8 },
  { id: "archived", label: "Archived", count: 6 },
];

export type InboxMessageStatus = "Sent" | "Delivered" | "Pending";

export const inboxMessages = [
  {
    id: "1",
    initials: "JN",
    color: "blue" as const,
    name: "James Mwangi",
    subject: "Registration Confirmation",
    preview: "Thank you for registering for ACA 2026...",
    time: "10:24 AM",
    date: "10 Sep 2026, 10:24 AM",
    status: "Sent" as InboxMessageStatus,
    email: "james.mwangi@example.com",
    intro: "Thank you for registering for the ACA Annual Conference 2026.",
    main: "Your registration has been successfully received. We look forward to welcoming you to the conference from 15 – 17 September 2026 at the Kenyatta International Convention Centre (KICC), Nairobi, Kenya.",
    extra: "You will receive a separate email with your e-ticket and further details.",
  },
  {
    id: "2",
    initials: "UW",
    color: "green" as const,
    name: "University of Nairobi",
    subject: "Speaker Invitation",
    preview: "We are pleased to invite you to speak...",
    time: "09:15 AM",
    date: "20 Sep 2026, 09:15 AM",
    status: "Delivered" as InboxMessageStatus,
    email: "events@uonbi.ac.ke",
    intro: "We are pleased to invite your representative to participate as a speaker.",
    main: "The symposium will bring together experts and stakeholders to discuss intellectual property protection and enforcement across Africa and beyond.",
    extra: "Please confirm your availability by replying to this message.",
  },
  {
    id: "3",
    initials: "KT",
    color: "blue" as const,
    name: "KEBS Team",
    subject: "Exhibitor Information",
    preview: "Please find attached the exhibitor guidelines...",
    time: "20 Sep 2026",
    date: "20 Sep 2026, 08:40 AM",
    status: "Delivered" as InboxMessageStatus,
    email: "exhibitions@kebs.org",
    intro: "Thank you for your interest in exhibiting at the conference.",
    main: "Please review the exhibitor guidelines and setup details for the ACA Annual Conference 2026 at KICC, Nairobi.",
    extra: "Contact the events team if you require any additional information.",
  },
  {
    id: "4",
    initials: "AM",
    color: "red" as const,
    name: "Amina Hassan",
    subject: "Payment Reminder",
    preview: "This is a friendly reminder to complete...",
    time: "20 Sep 2026",
    date: "20 Sep 2026, 07:55 AM",
    status: "Pending" as InboxMessageStatus,
    email: "amina.hassan@example.com",
    intro: "This is a friendly reminder regarding your conference registration payment.",
    main: "Our records indicate that your payment is still pending. Please complete the payment to secure your participation.",
    extra: "If you have already paid, kindly disregard this reminder.",
  },
  {
    id: "5",
    initials: "DO",
    color: "blue" as const,
    name: "David Ochieng",
    subject: "Programme Update",
    preview: "The latest programme has been published...",
    time: "19 Sep 2026",
    date: "19 Sep 2026, 03:15 PM",
    status: "Delivered" as InboxMessageStatus,
    email: "david.ochieng@example.com",
    intro: "The latest conference programme is now available.",
    main: "Explore the updated session schedule, speakers, and networking opportunities planned for the ACA Annual Conference 2026.",
    extra: "We look forward to seeing you at the event.",
  },
  {
    id: "6",
    initials: "MS",
    color: "green" as const,
    name: "Mary Wanjiru",
    subject: "Accommodation Information",
    preview: "Find here the recommended hotels near...",
    time: "19 Sep 2026",
    date: "19 Sep 2026, 11:05 AM",
    status: "Delivered" as InboxMessageStatus,
    email: "mary.wanjiru@example.com",
    intro: "Here is some useful information to help you plan your stay in Nairobi.",
    main: "Recommended accommodation options are available near the Kenyatta International Convention Centre and other central locations.",
    extra: "Please make your own reservation directly with your preferred hotel.",
  },
  {
    id: "7",
    initials: "PT",
    color: "orange" as const,
    name: "Peter Otieno",
    subject: "Event Day Reminder",
    preview: "We look forward to welcoming you tomorrow...",
    time: "18 Sep 2026",
    date: "18 Sep 2026, 02:30 PM",
    status: "Delivered" as InboxMessageStatus,
    email: "peter.otieno@example.com",
    intro: "This is a reminder about the upcoming conference.",
    main: "Please arrive early and have your event ticket or QR code ready for check-in at the venue.",
    extra: "For assistance, contact the ACA Conference Team.",
  },
];

/** @deprecated prefer fields on inboxMessages */
export const selectedMessageBody = {
  subject: "Registration Confirmation - ACA Annual Conference 2026",
  status: "Sent",
  datetime: "10 Sep 2026, 10:24 AM",
  from: "events@aca.go.ke",
  to: "James Mwangi <james.mwangi@example.com>",
  body: "",
};
