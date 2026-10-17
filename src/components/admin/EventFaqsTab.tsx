import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { useToast } from "../ui/Toast";
import { ApiError } from "../../lib/api";
import { asFaqs, updateEngagement } from "../../lib/engagements";
import { clearPublicEngagementCache } from "../../lib/publicEvent";
import type { Engagement, EngagementFaqCategory, EngagementFaqItem } from "../../types/engagement";

const ICON_OPTIONS = [
  { value: "FileText", label: "Document" },
  { value: "User", label: "User" },
  { value: "CreditCard", label: "Payments" },
  { value: "Handshake", label: "Sponsorship" },
  { value: "Users", label: "People" },
  { value: "Ticket", label: "Ticket" },
  { value: "MapPin", label: "Venue" },
  { value: "Headset", label: "Support" },
];

function cloneFaqs(source: EngagementFaqCategory[]): EngagementFaqCategory[] {
  return source.map((cat) => ({
    ...cat,
    items: cat.items.map((item) => ({ ...item })),
  }));
}

type Props = {
  eventId: string;
  engagement: Engagement | null;
  fromApi: boolean;
  onChanged: () => Promise<void>;
};

export function EventFaqsTab({ eventId, engagement, fromApi, onChanged }: Props) {
  const toast = useToast();
  const initial = useMemo(() => {
    // Only this event's FAQs — never seed a demo catalog from another event.
    return cloneFaqs(asFaqs(engagement?.faqs));
  }, [engagement]);

  const [categories, setCategories] = useState(initial);
  const [activeId, setActiveId] = useState(initial[0]?.id || "general");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCategories(initial);
    setActiveId((prev) => (initial.some((c) => c.id === prev) ? prev : initial[0]?.id || "general"));
  }, [initial]);

  const active = categories.find((c) => c.id === activeId) || categories[0];

  const updateActive = (patch: Partial<EngagementFaqCategory>) => {
    if (!active) return;
    setCategories((prev) =>
      prev.map((cat) => (cat.id === active.id ? { ...cat, ...patch } : cat)),
    );
  };

  const updateItem = (index: number, patch: Partial<EngagementFaqItem>) => {
    if (!active) return;
    const items = active.items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    updateActive({ items });
  };

  const addItem = () => {
    if (!active) return;
    updateActive({
      items: [
        ...active.items,
        {
          id: `faq-${Date.now()}`,
          q: "New question",
          a: "Add the answer here.",
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    if (!active) return;
    updateActive({ items: active.items.filter((_, i) => i !== index) });
  };

  const addCategory = () => {
    const id = `category-${Date.now()}`;
    const next: EngagementFaqCategory = {
      id,
      label: "New category",
      icon: "FileText",
      intro: "Short introduction for this FAQ category.",
      items: [],
    };
    setCategories((prev) => [...prev, next]);
    setActiveId(id);
  };

  const removeCategory = () => {
    if (!active) return;
    const next = categories.filter((c) => c.id !== active.id);
    setCategories(next);
    setActiveId(next[0]?.id || "");
  };

  const save = async () => {
    if (!fromApi) {
      toast.error("Load a live event before saving FAQs.");
      return;
    }
    const cleaned = categories
      .map((cat) => ({
        ...cat,
        label: cat.label.trim(),
        intro: cat.intro?.trim() || "",
        items: cat.items
          .map((item) => ({
            ...item,
            q: item.q.trim(),
            a: item.a.trim(),
          }))
          .filter((item) => item.q && item.a),
      }))
      .filter((cat) => cat.label);

    if (!cleaned.length) {
      toast.error("Add at least one FAQ category.");
      return;
    }

    setSaving(true);
    try {
      await updateEngagement(eventId, { faqs: cleaned });
      clearPublicEngagementCache(eventId);
      toast.success("FAQs saved");
      await onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save FAQs");
    } finally {
      setSaving(false);
    }
  };

  if (!active) {
    return (
      <Card>
        <p className="text-sm text-mute">No FAQ categories yet.</p>
        <Button className="mt-3" size="sm" onClick={addCategory}>
          <Plus size={14} /> Add category
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <Card className="h-fit p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-extrabold text-ink">Categories</h2>
          <Button size="sm" variant="outline" onClick={addCategory}>
            <Plus size={14} /> Add
          </Button>
        </div>
        <div className="grid gap-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`rounded-lg px-3 py-2 text-left text-sm ${
                cat.id === active.id
                  ? "bg-blue-50 font-bold text-blue-700"
                  : "text-ink hover:bg-slate-50"
              }`}
              onClick={() => setActiveId(cat.id)}
            >
              <span className="block truncate">{cat.label}</span>
              <span className="text-[11px] font-medium text-mute">{cat.items.length} questions</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-ink">Manage FAQs</h2>
            <p className="text-sm text-mute">
              These answers power the public FAQ page for this event.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={removeCategory} disabled={saving}>
              <Trash2 size={14} /> Remove category
            </Button>
            <Button size="sm" onClick={() => void save()} disabled={saving}>
              {saving ? "Saving…" : "Save FAQs"}
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Category label"
            value={active.label}
            onChange={(e) => updateActive({ label: e.target.value })}
          />
          <Select
            label="Icon"
            value={active.icon || "FileText"}
            onChange={(e) => updateActive({ icon: e.target.value })}
            options={ICON_OPTIONS}
          />
        </div>
        <label className="mt-3 block text-sm font-medium text-ink">
          Intro
          <textarea
            className="mt-1.5 min-h-[72px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={active.intro || ""}
            onChange={(e) => updateActive({ intro: e.target.value })}
          />
        </label>

        <div className="mt-5 flex items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold text-ink">Questions</h3>
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus size={14} /> Add question
          </Button>
        </div>

        <div className="mt-3 grid gap-3">
          {active.items.map((item, index) => (
            <div key={item.id || index} className="rounded-lg border border-slate-200 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-mute">Question {index + 1}</span>
                <button
                  type="button"
                  className="text-red hover:underline"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <Input
                label="Question"
                value={item.q}
                onChange={(e) => updateItem(index, { q: e.target.value })}
              />
              <label className="mt-2 block text-sm font-medium text-ink">
                Answer
                <textarea
                  className="mt-1.5 min-h-[88px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={item.a}
                  onChange={(e) => updateItem(index, { a: e.target.value })}
                />
              </label>
            </div>
          ))}
          {!active.items.length ? (
            <p className="text-sm text-mute">No questions in this category yet.</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
