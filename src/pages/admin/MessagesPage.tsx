import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Archive,
  CalendarClock,
  ChevronDown,
  FileText,
  Filter,
  Forward,
  Inbox,
  LayoutGrid,
  Mail,
  MoreHorizontal,
  MousePointerClick,
  Plus,
  Reply,
  Send,
  Users,
} from "lucide-react";
import {
  inboxMessages,
  messageFolders,
  messageKpis,
} from "../../data/adminOps";
import { cn } from "../../lib/cn";

type FolderId = (typeof messageFolders)[number]["id"];

const kpiIcons = [Mail, Send, Users, MousePointerClick];
const kpiIconTone = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  orange: "bg-orange-50 text-orange-500",
  purple: "bg-purple-50 text-purple-600",
} as const;

const folderIcons: Record<string, typeof Inbox> = {
  all: Inbox,
  unread: Mail,
  sent: Send,
  scheduled: CalendarClock,
  drafts: FileText,
  templates: LayoutGrid,
  archived: Archive,
};

const panel =
  "rounded-[10px] border border-[#e2edfc] bg-white shadow-[0_3px_12px_rgba(57,118,188,.04)]";

const field =
  "rounded-[7px] border border-[#cbdfff] bg-white px-2.5 py-2.5 text-[#17216d] outline-none focus:border-[#0755f5]";

const btn =
  "inline-flex items-center gap-2 rounded-[7px] border border-[#a8caff] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#0755f5] hover:bg-blue-50";

const avatarTone = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-emerald-100 text-emerald-600",
  red: "bg-red-100 text-red-600",
  orange: "bg-orange-100 text-orange-600",
} as const;

function statusBadge(status: string) {
  if (status === "Pending") return "bg-[#ffe2e2] text-[#d62727]";
  if (status === "Sent") return "bg-[#d8f9e8] text-[#07864e]";
  return "bg-[#d8f9e8] text-[#07864e]";
}

