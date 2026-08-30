"use client";

import { useEffect, useRef } from "react";
import { Focus, MapPinned, ShieldCheck } from "lucide-react";
import * as mapboxgl from "mapbox-gl/esm";

import type { MapStyleName } from "@/components/dashboard/map-toolbar";
import {
  getMapboxPublicToken,
  MAPBOX_INITIAL_CENTER,
  MAPBOX_INITIAL_ZOOM,
} from "@/lib/mapbox";
import type { Site } from "@/types/site";
import { MapLegend } from "./map-legend";

const SITE_SOURCE_ID = "mock-sites";
const ROUTE_SOURCE_ID = "mock-routes";
const REGION_SOURCE_ID = "mock-regions";
const REGION_FILL_LAYER_ID = "operational-region-fill";
const REGION_OUTLINE_LAYER_ID = "operational-region-outline";
const ROUTE_LAYER_ID = "operations-network";
const CLUSTER_LAYER_ID = "site-clusters";
const CLUSTER_COUNT_LAYER_ID = "site-cluster-count";
const SITE_LAYER_ID = "site-points";
const SELECTED_SITE_LAYER_ID = "selected-site-halo";
const SELECTED_SITE_LABEL_LAYER_ID = "selected-site-label";

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

function addOperationalLayers(map: mapboxgl.Map, sites: Site[], selectedSiteId: string | null, layers: MapLayerVisibility) {
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
  });

  map.addLayer({
    id: CLUSTER_LAYER_ID,
    type: "circle",
    source: SITE_SOURCE_ID,
    filter: ["has", "point_count"],
    layout: { visibility: layers.clusters ? "visible" : "none" },
    paint: {
      "circle-color": ["step", ["get", "point_count"], "#2563eb", 10, "#1d4ed8", 25, "#1e40af"],
      "circle-radius": [
        "+",
        ["step", ["get", "point_count"], 17, 10, 22, 25, 27],
        ["case", ["boolean", ["feature-state", "hover"], false], 4, 0],
      ],
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 3,
      "circle-opacity": 0.92,
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
}

function setLayerVisibility(map: mapboxgl.Map, layers: MapLayerVisibility) {
  const visibility = (visible: boolean) => visible ? "visible" : "none";
  for (const layerId of [SITE_LAYER_ID, SELECTED_SITE_LAYER_ID, SELECTED_SITE_LABEL_LAYER_ID]) {
    if (map.getLayer(layerId)) map.setLayoutProperty(layerId, "visibility", visibility(layers.sites));
  }
  for (const layerId of [CLUSTER_LAYER_ID, CLUSTER_COUNT_LAYER_ID]) {
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

export function MapView({ sites, selectedSiteId, mapStyle, layers, onSelectSite }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const sitesRef = useRef(sites);
  const selectedSiteIdRef = useRef(selectedSiteId);
  const layersRef = useRef(layers);
  const onSelectSiteRef = useRef(onSelectSite);
  const mapStyleRef = useRef(mapStyle);

  useEffect(() => {
    sitesRef.current = sites;
    selectedSiteIdRef.current = selectedSiteId;
    layersRef.current = layers;
    onSelectSiteRef.current = onSelectSite;
  }, [layers, onSelectSite, selectedSiteId, sites]);

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
      addOperationalLayers(map, sitesRef.current, selectedSiteIdRef.current, layersRef.current);
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
          map.setFeatureState(event.feature, { hover: true });
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
          if (event.feature) map.setFeatureState(event.feature, { hover: false });
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
          map.setFeatureState(event.feature, { hover: true });
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
        handler: (event) => {
          if (event.feature) map.setFeatureState(event.feature, { hover: false });
          tooltip.remove();
          resetPointer();
        },
      });
    };

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

      <MapLegend />
    </div>
  );
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
