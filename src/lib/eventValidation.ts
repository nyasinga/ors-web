export type EventWizardValues = {
  eventType: string;
  title: string;
  engagementCode: string;
  description: string;
  category: string;
  audience: string;
  tone: string;
  language: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  startTime: string;
  endTime: string;
  venueMode: "in-person" | "virtual" | "hybrid";
  venueName: string;
  address: string;
  city: string;
  country: string;
  capacity: string;
  virtualLink: string;
  payMpesa: boolean;
  payCard: boolean;
  payBank: boolean;
  payFree: boolean;
  websiteUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  contactEmail: string;
  contactPhone: string;
};

export type EventFieldErrors = Partial<Record<keyof EventWizardValues | "form", string>>;

export type ValidateMode = "step" | "draft" | "publish";

const URL_RE = /^https?:\/\/.+\..+/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidUrl(value: string) {
  const v = value.trim();
  if (!v) return true;
  try {
    const u = new URL(v);
    return (u.protocol === "http:" || u.protocol === "https:") && Boolean(u.host);
  } catch {
    return URL_RE.test(v);
  }
}

function parseLocalDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function timeToMinutes(value: string) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min) || h > 23 || min > 59) return null;
  return h * 60 + min;
}

function validateStep1(values: EventWizardValues, errors: EventFieldErrors) {
  if (!values.eventType.trim()) errors.eventType = "Select an event type.";
}

function validateStep2(values: EventWizardValues, errors: EventFieldErrors, strict: boolean) {
  if (!values.title.trim()) {
    errors.title = "Event title is required.";
  } else if (values.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters.";
  }

  if (!values.engagementCode.trim()) {
    errors.engagementCode = "Engagement code is required.";
  } else if (!/^[A-Za-z0-9][A-Za-z0-9._-]{1,47}$/.test(values.engagementCode.trim())) {
    errors.engagementCode =
      "Use 2–48 characters: letters, numbers, dots, underscores or hyphens.";
  }

  if (values.contactEmail.trim() && !EMAIL_RE.test(values.contactEmail.trim())) {
    errors.contactEmail = "Enter a valid support email.";
  }

  if (strict) {
    if (!values.description.trim()) {
      errors.description = "Short description is required.";
    } else if (values.description.trim().length < 20) {
      errors.description = "Add at least 20 characters for the description.";
    }
    if (!values.category) errors.category = "Select a category.";
    if (!values.audience) errors.audience = "Select a target audience.";
    if (!values.tone) errors.tone = "Select a tone.";
    if (!values.language) errors.language = "Select a language.";
    if (!values.contactEmail.trim()) {
      errors.contactEmail = "Support email is required for registration help.";
    }
    if (!values.contactPhone.trim()) {
      errors.contactPhone = "Support phone is required for registration help.";
    }
  }
}

function validateStep3(values: EventWizardValues, errors: EventFieldErrors, strict: boolean) {
  if (strict || values.startDate || values.endDate) {
    if (!values.startDate) errors.startDate = "Start date is required.";
    if (!values.endDate) errors.endDate = "End date is required.";

    const start = parseLocalDate(values.startDate);
    const end = parseLocalDate(values.endDate);
    if (start && end && end.getTime() < start.getTime()) {
      errors.endDate = "End date cannot be before the start date.";
    }

    if (!values.allDay) {
      if (!values.startTime) errors.startTime = "Start time is required.";
      if (!values.endTime) errors.endTime = "End time is required.";
      const a = timeToMinutes(values.startTime);
      const b = timeToMinutes(values.endTime);
      if (start && end && start.toDateString() === end.toDateString() && a != null && b != null && b <= a) {
        errors.endTime = "End time must be after start time on the same day.";
      }
    }
  }

  if (strict) {
    if (values.venueMode === "in-person" || values.venueMode === "hybrid") {
      if (!values.venueName.trim()) errors.venueName = "Venue name is required for this event mode.";
      if (!values.city.trim()) errors.city = "City is required.";
      if (!values.country) errors.country = "Country is required.";
    }
    if (values.venueMode === "virtual" || values.venueMode === "hybrid") {
      if (!values.virtualLink.trim()) {
        errors.virtualLink = "Meeting URL is required for virtual or hybrid events.";
      } else if (!isValidUrl(values.virtualLink)) {
        errors.virtualLink = "Enter a valid URL (https://…).";
      }
    }
  } else if (values.virtualLink.trim() && !isValidUrl(values.virtualLink)) {
    errors.virtualLink = "Enter a valid URL (https://…).";
  }

  if (values.capacity.trim()) {
    const n = Number(values.capacity);
    if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
      errors.capacity = "Capacity must be a positive whole number.";
    }
  }
}

