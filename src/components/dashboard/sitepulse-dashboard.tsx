"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { area as turfArea, length as turfLength } from "@turf/turf";

import { MapToolbar, type MapStyleName } from "@/components/dashboard/map-toolbar";
import { StatsStrip } from "@/components/dashboard/stats-strip";
import { MapView, type MapLayerVisibility } from "@/components/map/map-view";
import { SiteDetailPanel } from "@/components/sites/site-detail-panel";
import { SitePanel, type SiteSort } from "@/components/sites/site-panel";
import { useSiteSelection } from "@/hooks/use-site-selection";
import type { Site, SiteStatus } from "@/types/site";
import type { AnalysisMode } from "@/types/site";
import { createActivities } from "@/data/activities";
import { createBuffer, nearbySites, sitesInsidePolygon } from "@/lib/analysis";
import { exportSitesCsv, exportSitesGeoJson } from "@/lib/export";

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
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("none");
  const [analysisCoordinates, setAnalysisCoordinates] = useState<[number, number][]>([]);
  const [analysisSelectedSiteIds, setAnalysisSelectedSiteIds] = useState<string[]>([]);
  const [nearbyRadiusKm, setNearbyRadiusKm] = useState(50);
  const [rasterVisible, setRasterVisible] = useState(false);
  const [rasterOpacity, setRasterOpacity] = useState(0.55);
  const [viewportBounds, setViewportBounds] = useState<[number, number, number, number] | null>(null);
  const [locationTarget, setLocationTarget] = useState<[number, number, number] | null>(null);
  const [measurement, setMeasurement] = useState<number | null>(null);
  const [layers, setLayers] = useState<MapLayerVisibility>({
    sites: true,
    clusters: true,
    connections: true,
    regions: true,
  });
  const { selectedSiteId, isDetailOpen, selectSite, closeDetail } = useSiteSelection(sites[0]?.id ?? null);
  const activities = useMemo(() => createActivities(sites), [sites]);

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

    const dateFilteredSites = sites.filter((site) => {
      if (dateRange === "may-2024") return activities.some((activity) => activity.siteId === site.id && activity.timestamp.startsWith("2024-05"));
      if (dateRange === "apr-2024") return activities.some((activity) => activity.siteId === site.id && activity.timestamp.startsWith("2024-04"));
      return true;
    });
    return dateFilteredSites
      .filter((site) => status === "all" || site.status === status)
      .filter((site) => region === "all" || site.region === region)
      .filter((site) => {
        if (!normalizedQuery) return true;
        return [site.name, site.city, site.county, site.region, site.id]
          .filter(Boolean)
          .some((value) => value!.toLocaleLowerCase().includes(normalizedQuery));
      })
      .filter((site) => !viewportBounds || (site.longitude >= viewportBounds[0] && site.longitude <= viewportBounds[2] && site.latitude >= viewportBounds[1] && site.latitude <= viewportBounds[3]))
      .toSorted((first, second) => {
        if (sort === "name") return first.name.localeCompare(second.name);
        return statusOrder[first.status] - statusOrder[second.status] || first.name.localeCompare(second.name);
      });
  }, [activities, dateRange, query, region, sites, sort, status, viewportBounds]);

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

  function clearAnalysis() {
    setAnalysisCoordinates([]);
    setAnalysisSelectedSiteIds([]);
    setAnalysisMode("none");
    setMeasurement(null);
  }

  function handleAnalysisPoint(coordinate: [number, number]) {
    setAnalysisCoordinates((current) => {
      const next = [...current, coordinate];
      if (analysisMode === "select-area" && next.length >= 3) setAnalysisSelectedSiteIds(sitesInsidePolygon(filteredSites, next));
      if (analysisMode === "measure-distance" && next.length >= 2) {
        const line = { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: next } } as GeoJSON.Feature<GeoJSON.LineString>;
        setMeasurement(turfLength(line, { units: "kilometers" }));
      }
      if (analysisMode === "measure-area" && next.length >= 3) {
        const closed = [...next, next[0]];
        setMeasurement(turfArea({ type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [closed] } }) / 1_000_000);
      }
      return next;
    });
  }

  const nearby = useMemo(() => {
    const selected = sites.find((site) => site.id === selectedSiteId);
    return analysisMode === "nearby" && selected ? nearbySites(filteredSites, selected, nearbyRadiusKm) : [];
  }, [analysisMode, filteredSites, nearbyRadiusKm, selectedSiteId, sites]);
  const analysisGeometry = useMemo(() => {
    if (analysisMode === "nearby") {
      const selected = sites.find((site) => site.id === selectedSiteId);
      return selected ? createBuffer(selected, nearbyRadiusKm) as unknown as GeoJSON.Feature : null;
    }
    if (analysisMode === "select-area" && analysisCoordinates.length >= 3) return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[...analysisCoordinates, analysisCoordinates[0]]] } } as GeoJSON.Feature;
    if (analysisMode === "measure-area" && analysisCoordinates.length >= 3) return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[...analysisCoordinates, analysisCoordinates[0]]] } } as GeoJSON.Feature;
    return null;
  }, [analysisCoordinates, analysisMode, nearbyRadiusKm, selectedSiteId, sites]);
  const exportSites = analysisSelectedSiteIds.length ? filteredSites.filter((site) => analysisSelectedSiteIds.includes(site.id)) : filteredSites;
  const exportFilename = `sitepulse-${status === "all" ? "all" : status}-${new Date().toISOString().slice(0, 10)}`;

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
            onLocationSearch={setLocationTarget}
            onExportCsv={() => exportSitesCsv(exportSites, `${exportFilename}.csv`)}
            onExportGeoJson={() => exportSitesGeoJson(exportSites, `${exportFilename}.geojson`)}
            rasterVisible={rasterVisible}
            rasterOpacity={rasterOpacity}
            onRasterChange={(visible, opacity) => { setRasterVisible(visible); setRasterOpacity(opacity); }}
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
              analysisMode={analysisMode}
              analysisCoordinates={analysisCoordinates}
              analysisGeometry={analysisGeometry}
              analysisSelectedSiteIds={analysisMode === "nearby" ? nearby.map((item) => item.siteId) : analysisSelectedSiteIds}
              rasterVisible={rasterVisible}
              rasterOpacity={rasterOpacity}
              locationTarget={locationTarget}
              onAnalysisModeChange={(mode) => { setAnalysisMode(mode); setAnalysisCoordinates([]); setAnalysisSelectedSiteIds([]); setMeasurement(null); }}
              onAnalysisPoint={handleAnalysisPoint}
              onClearAnalysis={clearAnalysis}
              onSearchThisArea={(bounds) => setViewportBounds([bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()])}
            />
            {(analysisSelectedSiteIds.length > 0 || nearby.length > 0 || measurement !== null || analysisMode === "nearby") && <div className="absolute left-7 top-[172px] z-20 max-w-[250px] rounded-lg border border-blue-200 bg-white/95 p-3 text-xs shadow-md"><p className="font-semibold text-slate-800">{analysisMode === "nearby" ? `Nearby Sites · ${nearbyRadiusKm} km` : analysisMode.startsWith("measure") ? `${analysisMode === "measure-distance" ? "Distance" : "Area"} measurement` : `${analysisSelectedSiteIds.length} sites selected`}</p>{analysisMode === "nearby" ? <div className="mt-2 flex gap-1">{[25, 50, 100].map((radius) => <button key={radius} type="button" onClick={() => setNearbyRadiusKm(radius)} className={`rounded px-2 py-1 text-[10px] ${radius === nearbyRadiusKm ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>{radius} km</button>)}</div> : null}{measurement !== null ? <p className="mt-1 text-lg font-semibold text-blue-700">{measurement.toFixed(1)} {analysisMode === "measure-area" ? "km²" : "km"}</p> : null}{nearby.length === 0 && analysisMode === "nearby" ? <p className="mt-2 text-slate-500">No nearby sites found.</p> : null}{nearby.slice(0, 4).map((item) => <button key={item.siteId} type="button" onClick={() => selectSite(item.siteId)} className="mt-1 block w-full text-left text-slate-600 hover:text-blue-700">{sites.find((site) => site.id === item.siteId)?.name} · {item.distanceKm.toFixed(1)} km</button>)}</div>}
          </section>
          {isDetailOpen && visibleSelectedSite ? <SiteDetailPanel site={visibleSelectedSite} onClose={closeDetail} /> : null}
        </div>
      </main>
    </div>
  );
}
