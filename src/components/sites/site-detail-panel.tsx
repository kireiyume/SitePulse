import { BriefcaseBusiness, Camera, Check, ClipboardCheck, MapPin, Settings2, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Site, SiteStatus } from "@/types/site";
import { SiteQuickActions } from "./site-quick-actions";

const activities = [
  { title: "Inspection completed", detail: "Electrical systems inspection", date: "May 12, 2024 10:30 AM", icon: ClipboardCheck, bg: "bg-green-500" },
  { title: "Work order updated", detail: "WO-2456 · Panel installation", date: "May 11, 2024 02:15 PM", icon: BriefcaseBusiness, bg: "bg-blue-500" },
  { title: "Photo added", detail: "Site progress photo", date: "May 10, 2024 04:45 PM", icon: Camera, bg: "bg-violet-500" },
];

const statusPresentation: Record<SiteStatus, { label: string; text: string; dot: string; progressClass: string; track: string }> = {
  active: { label: "Active", text: "text-green-700", dot: "bg-green-500", progressClass: "[&_[data-slot=progress-indicator]]:bg-green-600", track: "On Track" },
  delayed: { label: "Delayed", text: "text-orange-700", dot: "bg-orange-500", progressClass: "[&_[data-slot=progress-indicator]]:bg-orange-500", track: "Needs Attention" },
  planned: { label: "Planned", text: "text-violet-700", dot: "bg-violet-500", progressClass: "[&_[data-slot=progress-indicator]]:bg-violet-500", track: "Scheduled" },
  completed: { label: "Completed", text: "text-cyan-700", dot: "bg-cyan-500", progressClass: "[&_[data-slot=progress-indicator]]:bg-cyan-500", track: "Complete" },
  "on-hold": { label: "On Hold", text: "text-amber-700", dot: "bg-amber-500", progressClass: "[&_[data-slot=progress-indicator]]:bg-amber-500", track: "Paused" },
};

export function SiteDetailPanel({ site, onClose }: { site: Site; onClose: () => void }) {
  const status = statusPresentation[site.status];
  const metadata = [
    { label: "Site ID", value: site.id, icon: Settings2 },
    { label: "Site Type", value: site.type, icon: BriefcaseBusiness },
    { label: "Manager", value: site.manager, icon: UserRound, accent: true },
    { label: "Region", value: site.region, icon: MapPin },
    { label: "Last Update", value: site.lastUpdated, icon: Settings2 },
  ];

  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white 2xl:w-[348px]">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 2xl:px-6">
        <header className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between"><span className={`flex items-center gap-2 text-xs font-medium ${status.text}`}><span className={`size-2 rounded-full ${status.dot}`} />{status.label}</span><Button variant="ghost" size="icon-sm" aria-label="Close detail panel" onClick={onClose}><X className="size-4" /></Button></div>
          <h2 className="mt-3 text-lg font-semibold tracking-[-0.02em] text-slate-950 2xl:text-xl">{site.name}</h2>
          <p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><MapPin className="size-3.5" />{site.county ? `${site.county}, ` : ""}{site.state}</p>
          <dl className="mt-4 space-y-3">{metadata.map(({ label, value, icon: Icon, accent }) => <div key={label} className="grid grid-cols-[16px_84px_1fr] items-center gap-2 text-xs"><Icon className="size-3.5 text-slate-400" /><dt className="text-slate-500">{label}</dt><dd className={`text-right font-medium ${accent ? "text-blue-600" : "text-slate-600"}`}>{value}</dd></div>)}</dl>
        </header>

        <section className="border-b border-slate-100 py-4">
          <div className="mb-3 flex items-center justify-between text-sm"><h3 className="font-medium text-slate-700">Completion</h3><span className="font-semibold text-slate-700">{site.completion}%</span></div>
          <Progress value={site.completion} className={`${status.progressClass} [&_[data-slot=progress-track]]:h-2`} />
          <div className="mt-3 flex items-center justify-between text-[11px]"><span className={`flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1.5 font-medium ${status.text}`}><Check className="size-3.5" />{status.track}</span><span className="text-slate-500">Estimated: {site.estimatedCompletion ?? "TBD"}</span></div>
        </section>

        <section className="border-b border-slate-100 py-4">
          <div className="mb-4 flex items-center justify-between"><h3 className="text-xs font-semibold text-slate-800">Recent Activity</h3><button type="button" className="text-xs font-medium text-blue-600 hover:text-blue-700">View all</button></div>
          <div className="space-y-4">{activities.map(({ title, detail, date, icon: Icon, bg }) => <div key={title} className="flex gap-3"><span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-white ${bg}`}><Icon className="size-4" /></span><div className="min-w-0"><p className="text-xs font-semibold text-slate-800">{title}</p><p className="mt-0.5 truncate text-[11px] text-slate-500">{detail}</p><p className="mt-0.5 text-[10px] text-slate-400">{date}</p></div></div>)}</div>
        </section>

        <section className="pt-4">
          <h3 className="mb-3 text-xs font-semibold text-slate-800">Quick Actions</h3>
          <SiteQuickActions site={site} />
        </section>
      </div>
    </aside>
  );
}
