const items = [
  ["Active", "bg-green-500"],
  ["On Hold", "bg-amber-400"],
  ["Delayed", "bg-orange-500"],
  ["Planned", "bg-violet-500"],
  ["Completed", "bg-cyan-500"],
];

export function MapLegend() {
  return (
    <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-4 rounded-lg border border-slate-200 bg-white/95 px-5 py-2.5 text-[10px] font-medium text-slate-600 shadow-[0_4px_14px_rgb(15_23_42_/_0.12)] backdrop-blur 2xl:gap-5 2xl:text-[11px]">
      {items.map(([label, color]) => <span key={label} className="flex items-center gap-1.5 whitespace-nowrap"><span className={`size-2 rounded-full ${color}`} />{label}</span>)}
      <span className="flex items-center gap-1.5 whitespace-nowrap"><span className="flex size-5 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-[9px]">2</span>Cluster</span>
    </div>
  );
}
