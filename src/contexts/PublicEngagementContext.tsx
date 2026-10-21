import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  clearPublicEngagementCache,
  getPublicEngagement,
} from "../lib/publicEvent";
import type { Engagement } from "../types/engagement";
import { PublicEngagementContext } from "./publicEngagementShared";

const SESSION_CACHE_KEY = "ors_public_engagement_v1";

function readSessionEngagement(): Engagement | null {
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Engagement;
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.engagementID && !parsed.engagementName) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSessionEngagement(engagement: Engagement | null) {
  try {
    if (!engagement) {
      sessionStorage.removeItem(SESSION_CACHE_KEY);
      return;
    }
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(engagement));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

function clearSessionEngagement() {
  try {
    sessionStorage.removeItem(SESSION_CACHE_KEY);
  } catch {
    // ignore
  }
}

/** One shared public engagement fetch for layout + all public pages. */
export function PublicEngagementProvider({ children }: { children: ReactNode }) {
  const [engagement, setEngagement] = useState<Engagement | null>(() => readSessionEngagement());
  const [loading, setLoading] = useState(() => !readSessionEngagement());
  const [error, setError] = useState<string | null>(null);
  const engagementRef = useRef<Engagement | null>(null);
  engagementRef.current = engagement;

  const fetchEngagement = useCallback(async (opts?: { forceBlank?: boolean }) => {
    const showBlank = Boolean(opts?.forceBlank) || !engagementRef.current;
    if (showBlank) setLoading(true);
    setError(null);
    try {
      const data = await getPublicEngagement();
      setEngagement(data);
      writeSessionEngagement(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not load event.";
      if (engagementRef.current) {
        // Keep showing cached content; quiet failure.
        setError(null);
      } else {
        setEngagement(null);
        writeSessionEngagement(null);
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = useCallback(async () => {
    clearPublicEngagementCache();
    clearSessionEngagement();
    engagementRef.current = null;
    setEngagement(null);
    await fetchEngagement({ forceBlank: true });
  }, [fetchEngagement]);

  useEffect(() => {
    void fetchEngagement();
  }, [fetchEngagement]);

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
