import type { Site } from "@/types/site";

function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportSitesCsv(sites: Site[], filename: string) {
  const fields = ["id", "name", "status", "region", "type", "city", "state", "latitude", "longitude", "completion", "lastUpdated"] as const;
  const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [fields.join(","), ...sites.map((site) => fields.map((field) => escape(site[field])).join(","))].join("\n");
  download(csv, filename, "text/csv;charset=utf-8");
}

export function exportSitesGeoJson(sites: Site[], filename: string) {
  const data = { type: "FeatureCollection", features: sites.map((site) => ({ type: "Feature", id: site.id, geometry: { type: "Point", coordinates: [site.longitude, site.latitude] }, properties: { ...site } })) };
  download(JSON.stringify(data, null, 2), filename, "application/geo+json");
}
