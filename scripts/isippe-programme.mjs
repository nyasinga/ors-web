/**
 * Official ISIPPE-3 programme.
 * Pre-events: 16–17 Nov 2026 (BCOCC, brand training, destruction).
 * Symposium: ACA/SYMPOSIUM/2026/INF/10 PROV. Revised 17 Nov 2026 (18–19 Nov).
 */

function s({
  id,
  day,
  title,
  description = "",
  start,
  end,
  venue = "Mombasa Continental Resort",
  badge = "Session",
  speakers = [],
  access = "open",
}) {
  const time =
    start && end ? `${start} – ${end}` : start || end ? String(start || end) : "All day";
  return {
    id,
    day,
    title,
    description,
    time,
    ...(start ? { startTime: start } : {}),
    ...(end ? { endTime: end } : {}),
    venue,
    place: venue,
    badge,
    access,
    speakers: speakers.length,
    speakerNames: speakers,
  };
}

/** Days 1–2 pre-events (unchanged by 17 Nov revision). */
const preEvents = [
  s({
    id: "d1-bcocc",
    day: 1,
    title: "BCOCC Meeting",
    description:
      "Day 1 · Monday, 16 November 2026 · Border Control and Operations Coordination Committee (BCOCC). Status: Confirmed. Lead: Lindsay Kipkemoi.",
    venue: "Mombasa Continental Resort",
    badge: "Pre-event",
    speakers: ["Lindsay Kipkemoi"],
  }),
  s({
    id: "d1-brand-training",
    day: 1,
    title: "Brand / Product Knowledge Training",
    description:
      "Day 1 · Monday, 16 November 2026 · Brand/Product Knowledge Training. Status: Confirmed. Lead: Yussuf Ahmed.",
    venue: "Mombasa Continental Resort",
    badge: "Training",
    speakers: ["Yussuf Ahmed"],
  }),
  s({
    id: "d1-destruction",
    day: 1,
    title: "Destruction of Counterfeit Goods",
    description:
      "Day 1 · Monday, 16 November 2026 · Destruction exercise. Status: Confirmed. Lead: Henry O. Maina, OGW.",
    venue: "SAIMBOT",
    badge: "Destruction",
    speakers: ["Henry O. Maina, OGW"],
  }),
  s({
    id: "d2-destruction",
    day: 2,
    title: "Destruction of Counterfeit Goods",
    description:
      "Day 2 · Tuesday, 17 November 2026 · Destruction exercise. Status: Confirmed. Lead: Henry O. Maina, OGW.",
    start: "09:00",
    end: "10:00",
    venue: "SAIMBOT",
    badge: "Destruction",
    speakers: ["Henry O. Maina, OGW"],
  }),
];

