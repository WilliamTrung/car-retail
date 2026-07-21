import { notFound } from "next/navigation";
import { requireAdmin } from "@/server/auth/session";
import { attributesService } from "@/server/modules/attributes";
import { vehiclesService } from "@/server/modules/vehicles";
import { ModelEditor } from "../ModelEditor";

type Props = { params: Promise<{ id: string }> };

export default async function AdminModelEditorPage({ params }: Props) {
  await requireAdmin("models");
  const { id } = await params;
  const [model, lines, units, attributeKeys, templates] = await Promise.all([
    vehiclesService.getModelAdmin(id),
    vehiclesService.listLinesAdmin(),
    attributesService.listUnitsAdmin(),
    attributesService.listAttributeKeys(),
    attributesService.listTemplates(),
  ]);
  if (!model) notFound();

  return (
    <ModelEditor
      model={model}
      lines={lines}
      units={units}
      attributeKeys={attributeKeys}
      templates={templates}
    />
  );
}
