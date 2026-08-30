export type SiteStatus = "active" | "delayed" | "planned" | "completed" | "on-hold";

export interface Site {
  id: string;
  name: string;
  city: string;
  state: string;
  county?: string;
  region: string;
  type: string;
  manager: string;
  status: SiteStatus;
  longitude: number;
  latitude: number;
  completion: number;
  lastUpdated: string;
  estimatedCompletion?: string;
}
