import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Archive,
  CalendarClock,
  ChevronDown,
  FileText,
  Filter,
  Folder,
  Forward,
  Inbox,
  LayoutGrid,
  Mail,
  MoreHorizontal,
  MousePointerClick,
  Plus,
  Reply,
  Search,
  Send,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Modal } from "../../components/ui/Modal";
import { Pill } from "../../components/ui/Pill";
import {
  inboxMessages,
  messageFolders,
  messageKpis,
  selectedMessageBody,
} from "../../data/adminOps";
import { cn } from "../../lib/cn";

const kpiIcons = [Mail, Send, Users, MousePointerClick];
const kpiTone = {
  blue: "bg-soft text-blue",
  green: "bg-green-50 text-green",
  orange: "bg-orange-50 text-orange-600",
  purple: "bg-purple-50 text-purple-600",
};

const statusTone = {
  Sent: "blue" as const,
  Delivered: "green" as const,
  Pending: "red" as const,
};

const folderIcons: Record<string, typeof Inbox> = {
  all: Inbox,
  unread: Mail,
  sent: Send,
  scheduled: CalendarClock,
  drafts: FileText,
  templates: LayoutGrid,
  archived: Archive,
};

const avatarTone = ["bg-soft text-blue", "bg-green-50 text-green", "bg-orange-50 text-orange-700", "bg-purple-50 text-purple-700", "bg-red-50 text-red"];

