import { API_BASE_URL, TENANT_ID, apiUpload } from "./api";
import { getValidAuthToken } from "./auth";

export type UploadedResource = {
  resourceID?: string;
  resourceName?: string;
  resourcePath?: string;
  mimeType?: string;
  resourceType?: string;
  moduleCode?: string;
  url?: string;
  [key: string]: unknown;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickResource(payload: unknown): UploadedResource {
  const root = asRecord(payload);
  if (!root) return {};

  const nested =
    asRecord(root.data) ||
    asRecord(root.resource) ||
    asRecord(root.result) ||
    (Array.isArray(root) ? asRecord(root[0]) : null);

  const source = nested || root;
  return {
    ...source,
    resourceID:
      typeof source.resourceID === "string"
        ? source.resourceID
        : typeof source.id === "string"
          ? source.id
          : undefined,
    resourceName: typeof source.resourceName === "string" ? source.resourceName : undefined,
    resourcePath: typeof source.resourcePath === "string" ? source.resourcePath : undefined,
    mimeType: typeof source.mimeType === "string" ? source.mimeType : undefined,
    resourceType: typeof source.resourceType === "string" ? source.resourceType : undefined,
    moduleCode: typeof source.moduleCode === "string" ? source.moduleCode : undefined,
    url:
      typeof source.url === "string"
        ? source.url
        : typeof source.publicUrl === "string"
          ? source.publicUrl
          : undefined,
  };
}

export const DEFAULT_EVENT_BANNER = "/assets/about-hero.png";

/** Event page banner: API banner/logo when set, otherwise static default. */
export function engagementBannerUrl(
  engagement: { bannerImage?: string | null; logo?: string | null } | null | undefined,
  fallback: string = DEFAULT_EVENT_BANNER,
): string {
  const raw = engagement?.bannerImage?.trim() || engagement?.logo?.trim() || "";
  if (!raw) return fallback;
  return resourcePublicUrl(raw) || fallback;
}

function withTenantQuery(url: string): string {
  if (!url || /[?&]tenant-id=/i.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}tenant-id=${encodeURIComponent(TENANT_ID)}`;
}

/** Resolve a stored photo/logo field or upload response to a browser-usable URL. */
export function resourcePublicUrl(resource: UploadedResource | string | null | undefined): string {
  if (!resource) return "";
  if (typeof resource === "string") {
    const value = resource.trim();
    if (!value) return "";
    if (value.startsWith("data:") || value.startsWith("blob:")) return value;
    if (/^(https?:)/i.test(value)) {
      return /\/resources\/download\//i.test(value) ? withTenantQuery(value) : value;
    }
    if (/\/resources\/download\//i.test(value)) {
      const path = value.startsWith("/") ? value : `/${value}`;
      return withTenantQuery(`${API_BASE_URL.replace(/\/$/, "")}${path}`);
    }
    if (value.startsWith("/")) {
      return /\/resources\/download\//i.test(value)
        ? withTenantQuery(`${API_BASE_URL.replace(/\/$/, "")}${value}`)
        : `${API_BASE_URL.replace(/\/$/, "")}${value}`;
    }
    // Bare resource id (ticket photo / logo) → authenticated download endpoint.
    if (!value.includes("/") && !value.includes(".")) {
      return withTenantQuery(
        `${API_BASE_URL.replace(/\/$/, "")}/resources/download/${encodeURIComponent(value)}`,
      );
    }
    return `${API_BASE_URL.replace(/\/$/, "")}/${value.replace(/^\/+/, "")}`;
  }

  if (resource.url?.trim()) return resourcePublicUrl(resource.url);
  if (resource.resourcePath?.trim()) {
    const path = resource.resourcePath.trim();
    if (/^https?:\/\//i.test(path) || path.startsWith("/") || /\/resources\/download\//i.test(path)) {
      return resourcePublicUrl(path);
    }
    if (!path.includes("/") && !path.includes(".")) {
      return resourcePublicUrl(path);
    }
    return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\/+/, "")}`;
  }
  if (resource.resourceID?.trim()) {
    return withTenantQuery(
      `${API_BASE_URL.replace(/\/$/, "")}/resources/download/${encodeURIComponent(resource.resourceID.trim())}`,
    );
  }
  return "";
}

export type UploadResourceOptions = {
  /** Defaults to a client-generated UUID (matches existing API resources). */
  resourceName?: string;
  /** Defaults to `rsc` (same as live resources). */
  moduleCode?: string;
  /** Defaults to the file mime type, or `image/jpeg`. */
  mimeType?: string;
  /** Defaults to the same value as mimeType. */
  resourceType?: string;
};

function extensionOf(fileName: string, mimeType: string): string {
  const fromName = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : "";
  if (fromName && fromName.length <= 8) return fromName;
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/gif") return ".gif";
  return ".jpg";
}

/**
 * POST multipart to /resources/upload.
 * The API requires resourceName, mimeType, resourceType, and moduleCode as form fields
 * in addition to `file` — file-only uploads return 422.
 */
export async function uploadResource(
  file: File,
  options: UploadResourceOptions = {},
): Promise<UploadedResource> {
  const mimeType = (options.mimeType || file.type || "image/jpeg").trim() || "image/jpeg";
  const resourceType = (options.resourceType || mimeType).trim() || mimeType;
  const moduleCode = (options.moduleCode || "rsc").trim() || "rsc";
  const resourceName = (options.resourceName || crypto.randomUUID()).trim();
  const filename = `${resourceName}${extensionOf(file.name || "", mimeType)}`;
  const uploadFile =
    file.name === filename && file.type === mimeType
      ? file
      : new File([file], filename, { type: mimeType });

  const formData = new FormData();
  formData.append("file", uploadFile, filename);
  formData.append("resourceName", resourceName);
  formData.append("mimeType", mimeType);
  formData.append("resourceType", resourceType);
  formData.append("moduleCode", moduleCode);

  const payload = await apiUpload<unknown>("/resources/upload", {
    formData,
    token: getValidAuthToken(),
  });

  const resource = pickResource(payload);
  const url = resourcePublicUrl(resource);
  if (!url && !resource.resourceID && !resource.resourcePath) {
    throw new Error("Upload succeeded but the server did not return a resource URL.");
  }
  return { ...resource, url: url || resource.url };
}
