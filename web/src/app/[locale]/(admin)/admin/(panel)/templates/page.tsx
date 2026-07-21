import { requireAdmin } from "@/server/auth/session";
import { attributesService } from "@/server/modules/attributes";
import { vehiclesService } from "@/server/modules/vehicles";
import { TemplatesManager } from "./TemplatesManager";

export default async function AdminTemplatesPage() {
  await requireAdmin("templates");
  const [templates, attributeKeys, units, models] = await Promise.all([
    attributesService.listTemplates(),
    attributesService.listAttributeKeys(),
    attributesService.listUnitsAdmin(),
    vehiclesService.listModelsAdmin(),
  ]);

  return (
    <TemplatesManager
      templates={templates}
      attributeKeys={attributeKeys}
      units={units}
      models={models.map(({ id, name }) => ({ id, name }))}
    />
  );
}
