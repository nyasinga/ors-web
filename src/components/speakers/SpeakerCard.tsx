import { cn } from "../../lib/cn";
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

const badgeTone: Record<SpeakerCategory, string> = {
  keynote: "bg-[#075fd8]",
  panelist: "bg-[#08713f]",
  moderator: "bg-[#6734e8]",
  government: "bg-[#ed1c24]",
};

function badgeClass(category?: string) {
  if (category === "keynote" || category === "panelist" || category === "moderator" || category === "government") {
    return badgeTone[category];
  }
  return badgeTone.keynote;
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

const photoBase =
  "h-[158px] w-[111px] rounded-md max-[1200px]:h-[150px] max-[1200px]:w-[95px] max-[640px]:h-28 max-[640px]:w-[82px]";

/** Shared speaker card — matches Speakers page / Screen design. */
export function SpeakerCard({ speaker, onViewProfile }: SpeakerCardProps) {
  const lines = roleLinesOf(speaker);

  return (
    <article className="grid min-h-[185px] grid-cols-[111px_1fr] gap-2 rounded-[7px] border border-[#e0e8f1] bg-white p-2.5 shadow-[0_1px_5px_rgba(15,52,86,0.025)] max-[1200px]:grid-cols-[95px_1fr] max-[640px]:min-h-[126px] max-[640px]:grid-cols-[82px_1fr] max-[640px]:gap-[9px] max-[640px]:p-2">
      {speaker.photo ? (
        <img
          className={cn(photoBase, "block bg-[#e8edf2] object-cover object-top")}
          src={speaker.photo}
          alt={speaker.name}
        />
      ) : (
        <div
          className={cn(
            photoBase,
            "grid place-items-center bg-[#eef4fc] text-[22px] font-extrabold text-[#075fd8]",
          )}
          aria-hidden
        >
          {initialsOf(speaker.name)}
        </div>
      )}
      <div className="flex min-w-0 flex-col">
        <span
          className={cn(
            "inline-flex min-h-6 items-center self-start whitespace-nowrap rounded px-[9px] text-[10px] font-bold text-white max-[640px]:min-h-5 max-[640px]:px-[7px] max-[640px]:text-[8px]",
            badgeClass(speaker.category),
          )}
        >
          {badgeText(speaker)}
        </span>
        <h2 className="mb-[3px] mt-2.5 text-xs font-extrabold leading-[1.16] text-[#101620] max-[640px]:mb-0.5 max-[640px]:mt-[7px] max-[640px]:text-[11px]">{speaker.name}</h2>
        {lines.length > 0 ? (
          <div className="text-[11px] leading-[1.22] text-[#4c5d76] max-[640px]:text-[9.5px]">
            {lines.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </div>
        ) : null}
        {speaker.country ? (
          <div className="mt-2 flex items-center gap-[7px] text-[10.5px] text-[#43536c] max-[640px]:mt-1.5 max-[640px]:text-[9px]">
            {speaker.flag ? (
              <span
                className="grid h-[15px] w-[23px] place-items-center overflow-hidden rounded-[1px] border border-[#ccd5df] text-xs leading-none max-[640px]:h-[13px] max-[640px]:w-5 max-[640px]:text-[10px]"
                aria-hidden
              >
                {speaker.flag}
              </span>
            ) : null}
            {speaker.country}
          </div>
        ) : null}
        <button
          type="button"
          className="mt-auto inline-flex cursor-pointer items-center gap-[7px] border-0 bg-transparent px-0 pb-0 pt-1.5 text-[11px] font-bold text-[#075fd8] max-[640px]:text-[9.5px]"
          onClick={() => onViewProfile?.(speaker)}
        >
          View Profile{" "}
          <span className="text-[20px] font-normal leading-none max-[640px]:text-[17px]" aria-hidden>
            →
          </span>
        </button>
      </div>
    </article>
  );
}

const gridColumns = {
  2: "grid-cols-[repeat(2,1fr)]",
  3: "grid-cols-[repeat(3,1fr)]",
  4: "grid-cols-[repeat(4,1fr)]",
} as const;

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
      className={cn(
        "grid gap-2.5 max-[960px]:grid-cols-[repeat(2,1fr)] max-[640px]:grid-cols-[1fr] max-[640px]:gap-2",
        gridColumns[columns],
        className,
      )}
    >
      {speakers.map((speaker) => (
        <SpeakerCard
          key={speaker.id}
          speaker={speaker}
          onViewProfile={onViewProfile}
        />
      ))}
      {speakers.length === 0 ? (
        <p className="col-span-full py-10 text-center text-[13px] text-[#4d5967]">{emptyMessage}</p>
      ) : null}
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
