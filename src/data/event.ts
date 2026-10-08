/** Structural event data — user-facing copy lives in locale catalogs (`common.event`, `common.fees`, `common.nav`). */
export const eventInfo = {
  name: "ISIPPE-3",
  supportEmail: "isippe@aca.go.ke",
  supportPhone: "+254 700 123 456",
} as const;

export const fees = {
  earlyBird: {
    kes: 60000,
    usd: 470,
    labelKey: "fees.earlyBird.label",
    untilKey: "fees.earlyBird.until",
  },
  late: {
    kes: 70000,
    usd: 510,
    labelKey: "fees.late.label",
    untilKey: "fees.late.until",
  },
} as const;

export const sponsorshipPackages = [
  { name: "Platinum", value: 1000000, color: "#0B45E0" },
  { name: "Gold", value: 500000, color: "#d4a017" },
  { name: "Silver", value: 300000, color: "#8a939e" },
  { name: "Bronze", value: 150000, color: "#b87333" },
] as const;

export const navLinks = [
  { to: "/", labelKey: "nav.home" },
  { to: "/about", labelKey: "nav.about" },
  { to: "/programme", labelKey: "nav.programme" },
  { to: "/speakers", labelKey: "nav.speakers" },
  { to: "/sponsorship", labelKey: "nav.sponsorship" },
  { to: "/venue", labelKey: "nav.venue" },
  { to: "/faq", labelKey: "nav.faq" },
] as const;
