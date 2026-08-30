import type { Ref } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Site, SiteStatus } from "@/types/site";

const statusColors: Record<SiteStatus, string> = {
  active: "bg-emerald-500",
  delayed: "bg-orange-500",
  planned: "bg-violet-500",
  completed: "bg-sky-500",
  "on-hold": "bg-amber-500",
};

export function SiteListItem({ site, selected = false, onSelect, buttonRef }: { site: Site; selected?: boolean; onSelect: () => void; buttonRef?: Ref<HTMLButtonElement> }) {
  const location = selected && site.county ? `${site.county}, ${site.state}` : `${site.city}, ${site.state}`;

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group mx-4 flex min-h-[70px] w-[calc(100%-2rem)] items-center gap-3 border-b border-slate-100 px-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 2xl:mx-5 2xl:w-[calc(100%-2.5rem)]",
        selected && "my-0.5 rounded-md border border-blue-300 bg-blue-50/70 shadow-[0_1px_2px_rgb(15_23_42_/_0.03)]",
      )}
    >
      <span className={cn("size-2 shrink-0 rounded-full", selected ? "bg-blue-600" : statusColors[site.status])} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-slate-800 2xl:text-sm">{site.name}</span>
        <span className="mt-1 block truncate text-[11px] text-slate-500 2xl:text-xs">{location}</span>
      </span>
      {selected && <ChevronRight className="size-4 shrink-0 text-slate-600" />}
    </button>
  );
}
