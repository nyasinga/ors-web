/**
 * Official ISIPPE-3 FAQ catalogue (categories for admin + public FAQ page).
 * Shared by seed-isippe-faqs.mjs and seed-isippe-to-live.mjs.
 */

export const isippeFaqs = [
  {
    id: "general",
    label: "General Information",
    icon: "FileText",
    intro: "About ISIPPE-3, theme, dates, venue and who should attend.",
    items: [
      {
        id: "g1",
        q: "What is ISIPPE-3?",
        a: "ISIPPE-3 is an International Symposium hosted by Kenya's Anti-Counterfeit Authority (ACA) together with the Ministry of Investments, Trade and Industry (MITI). The event brings together local and international stakeholders to discuss and strategize on combating counterfeiting.",
      },
      {
        id: "g2",
        q: "What is the theme of the event?",
        a: 'The theme is: "Stepping Up the Fights against Counterfeiting to Safeguard Public Health and Safety."',
      },
      {
        id: "g3",
        q: "When and where will the event take place, and what is the schedule?",
        a: "Dates: November 16–19, 2026. Venue: Mombasa Continental Hotel, Mombasa, Kenya. Schedule: Please note that the event features pre-event activities, including the Border Control and Operations Coordination Committee (BCOCC) meeting and the destruction of counterfeit goods. The main symposium will conclude with sessions running alongside the CEO's Caucus.",
      },
      {
        id: "g4",
        q: "What is the format of the event?",
        a: "ISIPPE-3 will be held as an in-person, physical event. Please note that it is not a hybrid event.",
      },
      {
        id: "g5",
        q: "Who should attend?",
        a: "Government officials, regulatory bodies, international trade organizations, law enforcement, manufacturers, brand owners, and consumer safety advocates. (Attendee list subject to final review by the CEO/ED.)",
      },
    ],
  },
  {
    id: "registration",
    label: "Registration & Payments",
    icon: "CreditCard",
    intro: "How to register, pay by bank or M-Pesa, and verify your payment.",
    items: [
      {
        id: "r1",
        q: "How do I register and pay?",
        a: "Registration is done through our online portal. Once you complete the initial registration, an invoice will be generated. Payment can be made through either of the following options:\n\nBank Transfer: Pay to the provided Anti-Counterfeit Agency account (KCB, Kipande House Branch).\n\nM-Pesa: Pay via Paybill number 522522 using the account details provided on your invoice.\n\nAfter making your payment, you must upload your proof of payment (PDF, JPG, or PNG) along with your transaction number to complete your registration. This includes attaching your M-Pesa confirmation message or bank deposit slip as payment evidence.",
      },
      {
        id: "r2",
        q: "How do I verify my payment, and how do I get my attendance tag?",
        a: 'Once you upload your proof of payment, your registration status will change to "Pending Verification." Our admin team will review the uploaded bank deposit or M-Pesa confirmation and validate the payment.',
      },
    ],
  },
  {
    id: "experience",
    label: "Languages, Travel & Sponsorship",
    icon: "Handshake",
    intro: "Languages, travel/accommodation, and sponsorship opportunities.",
    items: [
      {
        id: "e1",
        q: "What languages is the system and event translated into?",
        a: "The registration portal includes a language dropdown menu allowing registrants to select their preferred language, including English, French, German, Spanish, and others.",
      },
      {
        id: "e2",
        q: "Is there travel and accommodation information available?",
        a: "Yes. We have a dedicated information section on the website—especially for our international guests—which includes hotel rate cards and travel information, including ETA (Electronic Travel Authorisation) details.",
      },
      {
        id: "e3",
        q: "Are there sponsorship opportunities?",
        a: 'Yes, we offer various sponsorship packages with expanded and limited scopes of benefits depending on the tier. Please visit the "Sponsor" section on our website to see our sponsors and learn how to become one.',
      },
    ],
  },
];
