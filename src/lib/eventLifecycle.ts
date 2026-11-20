import type { Engagement } from "../types/engagement";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** End of the calendar day for an engagement date (handles date-only ISO values). */
function endOfEngagementDay(iso: string): Date | null {
  const raw = iso.trim();
  if (!raw) return null;

  // Date-only (YYYY-MM-DD) → through end of that local calendar day.
  if (DATE_ONLY.test(raw)) {
    const [y, m, d] = raw.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d, 23, 59, 59, 999);
  }

  const end = new Date(raw);
  if (Number.isNaN(end.getTime())) return null;

  // Midnight local → treat as through the end of that local day.
  if (
    end.getHours() === 0 &&
    end.getMinutes() === 0 &&
    end.getSeconds() === 0 &&
    end.getMilliseconds() === 0
  ) {
    end.setHours(23, 59, 59, 999);
  }
  return end;
}

/** True when today is after the engagement end date. */
export function isEngagementEnded(
  engagement: Pick<Engagement, "endDate"> | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!engagement?.endDate) return false;
  const end = endOfEngagementDay(engagement.endDate);
  if (!end) return false;
  return now.getTime() > end.getTime();
}

/**
 * Admin-controlled Event Ended mode — shows the Event Ended hero
 * and soft-closes public registration when active.
 */
export function isEventEndedActive(
  engagement: Pick<Engagement, "eventEndedActive"> | null | undefined,
): boolean {
  return engagement?.eventEndedActive === true;
}

/**
 * Public registration should be closed when Event Ended is active,
 * registration is disabled, the event date has passed, or the
 * registration deadline has passed.
 */
export function isRegistrationOpen(
  engagement: Pick<
    Engagement,
    "endDate" | "registrationEnabled" | "registrationEndDate" | "eventEndedActive"
  > | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!engagement) return true;
  if (isEventEndedActive(engagement)) return false;
  if (engagement.registrationEnabled === false) return false;
  if (isEngagementEnded(engagement, now)) return false;
  const deadline = engagement.registrationEndDate?.trim();
  if (deadline) {
    const until = endOfEngagementDay(deadline);
    if (until && now.getTime() > until.getTime()) return false;
  }
  return true;
}
