import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { useToast } from "../ui/Toast";
import { ApiError } from "../../lib/api";
import { asVenueHighlights, asVenueSpaces, updateEngagement } from "../../lib/engagements";
import { clearPublicEngagementCache } from "../../lib/publicEvent";
import type {
  Engagement,
  EngagementVenueHighlight,
  EngagementVenueSpace,
} from "../../types/engagement";

const ICON_OPTIONS = [
  { value: "MapPin", label: "Map pin" },
  { value: "Users", label: "People" },
  { value: "Shield", label: "Shield" },
  { value: "Wifi", label: "Wifi" },
  { value: "Bus", label: "Transport" },
  { value: "Globe2", label: "Globe" },
];

type Props = {
  eventId: string;
  engagement: Engagement | null;
  fromApi: boolean;
  onChanged: () => Promise<void>;
};

export function EventVenueContentTab({ eventId, engagement, fromApi, onChanged }: Props) {
  const toast = useToast();
  const initialHighlights = useMemo(() => {
    // Only this event's content — never seed another event's / demo venue catalog.
    return asVenueHighlights(engagement?.venueHighlights).map((r) => ({ ...r }));
  }, [engagement]);
  const initialSpaces = useMemo(() => {
    return asVenueSpaces(engagement?.venueSpaces).map((r) => ({ ...r }));
  }, [engagement]);

  const [highlights, setHighlights] = useState(initialHighlights);
  const [spaces, setSpaces] = useState(initialSpaces);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setHighlights(initialHighlights);
    setSpaces(initialSpaces);
  }, [initialHighlights, initialSpaces]);

  const save = async () => {
    if (!fromApi) {
      toast.error("Load a live event before saving venue content.");
      return;
    }
    const nextHighlights = highlights
      .map((row) => ({
        ...row,
        title: row.title.trim(),
        text: row.text.trim(),
      }))
      .filter((row) => row.title && row.text);
    const nextSpaces = spaces
      .map((row) => ({
        ...row,
        name: row.name.trim(),
        text: row.text.trim(),
        capacity: row.capacity?.trim() || "",
        image: row.image?.trim() || "",
      }))
      .filter((row) => row.name && row.text);

    setSaving(true);
    try {
      await updateEngagement(eventId, {
        venueHighlights: nextHighlights,
        venueSpaces: nextSpaces,
      });
      clearPublicEngagementCache(eventId);
      toast.success("Venue content saved");
      await onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save venue content");
    } finally {
      setSaving(false);
    }
  };

  const updateHighlight = (index: number, patch: Partial<EngagementVenueHighlight>) => {
    setHighlights((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const updateSpace = (index: number, patch: Partial<EngagementVenueSpace>) => {
    setSpaces((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <div className="grid gap-4">
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-ink">Venue highlights</h2>
            <p className="text-sm text-mute">Top benefit strip on the public Venue page.</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setHighlights((prev) => [
                  ...prev,
                  {
                    id: `vh-${Date.now()}`,
                    icon: "MapPin",
                    title: "New highlight",
                    text: "Short supporting line",
                  },
                ])
              }
            >
              <Plus size={14} /> Add highlight
            </Button>
            <Button size="sm" onClick={() => void save()} disabled={saving}>
              {saving ? "Saving…" : "Save venue content"}
            </Button>
          </div>
        </div>
        <div className="grid gap-3">
          {highlights.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-mute">
              No highlights for this event yet. Add ones that match this venue.
            </p>
          ) : null}
          {highlights.map((row, index) => (
            <div key={row.id || index} className="grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-[140px_1fr_1fr_auto]">
              <Select
                label="Icon"
                value={row.icon || "MapPin"}
                onChange={(e) => updateHighlight(index, { icon: e.target.value })}
                options={ICON_OPTIONS}
              />
              <Input
                label="Title"
                value={row.title}
                onChange={(e) => updateHighlight(index, { title: e.target.value })}
              />
              <Input
                label="Text"
                value={row.text}
                onChange={(e) => updateHighlight(index, { text: e.target.value })}
              />
              <button
                type="button"
                className="self-end pb-2 text-red hover:underline"
                onClick={() => setHighlights((prev) => prev.filter((_, i) => i !== index))}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-ink">Venue spaces</h2>
            <p className="text-sm text-mute">Room / hall cards shown on the public Venue page.</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setSpaces((prev) => [
                ...prev,
                {
                  id: `vs-${Date.now()}`,
                  name: "New space",
                  text: "Describe how this space is used.",
                  capacity: "Capacity: —",
                  image: "/assets/venue-meeting-rooms.jpg",
                },
              ])
            }
          >
            <Plus size={14} /> Add space
          </Button>
        </div>
        <div className="grid gap-3">
          {spaces.map((row, index) => (
            <div key={row.id || index} className="rounded-lg border border-slate-200 p-3">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  className="text-red hover:underline"
                  onClick={() => setSpaces((prev) => prev.filter((_, i) => i !== index))}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  label="Name"
                  value={row.name}
                  onChange={(e) => updateSpace(index, { name: e.target.value })}
                />
                <Input
                  label="Capacity label"
                  value={row.capacity || ""}
                  onChange={(e) => updateSpace(index, { capacity: e.target.value })}
                />
              </div>
              <label className="mt-2 block text-sm font-medium text-ink">
                Description
                <textarea
                  className="mt-1.5 min-h-[72px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={row.text}
                  onChange={(e) => updateSpace(index, { text: e.target.value })}
                />
              </label>
              <Input
                className="mt-2"
                label="Image path or URL"
                value={row.image || ""}
                onChange={(e) => updateSpace(index, { image: e.target.value })}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
