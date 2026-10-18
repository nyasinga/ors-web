import { Html5Qrcode } from "html5-qrcode";

export interface ParticipantQRCodeData {
  passCode: string;
  engagementID?: string;
}

export async function scanQRCode(
  elementId: string,
): Promise<ParticipantQRCodeData> {
  const scanner = new Html5Qrcode(elementId);

  return new Promise((resolve, reject) => {
    let completed = false;

    const finish = async (callback: () => void) => {
      if (completed) return;
      completed = true;

      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch {
        // Ignore camera cleanup errors.
      }

      scanner.clear();
      callback();
    };

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          void finish(() => {
            try {
              const url = new URL(decodedText);
              const passCode = url.searchParams.get("passCode");
              const engagementID = url.searchParams.get("engagementID");

              if (!passCode) {
                reject(new Error("QR code does not contain a pass code."));
                return;
              }

              resolve({ passCode, engagementID: engagementID ?? undefined });
            } catch {
              reject(new Error("Invalid participant QR code."));
            }
          });
        },
        () => {},
      )
      .catch((error) => {
        void finish(() =>
          reject(
            new Error(
              error instanceof Error
                ? error.message
                : "Unable to start the camera.",
            ),
          ),
        );
      });
  });
}