/** Screen H Messages — from aca_messages_dashboard HTML */
export function MessagesPage() {
  const [folder, setFolder] = useState<FolderId>("all");
  const [selectedId, setSelectedId] = useState(inboxMessages[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inboxMessages.filter((m) => {
      const hay = `${m.name} ${m.subject} ${m.preview}`.toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (folder === "unread") return m.status === "Pending";
      if (folder === "sent") return m.status === "Sent";
      if (folder === "templates" || folder === "drafts" || folder === "archived" || folder === "scheduled") {
        return false;
      }
      return true;
    });
  }, [folder, query]);

  const selected =
    list.find((m) => m.id === selectedId) ?? list[0] ?? inboxMessages[0];

  const openCompose = (opts?: { to?: string; subject?: string }) => {
    setComposeTo(opts?.to ?? "");
    setComposeSubject(opts?.subject ?? "");
    setComposeBody("");
    setComposeOpen(true);
  };

  const selectFolder = (id: FolderId) => {
    setFolder(id);
    if (id === "templates") {
      setNotice(
        "Message Templates selected. Connect your template service to load and manage saved templates.",
      );
    }
  };

  return (
    <div className="text-[#101b61]">
      <nav className="mb-2 flex flex-wrap items-center gap-2 text-xs text-blue-700" aria-label="Breadcrumb">
        <Link to="/admin/events" className="hover:text-blue-900">
          ‹ Events
        </Link>
        <span>›</span>
        <Link to="/admin/events/isippe-3/overview" className="hover:text-blue-900">
          ACA Annual Conference 2026
        </Link>
        <span>›</span>
        <span className="font-semibold text-[#101b61]">Messages</span>
      </nav>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">Messages</h1>
          <p className="text-base text-blue-600">
            Communicate with participants, speakers, delegates and exhibitors.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn} onClick={() => openCompose()}>
            <Send size={15} /> Send Message
          </button>
          <button type="button" className={btn} onClick={() => selectFolder("templates")}>
            <LayoutGrid size={15} /> Message Templates
          </button>
          <button
            type="button"
            className={btn}
            onClick={() =>
              setNotice(
                "More Actions: connect your messaging service to support bulk actions, exports, and archive management.",
              )
            }
          >
            <MoreHorizontal size={15} /> More Actions <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <section className="mb-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {messageKpis.map((kpi, i) => {
          const Icon = kpiIcons[i];
          return (
            <article
              key={kpi.label}
              className={cn(panel, "relative flex min-w-0 items-center gap-3.5 overflow-hidden px-4 py-3.5")}
            >
              <div
                className={cn(
                  "flex h-[59px] w-[59px] shrink-0 items-center justify-center rounded-xl",
                  kpiIconTone[kpi.tone],
                )}
              >
                <Icon size={26} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <b className="block text-2xl font-extrabold leading-7 text-blue-950">{kpi.value}</b>
                <div className="text-sm text-slate-600">{kpi.label}</div>
                <span className="text-sm font-bold text-emerald-600">{kpi.trend}</span>
              </div>
              <svg className="ml-auto mt-auto h-12 w-24 shrink-0" viewBox="0 0 100 45" aria-hidden>
                <path d={`${kpi.sparkPath} L100 45 L0 45Z`} fill={kpi.sparkFill} />
                <path d={kpi.sparkPath} fill="none" stroke={kpi.sparkStroke} strokeWidth="2" />
              </svg>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-[256px_minmax(300px,1fr)_minmax(340px,1.45fr)]">
        <aside className={cn(panel, "p-4")}>
          <h2 className="mb-4 text-base font-extrabold text-blue-950">Message Inbox</h2>
          <button
            type="button"
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-[7px] border border-[#0755f5] bg-[#0755f5] px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={() => openCompose()}
          >
            <Plus size={16} strokeWidth={3} /> New Message
          </button>
          <nav className="space-y-0.5" aria-label="Message folders">
            {messageFolders.map((f) => {
              const Icon = folderIcons[f.id] ?? Inbox;
              const active = folder === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => selectFolder(f.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2.5 py-3 text-sm transition",
                    active ? "bg-[#e4f1ff] font-semibold text-[#0755f5]" : "text-[#101b61] hover:bg-[#e4f1ff]/hover:text-[#0755f5]",
                  )}
                >
                  <Icon size={18} />
                  <span className="flex-1 text-left">{f.label}</span>
                  <span
                    className={cn(
                      "rounded-lg px-2 py-0.5 text-[11px] font-bold",
                      f.badge === "red"
                        ? "bg-red-500 text-white"
                        : "bg-[#edf4ff] text-[#0755f5]",
                    )}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className={cn(panel, "min-w-0 p-2")}>
          <div className="flex gap-2 p-2">
            <input
              className={cn(field, "min-w-0 flex-1")}
              placeholder="Search messages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search messages"
            />
            <button
              type="button"
              className={cn(btn, "!px-3")}
              title="Filter messages"
              onClick={() => selectFolder(folder === "unread" ? "all" : "unread")}
            >
              <Filter size={16} />
            </button>
          </div>
          <div className="max-h-[560px] overflow-y-auto">
            {list.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">
                {folder === "templates"
                  ? "Connect your template service to load saved templates."
                  : "No messages match your search."}
              </p>
            ) : (
              list.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-[#e6effb] px-2.5 py-3 text-left transition hover:rounded-lg hover:bg-[#edf5ff]",
                    selected?.id === m.id && "rounded-lg bg-[#edf5ff]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full text-base font-bold",
                      avatarTone[m.color],
                    )}
                  >
                    {m.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <b className="truncate text-sm text-blue-950">{m.name}</b>
                      <span className="whitespace-nowrap text-xs text-blue-700">{m.time}</span>
                    </div>
                    <div className="text-xs font-medium">{m.subject}</div>
                    <div className="mt-1 truncate text-xs text-blue-600">{m.preview}</div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-[7px] px-2.5 py-1 text-[11px] font-semibold",
                      statusBadge(m.status),
                    )}
                  >
                    {m.status}
                  </span>
                </button>
              ))
            )}
          </div>
        </section>

        <article className={cn(panel, "min-w-0 p-4")}>
          {selected ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-blue-100 pb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-base font-extrabold text-blue-950">{selected.subject}</h2>
                    <span
                      className={cn(
                        "rounded-[7px] px-2.5 py-1 text-[11px] font-semibold",
                        statusBadge(selected.status),
                      )}
                    >
                      {selected.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-blue-500">{selected.date}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={cn(btn, "!p-2")}
                    title="Reply"
                    onClick={() =>
                      openCompose({
                        to: selected.email,
                        subject: `Re: ${selected.subject}`,
                      })
                    }
                  >
                    <Reply size={16} />
                  </button>
                  <button
                    type="button"
                    className={cn(btn, "!p-2")}
                    title="Forward"
                    onClick={() =>
                      openCompose({
                        subject: `Fwd: ${selected.subject}`,
                      })
                    }
                  >
                    <Forward size={16} />
                  </button>
                  <button
                    type="button"
                    className={cn(btn, "!p-2")}
                    title="More actions"
                    onClick={() =>
                      setNotice(
                        "Message actions: archive, mark unread, or delete can be wired to your backend.",
                      )
                    }
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 border-b border-blue-100 py-3 text-sm">
                <div className="flex gap-3">
                  <b className="w-16 shrink-0">From:</b>
                  <span className="text-blue-700">events@aca.go.ke</span>
                </div>
                <div className="flex gap-3">
                  <b className="w-16 shrink-0">To:</b>
                  <span className="break-all text-blue-700">
                    {selected.name} &lt;{selected.email}&gt;
                  </span>
                </div>
                <div className="flex gap-3">
                  <b className="w-16 shrink-0">Subject:</b>
                  <span className="text-blue-700">
                    {selected.subject} - ACA Annual Conference 2026
                  </span>
                </div>
              </div>

              <div className="px-1 py-3 text-sm leading-[1.75]">
                <div className="mb-5 flex min-h-[112px] items-center justify-between gap-3 rounded-md bg-gradient-to-r from-blue-100 via-sky-50 to-blue-100 px-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-500 via-red-500 to-blue-800 text-lg font-black text-white">
                      ACA
                    </div>
                    <div className="text-base font-extrabold leading-4 text-blue-700">
                      anti
                      <br />
                      counterfeit
                      <br />
                      authority
                    </div>
                  </div>
                  <div className="hidden text-right sm:block">
                    <div className="text-xl font-extrabold text-blue-700">
                      ISIPPE <span className="text-red-600">2026</span>
                    </div>
                    <div className="text-[10px] text-blue-800">
                      3RD INTERNATIONAL SYMPOSIUM ON INTELLECTUAL PROPERTY
                    </div>
                  </div>
                </div>
                <p>
                  Dear <b>{selected.name}</b>,
                </p>
                <p className="mt-3">{selected.intro}</p>
                <p className="mt-3">{selected.main}</p>
                <p className="mt-3">{selected.extra}</p>
                <p className="mt-3">
                  Regards,
                  <br />
                  <b>ACA Conference Team</b>
                  <br />
                  Anti-Counterfeit Authority
                </p>
              </div>
            </>
          ) : (
            <p className="py-16 text-center text-sm text-slate-500">Select a message to view.</p>
          )}
        </article>
      </section>

      {notice ? (
        <p
          className="mt-3 rounded-lg border border-blue-100 bg-white p-3 text-sm text-blue-800"
          role="status"
        >
          {notice}
        </p>
      ) : null}

      {composeOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setComposeOpen(false);
          }}
        >
          <form
            className="w-[min(600px,92vw)] space-y-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              setComposeOpen(false);
              setNotice(
                `Message prepared for ${composeTo || "recipient"}. Connect your messaging API to send it.`,
              );
              setComposeTo("");
              setComposeSubject("");
              setComposeBody("");
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-blue-950">New Message</h2>
              <button
                type="button"
                className="text-xl text-slate-500 hover:text-slate-800"
                aria-label="Close"
                onClick={() => setComposeOpen(false)}
              >
                ✕
              </button>
            </div>
            <label className="block text-sm font-semibold">
              To
              <input
                className={cn(field, "mt-1 w-full")}
                required
                placeholder="Recipient email or audience"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold">
              Subject
              <input
                className={cn(field, "mt-1 w-full")}
                required
                placeholder="Message subject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold">
              Message
              <textarea
                className={cn(field, "mt-1 w-full")}
                rows={6}
                required
                placeholder="Write your message..."
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className={btn}
                onClick={() => {
                  setComposeOpen(false);
                  setNotice(
                    "Draft saved in this demo session. Connect backend storage for persistent drafts.",
                  );
                }}
              >
                Save Draft
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-[7px] border border-[#0755f5] bg-[#0755f5] px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Send Message <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
