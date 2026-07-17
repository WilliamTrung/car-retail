import { requireAdmin } from "@/server/auth/session";
import { vehiclesService } from "@/server/modules/vehicles";
import { ModelsList } from "./ModelsList";

type Props = {
  searchParams: Promise<{ line?: string; segment?: string }>;
};

export default async function AdminModelsPage({ searchParams }: Props) {
  await requireAdmin("models");
  const [{ line = "", segment = "" }, models, lines] = await Promise.all([
    searchParams,
    vehiclesService.listModelsAdmin(),
    vehiclesService.listLinesAdmin(),
  ]);
  const filtered = models.filter(
    (model) =>
      (!line || model.segment?.line.id === line) &&
      (!segment || model.segmentId === segment),
  );

  return (
    <ModelsList
      models={filtered}
      lines={lines}
      selectedLine={line}
      selectedSegment={segment}
    />
  );
}
