"use client";

import { useState } from "react";
import { CalendarDays, Download, Layers3, Map, Network, Radio, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MapLayerVisibility } from "@/components/map/map-view";
import type { SiteStatus } from "@/types/site";

export type MapStyleName = "light" | "dark" | "satellite";

interface Option {
  label: string;
  value: string;
}

function ToolbarSelect({ label, value, options, icon: Icon, className, onValueChange }: { label: string; value: string; options: Option[]; icon: typeof Radio; className?: string; onValueChange: (value: string) => void }) {
  return (
    <Select value={value} onValueChange={(nextValue) => { if (nextValue) onValueChange(nextValue); }}>
      <SelectTrigger aria-label={label} className={`h-10 gap-2 rounded-lg px-3 ${className ?? ""}`}>
        <Icon className="size-3.5 text-slate-500" />
        <span className="text-slate-700">{label}:</span>
        <SelectValue className="font-medium text-slate-950" />
      </SelectTrigger>
      <SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
    </Select>
  );
}

interface MapToolbarProps {
  status: SiteStatus | "all";
  region: string;
  regions: string[];
  dateRange: string;
  mapStyle: MapStyleName;
  layers: MapLayerVisibility;
  onStatusChange: (value: SiteStatus | "all") => void;
  onRegionChange: (value: string) => void;
  onDateRangeChange: (value: string) => void;
  onMapStyleChange: (value: MapStyleName) => void;
  onToggleLayer: (layer: keyof MapLayerVisibility) => void;
  onLocationSearch: (target: [number, number, number]) => void;
  onExportCsv: () => void;
  onExportGeoJson: () => void;
  rasterVisible: boolean;
  rasterOpacity: number;
  onRasterChange: (visible: boolean, opacity: number) => void;
}

export function MapToolbar({ status, region, regions, dateRange, mapStyle, layers, onStatusChange, onRegionChange, onDateRangeChange, onMapStyleChange, onToggleLayer, onLocationSearch, onExportCsv, onExportGeoJson, rasterVisible, rasterOpacity, onRasterChange }: MapToolbarProps) {
  const [locationQuery, setLocationQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  async function searchLocation(event: React.FormEvent) {
    event.preventDefault();
    if (!locationQuery.trim()) return;
    setIsSearching(true); setLocationError(null);
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationQuery)}.json?limit=1&access_token=${token}`);
      const data = await response.json();
      const center = data.features?.[0]?.center;
      if (!center) setLocationError("Location not found");
      else onLocationSearch([center[0], center[1], 10]);
    } catch { setLocationError("Search failed"); }
    finally { setIsSearching(false); }
  }
  return (
    <div className="flex h-[68px] shrink-0 items-center gap-2 px-5 2xl:gap-3">
      <ToolbarSelect label="Status" value={status} options={[
        { label: "All", value: "all" },
        { label: "Active", value: "active" },
        { label: "Delayed", value: "delayed" },
        { label: "Planned", value: "planned" },
        { label: "Completed", value: "completed" },
        { label: "On Hold", value: "on-hold" },
      ]} icon={Radio} onValueChange={(value) => onStatusChange(value as SiteStatus | "all")} />
      <ToolbarSelect label="Region" value={region} options={[{ label: "All", value: "all" }, ...regions.map((item) => ({ label: item, value: item }))]} icon={Network} onValueChange={onRegionChange} />
      <ToolbarSelect label="Activity Date" value={dateRange} options={[
        { label: "May 1 – May 31, 2024", value: "may-2024" },
        { label: "Apr 1 – Apr 30, 2024", value: "apr-2024" },
        { label: "Last 90 days", value: "last-90-days" },
      ]} icon={CalendarDays} className="max-w-[245px]" onValueChange={onDateRangeChange} />
      <ToolbarSelect label="Map Style" value={mapStyle} options={[
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
        { label: "Satellite", value: "satellite" },
      ]} icon={Map} className="hidden min-[1380px]:flex" onValueChange={(value) => onMapStyleChange(value as MapStyleName)} />

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" className="h-10 gap-2 px-3 text-slate-800" />}>
          <Layers3 className="size-4" />Layers
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 p-2">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Map layers</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={layers.sites} onCheckedChange={() => onToggleLayer("sites")}>
              Site locations
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={layers.clusters} onCheckedChange={() => onToggleLayer("clusters")}>
              Site clusters
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={layers.connections} onCheckedChange={() => onToggleLayer("connections")}>
              Connections
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={layers.regions} onCheckedChange={() => onToggleLayer("regions")}>
              Operational areas
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={rasterVisible} onCheckedChange={(checked) => onRasterChange(Boolean(checked), rasterOpacity)}>
              Terrain / data overlay
            </DropdownMenuCheckboxItem>
            {rasterVisible ? <div className="px-2 py-2"><label className="flex items-center justify-between text-[11px] text-slate-500"><span>Opacity</span><span>{Math.round(rasterOpacity * 100)}%</span></label><input aria-label="Raster opacity" type="range" min="0" max="1" step="0.05" value={rasterOpacity} onChange={(event) => onRasterChange(true, Number(event.target.value))} className="mt-1 w-full accent-blue-600" /></div> : null}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" className="h-10 gap-2 px-3 text-slate-800" />}><Download className="size-4" />Export</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 p-2"><DropdownMenuGroup><DropdownMenuLabel>Current results</DropdownMenuLabel><DropdownMenuSeparator /><button type="button" onClick={onExportCsv} className="flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-slate-100">CSV</button><button type="button" onClick={onExportGeoJson} className="flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-slate-100">GeoJSON</button></DropdownMenuGroup></DropdownMenuContent>
      </DropdownMenu>

      <form onSubmit={searchLocation} className="relative ml-auto min-w-[200px] max-w-[270px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
        <input aria-label="Search location" value={locationQuery} onChange={(event) => setLocationQuery(event.target.value)} placeholder="Search location..." className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
        {isSearching ? <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">...</span> : null}
        {locationError ? <span className="absolute left-0 top-11 z-20 rounded-md bg-red-50 px-2 py-1 text-[10px] text-red-700">{locationError}</span> : null}
      </form>
    </div>
  );
}
