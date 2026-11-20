import type { ReactNode } from "react";
import { EventEndedNotice } from "./EventEndedNotice";
import { usePublicEngagement } from "../../hooks/usePublicEngagement";
import { isRegistrationOpen } from "../../lib/eventLifecycle";
import { engagementToHomeContent } from "../../lib/publicEvent";
import { cn } from "../../lib/cn";
import { pageContainer } from "../../lib/pageContainer";

type Props = {
  children: ReactNode;
  /** Allow finishing an in-progress registration (e.g. invoice already issued). */
  allowContinue?: boolean;
};

/**
 * Soft-closes public registration flows when the event has ended
 * or registration is otherwise closed — archive pages stay available.
 */
export function RegistrationClosedGate({ children, allowContinue = false }: Props) {
  const { engagement, loading } = usePublicEngagement();
  const open = isRegistrationOpen(engagement);

  if (loading && !engagement) {
    return <>{children}</>;
  }

  if (open || allowContinue) return <>{children}</>;

  const home = engagementToHomeContent(engagement);

  return (
    <div className="bg-[#f7f9fc] py-12 sm:py-16">
      <div className={cn(pageContainer, "flex justify-center")}>
        <div className="w-full max-w-lg rounded-xl border border-[#e5e9ee] bg-white px-6 py-8 shadow-sm sm:px-8">
          <EventEndedNotice
            variant="page"
            eventName={engagement?.engagementName || home.subtitle}
            datesLabel={home.datesLabel}
            placeLabel={home.cityLine}
          />
        </div>
      </div>
    </div>
  );
}
