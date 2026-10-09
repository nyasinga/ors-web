import type { SpeakerCategory } from "../../data/publicContent";

export type SpeakerCardData = {
  id: string;
  name: string;
  role?: string;
  org?: string;
  roleLines?: string[];
  country?: string;
  flag?: string;
  category?: SpeakerCategory | string;
  badgeLabel?: string;
  photo?: string;
  bio?: string;
  topic?: string;
};

const categoryLabel: Record<SpeakerCategory, string> = {
  keynote: "Keynote Speaker",
  panelist: "Panelist",
  moderator: "Moderator",
  government: "Government Representative",
};

function badgeClass(category?: string) {
  if (category === "keynote" || category === "panelist" || category === "moderator" || category === "government") {
    return category;
  }
  return "keynote";
}

function badgeText(speaker: SpeakerCardData) {
  if (speaker.badgeLabel) return speaker.badgeLabel;
  const cat = speaker.category;
  if (cat && cat in categoryLabel) return categoryLabel[cat as SpeakerCategory];
  if (cat) return String(cat).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return "Speaker";
}

function roleLinesOf(speaker: SpeakerCardData) {
  if (speaker.roleLines?.length) return speaker.roleLines;
  return [speaker.role, speaker.org].filter((line): line is string => Boolean(line?.trim()));
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type SpeakerCardProps = {
  speaker: SpeakerCardData;
  onViewProfile?: (speaker: SpeakerCardData) => void;
};

/** Shared speaker card — matches Speakers page / Screen design. */
export function SpeakerCard({ speaker, onViewProfile }: SpeakerCardProps) {
  const lines = roleLinesOf(speaker);

  return (
    <article className="sk-speaker-card">
      {speaker.photo ? (
        <img className="sk-speaker-photo" src={speaker.photo} alt={speaker.name} />
      ) : (
        <div className="sk-speaker-photo sk-speaker-photo--empty" aria-hidden>
          {initialsOf(speaker.name)}
        </div>
      )}
      <div className="sk-speaker-info">
        <span className={`sk-badge ${badgeClass(speaker.category)}`}>{badgeText(speaker)}</span>
        <h2 className="sk-speaker-name">{speaker.name}</h2>
        {lines.length > 0 ? (
          <div className="sk-speaker-role">
            {lines.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </div>
        ) : null}
        {speaker.country ? (
          <div className="sk-country">
            {speaker.flag ? (
              <span className="sk-flag" aria-hidden>
                {speaker.flag}
              </span>
            ) : null}
            {speaker.country}
          </div>
        ) : null}
        <button
          type="button"
          className="sk-profile"
          onClick={() => onViewProfile?.(speaker)}
        >
          View Profile{" "}
          <span className="sk-arrow" aria-hidden>
            →
          </span>
        </button>
      </div>
    </article>
  );
}

type SpeakerCardGridProps = {
  speakers: SpeakerCardData[];
  emptyMessage?: string;
  columns?: 2 | 3 | 4;
  onViewProfile?: (speaker: SpeakerCardData) => void;
  className?: string;
};

export function SpeakerCardGrid({
  speakers,
  emptyMessage = "No speakers added yet.",
  columns = 3,
  onViewProfile,
  className,
}: SpeakerCardGridProps) {
  return (
    <div
      className={["sk-speaker-grid", `sk-speaker-grid--${columns}`, className].filter(Boolean).join(" ")}
    >
      {speakers.map((speaker) => (
        <SpeakerCard
          key={speaker.id}
          speaker={speaker}
          onViewProfile={onViewProfile}
        />
      ))}
      {speakers.length === 0 ? <p className="sk-empty">{emptyMessage}</p> : null}
    </div>
  );
}

export function engagementSpeakerToCard(speaker: {
  id?: string;
  name: string;
  role?: string;
  org?: string;
  roleLines?: string[];
  country?: string;
  flag?: string;
  category?: string;
  badge?: string;
  photo?: string;
  bio?: string;
  topic?: string;
}): SpeakerCardData {
  return {
    id: speaker.id || speaker.name,
    name: speaker.name,
    role: speaker.role,
    org: speaker.org,
    roleLines: speaker.roleLines,
    country: speaker.country,
    flag: speaker.flag,
    category: speaker.category || (speaker.badge?.toLowerCase().includes("keynote") ? "keynote" : "panelist"),
    badgeLabel: speaker.badge,
    photo: speaker.photo,
    bio: speaker.bio,
    topic: speaker.topic,
  };
}
