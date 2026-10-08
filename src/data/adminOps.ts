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

export const paymentKpis = [
  {
    label: "Total Revenue",
    value: "KES 4,250,000",
    meta: "+12% vs last update",
    tone: "green" as const,
  },
  {
    label: "Participant Tickets",
    value: "KES 2,780,000",
    meta: "65% of total",
    tone: "purple" as const,
  },
  {
    label: "Sponsorships",
    value: "KES 1,200,000",
    meta: "28% of total",
    tone: "orange" as const,
  },
  {
    label: "Exhibitor Fees",
    value: "KES 270,000",
    meta: "6% of total",
    tone: "blue" as const,
  },
];

export const revenueBySource = [
  { label: "Participant Tickets", value: 65, color: "#0B45E0", amount: "KES 2,780,000" },
  { label: "Sponsorships", value: 28, color: "#F59E0B", amount: "KES 1,200,000" },
  { label: "Exhibitor Fees", value: 6, color: "#0B7A3B", amount: "KES 270,000" },
  { label: "Other", value: 2, color: "#7C3AED", amount: "KES 80,000" },
];

export const paymentMethodsBars = [
  { label: "M-Pesa", value: 52 },
  { label: "Card (Stripe)", value: 28 },
  { label: "Bank Transfer", value: 15 },
  { label: "PayPal", value: 5 },
];

export const paymentStatusBars = [
  { label: "Completed", value: 92, tone: "green" as const },
  { label: "Pending", value: 6, tone: "orange" as const },
  { label: "Failed", value: 2, tone: "red" as const },
];

export const revenueBreakdown = [
  { source: "Participant Tickets", amount: "2,780,000", pct: "65%", tx: 412, status: "Completed" },
  { source: "Sponsorships", amount: "1,200,000", pct: "28%", tx: 18, status: "Completed" },
  { source: "Exhibitor Fees", amount: "270,000", pct: "6%", tx: 24, status: "Completed" },
  { source: "Workshops & Add-ons", amount: "50,000", pct: "1%", tx: 14, status: "Completed" },
  { source: "Meals & Social Events", amount: "30,000", pct: "1%", tx: 9, status: "Completed" },
];

export const revenueBreakdownTotal = {
  amount: "4,250,000",
  pct: "100%",
  tx: 343,
};

export const recentPayments = [
  {
    id: "1",
    datetime: "17 Nov 2026, 02:34 PM",
    reference: "TKT-2026-0015",
    payer: "John Mwangi",
    source: "Participant Ticket",
    amount: "10,000",
    method: "M-Pesa",
    status: "Completed" as const,
  },
  {
    id: "2",
    datetime: "17 Nov 2026, 01:12 PM",
    reference: "SPN-2026-0008",
    payer: "Safaricom PLC",
    source: "Sponsorship",
    amount: "500,000",
    method: "Bank Transfer",
    status: "Completed" as const,
  },
  {
    id: "3",
    datetime: "16 Nov 2026, 04:45 PM",
    reference: "TKT-2026-0014",
    payer: "Amina Yusuf",
    source: "Participant Ticket",
    amount: "60,000",
    method: "Card",
    status: "Pending" as const,
  },
  {
    id: "4",
    datetime: "16 Nov 2026, 11:20 AM",
    reference: "EXH-2026-0003",
    payer: "Brand Protect Ltd",
    source: "Exhibitor Fee",
    amount: "45,000",
    method: "M-Pesa",
    status: "Failed" as const,
  },
  {
    id: "5",
    datetime: "15 Nov 2026, 09:05 AM",
    reference: "TKT-2026-0010",
    payer: "Chen Wei",
    source: "Participant Ticket",
    amount: "70,000",
    method: "Card",
    status: "Completed" as const,
  },
];

export const revenueTrend = [
  { day: "15 Nov", tickets: 42, sponsorships: 18, exhibitors: 8 },
  { day: "16 Nov", tickets: 58, sponsorships: 32, exhibitors: 12 },
  { day: "17 Nov", tickets: 78, sponsorships: 45, exhibitors: 16 },
  { day: "18 Nov", tickets: 95, sponsorships: 52, exhibitors: 20 },
  { day: "19 Nov", tickets: 110, sponsorships: 68, exhibitors: 24 },
];

export const revenueTrendSeries = [
  { key: "tickets" as const, label: "Participant Tickets", color: "#0B45E0" },
  { key: "sponsorships" as const, label: "Sponsorships", color: "#F59E0B" },
  { key: "exhibitors" as const, label: "Exhibitor Fees", color: "#0B7A3B" },
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

export const messageKpis = [
  { label: "Total Recipients", value: "3,245", trend: "+12%", tone: "blue" as const },
  { label: "Messages Sent", value: "12", trend: "+33%", tone: "green" as const },
  { label: "Delivered", value: "2,980", trend: "+92%", tone: "orange" as const },
  { label: "Link Clicks", value: "642", trend: "+21%", tone: "purple" as const },
];

export const messageFolders = [
  { id: "all", label: "All Messages", count: 24 },
  { id: "unread", label: "Unread", count: 3 },
  { id: "sent", label: "Sent", count: 12 },
  { id: "scheduled", label: "Scheduled", count: 4 },
  { id: "drafts", label: "Drafts", count: 2 },
  { id: "templates", label: "Templates", count: 8 },
  { id: "archived", label: "Archived", count: 6 },
];

export const inboxMessages = [
  {
    id: "m1",
    from: "James Njoroge",
    initials: "JN",
    subject: "Registration Confirmation",
    preview: "Thank you for registering for ACA Annual Conference 2026…",
    time: "10:24 AM",
    status: "Sent" as const,
    unread: true,
  },
  {
    id: "m2",
    from: "Events Team",
    initials: "ET",
    subject: "Programme Update — Day 2",
    preview: "Please note the revised keynote timing for 16 September…",
    time: "Yesterday",
    status: "Delivered" as const,
    unread: true,
  },
  {
    id: "m3",
    from: "Finance",
    initials: "FN",
    subject: "Payment Receipt",
    preview: "Your payment of KES 60,000 has been received…",
    time: "18 Sep",
    status: "Delivered" as const,
    unread: false,
  },
  {
    id: "m4",
    from: "Venue Ops",
    initials: "VO",
    subject: "Access Passes Ready",
    preview: "VIP and speaker passes are ready for collection…",
    time: "17 Sep",
    status: "Pending" as const,
    unread: true,
  },
  {
    id: "m5",
    from: "Support",
    initials: "SP",
    subject: "Welcome to ISIPPE-3",
    preview: "We look forward to welcoming you at KICC…",
    time: "15 Sep",
    status: "Sent" as const,
    unread: false,
  },
];

export const selectedMessageBody = {
  subject: "Registration Confirmation - ACA Annual Conference 2026",
  status: "Sent",
  datetime: "20 Sep 2026, 10:24 AM",
  from: "events@aca.go.ke",
  to: "James Mwangi <james.mwangi@example.com>",
  body: `Dear James Mwangi,

Thank you for registering for the ACA Annual Conference 2026.

Event dates: 15 – 17 September 2026
Venue: Kenyatta International Convention Centre (KICC), Nairobi, Kenya

Your registration is confirmed. Please keep this email for your records and present your QR ticket at the registration desk.

Kind regards,
ACA Events Team`,
};
