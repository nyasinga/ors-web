import { API_BASE_URL, apiUpload } from "./api";
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

/** Resolve a stored photo field or upload response to a browser-usable URL. */
export function resourcePublicUrl(resource: UploadedResource | string | null | undefined): string {
  if (!resource) return "";
  if (typeof resource === "string") {
    const value = resource.trim();
    if (!value) return "";
    if (value.startsWith("data:") || value.startsWith("blob:") || /^https?:\/\//i.test(value)) {
      return value;
    }
    if (value.startsWith("/")) return `${API_BASE_URL}${value}`;
    return `${API_BASE_URL}/${value}`;
  }

  if (resource.url?.trim()) return resourcePublicUrl(resource.url);
  if (resource.resourcePath?.trim()) {
    const path = resource.resourcePath.trim();
    if (/^https?:\/\//i.test(path) || path.startsWith("/")) return resourcePublicUrl(path);
    return `${API_BASE_URL}/${path}`;
  }
  if (resource.resourceID?.trim()) {
    return `${API_BASE_URL}/resources/download/${encodeURIComponent(resource.resourceID.trim())}`;
  }
  return "";
}

/** POST multipart to /resources/upload with field name `file`. */
export async function uploadResource(file: File): Promise<UploadedResource> {
  const formData = new FormData();
  formData.append("file", file, file.name);

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
