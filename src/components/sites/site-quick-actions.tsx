"use client";

import { useEffect, useRef, useState } from "react";
import { BarChart3, BriefcaseBusiness, CalendarDays, CheckCircle2, ClipboardCheck, Eye, FilePlus2, MapPin, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Site } from "@/types/site";

type QuickAction = "details" | "work-orders" | "inspection" | "report";

const actionTitles: Record<QuickAction, string> = {
  details: "Site details",
  "work-orders": "Work orders",
  inspection: "Add inspection",
  report: "Create report",
};

export function SiteQuickActions({ site }: { site: Site }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [action, setAction] = useState<QuickAction | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (action && !dialog.open) dialog.showModal();
    if (!action && dialog.open) dialog.close();
  }, [action]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function finish(message: string) {
    setAction(null);
    setNotice(message);
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5">
        <Button type="button" variant="outline" onClick={() => setAction("details")} className="h-11 justify-start gap-2 text-xs text-slate-700"><Eye className="text-blue-600" />View Details</Button>
        <Button type="button" variant="outline" onClick={() => setAction("work-orders")} className="h-11 justify-start gap-2 text-xs text-slate-700"><BriefcaseBusiness className="text-blue-600" />Work Orders</Button>
        <Button type="button" variant="outline" onClick={() => setAction("inspection")} className="h-11 justify-start gap-2 text-xs text-slate-700"><FilePlus2 className="text-blue-600" />Add Inspection</Button>
        <Button type="button" variant="outline" onClick={() => setAction("report")} className="h-11 justify-start gap-2 text-xs text-slate-700"><BarChart3 className="text-blue-600" />Create Report</Button>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="quick-action-title"
        onCancel={(event) => { event.preventDefault(); setAction(null); }}
        onClick={(event) => { if (event.target === event.currentTarget) setAction(null); }}
        className="m-auto w-[min(92vw,520px)] rounded-xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/40 backdrop:backdrop-blur-[1px]"
      >
        {action ? (
          <div>
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 id="quick-action-title" className="text-base font-semibold text-slate-950">{actionTitles[action]}</h2>
                <p className="mt-0.5 text-xs text-slate-500">{site.name} · {site.id}</p>
              </div>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => setAction(null)} aria-label="Close dialog"><X /></Button>
            </header>
            <div className="max-h-[70vh] overflow-y-auto p-5">
              {action === "details" ? <SiteDetails site={site} onClose={() => setAction(null)} /> : null}
              {action === "work-orders" ? <WorkOrders site={site} onOpen={(id) => finish(`${id} opened in the mock workspace.`)} /> : null}
              {action === "inspection" ? <InspectionForm onSubmit={() => finish(`Inspection added to ${site.name}.`)} /> : null}
              {action === "report" ? <ReportForm onSubmit={() => finish(`Report generation started for ${site.name}.`)} /> : null}
            </div>
          </div>
        ) : null}
      </dialog>

      {notice ? (
        <div role="status" className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-xs font-medium text-white shadow-xl">
          <CheckCircle2 className="size-4 text-emerald-400" />
          {notice}
        </div>
      ) : null}
    </>
  );
}

function SiteDetails({ site, onClose }: { site: Site; onClose: () => void }) {
  const rows = [
    ["Location", `${site.city}, ${site.state}`],
    ["County", site.county ?? "—"],
    ["Operational region", site.region],
    ["Coordinates", `${site.latitude.toFixed(4)}, ${site.longitude.toFixed(4)}`],
    ["Site type", site.type],
    ["Manager", site.manager],
    ["Completion", `${site.completion}%`],
    ["Last updated", site.lastUpdated],
  ];

  return (
    <div>
      <div className="mb-4 flex items-start gap-3 rounded-lg bg-blue-50 p-3 text-blue-800">
        <MapPin className="mt-0.5 size-4 shrink-0" />
        <p className="text-xs leading-5">Complete Mock profile for the currently selected infrastructure site.</p>
      </div>
      <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200">
        {rows.map(([label, value]) => <div key={label} className="grid grid-cols-[140px_1fr] gap-4 px-4 py-3 text-xs"><dt className="text-slate-500">{label}</dt><dd className="text-right font-medium text-slate-800">{value}</dd></div>)}
      </dl>
      <div className="mt-5 flex justify-end"><Button type="button" variant="outline" onClick={onClose}>Close</Button></div>
    </div>
  );
}

