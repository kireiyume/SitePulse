"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, Focus, MapPinned, MousePointer2, Pentagon, Ruler, Search, ShieldCheck, Square, Target } from "lucide-react";
import * as mapboxgl from "mapbox-gl/esm";

import type { MapStyleName } from "@/components/dashboard/map-toolbar";
import {
  getMapboxPublicToken,
  MAPBOX_INITIAL_CENTER,
  MAPBOX_INITIAL_ZOOM,
} from "@/lib/mapbox";
import type { AnalysisMode, Site } from "@/types/site";
import { MapLegend } from "./map-legend";

const SITE_SOURCE_ID = "mock-sites";
const ROUTE_SOURCE_ID = "mock-routes";
const REGION_SOURCE_ID = "mock-regions";
const REGION_FILL_LAYER_ID = "operational-region-fill";
const REGION_OUTLINE_LAYER_ID = "operational-region-outline";
const ROUTE_LAYER_ID = "operations-network";
const CLUSTER_LAYER_ID = "site-clusters";
const CLUSTER_HOVER_LAYER_ID = "site-cluster-hover";
const CLUSTER_COUNT_LAYER_ID = "site-cluster-count";
const SITE_LAYER_ID = "site-points";
const SELECTED_SITE_LAYER_ID = "selected-site-halo";
const SELECTED_SITE_LABEL_LAYER_ID = "selected-site-label";
const ANALYSIS_SELECTED_LAYER_ID = "analysis-selected-sites";
const ANALYSIS_SOURCE_ID = "analysis-geometry";
const ANALYSIS_FILL_LAYER_ID = "analysis-fill";
const ANALYSIS_LINE_LAYER_ID = "analysis-line";
const RASTER_SOURCE_ID = "risk-raster";
const RASTER_LAYER_ID = "risk-raster-layer";

const MAP_STYLES: Record<MapStyleName, string> = {
  light: "mapbox://styles/mapbox/light-v11",
  dark: "mapbox://styles/mapbox/dark-v11",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
};

const mapboxTokenResult = getMapboxPublicToken();

export interface MapLayerVisibility {
  sites: boolean;
  clusters: boolean;
  connections: boolean;
  regions: boolean;
}

interface MapViewProps {
  sites: Site[];
  selectedSiteId: string | null;
  mapStyle: MapStyleName;
  layers: MapLayerVisibility;
  onSelectSite: (siteId: string) => void;
  analysisMode: AnalysisMode;
  analysisCoordinates: [number, number][];
  analysisGeometry: GeoJSON.Feature | null;
  analysisSelectedSiteIds: string[];
  rasterVisible: boolean;
  rasterOpacity: number;
  locationTarget: [number, number, number] | null;
  onAnalysisModeChange: (mode: AnalysisMode) => void;
  onAnalysisPoint: (coordinate: [number, number]) => void;
  onClearAnalysis: () => void;
  onSearchThisArea: (bounds: mapboxgl.LngLatBounds) => void;
}

interface InteractiveMapFeature {
  id?: string | number;
  properties?: Record<string, unknown>;
  geometry: { type: string; coordinates?: unknown };
}

function sitesToGeoJson(sites: Site[]) {
  return {
    type: "FeatureCollection" as const,
    features: sites.map((site) => ({
      type: "Feature" as const,
      id: site.id,
      geometry: {
        type: "Point" as const,
        coordinates: [site.longitude, site.latitude],
      },
      properties: {
        id: site.id,
        name: site.name,
        status: site.status,
      },
    })),
  };
}

