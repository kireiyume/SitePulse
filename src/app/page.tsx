import { SitePulseDashboard } from "@/components/dashboard/sitepulse-dashboard";
import { sites } from "@/data/sites";

export default function Home() {
  return <SitePulseDashboard sites={sites} />;
}
