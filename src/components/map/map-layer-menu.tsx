import { Layers3 } from "lucide-react";

export function MapLayerMenu() {
  return <div className="absolute right-4 top-4 hidden rounded-lg border bg-white p-3 text-xs shadow-md"><p className="flex items-center gap-2 font-semibold"><Layers3 className="size-4" />Map layers</p></div>;
}
