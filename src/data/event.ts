/** Public nav structure — labels come from locale catalogs (`common.nav`). */
export const navLinks = [
  { to: "/", labelKey: "nav.home" },
  { to: "/about", labelKey: "nav.about" },
  { to: "/programme", labelKey: "nav.programme" },
  { to: "/speakers", labelKey: "nav.speakers" },
  { to: "/sponsorship", labelKey: "nav.sponsorship" },
  { to: "/venue", labelKey: "nav.venue" },
  { to: "/faq", labelKey: "nav.faq" },
  { to: "/info", labelKey: "nav.info" }
] as const;