/** Screen H Messages */
export function MessagesPage() {
  const [folder, setFolder] = useState("all");
  const [selectedId, setSelectedId] = useState(inboxMessages[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);

  const list = useMemo(() => {
    let rows = inboxMessages;
    if (folder === "unread") rows = rows.filter((m) => m.unread);
    if (folder === "sent") rows = rows.filter((m) => m.status === "Sent" || m.status === "Delivered");
    if (folder === "drafts" || folder === "templates" || folder === "archived" || folder === "scheduled") {
      rows = folder === "scheduled" ? rows.filter((m) => m.status === "Pending") : rows.slice(0, 2);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (m) =>
          m.subject.toLowerCase().includes(q) ||
          m.from.toLowerCase().includes(q) ||
          m.preview.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [folder, query]);

  const selected = list.find((m) => m.id === selectedId) ?? list[0] ?? inboxMessages[0];

  return (
    <div className="grid w-full gap-4">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-mute" aria-label="Breadcrumb">
        <Link to="/admin/events" className="hover:text-blue">
          Events
        </Link>
        <span>/</span>
        <Link to="/admin/events/isippe-3/overview" className="hover:text-blue">
          ACA Annual Conference 2026
        </Link>
        <span>/</span>
        <span className="font-medium text-navy">Messages</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Messages</h1>
          <p className="mt-1 text-sm text-mute">
            Communicate with participants, speakers, delegates and exhibitors.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setComposeOpen(true)}>
            <Send size={16} /> Send Message
          </Button>
          <Button variant="outline">
            <FileText size={16} /> Message Templates
          </Button>
          <Button variant="outline">
            More Actions <ChevronDown size={14} />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {messageKpis.map((kpi, i) => {
          const Icon = kpiIcons[i];
          return (
            <Card key={kpi.label}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-mute">{kpi.label}</p>
                <span className={cn("grid h-9 w-9 place-items-center rounded-lg", kpiTone[kpi.tone])}>
                  <Icon size={18} />
                </span>
              </div>
              <p className="mt-2 text-xl font-extrabold text-navy">{kpi.value}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-green">
                <TrendingUp size={12} /> {kpi.trend}
              </p>
            </Card>
          );
        })}
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="grid min-h-[520px] lg:grid-cols-[220px_300px_1fr]">
          <aside className="border-b border-slate-100 p-3 lg:border-r lg:border-b-0">
            <Button className="mb-3 w-full" onClick={() => setComposeOpen(true)}>
              <Plus size={16} /> New Message
            </Button>
            <nav className="grid gap-0.5" aria-label="Message folders">
              {messageFolders.map((f) => {
                const Icon = folderIcons[f.id] ?? Folder;
                const isActive = folder === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFolder(f.id)}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                      isActive ? "bg-soft text-blue" : "text-mute hover:bg-slate-50 hover:text-ink",
                    )}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon size={15} />
                      {f.label}
                    </span>
                    {f.id === "unread" ? (
                      <span className="grid min-w-5 place-items-center rounded-full bg-red px-1.5 text-[10px] font-bold text-white">
                        {f.count}
                      </span>
                    ) : (
                      <span className="text-xs">{f.count}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="border-b border-slate-100 lg:border-r lg:border-b-0">
            <div className="border-b border-slate-100 p-3">
              <label className="relative block">
                <span className="sr-only">Search messages</span>
                <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-mute" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full rounded-lg border border-slate-200 py-2 pr-9 pl-8 text-sm focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-mute hover:bg-slate-100 hover:text-ink"
                  aria-label="Filter messages"
                >
                  <Filter size={14} />
                </button>
              </label>
            </div>
            <ul className="max-h-[460px] overflow-y-auto">
              {list.map((m, i) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(m.id)}
                    className={cn(
                      "w-full border-b border-slate-50 px-3 py-3 text-left hover:bg-slate-50",
                      selected?.id === m.id && "bg-soft/60",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold",
                          avatarTone[i % avatarTone.length],
                        )}
                      >
                        {m.initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("truncate text-sm", m.unread ? "font-bold text-navy" : "font-medium text-navy")}>
                            {m.from}
                          </p>
                          <span className="shrink-0 text-[10px] text-mute">{m.time}</span>
                        </div>
                        <p className="truncate text-sm text-ink">{m.subject}</p>
                        <p className="truncate text-xs text-mute">{m.preview}</p>
                        <div className="mt-1 flex justify-end">
                          <Pill tone={statusTone[m.status]}>{m.status}</Pill>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
              {list.length === 0 ? (
                <li>
                  <EmptyState
                    compact
                    title="Empty"
                    description="Nothing found. Please check again."
                  />
                </li>
              ) : null}
            </ul>
          </div>

          <article className="flex min-w-0 flex-col">
            {selected ? (
              <>
                <header className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 p-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-navy">{selectedMessageBody.subject}</h2>
                      <Pill tone={statusTone[selected.status]}>{selected.status}</Pill>
                    </div>
                    <p className="mt-1 text-xs text-mute">{selectedMessageBody.datetime}</p>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-mute hover:bg-slate-100" aria-label="Reply">
                      <Reply size={16} />
                    </button>
                    <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-mute hover:bg-slate-100" aria-label="Forward">
                      <Forward size={16} />
                    </button>
                    <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-mute hover:bg-slate-100" aria-label="More">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </header>
                <div className="space-y-2 border-b border-slate-100 px-4 py-3 text-sm">
                  <p>
                    <span className="text-mute">From:</span>{" "}
                    <span className="font-medium text-navy">{selectedMessageBody.from}</span>
                  </p>
                  <p>
                    <span className="text-mute">To:</span>{" "}
                    <span className="font-medium text-navy">{selectedMessageBody.to}</span>
                  </p>
                  <p>
                    <span className="text-mute">Subject:</span>{" "}
                    <span className="font-medium text-navy">{selectedMessageBody.subject}</span>
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <img
                    src="/assets/admin-banner.jpg"
                    alt="ISIPPE 2026"
                    className="mb-4 h-28 w-full rounded-lg object-cover"
                  />
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">
                    {selectedMessageBody.body}
                  </pre>
                </div>
              </>
            ) : (
              <EmptyState
                className="flex-1"
                title="Empty"
                description="Nothing found. Please check again."
              />
            )}
          </article>
        </div>
      </Card>

      <Modal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="Send Message"
        className="md:max-w-xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setComposeOpen(false);
                setFolder("sent");
              }}
            >
              <Send size={16} /> Send
            </Button>
          </div>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-ink">To</span>
            <input
              defaultValue="All confirmed participants"
              className="rounded-lg border border-slate-200 px-3 py-2.5 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-ink">Subject</span>
            <input
              defaultValue="Important update — ACA Annual Conference 2026"
              className="rounded-lg border border-slate-200 px-3 py-2.5 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-ink">Message</span>
            <textarea
              rows={6}
              defaultValue={"Dear participant,\n\nWe have an important update regarding the conference."}
              className="rounded-lg border border-slate-200 px-3 py-2.5 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
            />
          </label>
        </div>
      </Modal>
    </div>
  );
}
