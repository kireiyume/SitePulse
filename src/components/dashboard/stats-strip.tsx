import { Activity, Building2, CircleCheck, Clock3 } from "lucide-react";
import type { Site } from "@/types/site";

export function StatsStrip({ sites, totalSiteCount }: { sites: Site[]; totalSiteCount: number }) {
  const count = (status: Site["status"]) => sites.filter((site) => site.status === status).length;
  const percentage = (value: number) => sites.length === 0 ? 0 : Math.round((value / sites.length) * 100);
  const active = count("active");
  const completed = count("completed");
  const delayed = count("delayed");
  const stats = [
    { label: "Total Sites", value: sites.length, detail: `${totalSiteCount === 0 ? 0 : Math.round((sites.length / totalSiteCount) * 100)}% of all sites`, icon: Building2, color: "text-blue-600", ring: "bg-blue-100", core: "bg-blue-500" },
    { label: "Active", value: active, detail: `${percentage(active)}% of results`, icon: Activity, color: "text-green-700", ring: "bg-green-100", core: "bg-green-500" },
    { label: "Completed", value: completed, detail: `${percentage(completed)}% of results`, icon: CircleCheck, color: "text-cyan-700", ring: "bg-cyan-100", core: "bg-cyan-500" },
    { label: "Delayed", value: delayed, detail: `${percentage(delayed)}% of results`, icon: Clock3, color: "text-orange-700", ring: "bg-orange-100", core: "bg-orange-500" },
  ];

  return (
    <div className="grid h-[82px] shrink-0 grid-cols-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgb(15_23_42_/_0.03)]">
      {stats.map(({ label, value, detail, icon: Icon, color, ring, core }) => (
        <div key={label} className="flex min-w-0 items-center gap-3 border-r border-slate-100 px-3 last:border-r-0 2xl:px-4">
          <span className={`hidden size-11 shrink-0 items-center justify-center rounded-full ${ring} min-[1280px]:flex`}><span className={`flex size-8 items-center justify-center rounded-full ${core} text-white shadow-sm`}><Icon className="size-4" /></span></span>
          <div className="min-w-0"><p className="truncate text-xs font-medium text-slate-600">{label}</p><div className="mt-1 flex items-baseline gap-2"><span className={`text-xl font-semibold leading-none ${color}`}>{value}</span><span className="hidden truncate text-[10px] text-slate-500 2xl:inline">{detail}</span></div></div>
        </div>
      ))}
    </div>
  );
}
