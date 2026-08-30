"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

import { MapToolbar, type MapStyleName } from "@/components/dashboard/map-toolbar";
import { StatsStrip } from "@/components/dashboard/stats-strip";
import { MapView, type MapLayerVisibility } from "@/components/map/map-view";
import { SiteDetailPanel } from "@/components/sites/site-detail-panel";
import { SitePanel, type SiteSort } from "@/components/sites/site-panel";
import { useSiteSelection } from "@/hooks/use-site-selection";
import type { Site, SiteStatus } from "@/types/site";

type StatusFilter = SiteStatus | "all";

export function SitePulseDashboard({ sites }: { sites: Site[] }) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [region, setRegion] = useState("all");
  const [sort, setSort] = useState<SiteSort>("status");
  const [isSitePanelCollapsed, setIsSitePanelCollapsed] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyleName>("light");
  const [dateRange, setDateRange] = useState("may-2024");
  const [layers, setLayers] = useState<MapLayerVisibility>({
    sites: true,
    clusters: true,
    connections: true,
    regions: true,
  });
  const { selectedSiteId, isDetailOpen, selectSite, closeDetail } = useSiteSelection(sites[0]?.id ?? null);

  const regions = useMemo(
    () => Array.from(new Set(sites.map((site) => site.region))).sort(),
    [sites],
  );

  const statusCounts = useMemo(
    () => sites.reduce<Partial<Record<SiteStatus, number>>>((counts, site) => {
      counts[site.status] = (counts[site.status] ?? 0) + 1;
      return counts;
    }, {}),
    [sites],
  );

  const filteredSites = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const statusOrder: Record<SiteStatus, number> = {
      active: 0,
      delayed: 1,
      planned: 2,
      "on-hold": 3,
      completed: 4,
    };

    return sites
      .filter((site) => status === "all" || site.status === status)
      .filter((site) => region === "all" || site.region === region)
      .filter((site) => {
        if (!normalizedQuery) return true;
        return [site.name, site.city, site.county, site.region, site.id]
          .filter(Boolean)
          .some((value) => value!.toLocaleLowerCase().includes(normalizedQuery));
      })
      .toSorted((first, second) => {
        if (sort === "name") return first.name.localeCompare(second.name);
        return statusOrder[first.status] - statusOrder[second.status] || first.name.localeCompare(second.name);
      });
  }, [query, region, sites, sort, status]);

  const visibleSelectedSite = filteredSites.find((site) => site.id === selectedSiteId) ?? filteredSites[0] ?? null;

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }

    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  function toggleLayer(layer: keyof MapLayerVisibility) {
    setLayers((current) => ({ ...current, [layer]: !current[layer] }));
  }

  return (
    <div className="flex h-dvh min-h-[720px] w-full overflow-hidden bg-white">
      <SitePanel
        sites={filteredSites}
        selectedSiteId={visibleSelectedSite?.id ?? null}
        query={query}
        status={status}
        statusCounts={statusCounts}
        sort={sort}
        collapsed={isSitePanelCollapsed}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onSelectSite={selectSite}
        onCollapsedChange={setIsSitePanelCollapsed}
      />

      <main className="flex min-w-0 flex-1 flex-col bg-white">
        <header className="flex h-[66px] shrink-0 items-center gap-6 px-5">
          <h1 className="shrink-0 text-[22px] font-semibold tracking-[-0.025em] text-slate-950 2xl:text-2xl">
            Infrastructure Operations Map
          </h1>
          <label className="relative ml-auto w-[42%] max-w-[350px] min-w-[260px] 2xl:mr-[300px]">
            <span className="sr-only">Search map</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-14 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Search map..."
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-slate-100 px-1.5 py-1 text-[10px] font-medium text-slate-400">⌘ K</span>
          </label>
        </header>

        <MapToolbar
          status={status}
          region={region}
          regions={regions}
          dateRange={dateRange}
          mapStyle={mapStyle}
          layers={layers}
          onStatusChange={setStatus}
          onRegionChange={setRegion}
          onDateRangeChange={setDateRange}
          onMapStyleChange={setMapStyle}
          onToggleLayer={toggleLayer}
        />

        <div className="flex min-h-0 flex-1 gap-3 pb-3 pl-2.5 pr-6 2xl:pb-3.5">
          <section className="flex min-w-0 flex-1 flex-col gap-2.5">
            <StatsStrip sites={filteredSites} totalSiteCount={sites.length} />
            <MapView
              sites={filteredSites}
              selectedSiteId={visibleSelectedSite?.id ?? null}
              mapStyle={mapStyle}
              layers={layers}
              onSelectSite={selectSite}
            />
          </section>
          {isDetailOpen && visibleSelectedSite ? <SiteDetailPanel site={visibleSelectedSite} onClose={closeDetail} /> : null}
        </div>
      </main>
    </div>
  );
}
