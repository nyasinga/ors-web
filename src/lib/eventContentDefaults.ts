import type {
  EngagementFaqCategory,
  EngagementVenueHighlight,
  EngagementVenueSpace,
} from "../types/engagement";

/** Default FAQ catalogue seeded into an engagement when none exist yet. */
export const DEFAULT_FAQ_CATEGORIES: EngagementFaqCategory[] = [
  {
    id: "general",
    label: "General Information",
    icon: "FileText",
    intro: "Learn more about this event, its objectives and key details.",
    items: [
      {
        id: "g1",
        q: "What is this event?",
        a: "This is an international symposium bringing together government agencies, industry leaders, policy makers, experts and stakeholders.",
      },
      {
        id: "g2",
        q: "When and where will it take place?",
        a: "See the event dates and venue published on this website for the latest details.",
      },
      {
        id: "g3",
        q: "Who is organising the event?",
        a: "The event is organised by the Anti-Counterfeit Authority and its partners.",
      },
      {
        id: "g4",
        q: "Who can attend?",
        a: "Government representatives, intellectual property professionals, industry leaders, policy makers, researchers, innovators and other interested stakeholders can participate.",
      },
      {
        id: "g5",
        q: "How can I get more information about the programme?",
        a: "Use the Programme section of the website for the latest sessions, speakers, topics and venue information.",
      },
    ],
  },
  {
    id: "registration",
    label: "Registration",
    icon: "User",
    intro: "Everything you need to know about registering for the event.",
    items: [
      {
        id: "r1",
        q: "How do I register?",
        a: "Use the Register Now button to start the registration process.",
      },
      {
        id: "r2",
        q: "Can I update my registration details?",
        a: "Yes, registered participants can update eligible details through the registration process.",
      },
      {
        id: "r3",
        q: "Will I receive a confirmation?",
        a: "A confirmation is provided after successful registration.",
      },
      {
        id: "r4",
        q: "Who can I contact for registration support?",
        a: "Use the event support contacts provided by the organisers.",
      },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    icon: "CreditCard",
    intro: "Information about registration fees, payment options and receipts.",
    items: [
      {
        id: "p1",
        q: "What payment methods are available?",
        a: "Available payment methods are shown during registration.",
      },
      {
        id: "p2",
        q: "Will I receive a receipt?",
        a: "A receipt or payment confirmation is provided for successful transactions.",
      },
      {
        id: "p3",
        q: "Who should I contact about a failed payment?",
        a: "Contact event support with your registration and transaction details.",
      },
    ],
  },
  {
    id: "sponsorship",
    label: "Sponsorship",
    icon: "Handshake",
    intro: "Learn about sponsorship packages and partnership opportunities.",
    items: [
      {
        id: "s1",
        q: "What sponsorship packages are available?",
        a: "Visit the Sponsorship page for current packages and benefits.",
      },
      {
        id: "s2",
        q: "How do I select a sponsorship package?",
        a: "Visit the Sponsorship page and select the package that best matches your objectives.",
      },
      {
        id: "s3",
        q: "Who should I contact about sponsorship?",
        a: "Use the official event sponsorship contact details.",
      },
    ],
  },
  {
    id: "participation",
    label: "Participation",
    icon: "Users",
    intro: "Guidance for delegates, speakers, partners and other participants.",
    items: [
      {
        id: "pa1",
        q: "Who can participate?",
        a: "The symposium is open to relevant stakeholders across government, industry, academia and the wider intellectual property ecosystem.",
      },
      {
        id: "pa2",
        q: "Can I participate as a speaker?",
        a: "Speaker participation is subject to the programme and organiser invitation or selection.",
      },
      {
        id: "pa3",
        q: "Where can I find programme updates?",
        a: "Check the Programme and Speakers sections for updates.",
      },
    ],
  },
  {
    id: "tickets",
    label: "Tickets & Confirmation",
    icon: "Ticket",
    intro: "Information about tickets, confirmations and delegate access.",
    items: [
      {
        id: "t1",
        q: "How do I receive my ticket?",
        a: "Ticket or confirmation information is provided after successful registration.",
      },
      {
        id: "t2",
        q: "Can I transfer my ticket?",
        a: "Ticket transfers are subject to the organiser's terms.",
      },
      {
        id: "t3",
        q: "Do I need to bring identification?",
        a: "Participants should carry appropriate identification and their registration confirmation.",
      },
    ],
  },
  {
    id: "venue",
    label: "Venue & Logistics",
    icon: "MapPin",
    intro: "Everything you need to know about the venue and event logistics.",
    items: [
      {
        id: "v1",
        q: "Where will the symposium be held?",
        a: "See the Venue page for the published location, map and facilities.",
      },
      {
        id: "v2",
        q: "Are accommodation options available nearby?",
        a: "There are typically multiple hotels and accommodation options near the venue.",
      },
      {
        id: "v3",
        q: "Where can I find venue information?",
        a: "Visit the Venue section for facilities, spaces, maps and access information.",
      },
    ],
  },
  {
    id: "technical",
    label: "Technical Support",
    icon: "Headset",
    intro: "Get help with website, registration and digital participation issues.",
    items: [
      {
        id: "te1",
        q: "Who do I contact for technical support?",
        a: "Use the official event support contacts for assistance.",
      },
      {
        id: "te2",
        q: "What if I cannot complete registration online?",
        a: "Try again using a current browser or contact support for assistance.",
      },
      {
        id: "te3",
        q: "What if I have a problem with the website?",
        a: "Report the issue to event support with details of the page and error encountered.",
      },
    ],
  },
];

export const DEFAULT_VENUE_HIGHLIGHTS: EngagementVenueHighlight[] = [
  {
    id: "vh1",
    icon: "MapPin",
    title: "Central Location",
    text: "Conveniently located for delegates and partners",
  },
  {
    id: "vh2",
    icon: "Users",
    title: "World-Class Facilities",
    text: "Modern conference and exhibition spaces",
  },
  {
    id: "vh3",
    icon: "Shield",
    title: "Secure & Accessible",
    text: "High security and easy access",
  },
  {
    id: "vh4",
    icon: "Wifi",
    title: "Modern Amenities",
    text: "High-speed internet and full support services",
  },
  {
    id: "vh5",
    icon: "Bus",
    title: "Convenient Access",
    text: "Close to major hotels and transport links",
  },
];

export const DEFAULT_VENUE_SPACES: EngagementVenueSpace[] = [
  {
    id: "vs1",
    name: "Plenary Hall",
    text: "Main hall for opening, closing and high-level plenary sessions.",
    capacity: "Capacity: 1,000+ delegates",
    image: "/assets/venue-plenary-hall.jpg",
  },
  {
    id: "vs2",
    name: "Breakout Rooms",
    text: "Parallel thematic sessions and workshops.",
    capacity: "Capacity: 100 – 300 delegates",
    image: "/assets/venue-breakout-rooms.jpg",
  },
  {
    id: "vs3",
    name: "Exhibition Area",
    text: "Showcase innovations, solutions and services.",
    capacity: "Capacity: 50+ exhibitors",
    image: "/assets/venue-exhibition-area.jpg",
  },
  {
    id: "vs4",
    name: "Meeting Rooms",
    text: "Bilateral meetings and side events.",
    capacity: "Capacity: 20 – 50 delegates",
    image: "/assets/venue-meeting-rooms.jpg",
  },
];
