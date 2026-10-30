
import { useCallback, useEffect, useState } from "react";
import Cropper from "react-easy-crop";

type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = {
  value?: string;
  onChange: (image: File | "") => void;
  imageKey: string;
  aspect?: number;
  cropShape?: "rect" | "round";
  previewClassName?: string;
};

async function createCroppedImage(
  imageSrc: string,
  area: Area,
  aspect: number,
): Promise<Blob> {
  const image = new Image();
  image.src = imageSrc;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Unable to load image"));
  });

  // Generate a high-resolution output while preserving the selected ratio.
  const outputWidth = 1280;
  const outputHeight = Math.round(outputWidth / aspect);

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is unavailable");
  }

  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to crop image"));
      },
      "image/jpeg",
      0.9,
    );
  });
}

export default function ImagePicker({
  value,
  onChange,
  imageKey = "avatar.jpg",
  aspect = 1,
  cropShape = "round",
  previewClassName,
}: Props) {
  const [source, setSource] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isRound = cropShape === "round";

  // Release temporary crop image URLs.
  useEffect(() => {
    return () => {
      if (source.startsWith("blob:")) {
        URL.revokeObjectURL(source);
      }
    };
  }, [source]);

  const onCropComplete = useCallback(
    (_: Area, pixels: Area) => {
      setCroppedArea(pixels);
    },
    [],
  );

  const selectImage = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    setError("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);

    setSource(URL.createObjectURL(file));
  };

  const closeCropper = () => {
    setSource("");
    setCroppedArea(null);
    setError("");
    setZoom(1);
  };

  const saveCrop = async () => {
    if (!source || !croppedArea || isSaving) return;

    try {
      setIsSaving(true);

      const blob = await createCroppedImage(
        source,
        croppedArea,
        aspect,
      );

      const file = new File([blob], imageKey, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      onChange(file);
      closeCropper();
    } catch (e) {
      console.error("Image cropping failed:", e);
      setError("Could not crop this image. Please try another image.");
    } finally {
      setIsSaving(false);
    }
  };

  const defaultPreviewClass = isRound
    ? "h-24 w-24 rounded-full"
    : "w-full aspect-video rounded-xl";

  const previewClasses =
    previewClassName || defaultPreviewClass;

  return (
    <div className="space-y-4">
      {/* Image preview and controls */}
      <div
        className={
          isRound
            ? "flex items-center gap-4"
            : "grid gap-3"
        }
      >
        <div
          className={`shrink-0 overflow-hidden border border-gray-200 bg-gray-50 ${previewClasses}`}
        >
          {value ? (
            <img
              src={value}
              alt="Image preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center text-gray-400 ${
                isRound ? "text-3xl" : "flex-col gap-2"
              }`}
            >
              {isRound ? (
                <span>👤</span>
              ) : (
                <>
                  <span className="text-3xl">🖼️</span>
                  <span className="text-xs">
                    No background image selected
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-50">
            {value
              ? isRound
                ? "Change picture"
                : "Change background"
              : isRound
                ? "Choose picture"
                : "Choose background"}

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                selectImage(e.target.files?.[0]);
                e.currentTarget.value = "";
              }}
            />
          </label>

          {value && (
            <button
              type="button"
              className="ml-3 text-sm text-red-600 hover:text-red-700"
              onClick={() => {
                onChange("");
                setError("");
              }}
            >
              Remove
            </button>
          )}

          <p className="mt-2 text-xs text-gray-500">
            JPG, PNG or other supported image · Max 5 MB
          </p>

          {!isRound && (
            <p className="mt-1 text-xs text-gray-500">
              Recommended ratio: {aspect.toFixed(2)}:1
            </p>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Crop modal */}
      {source && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="crop-title"
            className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl"
          >
            <h3
              id="crop-title"
              className="mb-4 text-lg font-semibold text-gray-900"
            >
              Crop your {isRound ? "picture" : "background image"}
            </h3>

            <div
              className={`relative w-full overflow-hidden rounded-lg bg-gray-900 ${
                aspect > 1.5 ? "h-64" : "h-80"
              }`}
            >
              <Cropper
                image={source}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                cropShape={cropShape}
                showGrid={!isRound}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <label className="mt-5 block text-sm font-medium text-gray-700">
              Zoom

              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="mt-2 w-full"
              />
            </label>

            {error && (
              <p role="alert" className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                onClick={closeCropper}
                disabled={isSaving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={saveCrop}
                disabled={!croppedArea || isSaving}
              >
                {isSaving ? "Saving..." : "Save image"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
