import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  Clock,
  Copy,
  Eye,
  Globe,
  GraduationCap,
  GripVertical,
  Handshake,
  Home,
  Lightbulb,
  Link2,
  Lock,
  MapPin,
  Mic2,
  Monitor,
  Mountain,
  Pencil,
  Plus,
  Save,
  Send,
  Sparkles,
  Store,
  Trash2,
  Upload,
  Users,
  Video,
  X,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import ImagePicker from "../../components/ui/ImagePicker";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Pill } from "../../components/ui/Pill";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { Select } from "../../components/ui/Select";
import { Stepper } from "../../components/ui/Stepper";
import { Tabs } from "../../components/ui/Tabs";
import { useToast } from "../../components/ui/Toast";
import { Toggle } from "../../components/ui/Toggle";
import { createWizardSteps, eventTypeOptions } from "../../data/adminEvents";
import { COUNTRY_CODE_OPTIONS } from "../../data/countries";
import { ApiError } from "../../lib/api";
import { getAuthUser } from "../../lib/auth";
import { resourcePublicUrl, uploadResource } from "../../lib/resources";
import {
  activateEngagement,
  buildEngagementPayload,
  createEngagement,
  engagementToWizardState,
  EVENT_AUDIENCE_OPTIONS,
  EVENT_CATEGORY_OPTIONS,
  EVENT_LANGUAGE_OPTIONS,
  EVENT_TONE_OPTIONS,
  getEngagement,
  updateEngagement,
} from "../../lib/engagements";
import {
  firstErrorMessage,
  firstErrorStep,
  validateEventWizard,
  type EventFieldErrors,
  type EventWizardValues,
} from "../../lib/eventValidation";
import { cn } from "../../lib/cn";

const typeIcons = {
  Conference: Users,
  Workshop: Monitor,
  Training: GraduationCap,
  Seminar: Mic2,
  Summit: Mountain,
  Exhibition: Store,
  Others: Sparkles,
};

const typeToneClass = {
  blue: "bg-soft text-blue",
  purple: "bg-purple-50 text-purple-600",
  green: "bg-green-50 text-green",
  red: "bg-red-50 text-red",
  orange: "bg-orange-50 text-orange-600",
  yellow: "bg-amber-50 text-amber-700",
};

