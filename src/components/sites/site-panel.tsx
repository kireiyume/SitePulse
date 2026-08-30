import { Activity, ChevronsLeft, ChevronsRight, RotateCcw, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Site, SiteStatus } from "@/types/site";
import { SiteList } from "./site-list";

const filters = [
  { label: "Active", value: "active", color: "bg-emerald-500" },
  { label: "Delayed", value: "delayed", color: "bg-orange-500" },
  { label: "Planned", value: "planned", color: "bg-violet-500" },
] satisfies { label: string; value: SiteStatus; color: string }[];

export type SiteSort = "status" | "name";

interface SitePanelProps {
  sites: Site[];
  selectedSiteId: string | null;
  query: string;
  status: SiteStatus | "all";
  statusCounts: Partial<Record<SiteStatus, number>>;
  sort: SiteSort;
  collapsed: boolean;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: SiteStatus | "all") => void;
  onSortChange: (value: SiteSort) => void;
  onSelectSite: (siteId: string) => void;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function SitePanel({
  sites,
  selectedSiteId,
  query,
  status,
  statusCounts,
  sort,
  collapsed,
  onQueryChange,
  onStatusChange,
  onSortChange,
  onSelectSite,
  onCollapsedChange,
}: SitePanelProps) {
  if (collapsed) {
    return (
      <aside className="flex h-full w-16 shrink-0 flex-col items-center border-r border-slate-200 bg-white py-5">
        <span className="flex size-9 items-center justify-center rounded-[45%_45%_45%_12%] bg-blue-600 text-white [transform:rotate(-45deg)]">
          <Activity className="size-5 [transform:rotate(45deg)]" />
        </span>
        <button type="button" onClick={() => onCollapsedChange(false)} aria-label="Expand site panel" className="mt-auto flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
          <ChevronsRight className="size-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-[20.7vw] min-w-[300px] max-w-[348px] shrink-0 flex-col border-r border-slate-200 bg-white">
      <header className="flex h-[96px] shrink-0 items-center gap-3 px-5 2xl:px-7">
        <span className="relative flex size-10 shrink-0 items-center justify-center rounded-[45%_45%_45%_12%] bg-blue-600 text-white shadow-sm [transform:rotate(-45deg)]">
          <Activity className="size-6 [transform:rotate(45deg)]" strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <p className="text-[19px] font-bold tracking-[-0.025em] text-slate-950 2xl:text-xl">SitePulse</p>
          <p className="truncate text-[10px] text-slate-500 2xl:text-[11px]">Infrastructure Monitoring Workspace</p>
        </div>
      </header>

      <div className="shrink-0 px-4 pb-[22px] 2xl:px-5">
        <div className="flex gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search sites</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => onQueryChange(event.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="Search sites..." />
          </label>
          <button type="button" onClick={() => { onQueryChange(""); onStatusChange("all"); }} aria-label="Clear site filters" title="Clear filters" disabled={!query && status === "all"} className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><RotateCcw className="size-4" /></button>
        </div>
      </div>

      <div className="shrink-0 px-4 pb-4 2xl:px-5">
        <div className="grid grid-cols-3 gap-1.5">
          {filters.map((filter) => (
            <button key={filter.value} type="button" aria-pressed={status === filter.value} onClick={() => onStatusChange(status === filter.value ? "all" : filter.value)} className={cn("flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-md border px-1 text-[11px] font-medium transition-colors 2xl:text-xs", status === filter.value ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50")}>
              <span className={`size-1.5 shrink-0 rounded-full ${filter.color}`} />
              <span className="truncate">{filter.label}</span>
              <span className="rounded bg-white/80 px-1 py-0.5 text-[10px] text-slate-500">{statusCounts[filter.value] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex h-[42px] shrink-0 items-center justify-between border-b border-slate-100 px-5 text-xs text-slate-500 2xl:px-6">
        <span>{sites.length} sites shown</span>
        <button type="button" onClick={() => onSortChange(sort === "status" ? "name" : "status")} className="flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900">Sort: {sort === "status" ? "Status" : "Name"} <span className="text-[10px]">⇅</span></button>
      </div>

      <SiteList sites={sites} selectedSiteId={selectedSiteId} onSelectSite={onSelectSite} />

      <div className="shrink-0 px-4 pb-4 pt-3 2xl:px-5">
        <button type="button" onClick={() => onCollapsedChange(true)} className="flex h-10 w-full items-center gap-2 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"><ChevronsLeft className="size-4" />Collapse</button>
      </div>
    </aside>
  );
}
