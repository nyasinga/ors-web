import { createContext } from "react";
import type { Engagement } from "../types/engagement";

export type PublicEngagementState = {
  engagement: Engagement | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

export const PublicEngagementContext = createContext<PublicEngagementState | null>(null);
