import type { ReactNode } from "react";
import { usePublicEngagement } from "../../hooks/usePublicEngagement";
import { cn } from "../../lib/cn";
import {
  PublicEventSkeleton,
  type PublicEventSkeletonVariant,
} from "./PublicEventSkeleton";

type Props = {
  children: ReactNode;
  className?: string;
  /** Skeleton layout while the featured engagement loads. */
  variant?: PublicEventSkeletonVariant;
};

/**
 * Blocks public page body until the featured engagement is ready.
 * Shows a page-shaped skeleton while loading (header/footer stay visible).
 */
export function PublicEventGate({ children, className, variant = "page" }: Props) {
  const { engagement, loading, error, reload } = usePublicEngagement();

  if (loading) {
    return <PublicEventSkeleton variant={variant} className={className} />;
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
