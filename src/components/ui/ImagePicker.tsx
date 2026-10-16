
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
};

async function createCroppedImage(
    imageSrc: string,
    area: Area,
  ): Promise<Blob> {
    const image = new Image();
    image.src = imageSrc;
  
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Unable to load image"));
    });
  
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
  
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable");
  
    context.drawImage(
      image,
      area.x,
      area.y,
      area.width,
      area.height,
      0,
      0,
      512,
      512,
    );
  
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to crop image"));
        },
        "image/jpeg",
        0.85,
      );
    });
}

export default function ImagePicker({
  value,
  onChange,
  imageKey='avatar.jpg'
}: Props) {
  const [source, setSource] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (source.startsWith("blob:")) {
        URL.revokeObjectURL(source);
      }
    };
  }, [source]);

  const onCropComplete = useCallback(
    (_: Area, pixels: Area) => setCroppedArea(pixels),
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
    setSource(URL.createObjectURL(file));
  };

  const saveCrop = async () => {
    if (!source || !croppedArea) return;
  
    try {
      const blob = await createCroppedImage(source, croppedArea);
      const file = new File(
        [blob],
        imageKey,
        { type: "image/jpeg" },
      );
  
      onChange(file);
      setSource("");
      setCroppedArea(null);
      setError("");
    } catch (e) {
      console.error("Image cropping failed:", e);
      setError("Could not crop this image. Please try another image");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
          {value ? (
            <img
              src={value}
              alt="Profile preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl text-gray-400">
              👤
            </div>
          )}
        </div>

        <div>
          <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
            {value ? "Change picture" : "Choose picture"}
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
              className="ml-3 text-sm text-red-600"
              onClick={() => onChange("")}
            >
              Remove
            </button>
          )}

          <p className="mt-2 text-xs text-gray-500">
            JPG, PNG or other supported image · Max 5 MB
          </p>
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      {source && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="crop-title"
            className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl"
          >
            <h3 id="crop-title" className="mb-4 text-lg font-semibold">
              Crop your picture
            </h3>

            <div className="relative h-72 overflow-hidden rounded-lg bg-gray-900">
              <Cropper
                image={source}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <label className="mt-5 block text-sm font-medium">
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

            {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border px-4 py-2"
                onClick={() => {
                  setSource("");
                  setCroppedArea(null);
                  setError("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-blue-700 px-4 py-2 text-white"
                onClick={saveCrop}
                disabled={!croppedArea}
              >
                Save picture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
