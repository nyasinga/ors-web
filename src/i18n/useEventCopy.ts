import { useMemo } from "react";
import { usePublicEngagement } from "../hooks/usePublicEngagement";
import {
  engagementToEventCopy,
  engagementToRegistrationFees,
} from "../lib/publicEvent";

/** Live event copy for public chrome, registration, and login surfaces. */
export function useEventCopy() {
  const { engagement, loading } = usePublicEngagement();
  return useMemo(() => {
    const copy = engagementToEventCopy(engagement);
    return { ...copy, loading };
  }, [engagement, loading]);
}

/** Live registration fee tiers from engagement tickets. */
export function useRegistrationFees() {
  const { engagement, loading } = usePublicEngagement();
  return useMemo(() => {
    const fees = engagementToRegistrationFees(engagement);
    return { ...fees, loading };
  }, [engagement, loading]);
}