function validateStep5(values: EventWizardValues, errors: EventFieldErrors, strict: boolean) {
  if (!strict) return;
  if (!values.payMpesa && !values.payCard && !values.payBank && !values.payFree) {
    errors.payFree = "Enable at least one payment method (or Free).";
  }
}

function validateStep6(values: EventWizardValues, errors: EventFieldErrors) {
  if (values.websiteUrl.trim() && !isValidUrl(values.websiteUrl)) {
    errors.websiteUrl = "Enter a valid website URL.";
  }
  if (values.facebookUrl.trim() && !isValidUrl(values.facebookUrl)) {
    errors.facebookUrl = "Enter a valid Facebook URL.";
  }
  if (values.twitterUrl.trim() && !isValidUrl(values.twitterUrl)) {
    errors.twitterUrl = "Enter a valid X (Twitter) URL.";
  }
  if (values.linkedinUrl.trim() && !isValidUrl(values.linkedinUrl)) {
    errors.linkedinUrl = "Enter a valid LinkedIn URL.";
  }
}

/** Validate one wizard step (for Next) or full form (draft/publish). */
export function validateEventWizard(
  values: EventWizardValues,
  mode: ValidateMode,
  step?: number,
): EventFieldErrors {
  const errors: EventFieldErrors = {};

  if (mode === "draft") {
    validateStep2(values, errors, false);
    validateStep3(values, errors, false);
    validateStep6(values, errors);
    return errors;
  }

  if (mode === "step" && step != null) {
    if (step === 1) validateStep1(values, errors);
    if (step === 2) validateStep2(values, errors, true);
    if (step === 3) validateStep3(values, errors, true);
    if (step === 5) validateStep5(values, errors, true);
    if (step === 6) validateStep6(values, errors);
    return errors;
  }

  // publish — validate all critical steps
  validateStep1(values, errors);
  validateStep2(values, errors, true);
  validateStep3(values, errors, true);
  validateStep5(values, errors, true);
  validateStep6(values, errors);
  return errors;
}

export function firstErrorMessage(errors: EventFieldErrors): string | null {
  const first = Object.values(errors).find((msg) => Boolean(msg));
  return first ?? null;
}

export function stepForField(field: keyof EventFieldErrors): number {
  switch (field) {
    case "eventType":
      return 1;
    case "title":
    case "engagementCode":
    case "description":
    case "category":
    case "audience":
    case "tone":
    case "language":
    case "contactEmail":
    case "contactPhone":
      return 2;
    case "startDate":
    case "endDate":
    case "startTime":
    case "endTime":
    case "venueMode":
    case "venueName":
    case "address":
    case "city":
    case "country":
    case "capacity":
    case "virtualLink":
      return 3;
    case "payMpesa":
    case "payCard":
    case "payBank":
    case "payFree":
      return 5;
    case "websiteUrl":
    case "facebookUrl":
    case "twitterUrl":
    case "linkedinUrl":
      return 6;
    default:
      return 2;
  }
}

export function firstErrorStep(errors: EventFieldErrors): number | null {
  const key = (Object.keys(errors) as Array<keyof EventFieldErrors>).find((k) => errors[k]);
  return key ? stepForField(key) : null;
}
