import { requireAdmin } from "@/server/auth/session";
import { vehiclesService } from "@/server/modules/vehicles";
import { LinesManager } from "./LinesManager";

export default async function AdminModelLinesPage() {
  await requireAdmin("models");
  const lines = await vehiclesService.listLinesAdmin();
  return <LinesManager lines={lines} />;
}