function addOperationalLayers(map: mapboxgl.Map, sites: Site[], selectedSiteId: string | null, analysisSelectedSiteIds: string[], layers: MapLayerVisibility) {
  if (!map.getSource(REGION_SOURCE_ID)) {
    map.addSource(REGION_SOURCE_ID, { type: "geojson", data: "/data/regions.geojson" });
    map.addLayer({
      id: REGION_FILL_LAYER_ID,
      type: "fill",
      source: REGION_SOURCE_ID,
      layout: { visibility: layers.regions ? "visible" : "none" },
      paint: {
        "fill-color": ["coalesce", ["get", "color"], "#2563eb"],
        "fill-opacity": 0.13,
      },
    });
    map.addLayer({
      id: REGION_OUTLINE_LAYER_ID,
      type: "line",
      source: REGION_SOURCE_ID,
      layout: { visibility: layers.regions ? "visible" : "none" },
      paint: {
        "line-color": ["coalesce", ["get", "color"], "#2563eb"],
        "line-width": 1.5,
        "line-opacity": 0.62,
      },
    });
  }

  if (!map.getSource(RASTER_SOURCE_ID)) {
    map.addSource(RASTER_SOURCE_ID, { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap contributors" });
    map.addLayer({ id: RASTER_LAYER_ID, type: "raster", source: RASTER_SOURCE_ID, layout: { visibility: "none" }, paint: { "raster-opacity": 0.55 } });
  }

  if (!map.getSource(ANALYSIS_SOURCE_ID)) {
    map.addSource(ANALYSIS_SOURCE_ID, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
    map.addLayer({ id: ANALYSIS_FILL_LAYER_ID, type: "fill", source: ANALYSIS_SOURCE_ID, paint: { "fill-color": "#2563eb", "fill-opacity": 0.12 } });
    map.addLayer({ id: ANALYSIS_LINE_LAYER_ID, type: "line", source: ANALYSIS_SOURCE_ID, paint: { "line-color": "#2563eb", "line-width": 2.5, "line-dasharray": [2, 1] } });
  }

  if (!map.getSource(ROUTE_SOURCE_ID)) {
    map.addSource(ROUTE_SOURCE_ID, { type: "geojson", data: "/data/routes.geojson" });
    map.addLayer({
      id: ROUTE_LAYER_ID,
      type: "line",
      source: ROUTE_SOURCE_ID,
      layout: {
        visibility: layers.connections ? "visible" : "none",
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": [
          "match",
          ["get", "status"],
          "active", "#0284c7",
          "delayed", "#f97316",
          "planned", "#8b5cf6",
          "#0284c7",
        ],
        "line-width": ["interpolate", ["linear"], ["zoom"], 4, 1.5, 9, 3],
        "line-dasharray": [2, 2],
        "line-opacity": 0.72,
      },
    });
  }

  if (map.getSource(SITE_SOURCE_ID)) return;

  map.addSource(SITE_SOURCE_ID, {
    type: "geojson",
    data: sitesToGeoJson(sites),
    cluster: true,
    clusterRadius: 50,
    clusterMaxZoom: 10,
    promoteId: "id",
  });

  map.addLayer({
    id: CLUSTER_LAYER_ID,
    type: "circle",
    source: SITE_SOURCE_ID,
    filter: ["has", "point_count"],
    layout: { visibility: layers.clusters ? "visible" : "none" },
    paint: {
      "circle-color": ["step", ["get", "point_count"], "#2563eb", 10, "#1d4ed8", 25, "#1e40af"],
      "circle-radius": ["step", ["get", "point_count"], 17, 10, 22, 25, 27],
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 3,
      "circle-opacity": 0.92,
    },
  });

  map.addLayer({
    id: CLUSTER_HOVER_LAYER_ID,
    type: "circle",
    source: SITE_SOURCE_ID,
    filter: ["==", ["get", "cluster_id"], -1],
    layout: { visibility: layers.clusters ? "visible" : "none" },
    paint: {
      "circle-color": "rgba(37, 99, 235, 0.12)",
      "circle-radius": ["+", ["step", ["get", "point_count"], 17, 10, 22, 25, 27], 5],
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 3,
    },
  });

  map.addLayer({
    id: CLUSTER_COUNT_LAYER_ID,
    type: "symbol",
    source: SITE_SOURCE_ID,
    filter: ["has", "point_count"],
    layout: {
      visibility: layers.clusters ? "visible" : "none",
      "text-field": ["get", "point_count_abbreviated"],
      "text-size": 11,
    },
    paint: { "text-color": "#ffffff" },
  });

  map.addLayer({
    id: SITE_LAYER_ID,
    type: "circle",
    source: SITE_SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    layout: { visibility: layers.sites ? "visible" : "none" },
    paint: {
      "circle-color": [
        "match",
        ["get", "status"],
        "active", "#22c55e",
        "delayed", "#f97316",
        "planned", "#9333ea",
        "completed", "#0ea5e9",
        "on-hold", "#eab308",
        "#64748b",
      ],
      "circle-radius": ["case", ["boolean", ["feature-state", "hover"], false], 10, 7],
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": ["case", ["boolean", ["feature-state", "hover"], false], 4, 2],
      "circle-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.94],
    },
  });

  map.addLayer({
    id: SELECTED_SITE_LAYER_ID,
    type: "circle",
    source: SITE_SOURCE_ID,
    filter: ["==", ["get", "id"], selectedSiteId ?? ""],
    layout: { visibility: layers.sites ? "visible" : "none" },
    paint: {
      "circle-color": "rgba(37, 99, 235, 0.18)",
      "circle-radius": 14,
      "circle-stroke-color": "#2563eb",
      "circle-stroke-width": 3,
    },
  });

  map.addLayer({
    id: SELECTED_SITE_LABEL_LAYER_ID,
    type: "symbol",
    source: SITE_SOURCE_ID,
    filter: ["==", ["get", "id"], selectedSiteId ?? ""],
    layout: {
      visibility: layers.sites ? "visible" : "none",
      "text-field": ["get", "name"],
      "text-size": 12,
      "text-offset": [0, 1.8],
      "text-anchor": "top",
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": "#0f172a",
      "text-halo-color": "#ffffff",
      "text-halo-width": 2,
    },
  });

  map.addLayer({
    id: ANALYSIS_SELECTED_LAYER_ID,
    type: "circle",
    source: SITE_SOURCE_ID,
    filter: ["in", ["get", "id"], ["literal", analysisSelectedSiteIds]],
    paint: { "circle-color": "#facc15", "circle-radius": 11, "circle-stroke-color": "#ffffff", "circle-stroke-width": 3 },
  });
}

function updateAnalysisGeometry(map: mapboxgl.Map, coordinates: [number, number][], geometry: GeoJSON.Feature | null) {
  const source = map.getSource(ANALYSIS_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
  if (!source) return;
  let feature: GeoJSON.Feature | null = geometry;
  if (!feature && coordinates.length >= 2) feature = { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } };
  source.setData({ type: "FeatureCollection", features: feature ? [feature] : [] });
}

function setLayerVisibility(map: mapboxgl.Map, layers: MapLayerVisibility) {
  const visibility = (visible: boolean) => visible ? "visible" : "none";
  for (const layerId of [SITE_LAYER_ID, SELECTED_SITE_LAYER_ID, SELECTED_SITE_LABEL_LAYER_ID, ANALYSIS_SELECTED_LAYER_ID]) {
    if (map.getLayer(layerId)) map.setLayoutProperty(layerId, "visibility", visibility(layers.sites));
  }
  for (const layerId of [CLUSTER_LAYER_ID, CLUSTER_HOVER_LAYER_ID, CLUSTER_COUNT_LAYER_ID]) {
    if (map.getLayer(layerId)) map.setLayoutProperty(layerId, "visibility", visibility(layers.clusters));
  }
  if (map.getLayer(ROUTE_LAYER_ID)) map.setLayoutProperty(ROUTE_LAYER_ID, "visibility", visibility(layers.connections));
  for (const layerId of [REGION_FILL_LAYER_ID, REGION_OUTLINE_LAYER_ID]) {
    if (map.getLayer(layerId)) map.setLayoutProperty(layerId, "visibility", visibility(layers.regions));
  }
}

function isPointCoordinates(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length >= 2 && typeof value[0] === "number" && typeof value[1] === "number";
}

function createSiteTooltip(name: unknown, status: unknown) {
  const content = document.createElement("div");
  const title = document.createElement("p");
  const metadata = document.createElement("p");
  title.className = "sitepulse-map-tooltip-title";
  metadata.className = "sitepulse-map-tooltip-meta";
  title.textContent = typeof name === "string" ? name : "Infrastructure site";
  metadata.textContent = typeof status === "string" ? status.replace("-", " ") : "Site";
  content.append(title, metadata);
  return content;
}

function fitSites(map: mapboxgl.Map, sites: Site[]) {
  if (sites.length === 0) return;
  if (sites.length === 1) {
    map.flyTo({ center: [sites[0].longitude, sites[0].latitude], zoom: 10, duration: 700 });
    return;
  }

  const bounds = new mapboxgl.LngLatBounds();
  sites.forEach((site) => bounds.extend([site.longitude, site.latitude]));
  map.fitBounds(bounds, { padding: 56, maxZoom: 8, duration: 700 });
}

export function MapView({ sites, selectedSiteId, mapStyle, layers, analysisMode, analysisCoordinates, analysisGeometry, analysisSelectedSiteIds, rasterVisible, rasterOpacity, locationTarget, onSelectSite, onAnalysisModeChange, onAnalysisPoint, onClearAnalysis, onSearchThisArea }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const sitesRef = useRef(sites);
  const selectedSiteIdRef = useRef(selectedSiteId);
  const layersRef = useRef(layers);
  const onSelectSiteRef = useRef(onSelectSite);
  const mapStyleRef = useRef(mapStyle);
  const analysisModeRef = useRef(analysisMode);
  const onAnalysisPointRef = useRef(onAnalysisPoint);
  const rasterVisibleRef = useRef(rasterVisible);
  const rasterOpacityRef = useRef(rasterOpacity);
  const analysisCoordinatesRef = useRef(analysisCoordinates);
  const analysisGeometryRef = useRef(analysisGeometry);
  const analysisSelectedSiteIdsRef = useRef(analysisSelectedSiteIds);
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    sitesRef.current = sites;
    selectedSiteIdRef.current = selectedSiteId;
    layersRef.current = layers;
    onSelectSiteRef.current = onSelectSite;
    analysisModeRef.current = analysisMode;
    onAnalysisPointRef.current = onAnalysisPoint;
    rasterVisibleRef.current = rasterVisible;
    rasterOpacityRef.current = rasterOpacity;
    analysisCoordinatesRef.current = analysisCoordinates;
    analysisGeometryRef.current = analysisGeometry;
    analysisSelectedSiteIdsRef.current = analysisSelectedSiteIds;
  }, [analysisCoordinates, analysisGeometry, analysisMode, analysisSelectedSiteIds, layers, onAnalysisPoint, onSelectSite, rasterOpacity, rasterVisible, selectedSiteId, sites]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || mapRef.current || !mapboxTokenResult.token || !mapboxgl.supported()) return;

    container.replaceChildren();

    const map = new mapboxgl.Map({
      accessToken: mapboxTokenResult.token,
      container,
      style: MAP_STYLES[mapStyleRef.current],
      center: MAPBOX_INITIAL_CENTER,
      zoom: MAPBOX_INITIAL_ZOOM,
      minZoom: 3,
      maxZoom: 18,
      attributionControl: false,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-left");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
    map.addControl(new mapboxgl.ScaleControl({ maxWidth: 80, unit: "imperial" }), "bottom-left");

    const tooltip = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 14,
      className: "sitepulse-map-tooltip",
    });
    const handleStyleLoad = () => {
      tooltip.remove();
      addOperationalLayers(map, sitesRef.current, selectedSiteIdRef.current, analysisSelectedSiteIdsRef.current, layersRef.current);
      if (map.getLayer(RASTER_LAYER_ID)) {
        map.setLayoutProperty(RASTER_LAYER_ID, "visibility", rasterVisibleRef.current ? "visible" : "none");
        map.setPaintProperty(RASTER_LAYER_ID, "raster-opacity", rasterOpacityRef.current);
      }
      updateAnalysisGeometry(map, analysisCoordinatesRef.current, analysisGeometryRef.current);
    };
    const showPointer = () => { map.getCanvas().style.cursor = "pointer"; };
    const resetPointer = () => { map.getCanvas().style.cursor = ""; };
    const registerInteractions = () => {
      map.addInteraction("site-click", {
        type: "click",
        target: { layerId: SITE_LAYER_ID },
        handler: (event) => {
          const siteId = event.feature?.properties?.id;
          if (typeof siteId === "string") onSelectSiteRef.current(siteId);
        },
      });
      map.addInteraction("cluster-click", {
        type: "click",
        target: { layerId: CLUSTER_LAYER_ID },
        handler: (event) => {
          const feature = event.feature as unknown as InteractiveMapFeature | undefined;
          const clusterId = Number(feature?.properties?.cluster_id);
          const coordinates = feature?.geometry.type === "Point" ? feature.geometry.coordinates : null;
          const source = map.getSource(SITE_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
          if (!source || !isPointCoordinates(coordinates) || !Number.isFinite(clusterId)) return;
          source.getClusterExpansionZoom(clusterId, (error, zoom) => {
            if (!error && zoom != null) map.easeTo({ center: coordinates, zoom });
          });
        },
      });
      map.addInteraction("site-hover-enter", {
        type: "mouseenter",
        target: { layerId: SITE_LAYER_ID },
        handler: (event) => {
          if (!event.feature) return;
          const feature = event.feature as unknown as InteractiveMapFeature;
          const coordinates = feature.geometry.type === "Point" ? feature.geometry.coordinates : null;
          const siteId = feature.properties?.id;
          if (typeof siteId === "string") map.setFeatureState({ source: SITE_SOURCE_ID, id: siteId }, { hover: true });
          showPointer();
          if (isPointCoordinates(coordinates)) {
            tooltip
              .setLngLat(coordinates)
              .setDOMContent(createSiteTooltip(feature.properties?.name, feature.properties?.status))
              .addTo(map);
          }
        },
      });
      map.addInteraction("site-hover-leave", {
        type: "mouseleave",
        target: { layerId: SITE_LAYER_ID },
        handler: (event) => {
          const feature = event.feature as unknown as InteractiveMapFeature | undefined;
          const siteId = feature?.properties?.id;
          if (typeof siteId === "string") map.setFeatureState({ source: SITE_SOURCE_ID, id: siteId }, { hover: false });
          tooltip.remove();
          resetPointer();
        },
      });
      map.addInteraction("cluster-hover-enter", {
        type: "mouseenter",
        target: { layerId: CLUSTER_LAYER_ID },
        handler: (event) => {
          if (!event.feature) return;
          const feature = event.feature as unknown as InteractiveMapFeature;
          const coordinates = feature.geometry.type === "Point" ? feature.geometry.coordinates : null;
          const clusterId = feature.properties?.cluster_id;
          if (typeof clusterId === "number" && map.getLayer(CLUSTER_HOVER_LAYER_ID)) {
            map.setFilter(CLUSTER_HOVER_LAYER_ID, ["==", ["get", "cluster_id"], clusterId]);
          }
          showPointer();
          if (isPointCoordinates(coordinates)) {
            const pointCount = feature.properties?.point_count;
            tooltip
              .setLngLat(coordinates)
              .setDOMContent(createSiteTooltip("Site cluster", typeof pointCount === "number" ? `${pointCount} sites` : "Multiple sites"))
              .addTo(map);
          }
        },
      });
      map.addInteraction("cluster-hover-leave", {
        type: "mouseleave",
        target: { layerId: CLUSTER_LAYER_ID },
        handler: () => {
          if (map.getLayer(CLUSTER_HOVER_LAYER_ID)) {
            map.setFilter(CLUSTER_HOVER_LAYER_ID, ["==", ["get", "cluster_id"], -1]);
          }
          tooltip.remove();
          resetPointer();
        },
      });
    };

    const handleMapClick = (event: mapboxgl.MapMouseEvent) => {
      if (analysisModeRef.current !== "none" && analysisModeRef.current !== "nearby") onAnalysisPointRef.current([event.lngLat.lng, event.lngLat.lat]);
    };
    const handleMoveEnd = () => { setHasMoved(true); };
    map.on("click", handleMapClick);
    map.on("moveend", handleMoveEnd);

    map.on("style.load", handleStyleLoad);
    map.once("load", registerInteractions);

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      tooltip.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const source = map?.getSource(SITE_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (source) source.setData(sitesToGeoJson(sites));
  }, [sites]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedSiteId) return;
    if (map.getLayer(SELECTED_SITE_LAYER_ID)) {
      const selectionFilter: mapboxgl.FilterSpecification = ["==", ["get", "id"], selectedSiteId];
      map.setFilter(SELECTED_SITE_LAYER_ID, selectionFilter);
      map.setFilter(SELECTED_SITE_LABEL_LAYER_ID, selectionFilter);
    }
    const selectedSite = sites.find((site) => site.id === selectedSiteId);
    if (selectedSite) map.flyTo({ center: [selectedSite.longitude, selectedSite.latitude], zoom: Math.max(map.getZoom(), 8), duration: 800 });
  }, [selectedSiteId, sites]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) setLayerVisibility(map, layers);
  }, [layers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    updateAnalysisGeometry(map, analysisCoordinates, analysisGeometry);
  }, [analysisCoordinates, analysisGeometry]);

  useEffect(() => {
    const map = mapRef.current;
    if (map?.getLayer(ANALYSIS_SELECTED_LAYER_ID)) map.setFilter(ANALYSIS_SELECTED_LAYER_ID, ["in", ["get", "id"], ["literal", analysisSelectedSiteIds]]);
  }, [analysisSelectedSiteIds]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getLayer(RASTER_LAYER_ID)) return;
    map.setLayoutProperty(RASTER_LAYER_ID, "visibility", rasterVisible ? "visible" : "none");
    map.setPaintProperty(RASTER_LAYER_ID, "raster-opacity", rasterOpacity);
  }, [rasterOpacity, rasterVisible]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && locationTarget) map.flyTo({ center: [locationTarget[0], locationTarget[1]], zoom: locationTarget[2], duration: 900 });
  }, [locationTarget]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapStyleRef.current === mapStyle) return;
    mapStyleRef.current = mapStyle;
    map.setStyle(MAP_STYLES[mapStyle]);
  }, [mapStyle]);

  function fitVisibleSites() {
    if (mapRef.current) fitSites(mapRef.current, sites);
  }

  if (!mapboxTokenResult.token) {
    return <MapConfigurationError message={mapboxTokenResult.error ?? "Mapbox public token is not configured."} />;
  }

  return (
    <div className="relative isolate min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-200 bg-[#e8eee4] shadow-inner">
      <div ref={containerRef} className="sitepulse-map absolute inset-0 z-0" aria-label="Interactive infrastructure operations map" />


      <div className="absolute left-3 top-[100px] z-10 space-y-2">
        <button type="button" onClick={fitVisibleSites} aria-label="Fit to visible sites" className="flex size-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-md hover:bg-slate-50"><Focus className="size-4" /></button>
      </div>

      <div className="absolute left-3 top-[150px] z-10 flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-md">
        <MapToolButton active={analysisMode === "none"} label="Normal selection" onClick={() => onAnalysisModeChange("none")}><MousePointer2 className="size-4" /></MapToolButton>
        <MapToolButton active={analysisMode === "select-area"} label="Select area" onClick={() => onAnalysisModeChange(analysisMode === "select-area" ? "none" : "select-area")}><Pentagon className="size-4" /></MapToolButton>
        <MapToolButton active={analysisMode === "measure-distance"} label="Measure distance" onClick={() => onAnalysisModeChange(analysisMode === "measure-distance" ? "none" : "measure-distance")}><Ruler className="size-4" /></MapToolButton>
        <MapToolButton active={analysisMode === "measure-area"} label="Measure area" onClick={() => onAnalysisModeChange(analysisMode === "measure-area" ? "none" : "measure-area")}><Square className="size-4" /></MapToolButton>
        <MapToolButton active={analysisMode === "nearby"} label="Nearby selected site" onClick={() => onAnalysisModeChange(analysisMode === "nearby" ? "none" : "nearby")}><Target className="size-4" /></MapToolButton>
        {(analysisCoordinates.length > 0 || analysisGeometry) && <MapToolButton active={false} label="Clear analysis" onClick={onClearAnalysis}><Eraser className="size-4" /></MapToolButton>}
      </div>

      {hasMoved && analysisMode === "none" ? <button type="button" onClick={() => { const bounds = mapRef.current?.getBounds(); if (bounds) onSearchThisArea(bounds); }} className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-medium text-blue-700 shadow-md hover:bg-blue-50"><Search className="size-3.5" />Search this area</button> : null}

      {analysisMode !== "none" && analysisMode !== "nearby" ? <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-blue-200 bg-white/95 px-3 py-2 text-xs text-slate-700 shadow-md"><Target className="mr-1 inline size-3.5 text-blue-600" />{analysisMode === "select-area" ? "Click 3+ points to select an area" : analysisMode === "measure-distance" ? "Click points to measure distance" : "Click 3+ points to measure area"}</div> : null}

      <MapLegend />
    </div>
  );
}

function MapToolButton({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} className={`flex size-9 items-center justify-center rounded-md ${active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{children}</button>;
}

function MapConfigurationError({ message }: { message: string }) {
  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-[radial-gradient(circle_at_center,#f8fafc_0,#e8eee4_70%)] p-6">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-lg">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-blue-50 text-blue-600"><MapPinned className="size-5" /></span>
        <h2 className="mt-4 text-sm font-semibold text-slate-900">Map configuration required</h2>
        <p className="mt-2 text-xs leading-5 text-slate-500">{message}</p>
        <code className="mt-4 block rounded-md bg-slate-950 px-3 py-2 text-[11px] text-slate-100">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.…</code>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-emerald-700"><ShieldCheck className="size-3.5" />Use a URL-restricted, least-privilege public token.</p>
      </div>
    </div>
  );
}
