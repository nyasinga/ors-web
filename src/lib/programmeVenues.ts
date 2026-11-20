/**
 * Programme venue helpers — day header should show the exact place when
 * sessions that day are not at the main event venue.
 */

export function mainVenueName(venueLine: string): string {
  return (venueLine.split(",")[0] || venueLine).trim();
}

/** True when a session venue is a room/space at the host venue (not a separate site). */
export function isOnMainVenue(sessionVenue: string, mainVenueLine: string): boolean {
  const v = sessionVenue.trim().toLowerCase().replace(/\s+/g, " ");
  if (!v || v === "—" || v === "-" || v === "tbc" || v === "tba") return true;

  const main = mainVenueName(mainVenueLine).toLowerCase();
  if (main && (v.includes(main) || main.includes(v))) return true;

  // Typical on-campus / in-resort labels used in the programme.
  if (
    /\b(plenary|lobby|exhibition|restaurant|breakout|ballroom|hall|meeting room|conference|amphitheatre|amphitheater)\b/i.test(
      v,
    )
  ) {
    return true;
  }
  return false;
}

/**
 * Location line for a programme day accordion header.
 * If every concrete session that day is off-site, show that exact venue.
 * If several off-site venues, join them. Otherwise keep the main event venue.
 */
export function dayHeaderLocation(
  sessionVenues: Array<string | undefined | null>,
  mainVenueLine: string,
): string {
  const main = mainVenueLine.trim() || "Venue to be announced";
  const cleaned = sessionVenues
    .map((v) => String(v || "").trim())
    .filter((v) => v && v !== "—");
  if (!cleaned.length) return main;

  const unique = [...new Set(cleaned)];
  const offsite = unique.filter((v) => !isOnMainVenue(v, main));
  if (!offsite.length) return main;

  const allOffsite = unique.every((v) => !isOnMainVenue(v, main));
  if (allOffsite) {
    return offsite.length === 1 ? offsite[0] : offsite.join(" · ");
  }

  // Mixed day: prefer exact off-site name(s) so the header is not misleading.
  return offsite.length === 1 ? offsite[0] : offsite.join(" · ");
}