/** Day 3 · Wednesday 18 Nov 2026 — revised programme. */
const day3 = [
  s({
    id: "d3-reg",
    day: 3,
    title: "Registration and Welcoming Reception",
    description:
      "Day 1 of symposium · Wednesday, 18 November 2026 · Registration, welcoming reception and tour of exhibitions.\nMC: Norman Mudibo.",
    start: "08:00",
    end: "09:00",
    venue: "Main Lobby",
    badge: "Registration",
    speakers: ["Norman Mudibo"],
  }),
  s({
    id: "d3-open",
    day: 3,
    title: "Opening Ceremony",
    description:
      "Opening Prayer.\nNational Anthem (Kayamba Africa).\nEAC Anthem (Kayamba Africa).\nEntertainment (Kayamba Africa).\nRemarks — CEC Trade, Mombasa County.\nRemarks — Mr. Mohamed Noor Hassan, County Commissioner, Mombasa County.\nWelcome remarks — Dr. Robi M. King’a, PhD, Executive Director, Anti-Counterfeit Authority.\nHost institution’s remarks — Hon. Nelson Ributhi Gaichuhie, CBS, Board Chairperson, Anti-Counterfeit Authority.\nRemarks — Ms. Regina Ombam, Principal Secretary, State Department for Trade.\nRemarks — Dr. Juma Mukhwana, PhD, CBS, Principal Secretary, State Department for Industry.\nAddress by the Chief Guest — Hon. Lee Kinyanjui, Cabinet Secretary, Ministry of Investments, Trade and Industry.\nMC: Norman Mudibo.",
    start: "09:00",
    end: "09:40",
    venue: "Main Plenary",
    badge: "Ceremony",
    speakers: [
      "CEC Trade, Mombasa County",
      "Mr. Mohamed Noor Hassan",
      "Dr. Robi M. King’a, PhD",
      "Hon. Nelson Ributhi Gaichuhie, CBS",
      "Ms. Regina Ombam",
      "Dr. Juma Mukhwana, PhD, CBS",
      "Hon. Lee Kinyanjui",
    ],
  }),
  s({
    id: "d3-keynote",
    day: 3,
    title: "Keynote Address and Official Opening",
    description:
      "Keynote address and official opening by the Chief Guest.\nTheme: Stepping Up the Fight Against Counterfeiting to Safeguard Public Health and Safety.",
    start: "09:40",
    end: "09:55",
    venue: "Main Plenary",
    badge: "Keynote",
    speakers: ["Hon. Lee Kinyanjui"],
  }),
  s({
    id: "d3-launch",
    day: 3,
    title: "Launch of Report on National Assessment of Illicit Trade in Kenya",
    description: "Official launch of the National Assessment of Illicit Trade in Kenya report.",
    start: "09:55",
    end: "10:10",
    venue: "Main Plenary",
    badge: "Launch",
  }),
  s({
    id: "d3-break1",
    day: 3,
    title: "Health Break",
    description: "Health break. High Level Policy and Legal Dialogue follows.",
    start: "10:10",
    end: "10:40",
    venue: "Exhibition Area",
    badge: "Break",
  }),
  s({
    id: "d3-panel1",
    day: 3,
    title:
      "Panel I — Closing the Enforcement Gap & Media’s Role in Protecting IPR",
    description:
      "High Level Policy and Legal Dialogue.\nTopics:\n• Closing the Enforcement Gap: From IP Rights to Effective Enforcement.\n• How can legacy and new media contribute to the protection of Intellectual Property Rights (IPR), safeguarding public health and enhancing consumer safety in the fight against counterfeiting?\nModerator: Mr. Tobias Alando / Mrs. Agnes Karingu.\nSpeakers: Mr. Todd Reeves, Director, WIPO; Dr. Saleem Alhabash, Michigan State University (online); Mr. David Omwoyo.\nPanel: Dr. Robi M. King’a, CEO, ACA, Kenya; Mr. Frank Mdimi, Head of …; Mr. Frank Chondo, FCC, Tanzania; Ms. Hazel Okoth, International Trademark Association (INTA); Mr. Allan Kakungulu, Uganda.",
    start: "10:40",
    end: "12:00",
    venue: "Main Plenary",
    badge: "Panel",
    speakers: [
      "Mr. Tobias Alando / Mrs. Agnes Karingu",
      "Mr. Todd Reeves",
      "Dr. Saleem Alhabash",
      "Mr. David Omwoyo",
      "Dr. Robi M. King’a",
      "Mr. Frank Mdimi",
      "Mr. Frank Chondo",
      "Ms. Hazel Okoth",
      "Mr. Allan Kakungulu",
    ],
  }),
  s({
    id: "d3-panel2",
    day: 3,
    title: "Panel II — Why Do Counterfeiters Continue to Thrive?",
    description:
      "Identifying the Gaps in Law, Regulation, Investigation, Prosecution and Cross-Border Enforcement.\nModerator: Dr. John Akoten.\nSpeakers: Mr. Kennedy Nyaiyo, MBS, Secretary General, BCOCC; Mr. Benjamin Koech Rotich, Data Management.\nPanel: Mr. Yussuf Osman, Director, Enforcement, ACA; Mr. Tobias Alando, CEO, KAM; Mr. Gregor Schneider, EU Regional Counsellor for IP in Africa, Ghana; Mr. Tito Oloo Wanga, Assistant Director, ODPP.",
    start: "12:00",
    end: "12:40",
    venue: "Main Plenary",
    badge: "Panel",
    speakers: [
      "Dr. John Akoten",
      "Mr. Kennedy Nyaiyo, MBS",
      "Mr. Benjamin Koech Rotich",
      "Mr. Yussuf Osman",
      "Mr. Tobias Alando",
      "Mr. Gregor Schneider",
      "Mr. Tito Oloo Wanga",
    ],
  }),
  s({
    id: "d3-questions",
    day: 3,
    title: "Questions",
    description: "Audience questions following Panel II.",
    start: "12:40",
    end: "13:00",
    venue: "Main Plenary",
    badge: "Session",
  }),
  s({
    id: "d3-lunch",
    day: 3,
    title: "Lunch Break",
    description:
      "Lunch break. Afternoon sectoral panels: Automotive Spare Parts and Agriculture.",
    start: "13:00",
    end: "14:00",
    venue: "Restaurant / Exhibition",
    badge: "Break",
  }),
  s({
    id: "d3-panel3",
    day: 3,
    title: "Panel III — Counterfeit Automotive Spare Parts",
    description:
      "Sector: Automotive Spare Parts.\nTopic: Counterfeit Automotive Spare Parts — Regulatory, Enforcement and financial investigations.\nModerator: Mr. Henry Maina.\nSpeakers: Mr. Mark Ogonji, DG, Assets Recovery Authority; Mr. Yussuf Osman, Director Enforcement, ACA.\nPanel: Ms. Concilia Were, Ass. Manager Legal Services, KIPI; Dr. Bakari Mwanaktina, Chair School of Law, UoN (Mombasa Campus); Ms. Brenda Vilita, CFL Advocates.",
    start: "14:00",
    end: "15:00",
    venue: "Main Plenary",
    badge: "Panel",
    speakers: [
      "Mr. Henry Maina",
      "Mr. Mark Ogonji",
      "Mr. Yussuf Osman",
      "Ms. Concilia Were",
      "Dr. Bakari Mwanaktina",
      "Ms. Brenda Vilita",
    ],
  }),
  s({
    id: "d3-panel4",
    day: 3,
    title: "Panel IV — Agriculture: Safeguarding Food-System Safety",
    description:
      "Sector: Agriculture.\nTopic: Safeguarding food-system safety by disrupting counterfeit supply chains in agricultural products.\nModerator: Mr. Caspar Oluoch.\nSpeaker: Mr. Lawrence Kalawa, PCPB.\nPanel: Mr. Gentrix Juma, KEPHIS; Ms. Happiness Sudi Sirengo, Legal Expert; Mr. Sam G. Ngige, Kenya Sugar Board; Mr. Peter Kaigwara, KEBS – Head of Market Surveillance; Mr. Peter Wanjala, Regional Manager, North Rift, ACA.",
    start: "15:00",
    end: "16:00",
    venue: "Main Plenary",
    badge: "Panel",
    speakers: [
      "Mr. Caspar Oluoch",
      "Mr. Lawrence Kalawa",
      "Mr. Gentrix Juma",
      "Ms. Happiness Sudi Sirengo",
      "Mr. Sam G. Ngige",
      "Mr. Peter Kaigwara",
      "Mr. Peter Wanjala",
    ],
  }),
  s({
    id: "d3-break2",
    day: 3,
    title: "Health Break / Exhibition",
    description: "Health break and exhibition viewing.",
    start: "16:00",
    venue: "Exhibition Area",
    badge: "Break",
  }),
];

