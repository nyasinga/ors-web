/** Same role as registration `IMAGE_KEY` — cropped passport filename. */
export const SPEAKER_PHOTO_KEY = "speaker-passport.jpg";

const DRAFT_PREFIX = "aca-ors-speaker-photos:";

type PersistedSpeakerPhoto = {
  dataUrl: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
};

function draftStorageKey(eventKey: string) {
  return `${DRAFT_PREFIX}${eventKey || "new"}`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Failed to read photo"));
    reader.readAsDataURL(file);
  });
}

/** Persist staged speaker photos (data URLs) — same idea as registration IMAGE_PERSIST_KEY. */
export async function persistSpeakerPhotoDrafts(
  eventKey: string,
  pending: Record<string, File>,
): Promise<void> {
  const key = draftStorageKey(eventKey);
  const ids = Object.keys(pending);
  if (!ids.length) {
    sessionStorage.removeItem(key);
    return;
  }

  const entries: Record<string, PersistedSpeakerPhoto> = {};
  await Promise.all(
    ids.map(async (id) => {
      const file = pending[id];
      if (!file) return;
      const dataUrl = await readFileAsDataUrl(file);
      if (!dataUrl) return;
      entries[id] = {
        dataUrl,
        name: file.name || SPEAKER_PHOTO_KEY,
        type: file.type || "image/jpeg",
        size: file.size,
        lastModified: file.lastModified,
      };
    }),
  );

  try {
    sessionStorage.setItem(key, JSON.stringify(entries));
  } catch (err) {
    console.error("Failed to persist speaker photo drafts:", err);
  }
}

/** Restore staged speaker photos into File objects + preview data URLs. */
export async function restoreSpeakerPhotoDrafts(eventKey: string): Promise<{
  files: Record<string, File>;
  previews: Record<string, string>;
}> {
  const raw = sessionStorage.getItem(draftStorageKey(eventKey));
  if (!raw) return { files: {}, previews: {} };

  try {
    const parsed = JSON.parse(raw) as Record<string, PersistedSpeakerPhoto>;
    const files: Record<string, File> = {};
    const previews: Record<string, string> = {};

    await Promise.all(
      Object.entries(parsed).map(async ([id, image]) => {
        if (!image?.dataUrl) return;
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], image.name || SPEAKER_PHOTO_KEY, {
          type: image.type || blob.type || "image/jpeg",
          lastModified: image.lastModified || Date.now(),
        });
        files[id] = file;
        previews[id] = image.dataUrl;
      }),
    );

    return { files, previews };
  } catch (err) {
    console.error("Failed to restore speaker photo drafts:", err);
    return { files: {}, previews: {} };
  }
}

export function clearSpeakerPhotoDrafts(eventKey: string) {
  sessionStorage.removeItem(draftStorageKey(eventKey));
}
