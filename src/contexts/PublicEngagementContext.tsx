import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearPublicEngagementCache,
  getPublicEngagement,
} from "../lib/publicEvent";
import type { Engagement } from "../types/engagement";
import { PublicEngagementContext } from "./publicEngagementShared";

/** One shared public engagement fetch for layout + all public pages. */
export function PublicEngagementProvider({ children }: { children: ReactNode }) {
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicEngagement();
      setEngagement(data);
    } catch (err) {
      setEngagement(null);
      setError(err instanceof Error ? err.message : "Could not load event.");
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = useCallback(async () => {
    clearPublicEngagementCache();
    await load();
  }, [load]);

  useEffect(() => {
    void load();
  }, [load]);

  const value = useMemo(
    () => ({ engagement, loading, error, reload }),
    [engagement, loading, error, reload],
  );

  return (
    <PublicEngagementContext.Provider value={value}>
      {children}
    </PublicEngagementContext.Provider>
  );
}