function WorkOrders({ site, onOpen }: { site: Site; onOpen: (id: string) => void }) {
  const orders = [
    { id: `${site.id}-WO-2456`, title: "Panel inspection follow-up", due: "May 18, 2024", status: "In progress", color: "bg-blue-50 text-blue-700" },
    { id: `${site.id}-WO-2398`, title: "Preventive maintenance", due: "May 24, 2024", status: "Scheduled", color: "bg-violet-50 text-violet-700" },
    { id: `${site.id}-WO-2311`, title: "Access and safety review", due: "May 08, 2024", status: "Completed", color: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <article key={order.id} className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{order.title}</p><p className="mt-1 text-[11px] text-slate-400">{order.id}</p></div>
            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ${order.color}`}>{order.status}</span>
          </div>
          <div className="mt-4 flex items-center justify-between"><span className="flex items-center gap-1.5 text-[11px] text-slate-500"><CalendarDays className="size-3.5" />Due {order.due}</span><Button type="button" size="sm" variant="outline" onClick={() => onOpen(order.id)}>Open</Button></div>
        </article>
      ))}
    </div>
  );
}

function InspectionForm({ onSubmit }: { onSubmit: () => void }) {
  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }} className="space-y-4">
      <Field label="Inspection type"><select required defaultValue="routine" className={fieldClass}><option value="routine">Routine inspection</option><option value="safety">Safety audit</option><option value="electrical">Electrical systems</option><option value="structural">Structural review</option></select></Field>
      <Field label="Inspection date"><input required type="date" defaultValue="2024-05-13" className={fieldClass} /></Field>
      <Field label="Inspector"><input required defaultValue="Alex Morgan" className={fieldClass} /></Field>
      <Field label="Notes"><textarea rows={4} placeholder="Add inspection notes..." className={`${fieldClass} h-auto resize-none`} /></Field>
      <div className="flex justify-end pt-1"><Button type="submit"><ClipboardCheck />Save inspection</Button></div>
    </form>
  );
}

function ReportForm({ onSubmit }: { onSubmit: () => void }) {
  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }} className="space-y-4">
      <Field label="Report type"><select required defaultValue="status" className={fieldClass}><option value="status">Site status summary</option><option value="inspection">Inspection history</option><option value="work-orders">Work order summary</option><option value="executive">Executive overview</option></select></Field>
      <Field label="Date range"><select required defaultValue="may" className={fieldClass}><option value="may">May 1 – May 31, 2024</option><option value="quarter">Current quarter</option><option value="year">Year to date</option></select></Field>
      <fieldset className="rounded-lg border border-slate-200 p-4"><legend className="px-1 text-xs font-medium text-slate-700">Include sections</legend><div className="mt-1 grid grid-cols-2 gap-3 text-xs text-slate-600"><label className="flex items-center gap-2"><input type="checkbox" defaultChecked />Site overview</label><label className="flex items-center gap-2"><input type="checkbox" defaultChecked />Completion</label><label className="flex items-center gap-2"><input type="checkbox" defaultChecked />Activities</label><label className="flex items-center gap-2"><input type="checkbox" />Map snapshot</label></div></fieldset>
      <div className="flex justify-end pt-1"><Button type="submit"><BarChart3 />Generate report</Button></div>
    </form>
  );
}

const fieldClass = "mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-slate-700">{label}{children}</label>;
}
