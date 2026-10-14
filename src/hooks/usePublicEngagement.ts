import { useEffect, useState } from "react";
import { usePublicEngagementContext } from "../contexts/PublicEngagementContext";
import type { Engagement } from "../types/engagement";
import { getPublicEngagement } from "../lib/publicEvent";

type PublicEngagementResult = {
  engagement: Engagement | null;
  loading: boolean;
  error: string | null;
  reload?: () => Promise<void>;
};

/**
 * Public featured engagement — prefers the shared provider (one network load),
 * with a standalone fetch fallback if used outside PublicLayout.
 */
export function usePublicEngagement(): PublicEngagementResult {
  const shared = usePublicEngagementContext();
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(!shared);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shared) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPublicEngagement();
        if (!cancelled) setEngagement(data);
      } catch (err) {
        if (!cancelled) {
          setEngagement(null);
          setError(err instanceof Error ? err.message : "Could not load event.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shared]);

  if (shared) return shared;
  return { engagement, loading, error };
}