/** Day 4 · Thursday 19 Nov 2026 — revised programme. */
const day4 = [
  s({
    id: "d4-recap",
    day: 4,
    title: "Recap of Day One",
    description:
      "Day 2 of symposium · Thursday, 19 November 2026 · Sectoral deep dives, finance, technology and action.",
    start: "08:30",
    end: "09:00",
    venue: "Main Plenary",
    badge: "Session",
  }),
  s({
    id: "d4-panel5",
    day: 4,
    title: "Panel V — Pharmaceuticals and Medical Equipment",
    description:
      "Sector: Pharmaceuticals and Medical Equipment.\nTopics:\n• Combating Counterfeiting in Pharmaceuticals and Medical Equipment: What Strategies and Lessons?\n• Strengthening the legal and enforcement framework for combating counterfeit pharma and medical devices: Use of technology for investigation, prosecution and regulatory accountability.\nModerator: Mr. Abdi Abikar.\nSpeakers: Dr. James Oigo Mokoro, Chair, KAPI; Mr. Frank Chondo, FCC, Tanzania.\nPanel: Dr. Anastacia Nyalita, CECM, Nairobi County; Mr. Tito Oloo Wanga, Assistant Director, ODPP; Mr. Kimeli Muge, Nandi County Government; Cowin Song, Future Strategy TF / TF Leader, NANOSILIKHAN Advanced Materials Co., Ltd.",
    start: "09:00",
    end: "10:00",
    venue: "Main Plenary",
    badge: "Panel",
    speakers: [
      "Mr. Abdi Abikar",
      "Dr. James Oigo Mokoro",
      "Mr. Frank Chondo",
      "Dr. Anastacia Nyalita",
      "Mr. Tito Oloo Wanga",
      "Mr. Kimeli Muge",
      "Cowin Song",
    ],
  }),
  s({
    id: "d4-panel6",
    day: 4,
    title: "Panel VI — Energy, Electricals and Electronics",
    description:
      "Sector: Energy, Electricals and Electronics.\nTopic: Counterfeit Electrical and Electronic Products — Application of Law, Standards and Technology to enhance Public Safety.\nModerator: Mr. Caspar Oluoch.\nSpeakers: Mr. Genesio Mugo, Chair — KAM Energy, Electrical and Electronics sector; Dr. Walter Juma Ongeti, CEO, KENAS.\nPanel: Ms. Brenda Vilita, CFL Advocates; Eng. Grace Onyango, Ag. CEO, EBK; Eng. Hassan Mwandoro, IEK; Mr. Peter Mutula, Samsung Electronics E. Africa.",
    start: "10:00",
    end: "11:00",
    venue: "Main Plenary",
    badge: "Panel",
    speakers: [
      "Mr. Caspar Oluoch",
      "Mr. Genesio Mugo",
      "Dr. Walter Juma Ongeti",
      "Ms. Brenda Vilita",
      "Eng. Grace Onyango",
      "Eng. Hassan Mwandoro",
      "Mr. Peter Mutula",
    ],
  }),
  s({
    id: "d4-break1",
    day: 4,
    title: "Health Break",
    description: "Health break. Alcohol and Tobacco panel follows.",
    start: "11:00",
    end: "11:30",
    venue: "Exhibition Area",
    badge: "Break",
  }),
  s({
    id: "d4-panel7",
    day: 4,
    title: "Panel VII — Alcohol and Tobacco",
    description:
      "Sector: Alcohol and Tobacco.\nTopic: From fragmented regulation to coordinated enforcement — strengthening the legal architecture for identifying and combating counterfeit alcoholic beverages & tobacco.\nModerator: Mr. Henry Maina.\nSpeaker: Dr. Anastacia Nyalita, CECM, Nairobi County.\nPanel: Mr. Kui Kinyanjui, Chair, ABAK; Billy Tsuma, BAT — Chair, KAM-AIT subcommittee; Mr. Michael Kiragu Muthami, Chair, PERAK; Mr. Eric Kwena, Research Analyst, National Crime Research Centre.",
    start: "11:30",
    end: "12:30",
    venue: "Main Plenary",
    badge: "Panel",
    speakers: [
      "Mr. Henry Maina",
      "Dr. Anastacia Nyalita",
      "Mr. Kui Kinyanjui",
      "Billy Tsuma",
      "Mr. Michael Kiragu Muthami",
      "Mr. Eric Kwena",
    ],
  }),
  s({
    id: "d4-entertainment",
    day: 4,
    title: "Entertainment",
    description: "Entertainment interlude.",
    start: "12:30",
    end: "12:45",
    venue: "Main Plenary",
    badge: "Session",
  }),
  s({
    id: "d4-recommendations",
    day: 4,
    title: "Presentation of Symposium Recommendations and Mombasa Action Points",
    description: "Presentation of symposium recommendations and Mombasa Action Points.",
    start: "12:45",
    end: "13:15",
    venue: "Main Plenary",
    badge: "Session",
  }),
  s({
    id: "d4-vote",
    day: 4,
    title: "Vote of Thanks",
    description: "Vote of thanks.",
    start: "13:15",
    end: "13:20",
    venue: "Main Plenary",
    badge: "Ceremony",
  }),
  s({
    id: "d4-lunch",
    day: 4,
    title: "Lunch Break / Exhibition",
    description: "Lunch break and exhibition viewing.",
    start: "13:20",
    end: "14:20",
    venue: "Restaurant / Exhibition",
    badge: "Break",
  }),
  s({
    id: "d4-networking",
    day: 4,
    title: "Networking and Departure",
    description: "Networking and departure.",
    start: "14:20",
    venue: "Main Lobby",
    badge: "Networking",
  }),
];

export const isippeProgramme = [...preEvents, ...day3, ...day4];
export const isippeProgrammeSymposium = [...day3, ...day4];
export const isippeProgrammePreEvents = preEvents;
