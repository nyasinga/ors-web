import { Modal } from "../ui/Modal";
import { cn } from "../../lib/cn";
import { resourcePublicUrl } from "../../lib/resources";
import type { SpeakerCategory } from "../../data/publicContent";
import type { SpeakerCardData } from "./SpeakerCard";

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

type Props = {
  speaker: SpeakerCardData | null;
  onClose: () => void;
};

export function SpeakerProfileModal({ speaker, onClose }: Props) {
  const lines = speaker ? roleLinesOf(speaker) : [];
  const hasPhoto = Boolean(speaker?.photo?.trim() && !speaker?.photo?.trim().includes("/assets/"));

  return (
    <Modal
      open={Boolean(speaker)}
      onClose={onClose}
      title="Speaker Profile"
      className="md:max-w-xl"
    >
      {speaker ? (
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 max-[480px]:flex-col max-[480px]:items-center max-[480px]:text-center">
            {hasPhoto ? (
              <img
                className="h-[140px] w-[100px] shrink-0 rounded-md bg-[#e8edf2] object-cover object-top max-[480px]:h-[160px] max-[480px]:w-[120px]"
                src={resourcePublicUrl(speaker.photo!)}
                alt={speaker.name}
              />
            ) : (
              <div
                className="grid h-[140px] w-[100px] shrink-0 place-items-center rounded-md bg-[#eef4fc] text-[28px] font-extrabold text-[#075fd8] max-[480px]:h-[160px] max-[480px]:w-[120px]"
                aria-hidden
              >
                {initialsOf(speaker.name)}
              </div>
            )}
            <div className="min-w-0 flex-1 max-[480px]:flex max-[480px]:flex-col max-[480px]:items-center">
              <span
                className={cn(
                  "inline-flex min-h-6 items-center self-start whitespace-nowrap rounded px-[9px] text-[10px] font-bold text-white max-[480px]:self-center",
                  badgeClass(speaker.category),
                )}
              >
                {badgeText(speaker)}
              </span>
              <h3 className="mt-2 text-lg font-extrabold leading-tight text-[#101620]">{speaker.name}</h3>
              {lines.length > 0 ? (
                <div className="mt-1.5 text-[13px] leading-snug text-[#4c5d76]">
                  {lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              ) : null}
              {speaker.country ? (
                <div className="mt-2.5 flex items-center gap-2 text-[12px] text-[#43536c] max-[480px]:justify-center">
                  {speaker.flag ? (
                    <span
                      className="grid h-4 w-6 place-items-center overflow-hidden rounded-[1px] border border-[#ccd5df] text-sm leading-none"
                      aria-hidden
                    >
                      {speaker.flag}
                    </span>
                  ) : null}
                  {speaker.country}
                </div>
              ) : null}
            </div>
          </div>

          {speaker.topic?.trim() ? (
            <div>
              <h4 className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#075fd8]">Topic</h4>
              <p className="text-[13px] leading-relaxed text-[#203250]">{speaker.topic}</p>
            </div>
          ) : null}

          {speaker.bio?.trim() ? (
            <div>
              <h4 className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#075fd8]">Biography</h4>
              <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#203250]">{speaker.bio}</p>
            </div>
          ) : !speaker.topic?.trim() ? (
            <p className="text-[13px] leading-relaxed text-[#6b7a90]">
              No biography has been published for this speaker yet.
            </p>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
