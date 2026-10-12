import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "../../lib/cn";

export type ToastTone = "info" | "success" | "error";

export type ToastInput = {
  message: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
  durationMs: number;
};

type ToastApi = {
  push: (input: ToastInput | string) => void;
  info: (message: string, durationMs?: number) => void;
  success: (message: string, durationMs?: number) => void;
  error: (message: string, durationMs?: number) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

let toastId = 0;
function nextId() {
  toastId += 1;
  return `toast-${toastId}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (input: ToastInput | string) => {
      const payload = typeof input === "string" ? { message: input } : input;
      const message = payload.message?.trim();
      if (!message) return;
      const id = nextId();
      const tone = payload.tone ?? "info";
      const durationMs = payload.durationMs ?? (tone === "error" ? 4200 : 2600);
      setItems((prev) => [...prev.slice(-4), { id, message, tone, durationMs }]);
      const timer = window.setTimeout(() => dismiss(id), durationMs);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => window.clearTimeout(timer));
      map.clear();
    };
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      push,
      info: (message, durationMs) => push({ message, tone: "info", durationMs }),
      success: (message, durationMs) => push({ message, tone: "success", durationMs }),
      error: (message, durationMs) => push({ message, tone: "error", durationMs }),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toaster items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

function Toaster({
  items,
  onDismiss,
}: {
  items: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (!items.length) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex flex-col items-center gap-2 px-4"
      aria-live="polite"
      aria-relevant="additions"
    >
      {items.map((item) => {
        const Icon =
          item.tone === "success" ? CheckCircle2 : item.tone === "error" ? XCircle : Info;
        return (
          <div
            key={item.id}
            role={item.tone === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto create-wizard-modal-panel flex max-w-[min(420px,calc(100vw-2rem))] items-start gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-lg",
              item.tone === "success" && "bg-[#087747]",
              item.tone === "error" && "bg-[#c81e1e]",
              item.tone === "info" && "bg-[#07145c]",
            )}
          >
            <Icon size={16} className="mt-0.5 shrink-0 opacity-95" aria-hidden />
            <span className="min-w-0 flex-1 leading-snug">{item.message}</span>
            <button
              type="button"
              className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded text-white/80 hover:bg-white/15 hover:text-white"
              aria-label="Dismiss notification"
              onClick={() => onDismiss(item.id)}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
