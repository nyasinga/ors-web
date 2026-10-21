import { cn } from "../../lib/cn";

export type PublicEventSkeletonVariant = "home" | "page";

type Props = {
  variant?: PublicEventSkeletonVariant;
  className?: string;
};

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-[#e8eef8] via-[#f3f6fc] to-[#e8eef8] bg-[length:200%_100%]",
        className,
      )}
      aria-hidden
    />
  );
}

function HomeSkeleton() {
  return (
    <div className="text-[#0b1016]">
      <section className="relative isolate min-h-[516px] overflow-hidden bg-white max-[960px]:min-h-0">
        <div className="pointer-events-none absolute inset-y-0 left-[min(44%,520px)] right-0 z-0 hidden bg-[#eef3fb] min-[961px]:block" />
        <div
          className={cn(
            "relative z-[2] mx-auto box-border w-[min(calc(100%-32px),1180px)]",
            "min-[961px]:min-h-[516px] min-[961px]:px-[clamp(24px,3vw,48px)]",
            "max-[960px]:flex max-[960px]:flex-col",
          )}
        >
          <div
            className={cn(
              "relative min-w-0 pt-[43px]",
              "min-[961px]:max-w-[min(40%,460px)] min-[961px]:pb-10",
              "max-[960px]:w-full max-[960px]:pt-7",
            )}
          >
            <Bone className="mb-[22px] h-1.5 w-[112px]" />
            <Bone className="h-[72px] w-[min(100%,280px)] max-[960px]:h-14" />
            <Bone className="my-4 h-1 w-[190px]" />
            <Bone className="mt-3 h-6 w-[90%]" />
            <Bone className="mt-2 h-6 w-[70%]" />
            <Bone className="mt-4 h-4 w-[55%]" />
            <div className="mt-8 flex flex-wrap gap-3">
              <Bone className="h-[50px] w-[160px] rounded-[7px]" />
              <Bone className="h-[50px] w-[160px] rounded-[7px]" />
            </div>
          </div>

          <aside
            className={cn(
              "z-[3] flex min-w-0 flex-col",
              "min-[961px]:absolute min-[961px]:bottom-8 min-[961px]:right-[clamp(28px,4vw,64px)] min-[961px]:top-[clamp(56px,10%,88px)] min-[961px]:w-[min(40%,420px)]",
              "max-[960px]:relative max-[960px]:mt-6 max-[960px]:w-full max-[960px]:rounded-xl max-[960px]:border max-[960px]:border-dotted max-[960px]:border-[#c5d0ea] max-[960px]:px-4 max-[960px]:py-5",
            )}
          >
            <Bone className="mb-2.5 h-1 w-10" />
            <Bone className="h-4 w-full" />
            <Bone className="mt-2 h-4 w-[92%]" />
            <Bone className="mt-2 h-4 w-[80%]" />
            <Bone className="mt-2 h-4 w-[88%]" />
            <div className="mt-auto grid grid-cols-3 gap-2.5 pt-8 max-[960px]:mt-6 max-[960px]:pt-0">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <Bone className="h-11 w-11 rounded-full" />
                  <Bone className="h-2.5 w-14" />
                </div>
              ))}
            </div>
            <Bone className="mt-8 h-3 w-[85%] max-[960px]:mt-4" />
          </aside>
        </div>
      </section>

      <section className="border-b border-[#edf1f4] bg-white">
        <div className="mx-auto grid min-h-[111px] w-[min(calc(100%-32px),1180px)] grid-cols-5 items-center gap-3 max-[960px]:min-h-0 max-[960px]:grid-cols-2 max-[960px]:gap-4 max-[960px]:py-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 px-2 max-[960px]:px-0">
              <Bone className="h-10 w-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <Bone className="h-3 w-[80%]" />
                <Bone className="mt-2 h-2.5 w-[55%]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f7f9fc] py-12">
        <div className="mx-auto grid w-[min(calc(100%-32px),1180px)] gap-8 lg:grid-cols-2">
          <div>
            <Bone className="h-7 w-48" />
            <Bone className="mt-4 h-3.5 w-full" />
            <Bone className="mt-2 h-3.5 w-[95%]" />
            <Bone className="mt-2 h-3.5 w-[88%]" />
            <Bone className="mt-2 h-3.5 w-[70%]" />
          </div>
          <Bone className="min-h-[200px] w-full rounded-xl" />
        </div>
      </section>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-[#edf1f4] bg-[#07145b]">
        <div className="mx-auto w-[min(calc(100%-32px),1180px)] px-4 py-14 max-[640px]:py-10">
          <div className="h-3 w-24 animate-pulse rounded-md bg-white/20" aria-hidden />
          <div className="mt-4 h-9 w-[min(100%,320px)] animate-pulse rounded-md bg-white/25" aria-hidden />
          <div className="mt-3 h-3.5 w-[min(100%,480px)] animate-pulse rounded-md bg-white/15" aria-hidden />
        </div>
      </section>
      <section className="bg-white py-10">
        <div className="mx-auto grid w-[min(calc(100%-32px),1180px)] gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-[#e6eef8] bg-[#f9fbfe] p-5"
            >
              <Bone className="h-5 w-[60%]" />
              <Bone className="mt-3 h-3 w-full" />
              <Bone className="mt-2 h-3 w-[90%]" />
              <Bone className="mt-2 h-3 w-[75%]" />
              <Bone className="mt-5 h-9 w-28 rounded-lg" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Branded page-shaped placeholders while the public engagement loads. */
export function PublicEventSkeleton({ variant = "page", className }: Props) {
  return (
    <div
      className={cn(className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading event"
    >
      <span className="sr-only">Loading event…</span>
      {variant === "home" ? <HomeSkeleton /> : <PageSkeleton />}
    </div>
  );
}
