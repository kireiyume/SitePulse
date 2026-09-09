import type { Site, SiteActivity } from "@/types/site";

const activityTemplates: SiteActivity["type"][] = ["inspection", "work-order", "photo"];

export function createActivities(sites: Site[]): SiteActivity[] {
  return sites.flatMap((site, siteIndex) => activityTemplates.map((type, activityIndex) => ({
    id: `${site.id}-ACT-${activityIndex + 1}`,
    siteId: site.id,
    type,
    timestamp: `2024-05-${String(Math.max(1, 12 - Math.floor(siteIndex / 2) - activityIndex)).padStart(2, "0")}T${String(10 + activityIndex * 2).padStart(2, "0")}:30:00Z`,
    title: type === "inspection" ? "Inspection completed" : type === "work-order" ? "Work order updated" : "Photo added",
    description: type === "inspection" ? "Electrical systems inspection" : type === "work-order" ? "Panel installation follow-up" : "Site progress photo",
  })));
}
