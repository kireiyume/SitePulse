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

export type SiteActivityType = "inspection" | "maintenance" | "work-order" | "photo" | "status-change";

export interface SiteActivity {
  id: string;
  siteId: string;
  type: SiteActivityType;
  timestamp: string;
  title: string;
  description?: string;
}

export interface NearbySiteResult {
  siteId: string;
  distanceKm: number;
}

export type AnalysisMode = "none" | "select-area" | "nearby" | "measure-distance" | "measure-area";
