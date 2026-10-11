/** Workspace prefs persisted locally until a settings API exists. */

export type WorkspaceSettings = {
  organization: string;
  timezone: string;
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  firstDay: string;
  integrations: Record<string, boolean>;
};

const KEY = "ors_workspace_settings";

const defaults: WorkspaceSettings = {
  organization: "Anti-Counterfeit Authority",
  timezone: "Africa/Nairobi (EAT, UTC+3)",
  language: "English",
  currency: "KES — Kenyan Shilling",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24-hour",
  firstDay: "Monday",
  integrations: {},
};

export function loadWorkspaceSettings(): WorkspaceSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults, integrations: {} };
    const parsed = JSON.parse(raw) as Partial<WorkspaceSettings>;
    return {
      ...defaults,
      ...parsed,
      integrations: { ...defaults.integrations, ...(parsed.integrations || {}) },
    };
  } catch {
    return { ...defaults, integrations: {} };
  }
}

export function saveWorkspaceSettings(next: WorkspaceSettings) {
  localStorage.setItem(KEY, JSON.stringify(next));
}
