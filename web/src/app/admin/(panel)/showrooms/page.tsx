import { requireAdmin } from "@/server/auth/session";
import { showroomsService } from "@/server/modules/showrooms";
import { ShowroomsManager } from "./ShowroomsManager";

export default async function AdminShowroomsPage() {
  await requireAdmin("showrooms");
  const showrooms = await showroomsService.listShowroomsAdmin();

  return <ShowroomsManager showrooms={showrooms} />;
}
