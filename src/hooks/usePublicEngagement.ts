import { useEffect, useState } from "react";
import type { Engagement } from "../types/engagement";
import { getPublicEngagement } from "../lib/publicEvent";

export function usePublicEngagement() {
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  return { engagement, loading, error };
}
