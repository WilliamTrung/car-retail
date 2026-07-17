import { redirect } from "next/navigation";

import { requireAdmin } from "@/server/auth/session";
import { vehiclesService } from "@/server/modules/vehicles";

import { createModelAction } from "../actions";

type Props = {
  searchParams: Promise<{ error?: string; created?: string }>;
};

/** Minimal unstyled create form — exercises createModelAction + revalidateTag. */
export default async function AdminCreateModelPage({ searchParams }: Props) {
  await requireAdmin("models");
  const { error, created } = await searchParams;
  const lines = await vehiclesService.listLinesAdmin();
  const segments = lines.flatMap((line) =>
    line.segments.map((seg) => ({
      id: seg.id,
      label: `${line.key}/${seg.key}`,
    })),
  );

  async function createAction(formData: FormData) {
    "use server";
    const slug = String(formData.get("slug") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const segmentId = String(formData.get("segmentId") ?? "").trim();
    const published = formData.get("published") === "on";
    const result = await createModelAction({
      segmentId,
      name: { vi: name, en: name },
      slug: { vi: slug, en: slug },
      attributes: [
        { key: "range", value: 400, unit: "km" },
        { key: "power", value: 100, unit: "kW" },
      ],
      published,
    });
    if (!result.ok) {
      redirect(
        `/admin/models/new?error=${encodeURIComponent(result.error.message)}`,
      );
    }
    redirect(`/admin/models/new?created=${encodeURIComponent(slug)}`);
  }

  return (
    <main>
      <h1>Create model</h1>
      {error ? <p role="alert">{error}</p> : null}
      {created ? (
        <p data-testid="created-slug" data-slug={created}>
          Created: {created}
        </p>
      ) : null}
      {segments.length === 0 ? (
        <p role="alert">No segments — run db:seed first.</p>
      ) : (
        <form action={createAction}>
          <div>
            <label htmlFor="segmentId">Segment</label>
            <select id="segmentId" name="segmentId" required>
              {segments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="name">Name</label>
            <input id="name" name="name" required />
          </div>
          <div>
            <label htmlFor="slug">Slug</label>
            <input id="slug" name="slug" required />
          </div>
          <div>
            <label htmlFor="published">
              <input
                id="published"
                name="published"
                type="checkbox"
                defaultChecked
              />
              Published
            </label>
          </div>
          <button type="submit">Create</button>
        </form>
      )}
    </main>
  );
}
