import { buffer, distance, point, pointsWithinPolygon, polygon } from "@turf/turf";
import type { Site } from "@/types/site";

export function sitesInsidePolygon(sites: Site[], coordinates: [number, number][]) {
  if (coordinates.length < 3) return [];
  const ring = coordinates[0][0] === coordinates.at(-1)?.[0] && coordinates[0][1] === coordinates.at(-1)?.[1] ? coordinates : [...coordinates, coordinates[0]];
  const result = pointsWithinPolygon({ type: "FeatureCollection", features: sites.map((site) => point([site.longitude, site.latitude], { id: site.id })) }, polygon([ring]));
  return result.features.map((feature) => String(feature.properties?.id));
}

export function nearbySites(sites: Site[], selectedSite: Site, radiusKm: number) {
  const origin = point([selectedSite.longitude, selectedSite.latitude]);
  return sites.filter((site) => site.id !== selectedSite.id).map((site) => ({ siteId: site.id, distanceKm: distance(origin, point([site.longitude, site.latitude]), { units: "kilometers" }) })).filter((item) => item.distanceKm <= radiusKm).sort((a, b) => a.distanceKm - b.distanceKm);
}

export function createBuffer(site: Site, radiusKm: number) {
  return buffer(point([site.longitude, site.latitude]), radiusKm, { units: "kilometers" });
}
