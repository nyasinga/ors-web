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
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Pill } from "../../components/ui/Pill";
import { Select } from "../../components/ui/Select";
import { Stepper } from "../../components/ui/Stepper";
import { Tabs } from "../../components/ui/Tabs";
import { Toggle } from "../../components/ui/Toggle";
import {
  createWizardSteps,
  draftProgrammeSessions,
  draftSpeakers,
  draftSponsorshipPackages,
  draftTickets,
  eventTypeOptions,
} from "../../data/adminEvents";
import { ApiError } from "../../lib/api";
import {
  buildEngagementPayload,
  createEngagement,
  engagementToWizardState,
  getEngagement,
  updateEngagement,
} from "../../lib/engagements";
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

/** Screen E Create / Edit Event 1–6 */
export function CreateEventPage() {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const editId = routeId && routeId !== "new" ? routeId : null;
  const isEdit = Boolean(editId);

  const [step, setStep] = useState(1);
  const [loadingEdit, setLoadingEdit] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [eventType, setEventType] = useState("Conference");
  const [title, setTitle] = useState(
    "3rd International Symposium on Intellectual Property Protection and Enforcement",
  );
  const [description, setDescription] = useState(
    "A premier forum bringing together regulators, industry and academia to strengthen IP protection and enforcement across Africa.",
  );
  const [category, setCategory] = useState("legal");
  const [audience, setAudience] = useState("government");
  const [tone, setTone] = useState("professional");
  const [language, setLanguage] = useState("en");
  const [tags, setTags] = useState([
    "Intellectual Property",
    "Enforcement",
    "Policy",
    "Innovation",
    "Regional Collaboration",
  ]);
  const [tagDraft, setTagDraft] = useState("");
  const [startDate, setStartDate] = useState("2026-11-15");
  const [endDate, setEndDate] = useState("2026-11-17");
  const [allDay, setAllDay] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [venueMode, setVenueMode] = useState<"in-person" | "virtual" | "hybrid">("in-person");
  const [venueName, setVenueName] = useState("Kenyatta International Convention Centre (KICC)");
  const [address, setAddress] = useState("Harambee Ave, Nairobi, Kenya");
  const [city, setCity] = useState("Nairobi");
  const [country, setCountry] = useState("KE");
  const [capacity, setCapacity] = useState("500");
  const [virtualLink, setVirtualLink] = useState("https://meet.google.com/xxx-xxxx-xxx");
  const [programTab, setProgramTab] = useState("schedule");
  const [day, setDay] = useState("1");
  const [sessions, setSessions] = useState(draftProgrammeSessions);
  const [speakers, setSpeakers] = useState(draftSpeakers);
  const [packages, setPackages] = useState(
    draftSponsorshipPackages.map((p) => ({ ...p, benefits: [...p.benefits] })),
  );
  const [tickets, setTickets] = useState(draftTickets);
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
  const [sessionModal, setSessionModal] = useState(false);
  const [speakerModal, setSpeakerModal] = useState(false);
  const [packageModal, setPackageModal] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [newSessionDesc, setNewSessionDesc] = useState("");
  const [newSessionType, setNewSessionType] = useState("Session");
  const [newSessionStart, setNewSessionStart] = useState("14:00");
  const [newSessionEnd, setNewSessionEnd] = useState("15:00");
  const [newSessionVenue, setNewSessionVenue] = useState("Tsavo Ballroom");
  const [newSessionCapacity, setNewSessionCapacity] = useState("200");
  const [newSpeakerName, setNewSpeakerName] = useState("");
  const [newSpeakerRole, setNewSpeakerRole] = useState("");
  const [newSpeakerOrg, setNewSpeakerOrg] = useState("");
  const [newSpeakerTopic, setNewSpeakerTopic] = useState("");
  const [newSpeakerCategory, setNewSpeakerCategory] = useState("keynote");
  const [newSpeakerCountry, setNewSpeakerCountry] = useState("");
  const [pkgName, setPkgName] = useState("");
  const [pkgPrice, setPkgPrice] = useState("");
  const [pkgDesc, setPkgDesc] = useState("");
  const [pkgAvail, setPkgAvail] = useState("1");
  const [pkgBenefits, setPkgBenefits] = useState(["Logo on main stage backdrop"]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
        setDescription(state.description);
        setCategory(state.category);
        setAudience(state.audience);
        setTone(state.tone);
        setLanguage(state.language);
        setTags(state.tags.length ? state.tags : []);
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
        if (state.sessions.length) setSessions(state.sessions);
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

  const previewDate =
    startDate && endDate
      ? `${startDate.slice(8)} – ${endDate.slice(8)} Nov 2026`
      : "Date not set";

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

  const goNext = async () => {
    if (step < 6) {
      setStep(step + 1);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = buildEngagementPayload({
        eventType,
        title,
        description,
        category,
        audience,
        tone,
        language,
        tags,
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
        saveDraft,
        websiteUrl,
        facebookUrl,
        twitterUrl,
        linkedinUrl,
      });
      if (isEdit && editId) {
        await updateEngagement(editId, payload);
        navigate(`/admin/events/${editId}/overview`);
      } else {
        const created = await createEngagement(payload);
        const id = created.engagementID;
        if (!id) throw new Error("Event created but no engagementID was returned.");
        navigate(`/admin/events/${id}/overview`);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
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
            : isEdit
              ? "Failed to update event"
              : "Failed to create event";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const goPrev = () => {
    if (step > 1) setStep(step - 1);
  };

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
        className="rounded-xl border border-slate-200 bg-white px-3 py-4 shadow-card"
      />

      {step === 1 ? (
        <div className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
          <Card>
            <h2 className="text-lg font-bold text-navy">Select Event Type</h2>
            <p className="mt-1 text-sm text-mute">
              Choose the type of event you want to create. This helps us tailor the right features, templates and
              settings for your event.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {eventTypeOptions.map((opt) => {
                const Icon = typeIcons[opt.id as keyof typeof typeIcons] ?? Sparkles;
                const selected = eventType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEventType(opt.id)}
                    className={cn(
                      "relative rounded-lg border p-4 text-left transition",
                      selected ? "border-blue bg-soft/40 ring-2 ring-blue/20" : "border-slate-200 hover:border-blue/40",
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
        <div className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
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
              <Input label="Event Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
              <div>
                <p className="mb-1.5 text-sm font-medium text-ink">Event Logo</p>
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 sm:flex-row">
                  <img src="/assets/logo-isippe.png" alt="Event logo" className="h-16 w-auto object-contain" />
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
                  onChange={(e) => setDescription(e.target.value.slice(0, 300))}
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-ink focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
                />
                <span className="text-right text-xs text-mute">{description.length}/300</span>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <Select
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={[
                    { value: "legal", label: "Legal & Policy" },
                    { value: "tech", label: "Technology" },
                    { value: "trade", label: "Trade & Commerce" },
                  ]}
                />
                <Select
                  label="Target Audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  options={[
                    { value: "government", label: "Government" },
                    { value: "industry", label: "Industry" },
                    { value: "academia", label: "Academia" },
                  ]}
                />
                <Select
                  label="Tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  options={[
                    { value: "professional", label: "Professional and engaging" },
                    { value: "formal", label: "Formal" },
                    { value: "conversational", label: "Conversational" },
                  ]}
                />
                <Select
                  label="Language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  options={[
                    { value: "en", label: "English" },
                    { value: "sw", label: "Kiswahili" },
                    { value: "fr", label: "French" },
                  ]}
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
                      className="inline-flex items-center gap-1 rounded-full bg-soft px-2.5 py-1 text-xs font-semibold text-blue"
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
                        setTags((prev) => [...prev, tagDraft.trim()]);
                        setTagDraft("");
                      }
                    }}
                    placeholder="Add tag…"
                    className="min-w-[100px] flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          </Card>
          <aside className="grid gap-4 self-start">
            <Card padded={false} className="overflow-hidden">
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
                  <Pill tone="blue">Government</Pill>
                </div>
              </div>
            </Card>
            <TipsCard title="Tips for a great event" tips={tips} />
          </aside>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
          <Card className="grid gap-6">
            <section>
              <h2 className="mb-3 flex items-center gap-2 font-bold text-ink">
                <CalendarDays size={18} className="text-blue" /> Event Dates
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Start Date" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <Input label="End Date" type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="mt-3">
                <Toggle checked={allDay} onChange={setAllDay} label="All day event" />
              </div>
            </section>
            <section>
              <h2 className="mb-3 flex items-center gap-2 font-bold text-ink">
                <Clock size={18} className="text-blue" /> Event Time
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Start Time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} disabled={allDay} />
                <Input label="End Time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={allDay} />
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
                    onClick={() => setVenueMode(m.id)}
                    className={cn(
                      "rounded-lg border p-3 text-left",
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
                <Input label="Venue Name" value={venueName} onChange={(e) => setVenueName(e.target.value)} />
                <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
                  <Select
                    label="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    options={[
                      { value: "KE", label: "Kenya" },
                      { value: "UG", label: "Uganda" },
                      { value: "TZ", label: "Tanzania" },
                    ]}
                  />
                  <Input label="Capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                </div>
              </div>
            </section>
            {venueMode !== "in-person" ? (
              <section>
                <h2 className="mb-3 flex items-center gap-2 font-bold text-ink">
                  <Video size={18} className="text-blue" /> Virtual Event Link
                </h2>
                <Input label="Meeting URL" value={virtualLink} onChange={(e) => setVirtualLink(e.target.value)} />
              </section>
            ) : null}
          </Card>
          <aside className="grid gap-4 self-start">
            <Card padded={false} className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                <p className="text-sm font-bold text-ink">Event Preview</p>
                <button type="button" className="text-xs font-semibold text-blue">
                  View Larger
                </button>
              </div>
              <img src="/assets/venue-kicc.jpg" alt="Venue" className="h-28 w-full object-cover" />
              <div className="p-4">
                <p className="font-semibold text-ink line-clamp-2">{title}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-mute">
                  <CalendarDays size={12} /> {previewDate}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-mute">
                  <Clock size={12} /> {startTime} – {endTime}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-mute">
                  <MapPin size={12} /> {venueName}
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
        <div className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
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
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {["1", "2", "3"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDay(d)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-sm font-semibold transition",
                        day === d
                          ? "border-blue bg-soft text-blue"
                          : "border-slate-200 bg-white text-mute hover:border-blue/40",
                      )}
                    >
                      Day {d}
                      <span className="mt-0.5 block text-xs font-normal text-mute">
                        {d === "1" ? "15 Nov 2026" : d === "2" ? "16 Nov 2026" : "17 Nov 2026"}
                      </span>
                    </button>
                  ))}
                  <Button variant="ghost" size="sm">
                    <Plus size={14} /> Add Day
                  </Button>
                  <Button variant="outline" size="sm" className="ml-auto">
                    <Eye size={14} /> Preview Agenda
                  </Button>
                </div>
                <ul className="relative grid gap-0 before:absolute before:top-3 before:bottom-3 before:left-[7px] before:w-px before:bg-slate-200">
                  {sessions.map((s) => (
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
                        <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-mute hover:bg-slate-100" aria-label="Edit">
                          <Pencil size={14} />
                        </button>
                        <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-mute hover:bg-slate-100" aria-label="Duplicate">
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
                        <span className="grid h-8 w-8 place-items-center text-mute" aria-hidden>
                          <GripVertical size={14} />
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="mt-4" onClick={() => setSessionModal(true)}>
                  <Plus size={16} /> Add Session
                </Button>
              </div>
            ) : programTab === "speakers" ? (
              <div className="mt-4">
                <ul className="grid gap-3">
                  {speakers.map((sp) => (
                    <li key={sp.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-soft text-sm font-bold text-blue">
                        {sp.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
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
                <Button variant="outline" className="mt-4" onClick={() => setSpeakerModal(true)}>
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
                  defaultValue="3"
                  options={[
                    { value: "1", label: "1 Day" },
                    { value: "2", label: "2 Days" },
                    { value: "3", label: "3 Days" },
                  ]}
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
        <div className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
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
                      period: "01 Nov 2026 – 14 Nov 2026",
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
                  {limitOn ? <Input label="Capacity" type="number" defaultValue="500" /> : null}
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
                <ul className="mt-4 grid gap-3 text-sm">
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
                          onChange={(e) => p.set(e.target.checked)}
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
              </Card>
            </div>
          </div>
          <aside className="grid gap-4 self-start">
            <Card padded={false} className="overflow-hidden">
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
        <div className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
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
                {["/placeholders/venue.jpg", "/assets/venue-kicc.jpg", "/assets/hero-nairobi.jpg"].map((src) => (
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
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
                <Input
                  label="Facebook"
                  type="url"
                  placeholder="https://facebook.com/…"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                />
                <Input
                  label="X (Twitter)"
                  type="url"
                  placeholder="https://x.com/…"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                />
                <Input
                  label="LinkedIn"
                  type="url"
                  placeholder="https://linkedin.com/…"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
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
                      "flex items-start gap-3 rounded-lg border p-3 text-left",
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
                  description="Save your event as a draft. You can review and publish later."
                />
              </div>
            </section>
          </Card>
          <aside className="self-start">
            <Card padded={false} className="overflow-hidden">
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

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur md:left-[220px] lg:left-[240px]">
        <div className="flex w-full flex-col gap-2 px-4 py-3 md:px-6 lg:px-6">
          {submitError ? (
            <p className="text-sm text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <Link to="/admin/events">
              <Button variant="outline" disabled={submitting}>
                Cancel
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" disabled={step <= 1 || submitting} onClick={goPrev}>
                <ArrowLeft size={16} /> Previous
              </Button>
              <Button onClick={() => void goNext()} disabled={submitting || loadingEdit || Boolean(loadError)}>
                {step === 6 ? (
                  <>
                    <Send size={16} />{" "}
                    {submitting
                      ? isEdit
                        ? "Saving…"
                        : saveDraft
                          ? "Saving…"
                          : "Publishing…"
                      : isEdit
                        ? saveDraft
                          ? "Save Draft"
                          : "Save Changes"
                        : saveDraft
                          ? "Save Draft"
                          : "Publish Event"}
                  </>
                ) : (
                  <>
                    Next <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={sessionModal}
        onClose={() => setSessionModal(false)}
        title="Add Session"
        className="md:max-w-lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSessionModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!newSessionTitle.trim()) return;
                setSessions((prev) => [
                  ...prev,
                  {
                    id: `s${prev.length + 1}`,
                    time: `${newSessionStart} – ${newSessionEnd}`,
                    title: newSessionTitle.trim(),
                    description: newSessionDesc.trim() || "New session added to the programme.",
                    speakers: 1,
                    place: newSessionVenue,
                    badge: newSessionType,
                    tone: "orange" as const,
                  },
                ]);
                setNewSessionTitle("");
                setNewSessionDesc("");
                setNewSessionType("Session");
                setSessionModal(false);
              }}
            >
              Save Session
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
            label="Session type"
            value={newSessionType}
            onChange={(e) => setNewSessionType(e.target.value)}
            options={[
              { value: "Keynote", label: "Keynote" },
              { value: "Panel Discussion", label: "Panel Discussion" },
              { value: "Workshop", label: "Workshop" },
              { value: "Session", label: "Session" },
              { value: "Break", label: "Break" },
            ]}
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
          <Input
            label="Capacity"
            type="number"
            value={newSessionCapacity}
            onChange={(e) => setNewSessionCapacity(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={speakerModal}
        onClose={() => setSpeakerModal(false)}
        title="Add Speaker"
        className="md:max-w-lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSpeakerModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!newSpeakerName.trim()) return;
                const role = newSpeakerRole.trim() || "Speaker";
                const org = newSpeakerOrg.trim() || "TBD";
                const category = newSpeakerCategory || "panelist";
                const badgeMap: Record<string, string> = {
                  keynote: "Keynote Speaker",
                  panelist: "Panelist",
                  moderator: "Moderator",
                  government: "Government Representative",
                };
                setSpeakers((prev) => [
                  ...prev,
                  {
                    id: `sp${prev.length + 1}`,
                    name: newSpeakerName.trim(),
                    role,
                    org,
                    roleLines: [role, org],
                    topic: newSpeakerTopic.trim() || "To be announced",
                    category,
                    badge: badgeMap[category] || "Speaker",
                    country: newSpeakerCountry.trim() || undefined,
                    flag: undefined,
                    photo: undefined,
                    bio: undefined,
                  },
                ]);
                setNewSpeakerName("");
                setNewSpeakerRole("");
                setNewSpeakerOrg("");
                setNewSpeakerTopic("");
                setNewSpeakerCategory("keynote");
                setNewSpeakerCountry("");
                setSpeakerModal(false);
              }}
            >
              Save Speaker
            </Button>
          </div>
        }
      >
        <div className="grid gap-3">
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
                if (!pkgName.trim() || !pkgPrice.trim()) return;
                setPackages((prev) => [
                  ...prev,
                  {
                    id: `pkg${prev.length + 1}`,
                    name: pkgName.trim(),
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
      <ul className="mt-3 grid gap-2">
        {tips.map((t) => (
          <li key={t} className="flex gap-2 text-sm text-ink">
            <Check size={14} className="mt-0.5 shrink-0 text-blue" /> {t}
          </li>
        ))}
      </ul>
    </Card>
  );
}
