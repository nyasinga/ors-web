import type { ReactNode } from "react";
import { usePublicEngagement } from "../../hooks/usePublicEngagement";
import { cn } from "../../lib/cn";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Blocks public page body until the featured engagement is loaded from the API. */
export function PublicEventGate({ children, className }: Props) {
  const { engagement, loading, error, reload } = usePublicEngagement();

  if (loading) {
    return (
      <div
        className={cn(
          "mx-auto w-[min(calc(100%-32px),720px)] px-4 py-16 text-center text-[#4c5a9c]",
          className,
        )}
        role="status"
        aria-live="polite"
      >
        <p className="text-[15px] font-semibold text-[#07145b]">Loading event…</p>
        <p className="mt-2 text-[13px]">Fetching the latest published event from the API.</p>
      </div>
    );
  }

  if (error || !engagement) {
    return (
      <div
        className={cn(
          "mx-auto w-[min(calc(100%-32px),720px)] px-4 py-16 text-center",
          className,
        )}
        role="alert"
      >
        <p className="text-[15px] font-semibold text-[#07145b]">Event unavailable</p>
        <p className="mt-2 text-[13px] leading-relaxed text-[#4c5a9c]">
          {error ||
            "No published public event is available to display. Mark one event as featured in admin, or publish an event."}
        </p>
        {reload ? (
          <button
            type="button"
            className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#075fd8] px-4 text-[13px] font-semibold text-white hover:brightness-[0.96]"
            onClick={() => void reload()}
          >
            Try again
          </button>
        ) : null}
      </div>
    );
  }

  return <>{children}</>;
}
