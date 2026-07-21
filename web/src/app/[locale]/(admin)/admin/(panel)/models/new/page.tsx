import { requireAdmin } from "@/server/auth/session";
import { attributesService } from "@/server/modules/attributes";
import { vehiclesService } from "@/server/modules/vehicles";
import { ModelEditor } from "../ModelEditor";

export default async function AdminCreateModelPage() {
  await requireAdmin("models");
  const [lines, units, attributeKeys, templates] = await Promise.all([
    vehiclesService.listLinesAdmin(),
    attributesService.listUnitsAdmin(),
    attributesService.listAttributeKeys(),
    attributesService.listTemplates(),
  ]);
  return (
    <ModelEditor
      lines={lines}
      units={units}
      attributeKeys={attributeKeys}
      templates={templates}
    />
  );
}
