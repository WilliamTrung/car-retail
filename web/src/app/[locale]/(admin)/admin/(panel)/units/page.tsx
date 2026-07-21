import { requireAdmin } from "@/server/auth/session";
import { attributesService } from "@/server/modules/attributes";
import { UnitsManager } from "./UnitsManager";

export default async function AdminUnitsPage() {
  await requireAdmin("units");
  const [units, attributeKeys] = await Promise.all([
    attributesService.listUnitsAdmin(),
    attributesService.listAttributeKeys(),
  ]);

  return <UnitsManager units={units} attributeKeys={attributeKeys} />;
}
