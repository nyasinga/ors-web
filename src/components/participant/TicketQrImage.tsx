import { useEffect, useState } from "react";
import { cn } from "../../lib/cn";
import { generateTicketQrDataUrl, ticketQrPayload } from "../../lib/ticketQr";

type Props = {
  passCode?: string;
  reference?: string;
  className?: string;
  imgClassName?: string;
  alt?: string;
  /** Called when a data URL is ready (for download handlers). */
  onReady?: (dataUrl: string | null) => void;
};

export function TicketQrImage({
  passCode,
  reference,
  className,
  imgClassName,
  alt = "Event pass QR code",
  onReady,
}: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const payload = ticketQrPayload({ passCode, reference });

  useEffect(() => {
    let cancelled = false;
    setSrc(null);
    setFailed(false);
    onReady?.(null);

    if (!payload) {
      setFailed(true);
      return;
    }

    void generateTicketQrDataUrl(payload)
      .then((url) => {
        if (cancelled) return;
        setSrc(url);
        onReady?.(url);
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
        onReady?.(null);
      });

    return () => {
      cancelled = true;
    };
  }, [payload, onReady]);

  return (
    <div className={cn("grid place-items-center bg-white", className)}>
      {src ? (
        <img className={cn("block bg-white", imgClassName)} src={src} alt={alt} />
      ) : (
        <div
          className={cn(
            "grid place-items-center text-center text-[10px] font-medium text-[#687aa0]",
            imgClassName,
          )}
          role="status"
        >
          {failed || !payload ? "QR unavailable" : "Generating QR…"}
        </div>
      )}
    </div>
  );
}