/** Parse `YYYY-MM-DD` as a local calendar date (avoids UTC off-by-one). */
function parseDateInput(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDayLabel(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatPreviewDateRange(start: string, end: string) {
  const a = parseDateInput(start);
  const b = parseDateInput(end) || a;
  if (!a) return "Date not set";
  if (!b || a.toDateString() === b.toDateString()) return formatDayLabel(a);
  const sameMonth = a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  if (sameMonth) {
    return `${a.getDate()} – ${b.getDate()} ${a.toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
    })}`;
  }
  return `${formatDayLabel(a)} – ${formatDayLabel(b)}`;
}

function enumerateEventDays(start: string, end: string, extraDays = 0) {
  const first = parseDateInput(start);
  if (!first) return [] as Array<{ index: number; label: string }>;
  const last = parseDateInput(end) || first;
  const days: Array<{ index: number; label: string }> = [];
  const cur = new Date(first.getFullYear(), first.getMonth(), first.getDate());
  const endMs = last.getTime();
  for (let i = 0; i < 31 && cur.getTime() <= endMs; i += 1) {
    days.push({ index: days.length + 1, label: formatDayLabel(cur) });
    cur.setDate(cur.getDate() + 1);
  }
  if (!days.length) {
    days.push({ index: 1, label: formatDayLabel(first) });
  }
  for (let i = 0; i < extraDays; i += 1) {
    days.push({ index: days.length + 1, label: formatDayLabel(cur) });
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

type WizardSession = {
  id: string;
  day: string;
  time: string;
  title: string;
  description: string;
  speakers: number;
  place: string;
  badge: string;
  tone: "green" | "purple" | "orange" | "blue";
};

function toTimeInputValue(raw: string): string {
  const m = raw.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return "09:00";
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

function parseSessionTimeRange(time: string): { start: string; end: string } {
  const m = time.match(/(\d{1,2}:\d{2})\s*[–\-—]\s*(\d{1,2}:\d{2})/);
  if (m) return { start: toTimeInputValue(m[1]), end: toTimeInputValue(m[2]) };
  const single = time.match(/(\d{1,2}:\d{2})/);
  if (single) {
    const start = toTimeInputValue(single[1]);
    return { start, end: start };
  }
  return { start: "09:00", end: "10:00" };
}

function toneForSessionBadge(badge: string): WizardSession["tone"] {
  const key = badge.toLowerCase();
  if (/ceremony|opening|closing/.test(key)) return "purple";
  if (/keynote/.test(key)) return "green";
  if (/roundtable|workshop|panel/.test(key)) return "purple";
  if (/break|lunch|registration|coffee|networking/.test(key)) return "blue";
  return "orange";
}

/** Screen E Create / Edit Event 1–6 */
export function CreateEventPage() {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const editId = routeId && routeId !== "new" ? routeId : null;
  const isEdit = Boolean(editId);

  const [step, setStep] = useState(1);
  const [stepAnim, setStepAnim] = useState<"forward" | "back">("forward");
  const [previewPulse, setPreviewPulse] = useState(0);
  const [loadingEdit, setLoadingEdit] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [eventType, setEventType] = useState("Conference");
  const [title, setTitle] = useState("");
  const [engagementCode, setEngagementCode] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("legal");
  const [audience, setAudience] = useState("government");
  const [tone, setTone] = useState("professional");
  const [language, setLanguage] = useState("en");
  const [tags, setTags] = useState<string[]>([]);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const audienceLabel =
    EVENT_AUDIENCE_OPTIONS.find((o) => o.value === audience)?.label || audience;
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [venueMode, setVenueMode] = useState<"in-person" | "virtual" | "hybrid">("in-person");
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("KE");
  const [capacity, setCapacity] = useState("");
  const [virtualLink, setVirtualLink] = useState("");
  const [programTab, setProgramTab] = useState("schedule");
  const [day, setDay] = useState("1");
  const [extraProgramDays, setExtraProgramDays] = useState(0);
  const [sessions, setSessions] = useState<WizardSession[]>([]);
  const [speakers, setSpeakers] = useState<
    Array<{
      id: string;
      name: string;
      role: string;
      org: string;
      roleLines: string[];
      topic: string;
      country: string;
      flag: string;
      category: string;
      badge: string;
      photo: string;
      bio: string;
    }>
  >([]);
  const [packages, setPackages] = useState<
    Array<{
      id: string;
      name: string;
      subtitle: string;
      price: number;
      availability: string;
      benefits: string[];
      active: boolean;
      tone: "amber" | "yellow" | "slate" | "orange";
    }>
  >([]);
  const [tickets, setTickets] = useState<
    Array<{
      id: string;
      name: string;
      price: string;
      capacity: number;
      period: string;
      tone: "green" | "blue" | "orange";
    }>
  >([]);
  const [requireApproval, setRequireApproval] = useState(false);
  const [deadlineOn, setDeadlineOn] = useState(true);
  const [limitOn, setLimitOn] = useState(true);
  const [waitlist, setWaitlist] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(true);
  const [collectExtra, setCollectExtra] = useState(true);
  const [payMpesa, setPayMpesa] = useState(true);
  const [payCard, setPayCard] = useState(true);
  const [payBank, setPayBank] = useState(true);
  const [payFree, setPayFree] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "private" | "unlisted">("public");
  const [saveDraft, setSaveDraft] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [contactEmail, setContactEmail] = useState(() => getAuthUser()?.email || "");
  const [contactPhone, setContactPhone] = useState(() => getAuthUser()?.phoneNo || "");
  const [sessionModal, setSessionModal] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [agendaPreviewOpen, setAgendaPreviewOpen] = useState(false);
  const [speakerModal, setSpeakerModal] = useState(false);
  const [packageModal, setPackageModal] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [newSessionDesc, setNewSessionDesc] = useState("");
  const [newSessionType, setNewSessionType] = useState("Session");
  const [newSessionDay, setNewSessionDay] = useState("1");
  const [newSessionStart, setNewSessionStart] = useState("14:00");
  const [newSessionEnd, setNewSessionEnd] = useState("15:00");
  const [newSessionVenue, setNewSessionVenue] = useState("");
  const [newSessionSpeakers, setNewSessionSpeakers] = useState("0");
  const [newSessionCapacity, setNewSessionCapacity] = useState("");
  const [newSpeakerName, setNewSpeakerName] = useState("");
  const [newSpeakerRole, setNewSpeakerRole] = useState("");
  const [newSpeakerOrg, setNewSpeakerOrg] = useState("");
  const [newSpeakerTopic, setNewSpeakerTopic] = useState("");
  const [newSpeakerCategory, setNewSpeakerCategory] = useState("keynote");
  const [newSpeakerCountry, setNewSpeakerCountry] = useState("");
  const [newSpeakerPhotoFile, setNewSpeakerPhotoFile] = useState<File | null>(null);
  const [newSpeakerPhotoPreview, setNewSpeakerPhotoPreview] = useState("");
  const [uploadingSpeakerPhoto, setUploadingSpeakerPhoto] = useState(false);
  const [pkgName, setPkgName] = useState("");
  const [pkgPrice, setPkgPrice] = useState("");
  const [pkgDesc, setPkgDesc] = useState("");
  const [pkgAvail, setPkgAvail] = useState("1");
  const [pkgBenefits, setPkgBenefits] = useState(["Logo on main stage backdrop"]);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<EventFieldErrors>({});
  const toast = useToast();

  const clearSpeakerPhoto = () => {
    setNewSpeakerPhotoPreview((prev) => {
      if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return "";
    });
    setNewSpeakerPhotoFile(null);
  };

  const wizardValues = (): EventWizardValues => ({
    eventType,
    title,
    engagementCode,
    description,
    category,
    audience,
    tone,
    language,
    startDate,
    endDate,
    allDay,
    startTime,
    endTime,
    venueMode,
    venueName,
    address,
    city,
    country,
    capacity,
    virtualLink,
    payMpesa,
    payCard,
    payBank,
    payFree,
    websiteUrl,
    facebookUrl,
    twitterUrl,
    linkedinUrl,
    contactEmail,
    contactPhone,
  });

  const clearFieldError = (field: keyof EventFieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const applyValidation = (mode: "step" | "draft" | "publish", currentStep?: number) => {
    const errors = validateEventWizard(wizardValues(), mode, currentStep);
    setFieldErrors(errors);
    const message = firstErrorMessage(errors);
    if (message) {
      toast.error(message);
      const target = firstErrorStep(errors);
      if (target != null && target !== step) {
        setStepAnim(target < step ? "back" : "forward");
        setStep(target);
      }
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!editId) {
      setLoadingEdit(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingEdit(true);
      setLoadError(null);
      try {
        const engagement = await getEngagement(editId);
        if (cancelled) return;
        const state = engagementToWizardState(engagement);
        setEventType(state.eventType);
        setTitle(state.title);
        setEngagementCode(state.engagementCode);
        setDescription(state.description);
        setCategory(state.category);
        setAudience(state.audience);
        setTone(state.tone);
        setLanguage(state.language);
        setTags(state.tags.length ? state.tags : []);
        setObjectives(state.objectives.length ? state.objectives : []);
        setStartDate(state.startDate);
        setEndDate(state.endDate);
        setAllDay(state.allDay);
        setStartTime(state.startTime);
        setEndTime(state.endTime);
        setVenueMode(state.venueMode);
        setVenueName(state.venueName);
        setAddress(state.address);
        setCity(state.city);
        setCountry(state.country);
        setCapacity(state.capacity || "500");
        setVirtualLink(state.virtualLink);
        if (state.sessions.length) {
          const normalized = state.sessions.map((s) => ({
            ...s,
            day: String(s.day || "1"),
          }));
          setSessions(normalized);
          const maxDay = Math.max(1, ...normalized.map((s) => Number(s.day) || 1));
          const rangeLen =
            enumerateEventDays(state.startDate, state.endDate || state.startDate).length || 1;
          setExtraProgramDays(Math.max(0, maxDay - rangeLen));
        }
        if (state.speakers.length) setSpeakers(state.speakers);
        if (state.packages.length) setPackages(state.packages);
        if (state.tickets.length) setTickets(state.tickets);
        setRequireApproval(state.requireApproval);
        setDeadlineOn(state.deadlineOn);
        setLimitOn(state.limitOn);
        setWaitlist(state.waitlist);
        setPayMpesa(state.payMpesa);
        setPayCard(state.payCard);
        setPayBank(state.payBank);
        setPayFree(state.payFree);
        setVisibility(state.visibility);
        setSaveDraft(state.saveDraft);
        setWebsiteUrl(state.websiteUrl);
        setFacebookUrl(state.facebookUrl);
        setTwitterUrl(state.twitterUrl);
        setLinkedinUrl(state.linkedinUrl);
        setContactEmail(state.contactEmail);
        setContactPhone(state.contactPhone);
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load event for editing",
        );
      } finally {
        if (!cancelled) setLoadingEdit(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editId]);

  useEffect(() => {
    const raw = Number(searchParams.get("step"));
    if (Number.isInteger(raw) && raw >= 1 && raw <= 6) setStep(raw);
  }, [searchParams]);

  useEffect(() => {
    setPreviewPulse((n) => n + 1);
  }, [startDate, endDate, venueName, eventType, venueMode]);

  const previewDate =
    startDate ? formatPreviewDateRange(startDate, endDate || startDate) : "Date not set";

  const programDays = useMemo(
    () => enumerateEventDays(startDate, endDate || startDate, extraProgramDays),
    [startDate, endDate, extraProgramDays],
  );

  useEffect(() => {
    if (!programDays.length) {
      if (day !== "1") setDay("1");
      return;
    }
    if (!programDays.some((d) => String(d.index) === day)) {
      setDay(String(programDays[0].index));
    }
  }, [programDays, day]);

  const daySessions = useMemo(
    () => sessions.filter((s) => String(s.day || "1") === day),
    [sessions, day],
  );

  const agendaByDay = useMemo(() => {
    const days =
      programDays.length > 0
        ? programDays
        : [{ index: 1, label: previewDate === "Date not set" ? "Day 1" : previewDate }];
    return days.map((d) => ({
      ...d,
      sessions: sessions.filter((s) => String(s.day || "1") === String(d.index)),
    }));
  }, [programDays, sessions, previewDate]);

  const resetSessionForm = (forDay = day) => {
    setEditingSessionId(null);
    setNewSessionTitle("");
    setNewSessionDesc("");
    setNewSessionType("Session");
    setNewSessionDay(forDay);
    setNewSessionStart("09:00");
    setNewSessionEnd("10:00");
    setNewSessionVenue(venueName || "");
    setNewSessionSpeakers("0");
    setNewSessionCapacity("");
  };

  const openAddSession = () => {
    resetSessionForm(day);
    setSessionModal(true);
  };

  const openEditSession = (session: WizardSession) => {
    const range = parseSessionTimeRange(session.time);
    setEditingSessionId(session.id);
    setNewSessionTitle(session.title);
    setNewSessionDesc(session.description === "New session added to the programme." ? "" : session.description);
    setNewSessionType(session.badge || "Session");
    setNewSessionDay(String(session.day || day));
    setNewSessionStart(range.start);
    setNewSessionEnd(range.end);
    setNewSessionVenue(session.place || "");
    setNewSessionSpeakers(String(session.speakers ?? 0));
    setNewSessionCapacity("");
    setSessionModal(true);
  };

  const saveSessionFromModal = () => {
    if (!newSessionTitle.trim()) {
      toast.error("Enter a session title.");
      return;
    }
    const sessionDay = newSessionDay || day;
    const wasEdit = Boolean(editingSessionId);
    const entry: WizardSession = {
      id: editingSessionId || `s${Date.now()}`,
      day: sessionDay,
      time: `${newSessionStart} – ${newSessionEnd}`,
      title: newSessionTitle.trim(),
      description: newSessionDesc.trim() || "New session added to the programme.",
      speakers: Math.max(0, Number(newSessionSpeakers) || 0),
      place: newSessionVenue.trim() || venueName || "Main hall",
      badge: newSessionType,
      tone: toneForSessionBadge(newSessionType),
    };
    setSessions((prev) => {
      if (wasEdit) {
        return prev.map((s) => (s.id === entry.id ? entry : s));
      }
      return [...prev, entry];
    });
    setSessionModal(false);
    resetSessionForm(sessionDay);
    setDay(sessionDay);
    toast.success(wasEdit ? "Session updated." : `Session added to Day ${sessionDay}`);
  };

  const tips = useMemo(() => {
    if (step === 1) {
      return [
        "Recommended settings and templates.",
        "Relevant registration options.",
        "Session and speaker management.",
        "Tailored communication tools.",
        "Enhanced attendee experience.",
      ];
    }
    if (step === 2) {
      return [
        "Use a clear and descriptive title.",
        "Keep the description concise.",
        "Set support email and phone for Need Assistance.",
        "Choose tags that improve discovery.",
        "Upload a high-resolution logo.",
      ];
    }
    if (step === 3) {
      return [
        "Choose dates avoiding major holidays.",
        "Verify venue availability early.",
        "Confirm capacity against expected attendance.",
        "Add a virtual link for hybrid access.",
      ];
    }
    if (step === 5) {
      return [
        "Offer early bird tickets.",
        "Set clear registration deadlines.",
        "Enable waitlist when capacity is tight.",
        "Confirm payment channels before publish.",
      ];
    }
    return [
      "Use a wide banner (1920×600).",
      "Keep gallery images consistent.",
      "Match brand colours to ACA guidelines.",
      "Review visibility before publishing.",
    ];
  }, [step]);

  const submitEvent = async (asDraft: boolean) => {
    if (!applyValidation(asDraft ? "draft" : "publish")) return;

    setSaveDraft(asDraft);
    setSubmitting(true);
    try {
      const payload = buildEngagementPayload({
        eventType,
        title,
        engagementCode,
        description,
        category,
        audience,
        tone,
        language,
        tags,
        objectives,
        startDate,
        endDate,
        allDay,
        startTime,
        endTime,
        venueMode,
        venueName,
        address,
        city,
        country,
        capacity,
        virtualLink,
        sessions,
        speakers,
        packages,
        tickets,
        requireApproval,
        waitlist,
        deadlineOn,
        limitOn,
        payMpesa,
        payCard,
        payBank,
        payFree,
        visibility,
        saveDraft: asDraft,
        websiteUrl,
        facebookUrl,
        twitterUrl,
        linkedinUrl,
        contactEmail,
        contactPhone,
      });
      console.log("[engagement submit] speakers.photo values", payload.speakers);
      if (isEdit && editId) {
        await updateEngagement(editId, payload);
        if (!asDraft) {
          await activateEngagement(editId);
          toast.success("Event published — it is now the only active event.");
        } else {
          toast.success("Draft saved");
        }
        navigate(`/admin/events/${editId}/overview`);
      } else {
        const created = await createEngagement(payload);
        const id = created.engagementID;
        if (!id) throw new Error("Event created but no engagementID was returned.");
        if (!asDraft) {
          await activateEngagement(id);
          toast.success("Event published — it is now the only active event.");
        } else {
          toast.success("Draft saved");
        }
        navigate(`/admin/events/${id}/overview`);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error("Your session has expired. Please sign in again.");
        navigate("/admin-login", {
          replace: true,
          state: { from: isEdit && editId ? `/admin/events/${editId}/edit` : "/admin/events/new" },
        });
        return;
      }
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : asDraft
              ? "Failed to save draft"
              : isEdit
                ? "Failed to update event"
                : "Failed to create event";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = async () => {
    if (step < 6) {
      if (!applyValidation("step", step)) return;
      setFieldErrors({});
      setStepAnim("forward");
      setStep(step + 1);
      return;
    }
    await submitEvent(false);
  };

  const goPrev = () => {
    if (step > 1) {
      setStepAnim("back");
      setStep(step - 1);
    }
  };

  const jumpToStep = (n: number) => {
    if (n < 1 || n > 6 || n === step) return;
    setStepAnim(n < step ? "back" : "forward");
    setStep(n);
  };

  const stepPanelClass =
    stepAnim === "forward" ? "create-wizard-step-forward" : "create-wizard-step-back";

  return (
    <div className="grid w-full gap-4 pb-24">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-mute" aria-label="Breadcrumb">
        <Link to="/admin" className="hover:text-blue">
          <Home size={14} />
        </Link>
        <span>/</span>
        <Link to="/admin/events" className="hover:text-blue">
          Events
        </Link>
        <span>/</span>
        <span className="font-medium text-navy">{isEdit ? "Edit Event" : "Create Event"}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-extrabold text-navy">{isEdit ? "Edit Event" : "Create Event"}</h1>
        <p className="mt-1 text-sm text-mute">
          {isEdit
            ? "Update event details, programme, speakers and publish settings."
            : "Set up your event, configure details and publish."}
        </p>
      </div>

      {loadError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {loadError}
        </p>
      ) : null}
      {loadingEdit ? (
        <p className="text-sm text-mute">Loading event…</p>
      ) : null}

      <Stepper
        steps={createWizardSteps}
        current={step}
        doneTone="blue"
        onStepClick={jumpToStep}
        className="rounded-xl border border-slate-200 bg-white px-3 py-4 shadow-card"
      />

      {step === 1 ? (
        <div key={`step-${step}`} className={cn("grid gap-4 lg:grid-cols-[1.6fr_0.9fr]", stepPanelClass)}>
          <Card>
            <h2 className="text-lg font-bold text-navy">Select Event Type</h2>
            <p className="mt-1 text-sm text-mute">
              Choose the type of event you want to create. This helps us tailor the right features, templates and
              settings for your event.
            </p>
            {fieldErrors.eventType ? (
              <p className="mt-3 text-sm text-red" role="alert">
                {fieldErrors.eventType}
              </p>
            ) : null}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 create-wizard-stagger">
              {eventTypeOptions.map((opt) => {
                const Icon = typeIcons[opt.id as keyof typeof typeIcons] ?? Sparkles;
                const selected = eventType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setEventType(opt.id);
                      clearFieldError("eventType");
                    }}
                    className={cn(
                      "create-wizard-choice relative rounded-lg border p-4 text-left",
                      selected ? "border-blue bg-soft/40 ring-2 ring-blue/20" : "border-slate-200 hover:border-blue/40",
                      fieldErrors.eventType && !selected && "border-red/50",
                      opt.id === "Others" && "sm:col-span-2",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-3 right-3 grid h-4 w-4 place-items-center rounded-full border",
                        selected ? "border-blue bg-blue text-white" : "border-slate-300",
                      )}
                    >
                      {selected ? <Check size={10} /> : null}
                    </span>
                    <span className={cn("grid h-10 w-10 place-items-center rounded-lg", typeToneClass[opt.tone])}>
                      <Icon size={20} />
                    </span>
                    <p className="mt-3 font-bold text-ink">{opt.title}</p>
                    <p className="mt-1 text-sm text-mute">{opt.description}</p>
                  </button>
                );
              })}
            </div>
          </Card>
          <Card className="self-start bg-soft/40">
            <div className="grid h-16 w-16 place-items-center rounded-xl bg-white text-blue shadow-sm">
              <CalendarDays size={28} />
            </div>
            <h3 className="mt-4 font-bold text-navy">Why choose the right event type?</h3>
            <p className="mt-2 text-sm text-mute">
              It determines features, registration flows, and attendee experience.
            </p>
            <ul className="mt-4 grid gap-2">
              {tips.map((t) => (
                <li key={t} className="flex gap-2 text-sm text-ink">
                  <Check size={16} className="mt-0.5 shrink-0 text-blue" /> {t}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ) : null}

      {step === 2 ? (
        <div key={`step-${step}`} className={cn("grid gap-4 lg:grid-cols-[1.6fr_0.9fr]", stepPanelClass)}>
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-navy">Basic Details</h2>
                <p className="text-sm text-mute">Provide the main information about your event.</p>
              </div>
              <Button size="sm" className="border-transparent bg-purple-600 text-white hover:bg-purple-700">
                <Sparkles size={14} /> Generate with AI
              </Button>
            </div>
            <div className="grid gap-4">
              <Input
                label="Event Title"
                required
                value={title}
                error={fieldErrors.title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearFieldError("title");
                }}
              />
              <Input
                label="Engagement Code"
                required
                value={engagementCode}
                error={fieldErrors.engagementCode}
                placeholder="e.g. ISIPPE-2026"
                onChange={(e) => {
                  setEngagementCode(e.target.value.trimStart());
                  clearFieldError("engagementCode");
                }}
              />
              <div>
                <p className="mb-1.5 text-sm font-medium text-ink">Event Logo</p>
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 sm:flex-row">
                  <img
                    src="/assets/logo-aca.png"
                    alt="Event logo placeholder"
                    className="h-16 w-auto object-contain opacity-80"
                  />
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-medium text-ink">Upload event logo</p>
                    <p className="text-xs text-mute">Recommended 800×400px</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Upload size={14} /> Choose File
                    </Button>
                  </div>
                </div>
              </div>
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium text-ink">
                  Short Description <span className="text-red">*</span>
                </span>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value.slice(0, 300));
                    clearFieldError("description");
                  }}
                  rows={4}
                  aria-invalid={Boolean(fieldErrors.description) || undefined}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-ink focus:outline-none focus:ring-2",
                    fieldErrors.description
                      ? "border-red focus:border-red focus:ring-red/20"
                      : "border-slate-200 focus:border-blue focus:ring-blue/20",
                  )}
                />
                <div className="flex items-center justify-between gap-2">
                  {fieldErrors.description ? (
                    <span className="text-xs text-red" role="alert">
                      {fieldErrors.description}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="text-right text-xs text-mute">{description.length}/300</span>
                </div>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <Select
                  label="Category"
                  required
                  value={category}
                  error={fieldErrors.category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    clearFieldError("category");
                  }}
                  options={[...EVENT_CATEGORY_OPTIONS]}
                />
                <Select
                  label="Target Audience"
                  required
                  value={audience}
                  error={fieldErrors.audience}
                  onChange={(e) => {
                    setAudience(e.target.value);
                    clearFieldError("audience");
                  }}
                  options={[...EVENT_AUDIENCE_OPTIONS]}
                />
                <Select
                  label="Tone"
                  required
                  value={tone}
                  error={fieldErrors.tone}
                  onChange={(e) => {
                    setTone(e.target.value);
                    clearFieldError("tone");
                  }}
                  options={[...EVENT_TONE_OPTIONS]}
                />
                <Select
                  label="Language"
                  required
                  value={language}
                  error={fieldErrors.language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    clearFieldError("language");
                  }}
                  options={[...EVENT_LANGUAGE_OPTIONS]}
                />
              </div>
              <div>
                <p className="mb-1.5 text-sm font-medium text-ink">Event Tags</p>
                <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 p-3">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                      className="create-wizard-chip-in inline-flex items-center gap-1 rounded-full bg-soft px-2.5 py-1 text-xs font-semibold text-blue transition hover:bg-blue/10"
                    >
                      {tag} <X size={12} />
                    </button>
                  ))}
                  <input
                    value={tagDraft}
                    onChange={(e) => setTagDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tagDraft.trim()) {
                        e.preventDefault();
                        const next = tagDraft.trim();
                        setTags((prev) => (prev.includes(next) ? prev : [...prev, next]));
                        setTagDraft("");
                      }
                    }}
                    placeholder="Add tag…"
                    className="min-w-[100px] flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
                <p className="mt-1 text-xs text-mute">Press Enter to add. Tags are saved with the event.</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                <p className="text-sm font-semibold text-ink">Event support contacts</p>
                <p className="mt-0.5 text-xs text-mute">
                  Shown as “Need Assistance?” on registration (email / phone).
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Input
                    label="Support email"
                    type="email"
                    required
                    value={contactEmail}
                    error={fieldErrors.contactEmail}
                    placeholder="e.g. events@aca.go.ke"
                    onChange={(e) => {
                      setContactEmail(e.target.value);
                      clearFieldError("contactEmail");
                    }}
                  />
                  <Input
                    label="Support phone"
                    type="tel"
                    required
                    value={contactPhone}
                    error={fieldErrors.contactPhone}
                    placeholder="e.g. 254700000000"
                    onChange={(e) => {
                      setContactPhone(e.target.value);
                      clearFieldError("contactPhone");
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
          <aside className="grid gap-4 self-start">
            <Card
              padded={false}
              key={`preview-${previewPulse}`}
              className="overflow-hidden create-wizard-preview-pulse"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                <p className="text-sm font-bold text-ink">Event Preview</p>
                <button type="button" className="text-xs font-semibold text-blue">
                  View Larger
                </button>
              </div>
              <img src="/assets/admin-banner.jpg" alt="" className="h-28 w-full object-cover" />
              <div className="p-4">
                <p className="font-semibold text-ink line-clamp-2">{title}</p>
                <p className="mt-2 line-clamp-3 text-xs text-mute">{description}</p>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-mute">
                  <CalendarDays size={12} /> Date not set
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-mute">
                  <MapPin size={12} /> Venue not set
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill tone="green">{eventType}</Pill>
                  <Pill tone="blue">{audienceLabel}</Pill>
                </div>
              </div>
            </Card>
            <TipsCard title="Tips for a great event" tips={tips} />
          </aside>
        </div>
      ) : null}

      {step === 3 ? (
        <div key={`step-${step}`} className={cn("grid gap-4 lg:grid-cols-[1.6fr_0.9fr]", stepPanelClass)}>
          <Card className="grid gap-6">
            <section>
              <h2 className="mb-3 flex items-center gap-2 font-bold text-ink">
                <CalendarDays size={18} className="text-blue" /> Event Dates
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Start Date"
                  type="date"
                  required
                  value={startDate}
                  error={fieldErrors.startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    clearFieldError("startDate");
                  }}
                />
                <Input
                  label="End Date"
                  type="date"
                  required
                  value={endDate}
                  error={fieldErrors.endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    clearFieldError("endDate");
                  }}
                />
              </div>
              <div className="mt-3">
                <Toggle
                  checked={allDay}
                  onChange={(next) => {
                    setAllDay(next);
                    clearFieldError("startTime");
                    clearFieldError("endTime");
                  }}
                  label="All day event"
                />
              </div>
            </section>
            <section>
              <h2 className="mb-3 flex items-center gap-2 font-bold text-ink">
                <Clock size={18} className="text-blue" /> Event Time
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Start Time"
                  type="time"
                  required={!allDay}
                  value={startTime}
                  error={fieldErrors.startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    clearFieldError("startTime");
                  }}
                  disabled={allDay}
                />
                <Input
                  label="End Time"
                  type="time"
                  required={!allDay}
                  value={endTime}
                  error={fieldErrors.endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    clearFieldError("endTime");
                  }}
                  disabled={allDay}
                />
              </div>
            </section>
            <section>
              <h2 className="mb-3 flex items-center gap-2 font-bold text-ink">
                <MapPin size={18} className="text-blue" /> Venue Type
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    { id: "in-person", label: "In-Person", desc: "Physical location event", icon: Building2 },
                    { id: "virtual", label: "Virtual", desc: "Online event", icon: Video },
                    { id: "hybrid", label: "Hybrid", desc: "Both in-person and online", icon: Globe },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setVenueMode(m.id);
                      clearFieldError("venueName");
                      clearFieldError("virtualLink");
                      clearFieldError("city");
                    }}
                    className={cn(
                      "create-wizard-choice rounded-lg border p-3 text-left",
                      venueMode === m.id ? "border-blue bg-soft/50 ring-2 ring-blue/20" : "border-slate-200",
                    )}
                  >
                    <m.icon size={18} className="text-blue" />
                    <p className="mt-2 font-semibold text-ink">{m.label}</p>
                    <p className="text-xs text-mute">{m.desc}</p>
                  </button>
                ))}
              </div>
            </section>
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 font-bold text-ink">
                  <Building2 size={18} className="text-blue" /> Venue Details
                </h2>
                <Button variant="outline" size="sm">
                  <MapPin size={14} /> Find venue on map
                </Button>
              </div>
              <div className="grid gap-3">
                <Input
                  label="Venue Name"
                  required={venueMode === "in-person" || venueMode === "hybrid"}
                  value={venueName}
                  error={fieldErrors.venueName}
                  onChange={(e) => {
                    setVenueName(e.target.value);
                    clearFieldError("venueName");
                  }}
                />
                <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input
                    label="City"
                    required={venueMode === "in-person" || venueMode === "hybrid"}
                    value={city}
                    error={fieldErrors.city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      clearFieldError("city");
                    }}
                  />
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-medium text-ink">
                      Country
                      {venueMode === "in-person" || venueMode === "hybrid" ? (
                        <span className="text-red"> *</span>
                      ) : null}
                    </span>
                    <SearchableSelect
                      value={country}
                      onChange={(next) => {
                        setCountry(next);
                        clearFieldError("country");
                      }}
                      options={COUNTRY_CODE_OPTIONS}
                      placeholder="Select country"
                      searchPlaceholder="Search countries…"
                      aria-label="Country"
                    />
                    {fieldErrors.country ? (
                      <span className="text-xs text-red" role="alert">
                        {fieldErrors.country}
                      </span>
                    ) : null}
                  </label>
                  <Input
                    label="Capacity"
                    type="number"
                    min={1}
                    value={capacity}
                    error={fieldErrors.capacity}
                    onChange={(e) => {
                      setCapacity(e.target.value);
                      clearFieldError("capacity");
                    }}
                  />
                </div>
              </div>
            </section>
            {venueMode !== "in-person" ? (
              <section key={venueMode} className="create-wizard-step-forward">
                <h2 className="mb-3 flex items-center gap-2 font-bold text-ink">
                  <Video size={18} className="text-blue" /> Virtual Event Link
                </h2>
                <Input
                  label="Meeting URL"
                  type="url"
                  required
                  value={virtualLink}
                  error={fieldErrors.virtualLink}
                  onChange={(e) => {
                    setVirtualLink(e.target.value);
                    clearFieldError("virtualLink");
                  }}
                />
              </section>
            ) : null}
          </Card>
          <aside className="grid gap-4 self-start">
            <Card
              padded={false}
              key={`preview-venue-${previewPulse}`}
              className="overflow-hidden create-wizard-preview-pulse"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                <p className="text-sm font-bold text-ink">Event Preview</p>
                <button type="button" className="text-xs font-semibold text-blue">
                  View Larger
                </button>
              </div>
              <img
                src="/assets/dashboard-venue.jpg"
                alt={venueName || "Venue preview"}
                className="h-28 w-full object-cover"
              />
              <div className="p-4">
                <p className="font-semibold text-ink line-clamp-2">{title || "Untitled event"}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-mute">
                  <CalendarDays size={12} /> {previewDate}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-mute">
                  <Clock size={12} /> {startTime} – {endTime}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-mute">
                  <MapPin size={12} /> {venueName || "Venue to be announced"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill tone="green">{eventType}</Pill>
                  <Pill tone="blue">
                    {venueMode === "in-person" ? "In-Person" : venueMode === "virtual" ? "Virtual" : "Hybrid"}
                  </Pill>
                </div>
              </div>
            </Card>
            <TipsCard title="Tips for date & venue" tips={tips} />
          </aside>
        </div>
      ) : null}

      {step === 4 ? (
        <div key={`step-${step}`} className={cn("grid gap-4 lg:grid-cols-[1.6fr_0.9fr]", stepPanelClass)}>
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-ink">Program & Sessions</h2>
                <p className="text-sm text-mute">Build your agenda and speaker lineup.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="border-transparent bg-purple-600 text-white hover:bg-purple-700">
                  <Sparkles size={14} /> Generate with AI
                </Button>
                <Button variant="outline" size="sm">
                  Import from template
                </Button>
              </div>
            </div>
            <Tabs
              items={[
                { id: "schedule", label: "Program Schedule" },
                { id: "speakers", label: "Speakers", count: speakers.length },
                { id: "sponsorship", label: "Sponsorship Packages", count: packages.length },
              ]}
              value={programTab}
              onChange={setProgramTab}
            />
            {programTab === "schedule" ? (
              <div className="mt-4">
                {!startDate ? (
                  <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Set the event start and end dates in Date & Venue first. Program days are generated from that range.
                  </p>
                ) : null}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {programDays.length ? (
                    programDays.map((d) => (
                      <button
                        key={d.index}
                        type="button"
                        onClick={() => setDay(String(d.index))}
                        className={cn(
                          "create-wizard-choice rounded-lg border px-3 py-2 text-left text-sm font-semibold",
                          day === String(d.index)
                            ? "border-blue bg-soft text-blue"
                            : "border-slate-200 bg-white text-mute hover:border-blue/40",
                        )}
                      >
                        Day {d.index}
                        <span className="mt-0.5 block text-xs font-normal text-mute">{d.label}</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-mute">No program days yet.</p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!startDate}
                    onClick={() => setExtraProgramDays((n) => n + 1)}
                  >
                    <Plus size={14} /> Add Day
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => setAgendaPreviewOpen(true)}
                  >
                    <Eye size={14} /> Preview Agenda
                  </Button>
                </div>
                {daySessions.length ? (
                  <ul className="relative grid gap-0 before:absolute before:top-3 before:bottom-3 before:left-[7px] before:w-px before:bg-slate-200">
                    {daySessions.map((s) => (
                      <li key={s.id} className="relative flex gap-3 border-b border-slate-100 py-3 last:border-b-0">
                        <span
                          className={cn(
                            "relative z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white",
                            s.tone === "green"
                              ? "bg-green"
                              : s.tone === "purple"
                                ? "bg-purple-600"
                                : "bg-orange-500",
                          )}
                          aria-hidden
                        />
                        <div className="w-36 shrink-0 text-xs text-mute">{s.time}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-ink">{s.title}</p>
                            <Pill tone={s.tone === "green" ? "green" : s.tone === "purple" ? "purple" : "orange"}>
                              {s.badge}
                            </Pill>
                          </div>
                          <p className="mt-1 text-sm text-mute">{s.description}</p>
                          <p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-mute">
                            <span className="inline-flex items-center gap-1">
                              <Users size={12} /> {s.speakers} speakers
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={12} /> {s.place}
                            </span>
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            className="grid h-8 w-8 place-items-center rounded-lg text-mute hover:bg-slate-100 hover:text-blue"
                            aria-label={`Edit ${s.title}`}
                            onClick={() => openEditSession(s)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className="grid h-8 w-8 place-items-center rounded-lg text-mute hover:bg-slate-100"
                            aria-label="Duplicate"
                            onClick={() =>
                              setSessions((prev) => [
                                ...prev,
                                {
                                  ...s,
                                  id: `s${Date.now()}`,
                                  title: `${s.title} (copy)`,
                                },
                              ])
                            }
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            type="button"
                            className="grid h-8 w-8 place-items-center rounded-lg text-red hover:bg-red-50"
                            aria-label="Delete"
                            onClick={() => setSessions((prev) => prev.filter((x) => x.id !== s.id))}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-mute">
                    No sessions for Day {day}
                    {programDays.find((d) => String(d.index) === day)
                      ? ` (${programDays.find((d) => String(d.index) === day)?.label})`
                      : ""}
                    . Add one below.
                  </p>
                )}
                <Button
                  variant="outline"
                  className="mt-4"
                  disabled={!startDate}
                  onClick={openAddSession}
                >
                  <Plus size={16} /> Add Session
                </Button>
              </div>
            ) : programTab === "speakers" ? (
              <div className="mt-4">
                <ul className="grid gap-3">
                  {speakers.map((sp) => (
                    <li key={sp.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                      {sp.photo ? (
                        <img
                          src={resourcePublicUrl(sp.photo)}
                          alt=""
                          className="h-12 w-10 shrink-0 rounded-md border border-slate-200 object-cover object-top"
                        />
                      ) : (
                        <span className="grid h-12 w-10 shrink-0 place-items-center rounded-md bg-soft text-sm font-bold text-blue">
                          {sp.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink">{sp.name}</p>
                        <p className="text-xs text-mute">
                          {sp.role} · {sp.org}
                        </p>
                        <p className="text-xs text-blue">{sp.topic}</p>
                      </div>
                      <button
                        type="button"
                        className="grid h-8 w-8 place-items-center rounded-lg text-red hover:bg-red-50"
                        aria-label={`Remove ${sp.name}`}
                        onClick={() => setSpeakers((prev) => prev.filter((x) => x.id !== sp.id))}
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    clearSpeakerPhoto();
                    setSpeakerModal(true);
                  }}
                >
                  <Plus size={16} /> Add Speaker
                </Button>
              </div>
            ) : (
              <div className="mt-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="flex items-center gap-2 font-bold text-ink">
                      <Handshake size={18} className="text-blue" /> Sponsorship Packages
                    </h3>
                    <p className="text-sm text-mute">
                      Create and manage sponsorship packages for your event.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      Import from template
                    </Button>
                    <Button size="sm" onClick={() => setPackageModal(true)}>
                      <Plus size={14} /> Add Package
                    </Button>
                  </div>
                </div>
                <ul className="grid gap-3">
                  {packages.map((pkg) => (
                    <li
                      key={pkg.id}
                      className="flex flex-wrap items-start gap-3 rounded-lg border border-slate-200 p-3"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-soft text-[10px] font-extrabold uppercase text-blue">
                        {pkg.name.split(" ")[0].slice(0, 4)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink">{pkg.name}</p>
                        <p className="text-xs text-mute">{pkg.subtitle}</p>
                        <p className="mt-1 text-sm font-bold text-ink">
                          KES {pkg.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-mute">{pkg.availability}</p>
                        <ul className="mt-2 grid gap-1 text-xs text-mute">
                          {pkg.benefits.map((b) => (
                            <li key={b} className="flex gap-1.5">
                              <Check size={12} className="mt-0.5 shrink-0 text-green" /> {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center gap-2">
                        <Toggle
                          checked={pkg.active}
                          onChange={(next) =>
                            setPackages((prev) =>
                              prev.map((p) => (p.id === pkg.id ? { ...p, active: next } : p)),
                            )
                          }
                          label={pkg.active ? "Active" : "Inactive"}
                        />
                        <button
                          type="button"
                          className="grid h-8 w-8 place-items-center rounded-lg text-red hover:bg-red-50"
                          aria-label={`Delete ${pkg.name}`}
                          onClick={() => setPackages((prev) => prev.filter((p) => p.id !== pkg.id))}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
          <aside className="grid gap-4 self-start">
            <Card>
              <h3 className="flex items-center gap-2 font-bold text-ink">
                <Sparkles size={18} className="text-blue" /> AI Program Generator
              </h3>
              <div className="mt-4 grid gap-3">
                <Select
                  label="Program length"
                  value={String(Math.max(1, programDays.length || 1))}
                  onChange={(e) => {
                    const next = Math.max(1, Number(e.target.value) || 1);
                    const rangeLen =
                      enumerateEventDays(startDate, endDate || startDate).length || 1;
                    setExtraProgramDays(Math.max(0, next - rangeLen));
                  }}
                  options={Array.from({ length: 7 }, (_, i) => {
                    const n = i + 1;
                    return { value: String(n), label: n === 1 ? "1 Day" : `${n} Days` };
                  })}
                />
                <fieldset className="grid gap-2 text-sm">
                  <legend className="font-medium text-ink">Include session types</legend>
                  {["Keynotes", "Panel discussions", "Workshops", "Breakout sessions", "Networking sessions"].map(
                    (label, i) => (
                      <label key={label} className="flex items-center gap-2 text-mute">
                        <input type="checkbox" defaultChecked={i < 4} className="rounded border-slate-300" />
                        {label}
                      </label>
                    ),
                  )}
                </fieldset>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-ink">Tone & focus (optional)</span>
                  <textarea
                    rows={3}
                    placeholder="e.g. Focus on regional enforcement collaboration"
                    className="rounded-lg border border-slate-200 px-3 py-2 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
                  />
                </label>
                <Button className="bg-gradient-to-r from-purple-600 to-blue">
                  <Sparkles size={16} /> Generate Program
                </Button>
              </div>
            </Card>
            <TipsCard
              title="Tips for a great program"
              tips={[
                "Balance keynotes with interactive sessions.",
                "Leave breaks between dense blocks.",
                "Assign rooms early to avoid clashes.",
              ]}
            />
          </aside>
        </div>
      ) : null}

      {step === 5 ? (
        <div key={`step-${step}`} className={cn("grid gap-4 lg:grid-cols-[1.6fr_0.9fr]", stepPanelClass)}>
          <div className="grid gap-4">
            <Card>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-ink">Registration</h2>
                <Button variant="outline" size="sm">
                  <Sparkles size={14} /> Generate with AI
                </Button>
              </div>
              <ul className="grid gap-3">
                {tickets.map((t) => (
                  <li
                    key={t.id}
                    className={cn(
                      "flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 border-l-4 p-3",
                      t.tone === "green" && "border-l-green",
                      t.tone === "blue" && "border-l-blue",
                      t.tone === "orange" && "border-l-orange-500",
                    )}
                  >
                    <GripVertical size={16} className="text-mute" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{t.name}</p>
                      <p className="text-sm text-mute">
                        {t.price} · Capacity {t.capacity}
                      </p>
                      <p className="text-xs text-mute">{t.period}</p>
                    </div>
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center rounded-lg text-red hover:bg-red-50"
                      aria-label={`Remove ${t.name}`}
                      onClick={() => setTickets((prev) => prev.filter((x) => x.id !== t.id))}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() =>
                  setTickets((prev) => [
                    ...prev,
                    {
                      id: `t${prev.length + 1}`,
                      name: "Student",
                      price: "KES 3,000",
                      capacity: 80,
                      period: previewDate === "Date not set" ? "Registration open" : previewDate,
                      tone: "blue",
                    },
                  ])
                }
              >
                <Plus size={16} /> Add Ticket Type
              </Button>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <h3 className="font-bold text-ink">Registration Settings</h3>
                <div className="mt-4 grid gap-4">
                  <Toggle checked={requireApproval} onChange={setRequireApproval} label="Require approval for registrations" />
                  <Toggle checked={deadlineOn} onChange={setDeadlineOn} label="Set registration deadline" />
                  {deadlineOn ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label="Deadline date" type="date" defaultValue="2026-11-14" />
                      <Input label="Deadline time" type="time" defaultValue="23:59" />
                    </div>
                  ) : null}
                  <Toggle checked={limitOn} onChange={setLimitOn} label="Limit total registrations" />
                  {limitOn ? (
                    <Input
                      label="Capacity"
                      type="number"
                      min={1}
                      value={capacity}
                      error={fieldErrors.capacity}
                      onChange={(e) => {
                        setCapacity(e.target.value);
                        clearFieldError("capacity");
                      }}
                    />
                  ) : null}
                  <Toggle checked={waitlist} onChange={setWaitlist} label="Enable waitlist when full" />
                  <Toggle checked={confirmEmail} onChange={setConfirmEmail} label="Send confirmation email" />
                  <Toggle
                    checked={collectExtra}
                    onChange={setCollectExtra}
                    label="Collect additional information"
                    description="Configure fields"
                  />
                </div>
              </Card>
              <Card>
                <h3 className="font-bold text-ink">Payment Options</h3>
                <ul
                  className={cn(
                    "mt-4 grid gap-3 text-sm",
                    fieldErrors.payFree && "rounded-lg ring-2 ring-red/30",
                  )}
                >
                  {(
                    [
                      { label: "M-Pesa", checked: payMpesa, set: setPayMpesa },
                      { label: "Card Payments (Stripe/Paystack)", checked: payCard, set: setPayCard },
                      { label: "Bank Transfer", checked: payBank, set: setPayBank },
                      { label: "Free Registration", checked: payFree, set: setPayFree },
                    ] as const
                  ).map((p) => (
                    <li key={p.label} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2">
                      <label className="flex items-center gap-2 font-medium text-ink">
                        <input
                          type="checkbox"
                          checked={p.checked}
                          onChange={(e) => {
                            p.set(e.target.checked);
                            clearFieldError("payFree");
                          }}
                          className="rounded border-slate-300"
                        />
                        {p.label}
                      </label>
                      {p.label !== "Free Registration" ? (
                        <button type="button" className="text-xs font-semibold text-blue">
                          Configure
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
                {fieldErrors.payFree ? (
                  <p className="mt-2 text-xs text-red" role="alert">
                    {fieldErrors.payFree}
                  </p>
                ) : null}
              </Card>
            </div>
          </div>
          <aside className="grid gap-4 self-start">
            <Card
              padded={false}
              key={`preview-reg-${previewPulse}`}
              className="overflow-hidden create-wizard-preview-pulse"
            >
              <img src="/assets/admin-banner.jpg" alt="" className="h-28 w-full object-cover" />
              <div className="p-4">
                <p className="font-semibold text-ink line-clamp-2">{title}</p>
                <p className="mt-2 text-xs text-mute">{previewDate}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill tone="green">{eventType}</Pill>
                  <Pill tone="blue">In-Person</Pill>
                </div>
              </div>
            </Card>
            <TipsCard title="Tips for registration" tips={tips} />
          </aside>
        </div>
      ) : null}

      {step === 6 ? (
        <div key={`step-${step}`} className={cn("grid gap-4 lg:grid-cols-[1.6fr_0.9fr]", stepPanelClass)}>
          <Card className="grid gap-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-ink">Media & Publish</h2>
              <Button variant="outline" size="sm">
                <Sparkles size={14} /> Generate with AI
              </Button>
            </div>
            <section>
              <h3 className="mb-2 font-semibold text-ink">Event Banner</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <Upload size={24} className="text-mute" />
                  <p className="text-sm text-mute">Recommended 1920 × 600</p>
                  <Button variant="outline" size="sm">
                    Upload Image
                  </Button>
                </div>
                <div className="relative overflow-hidden rounded-lg">
                  <img src="/assets/admin-banner.jpg" alt="Selected banner" className="h-40 w-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-red"
                    aria-label="Remove banner"
                  >
                    <Trash2 size={14} />
                  </button>
                  <Button variant="outline" size="sm" className="absolute right-2 bottom-2 bg-white">
                    <Pencil size={14} /> Change Image
                  </Button>
                </div>
              </div>
            </section>
            <section>
              <h3 className="mb-2 font-semibold text-ink">Gallery Images (Optional)</h3>
              <div className="flex flex-wrap gap-3">
                {["/placeholders/venue.jpg", "/assets/dashboard-venue.jpg", "/assets/hero-nairobi.jpg"].map((src) => (
                  <div key={src} className="relative h-20 w-28 overflow-hidden rounded-lg">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-white/90 text-mute"
                      aria-label="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="grid h-20 w-28 place-items-center rounded-lg border border-dashed border-slate-300 text-mute"
                  aria-label="Add gallery image"
                >
                  <Plus size={20} />
                </button>
              </div>
            </section>
            <section>
              <h3 className="mb-2 font-semibold text-ink">Event Branding</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <Select
                  label="Primary Color"
                  defaultValue="green"
                  options={[
                    { value: "green", label: "#096a2e" },
                    { value: "blue", label: "#0B45E0" },
                    { value: "navy", label: "#0A2A7A" },
                  ]}
                />
                <Select
                  label="Secondary Color"
                  defaultValue="sky"
                  options={[
                    { value: "sky", label: "#0ea5e9" },
                    { value: "soft", label: "#EEF3FF" },
                  ]}
                />
                <Select
                  label="Font"
                  defaultValue="inter"
                  options={[
                    { value: "inter", label: "Inter" },
                    { value: "system", label: "System" },
                  ]}
                />
              </div>
            </section>
            <section>
              <h3 className="mb-2 font-semibold text-ink">Social Media & Links</h3>
              <p className="mb-3 text-sm text-mute">Shown on the event details page.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Event Website"
                  type="url"
                  placeholder="https://"
                  value={websiteUrl}
                  error={fieldErrors.websiteUrl}
                  onChange={(e) => {
                    setWebsiteUrl(e.target.value);
                    clearFieldError("websiteUrl");
                  }}
                />
                <Input
                  label="Facebook"
                  type="url"
                  placeholder="https://facebook.com/…"
                  value={facebookUrl}
                  error={fieldErrors.facebookUrl}
                  onChange={(e) => {
                    setFacebookUrl(e.target.value);
                    clearFieldError("facebookUrl");
                  }}
                />
                <Input
                  label="X (Twitter)"
                  type="url"
                  placeholder="https://x.com/…"
                  value={twitterUrl}
                  error={fieldErrors.twitterUrl}
                  onChange={(e) => {
                    setTwitterUrl(e.target.value);
                    clearFieldError("twitterUrl");
                  }}
                />
                <Input
                  label="LinkedIn"
                  type="url"
                  placeholder="https://linkedin.com/…"
                  value={linkedinUrl}
                  error={fieldErrors.linkedinUrl}
                  onChange={(e) => {
                    setLinkedinUrl(e.target.value);
                    clearFieldError("linkedinUrl");
                  }}
                />
              </div>
            </section>
            <section>
              <h3 className="mb-2 font-semibold text-ink">Visibility & Publish</h3>
              <div className="grid gap-2">
                {(
                  [
                    { id: "public", label: "Public", desc: "Visible to everyone.", icon: Globe },
                    { id: "private", label: "Private", desc: "Only invited participants can view.", icon: Lock },
                    { id: "unlisted", label: "Unlisted", desc: "Visible via direct link only.", icon: Link2 },
                  ] as const
                ).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVisibility(v.id)}
                    className={cn(
                      "create-wizard-choice flex items-start gap-3 rounded-lg border p-3 text-left",
                      visibility === v.id ? "border-blue bg-soft/40" : "border-slate-200",
                    )}
                  >
                    <v.icon size={18} className="mt-0.5 text-blue" />
                    <span>
                      <span className="block font-semibold text-ink">{v.label}</span>
                      <span className="text-sm text-mute">{v.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <Toggle
                  checked={saveDraft}
                  onChange={setSaveDraft}
                  label="Save as Draft"
                  description="Keeps the event unpublished. Use Save as Draft in the footer anytime, or Publish Event when ready."
                />
              </div>
            </section>
          </Card>
          <aside className="self-start">
            <Card
              padded={false}
              key={`preview-publish-${previewPulse}`}
              className="overflow-hidden create-wizard-preview-pulse"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                <p className="text-sm font-bold text-ink">Event Preview</p>
                <button type="button" className="text-xs font-semibold text-blue">
                  View Full Event Page
                </button>
              </div>
              <img src="/assets/admin-banner.jpg" alt="" className="h-32 w-full object-cover" />
              <div className="p-4">
                <Pill tone="green">{eventType}</Pill>
                <p className="mt-2 font-semibold text-ink">{title}</p>
                <ul className="mt-3 grid gap-1.5 text-xs text-mute">
                  <li className="flex items-center gap-1.5">
                    <CalendarDays size={12} /> {previewDate}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Clock size={12} /> {startTime} – {endTime}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <MapPin size={12} /> {venueName}
                  </li>
                </ul>
                <p className="mt-3 line-clamp-3 text-sm text-mute">{description}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-soft p-2 font-semibold text-blue">
                    {sessions.length} Sessions
                  </div>
                  <div className="rounded-lg bg-purple-50 p-2 font-semibold text-purple-700">
                    {speakers.length} Speakers
                  </div>
                  <div className="rounded-lg bg-navy/5 p-2 font-semibold text-navy">{capacity} Capacity</div>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur transition-[box-shadow] duration-200 md:left-[220px] lg:left-[240px] shadow-[0_-8px_24px_rgba(15,40,90,0.06)]">
        <div className="flex w-full flex-col gap-2 px-4 py-3 md:px-6 lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link to="/admin/events">
              <Button variant="outline" disabled={submitting}>
                Cancel
              </Button>
            </Link>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" disabled={step <= 1 || submitting} onClick={goPrev}>
                <ArrowLeft size={16} /> Previous
              </Button>
              <Button
                variant="outline"
                disabled={submitting || loadingEdit || Boolean(loadError)}
                onClick={() => void submitEvent(true)}
              >
                <Save size={16} />
                {submitting && saveDraft ? "Saving draft…" : "Save as Draft"}
              </Button>
              {step === 6 ? (
                <Button
                  disabled={submitting || loadingEdit || Boolean(loadError)}
                  onClick={() => void submitEvent(false)}
                >
                  <Send size={16} />
                  {submitting && !saveDraft
                    ? isEdit
                      ? "Saving…"
                      : "Publishing…"
                    : isEdit
                      ? "Save & Publish"
                      : "Publish Event"}
                </Button>
              ) : (
                <Button onClick={() => void goNext()} disabled={submitting || loadingEdit || Boolean(loadError)}>
                  Next <ArrowRight size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={agendaPreviewOpen}
        onClose={() => setAgendaPreviewOpen(false)}
        title="Agenda preview"
        className="md:max-w-2xl"
        footer={
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setAgendaPreviewOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <div className="rounded-lg border border-slate-100 bg-soft/60 px-3 py-2 text-sm text-mute">
            <p className="font-semibold text-ink">{title.trim() || "Untitled event"}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={12} /> {previewDate}
              </span>
              {venueName ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} /> {venueName}
                </span>
              ) : null}
              <span>
                {sessions.length} session{sessions.length === 1 ? "" : "s"} ·{" "}
                {agendaByDay.length} day{agendaByDay.length === 1 ? "" : "s"}
              </span>
            </p>
          </div>

          {sessions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-mute">
              No sessions added yet. Use Add Session on each day to build the agenda.
            </p>
          ) : (
            agendaByDay.map((d) => (
              <section key={d.index} className="rounded-lg border border-slate-200 overflow-hidden">
                <header className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
                  <div>
                    <p className="text-sm font-bold text-ink">Day {d.index}</p>
                    <p className="text-xs text-mute">{d.label}</p>
                  </div>
                  <span className="text-xs font-semibold text-mute">
                    {d.sessions.length} session{d.sessions.length === 1 ? "" : "s"}
                  </span>
                </header>
                {d.sessions.length ? (
                  <ul className="divide-y divide-slate-100">
                    {d.sessions.map((s) => (
                      <li key={s.id} className="flex gap-3 px-3 py-3">
                        <div className="w-28 shrink-0 text-xs font-semibold text-blue">{s.time}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-ink">{s.title}</p>
                            <Pill
                              tone={
                                s.tone === "green"
                                  ? "green"
                                  : s.tone === "purple"
                                    ? "purple"
                                    : s.tone === "blue"
                                      ? "blue"
                                      : "orange"
                              }
                            >
                              {s.badge}
                            </Pill>
                          </div>
                          {s.description ? (
                            <p className="mt-1 text-sm text-mute">{s.description}</p>
                          ) : null}
                          <p className="mt-1.5 flex flex-wrap gap-3 text-xs text-mute">
                            <span className="inline-flex items-center gap-1">
                              <Users size={12} /> {s.speakers} speakers
                            </span>
                            {s.place ? (
                              <span className="inline-flex items-center gap-1">
                                <MapPin size={12} /> {s.place}
                              </span>
                            ) : null}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-3 py-4 text-sm text-mute">No sessions scheduled for this day.</p>
                )}
              </section>
            ))
          )}
        </div>
      </Modal>

      <Modal
        open={sessionModal}
        onClose={() => {
          setSessionModal(false);
          resetSessionForm();
        }}
        title={
          editingSessionId
            ? `Edit Session — Day ${newSessionDay}${
                programDays.find((d) => String(d.index) === newSessionDay)
                  ? ` (${programDays.find((d) => String(d.index) === newSessionDay)?.label})`
                  : ""
              }`
            : `Add Session — Day ${newSessionDay || day}${
                programDays.find((d) => String(d.index) === (newSessionDay || day))
                  ? ` (${programDays.find((d) => String(d.index) === (newSessionDay || day))?.label})`
                  : ""
              }`
        }
        className="md:max-w-lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSessionModal(false);
                resetSessionForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveSessionFromModal}>
              {editingSessionId ? "Save changes" : "Save Session"}
            </Button>
          </div>
        }
      >
        <div className="grid gap-3">
          <Input
            label="Session title"
            required
            value={newSessionTitle}
            onChange={(e) => setNewSessionTitle(e.target.value)}
            placeholder="e.g. Closing Remarks"
          />
          <Select
            label="Day"
            value={newSessionDay}
            onChange={(e) => setNewSessionDay(e.target.value)}
            options={
              programDays.length
                ? programDays.map((d) => ({
                    value: String(d.index),
                    label: `Day ${d.index} (${d.label})`,
                  }))
                : [{ value: day || "1", label: `Day ${day || "1"}` }]
            }
          />
          <Select
            label="Session type"
            value={newSessionType}
            onChange={(e) => setNewSessionType(e.target.value)}
            options={(() => {
              const base = [
                "Keynote",
                "Panel Discussion",
                "Panel",
                "Workshop",
                "Roundtable",
                "Ceremony",
                "Registration",
                "Session",
                "Break",
              ];
              const list = base.includes(newSessionType) ? base : [...base, newSessionType];
              return list.map((value) => ({ value, label: value }));
            })()}
          />
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-ink">Description</span>
            <textarea
              value={newSessionDesc}
              onChange={(e) => setNewSessionDesc(e.target.value)}
              rows={3}
              placeholder="Brief session description…"
              className="rounded-lg border border-slate-200 px-3 py-2.5 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Start time"
              type="time"
              value={newSessionStart}
              onChange={(e) => setNewSessionStart(e.target.value)}
            />
            <Input
              label="End time"
              type="time"
              value={newSessionEnd}
              onChange={(e) => setNewSessionEnd(e.target.value)}
            />
          </div>
          <Input
            label="Venue / room"
            value={newSessionVenue}
            onChange={(e) => setNewSessionVenue(e.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Speakers"
              type="number"
              min={0}
              value={newSessionSpeakers}
              onChange={(e) => setNewSessionSpeakers(e.target.value)}
            />
            <Input
              label="Capacity"
              type="number"
              value={newSessionCapacity}
              onChange={(e) => setNewSessionCapacity(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={speakerModal}
        onClose={() => {
          if (uploadingSpeakerPhoto) return;
          setSpeakerModal(false);
          clearSpeakerPhoto();
        }}
        title="Add Speaker"
        className="md:max-w-lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={uploadingSpeakerPhoto}
              onClick={() => {
                setSpeakerModal(false);
                clearSpeakerPhoto();
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={uploadingSpeakerPhoto}
              onClick={async () => {
                if (!newSpeakerName.trim()) {
                  toast.error("Enter the speaker’s name.");
                  return;
                }
                if (!newSpeakerPhotoFile) {
                  toast.error("Upload a passport photo for the speaker.");
                  return;
                }
                const role = newSpeakerRole.trim() || "Speaker";
                const org = newSpeakerOrg.trim() || "TBD";
                const category = newSpeakerCategory || "panelist";
                const badgeMap: Record<string, string> = {
                  keynote: "Keynote Speaker",
                  panelist: "Panelist",
                  moderator: "Moderator",
                  government: "Government Representative",
                };
                const name = newSpeakerName.trim();
                setUploadingSpeakerPhoto(true);
                try {
                  const uploaded = await uploadResource(newSpeakerPhotoFile);
                  const photoId = uploaded.resourceID?.trim();
                  console.log("[speaker photo upload]", {
                    resourceID: uploaded.resourceID,
                    resourcePath: uploaded.resourcePath,
                    url: uploaded.url,
                    photoId,
                  });
                  if (!photoId) {
                    toast.error("Upload succeeded but no photo id was returned.");
                    return;
                  }
                  const speakerRow = {
                    id: `sp${Date.now()}`,
                    name,
                    role,
                    org,
                    roleLines: [role, org],
                    topic: newSpeakerTopic.trim() || "To be announced",
                    category,
                    badge: badgeMap[category] || "Speaker",
                    country: newSpeakerCountry.trim() || "",
                    flag: "",
                    photo: photoId,
                    bio: "",
                  };
                  console.log("[speaker saved to array]", speakerRow);
                  setSpeakers((prev) => [...prev, speakerRow]);
                  setNewSpeakerName("");
                  setNewSpeakerRole("");
                  setNewSpeakerOrg("");
                  setNewSpeakerTopic("");
                  setNewSpeakerCategory("keynote");
                  setNewSpeakerCountry("");
                  clearSpeakerPhoto();
                  setSpeakerModal(false);
                  toast.success(`${name} added as speaker`);
                } catch (err) {
                  const message =
                    err instanceof ApiError
                      ? err.message
                      : err instanceof Error
                        ? err.message
                        : "Could not upload the passport photo.";
                  toast.error(message);
                } finally {
                  setUploadingSpeakerPhoto(false);
                }
              }}
            >
              {uploadingSpeakerPhoto ? "Uploading…" : "Save Speaker"}
            </Button>
          </div>
        }
      >
        <div className="grid gap-3">
          <div>
            <p className="mb-1.5 text-sm font-medium text-ink">
              Passport photo <span className="text-red">*</span>
            </p>
            <ImagePicker
              imageKey="speaker-passport.jpg"
              value={newSpeakerPhotoPreview}
              onChange={(file) => {
                if (!file) {
                  clearSpeakerPhoto();
                  return;
                }
                const previewUrl = URL.createObjectURL(file);
                setNewSpeakerPhotoPreview((prev) => {
                  if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
                  return previewUrl;
                });
                setNewSpeakerPhotoFile(file);
              }}
            />
            <p className="mt-2 text-xs text-mute">
              Clear front-facing passport-style photo. Crop to frame the face before saving.
            </p>
          </div>
          <Input
            label="Full name"
            required
            value={newSpeakerName}
            onChange={(e) => setNewSpeakerName(e.target.value)}
            placeholder="e.g. Jane Doe"
          />
          <Input
            label="Role / title"
            value={newSpeakerRole}
            onChange={(e) => setNewSpeakerRole(e.target.value)}
            placeholder="e.g. Director General"
          />
          <Input
            label="Organisation"
            value={newSpeakerOrg}
            onChange={(e) => setNewSpeakerOrg(e.target.value)}
            placeholder="e.g. Anti-Counterfeit Authority"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Speaker type"
              value={newSpeakerCategory}
              onChange={(e) => setNewSpeakerCategory(e.target.value)}
              options={[
                { value: "keynote", label: "Keynote Speaker" },
                { value: "panelist", label: "Panelist" },
                { value: "moderator", label: "Moderator" },
                { value: "government", label: "Government Representative" },
              ]}
            />
            <Input
              label="Country"
              value={newSpeakerCountry}
              onChange={(e) => setNewSpeakerCountry(e.target.value)}
              placeholder="e.g. Kenya"
            />
          </div>
          <Input
            label="Session / topic"
            value={newSpeakerTopic}
            onChange={(e) => setNewSpeakerTopic(e.target.value)}
            placeholder="e.g. Future of IP Enforcement"
          />
        </div>
      </Modal>

      <Modal
        open={packageModal}
        onClose={() => setPackageModal(false)}
        title="Add Sponsorship Package"
        className="md:max-w-lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPackageModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!pkgName.trim() || !pkgPrice.trim()) {
                  toast.error("Enter package name and price.");
                  return;
                }
                const name = pkgName.trim();
                setPackages((prev) => [
                  ...prev,
                  {
                    id: `pkg${prev.length + 1}`,
                    name,
                    subtitle: pkgDesc.trim() || "Custom sponsorship package",
                    price: Number(pkgPrice) || 0,
                    availability: `${pkgAvail} Available`,
                    benefits: pkgBenefits.filter(Boolean),
                    active: true,
                    tone: "orange" as const,
                  },
                ]);
                setPkgName("");
                setPkgPrice("");
                setPkgDesc("");
                setPkgAvail("1");
                setPkgBenefits(["Logo on main stage backdrop"]);
                setPackageModal(false);
                setProgramTab("sponsorship");
                toast.success(`${name} package added`);
              }}
            >
              Save Package
            </Button>
          </div>
        }
      >
        <div className="grid gap-3">
          <p className="text-sm text-mute">Create a new sponsorship package for your event.</p>
          <Input
            label="Package Name"
            required
            value={pkgName}
            onChange={(e) => setPkgName(e.target.value)}
            placeholder="e.g. Platinum Sponsor"
          />
          <Input
            label="Price (KES)"
            required
            type="number"
            value={pkgPrice}
            onChange={(e) => setPkgPrice(e.target.value)}
            placeholder="e.g. 1000000"
          />
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-ink">
              Description <span className="text-red">*</span>
            </span>
            <textarea
              value={pkgDesc}
              onChange={(e) => setPkgDesc(e.target.value)}
              rows={3}
              placeholder="Brief description of the package and its value…"
              className="rounded-lg border border-slate-200 px-3 py-2.5 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
            />
          </label>
          <Input
            label="Availability"
            required
            value={pkgAvail}
            onChange={(e) => setPkgAvail(e.target.value)}
            placeholder="1"
          />
          <div>
            <p className="mb-1.5 text-sm font-medium text-ink">
              Key Benefits <span className="text-red">*</span>
            </p>
            <div className="grid gap-2">
              {pkgBenefits.map((b, i) => (
                <Input
                  key={i}
                  label={`Benefit ${i + 1}`}
                  value={b}
                  onChange={(e) =>
                    setPkgBenefits((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))
                  }
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setPkgBenefits((prev) => [...prev, ""])}
            >
              <Plus size={14} /> Add Benefit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TipsCard({ title, tips }: { title: string; tips: string[] }) {
  return (
    <Card className="bg-soft border-blue/10">
      <p className="flex items-center gap-2 font-bold text-blue">
        <Lightbulb size={18} /> {title}
      </p>
      <ul className="mt-3 grid gap-2 create-wizard-stagger">
        {tips.map((t) => (
          <li key={t} className="flex gap-2 text-sm text-ink">
            <Check size={14} className="mt-0.5 shrink-0 text-blue" /> {t}
          </li>
        ))}
      </ul>
    </Card>
  );
}
