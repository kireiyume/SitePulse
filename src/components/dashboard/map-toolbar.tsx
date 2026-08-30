"use client";

import { CalendarDays, Layers3, Map, Network, Radio } from "lucide-react";

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
}

export function MapToolbar({ status, region, regions, dateRange, mapStyle, layers, onStatusChange, onRegionChange, onDateRangeChange, onMapStyleChange, onToggleLayer }: MapToolbarProps) {
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
      <ToolbarSelect label="Date Range" value={dateRange} options={[
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
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
