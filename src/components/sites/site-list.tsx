"use client";

import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import type { Site } from "@/types/site";
import { SiteListItem } from "./site-list-item";

export function SiteList({ sites, selectedSiteId, onSelectSite }: { sites: Site[]; selectedSiteId: string | null; onSelectSite: (siteId: string) => void }) {
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedItemRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedSiteId]);

  if (sites.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
        <Search className="size-8 text-slate-300" />
        <p className="mt-3 text-sm font-semibold text-slate-700">No matching sites</p>
        <p className="mt-1 text-xs text-slate-400">Try changing your search or filters.</p>
      </div>
    );
  }

  return <div className="min-h-0 flex-1 overflow-y-auto">{sites.map((site) => <SiteListItem key={site.id} site={site} selected={site.id === selectedSiteId} onSelect={() => onSelectSite(site.id)} buttonRef={site.id === selectedSiteId ? selectedItemRef : undefined} />)}</div>;
}
