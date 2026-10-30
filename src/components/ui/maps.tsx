
import { useEffect, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import {
  X,
  MapPin,
  Search,
  LocateFixed,
  Check,
  Loader2,
} from "lucide-react";

export type VenueLocation = {
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  placeId: string;
  googleMapsUrl: string;
};

type GoogleMapPickerModalProps = {
  open: boolean;
  initialLocation?: Partial<VenueLocation>;
  onClose: () => void;
  onSelect: (location: VenueLocation) => void;
};

const DEFAULT_CENTER = { lat: -1.286389, lng: 36.817223 };

export function GoogleMapPickerModal({
  open,
  initialLocation,
  onClose,
  onSelect,
}: GoogleMapPickerModalProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const searchElement = useRef<HTMLInputElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef =
    useRef<google.maps.places.Autocomplete | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [location, setLocation] = useState<VenueLocation>({
    name: initialLocation?.name || "",
    address: initialLocation?.address || "",
    city: initialLocation?.city || "",
    latitude: initialLocation?.latitude ?? DEFAULT_CENTER.lat,
    longitude: initialLocation?.longitude ?? DEFAULT_CENTER.lng,
    placeId: initialLocation?.placeId || "",
    googleMapsUrl: initialLocation?.googleMapsUrl || "",
  });

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !mapElement.current || !searchElement.current) return;

    let cancelled = false;

    const initializeMap = async () => {
      try {
        setLoading(true);

        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          throw new Error("Google Maps API key is missing.");
        }

        setOptions({
          key: apiKey,
          v: "weekly",
          language: "en",
        });

        await Promise.all([
          importLibrary("maps"),
          importLibrary("places"),
        ]);

        if (cancelled || !mapElement.current || !searchElement.current)
          return;

        const center = {
          lat: location.latitude,
          lng: location.longitude,
        };

        const map = new google.maps.Map(mapElement.current, {
          center,
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          clickableIcons: true,
          gestureHandling: "greedy",
          mapTypeId: "roadmap",
        });

        const marker = new google.maps.Marker({
          map,
          position: center,
          draggable: true,
          animation: google.maps.Animation.DROP,
        });

        const autocomplete =
          new google.maps.places.Autocomplete(searchElement.current, {
            fields: [
              "name",
              "formatted_address",
              "geometry",
              "place_id",
              "url",
              "address_components",
            ],
          });

        autocomplete.bindTo("bounds", map);

        const geocoder = new google.maps.Geocoder();

        mapRef.current = map;
        markerRef.current = marker;
        autocompleteRef.current = autocomplete;
        geocoderRef.current = geocoder;

        const updateFromCoordinates = async (
          lat: number,
          lng: number,
        ) => {
          marker.setPosition({ lat, lng });

          setLocation((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
          }));

          try {
            const result = await geocoder.geocode({
              location: { lat, lng },
            });

            const addressResult = result.results?.[0];

            if (addressResult) {
              const components = addressResult.address_components || [];

              const city =
                components.find((c) =>
                  c.types.includes("locality"),
                )?.long_name ||
                components.find((c) =>
                  c.types.includes("administrative_area_level_2"),
                )?.long_name ||
                "";

              setLocation((prev) => ({
                ...prev,
                address: addressResult.formatted_address || prev.address,
                city: city || prev.city,
                latitude: lat,
                longitude: lng,
                placeId: addressResult.place_id || prev.placeId,
                googleMapsUrl: addressResult.place_id
                  ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${addressResult.place_id}`
                  : `https://www.google.com/maps?q=${lat},${lng}`,
              }));
            }
          } catch (error) {
            console.error("Reverse geocoding failed:", error);
          }
        };

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();

          if (!place.geometry?.location) return;

          const position = place.geometry.location;
          const lat = position.lat();
          const lng = position.lng();

          map.setCenter(position);
          map.setZoom(17);
          marker.setPosition(position);

          const city =
            place.address_components?.find((c) =>
              c.types.includes("locality"),
            )?.long_name ||
            place.address_components?.find((c) =>
              c.types.includes("administrative_area_level_2"),
            )?.long_name ||
            "";

          setSearchValue(place.name || "");

          setLocation({
            name: place.name || "",
            address: place.formatted_address || "",
            city,
            latitude: lat,
            longitude: lng,
            placeId: place.place_id || "",
            googleMapsUrl:
              place.url ||
              `https://www.google.com/maps?q=${lat},${lng}`,
          });
        });

        marker.addListener("dragend", () => {
          const position = marker.getPosition();
          if (!position) return;

          void updateFromCoordinates(
            position.lat(),
            position.lng(),
          );
        });

        map.addListener("click", (event: google.maps.MapMouseEvent) => {
          if (!event.latLng) return;

          void updateFromCoordinates(
            event.latLng.lat(),
            event.latLng.lng(),
          );
        });

        setLoading(false);
      } catch (error) {
        console.error("Google Maps initialization failed:", error);
        setLoading(false);
      }
    };

    void initializeMap();

    return () => {
      cancelled = true;
      mapRef.current = null;
      markerRef.current = null;
      autocompleteRef.current = null;
      geocoderRef.current = null;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    setLocation({
      name: initialLocation?.name || "",
      address: initialLocation?.address || "",
      city: initialLocation?.city || "",
      latitude: initialLocation?.latitude ?? DEFAULT_CENTER.lat,
      longitude: initialLocation?.longitude ?? DEFAULT_CENTER.lng,
      placeId: initialLocation?.placeId || "",
      googleMapsUrl: initialLocation?.googleMapsUrl || "",
    });

    setSearchValue(initialLocation?.name || "");
  }, [open]);

  if (!open) return null;

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        mapRef.current?.setCenter({ lat, lng });
        mapRef.current?.setZoom(17);

        markerRef.current?.setPosition({ lat, lng });

        void geocoderRef.current?.geocode({
          location: { lat, lng },
        }).then((result) => {
          const item = result.results?.[0];
          if (!item) return;

          setLocation((prev) => ({
            ...prev,
            address: item.formatted_address || "",
            latitude: lat,
            longitude: lng,
            placeId: item.place_id || "",
            googleMapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
          }));
        });
      },
      (error) => console.error("Location access failed:", error),
      { enableHighAccuracy: true },
    );
  };

  const handleConfirm = () => {
    if (!location.latitude || !location.longitude) return;

    onSelect({
      ...location,
      name: location.name || searchValue || location.address,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="venue-picker-title"
        className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[min(780px,92vh)] sm:max-w-5xl sm:rounded-2xl"
      >
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue/10 text-blue">
              <MapPin size={20} />
            </div>
            <div className="min-w-0">
              <h2
                id="venue-picker-title"
                className="font-bold text-navy"
              >
                Select event venue
              </h2>
              <p className="text-xs text-mute">
                Search and pin your exact event location
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close venue picker"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-mute transition hover:bg-slate-100 hover:text-navy"
          >
            <X size={20} />
          </button>
        </header>

        {/* Search */}
        <div className="relative z-10 shrink-0 border-b border-slate-100 bg-white p-3 sm:px-6 sm:py-4">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute"
            />

            <input
              ref={searchElement}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search hotel, venue, building or address..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-blue focus:bg-white focus:ring-2 focus:ring-blue/10"
            />
          </div>

          <p className="mt-2 text-xs text-mute">
            Select a search result or click anywhere on the map to position
            your venue pin.
          </p>
        </div>

        {/* Map */}
        <div className="relative min-h-0 flex-1 bg-slate-100">
          <div ref={mapElement} className="h-full w-full" />

          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/90">
              <Loader2 size={28} className="animate-spin text-blue" />
              <p className="text-sm font-medium text-mute">
                Loading Google Maps...
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={useCurrentLocation}
            className="absolute bottom-4 right-4 flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-navy shadow-lg transition hover:bg-slate-50"
          >
            <LocateFixed size={17} className="text-blue" />
            My location
          </button>

          <div className="absolute left-3 top-3 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs font-medium text-mute shadow-sm">
            <MapPin size={13} className="mr-1 inline text-blue" />
            Drag the pin to adjust
          </div>
        </div>

        {/* Selected location */}
        <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green">
              <MapPin size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-mute">
                Selected location
              </p>
              <p className="mt-0.5 truncate text-sm font-bold text-navy">
                {location.name || "Choose a venue on the map"}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-mute">
                {location.address || "No address selected yet"}
              </p>
              <p className="mt-1 text-[11px] tabular-nums text-mute">
                {location.latitude.toFixed(6)},{" "}
                {location.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-2 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-navy transition hover:bg-slate-50 sm:flex-none"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={loading || !location.address}
              onClick={handleConfirm}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue px-5 text-sm font-semibold text-white transition hover:bg-blue/90 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              <Check size={17} />
              Use this location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
