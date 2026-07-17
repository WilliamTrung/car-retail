import { cachedRead, revalidateTags, TAGS } from "@/server/cache/tags";
import { jsonField } from "@/server/modules/json-field";
import { err, ok, type Result } from "@/server/result";
import { toShowroomDto } from "./showrooms.mapper";
import * as repo from "./showrooms.repository";
import {
  ShowroomCreateSchema,
  ShowroomUpdateSchema,
  type ShowroomDto,
} from "./showrooms.schema";

export function getShowroomsPublic() {
  return cachedRead(
    ["public-showrooms"],
    async () => {
      const rows = await repo.listPublished();
      return rows.map(toShowroomDto);
    },
    [TAGS.showrooms],
  );
}

export async function listShowroomsAdmin() {
  return (await repo.listAdmin()).map(toShowroomDto);
}

export async function getShowroom(id: string) {
  const row = await repo.findById(id);
  return row ? toShowroomDto(row) : null;
}

export async function createShowroom(
  input: unknown,
): Promise<Result<ShowroomDto>> {
  const parsed = ShowroomCreateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid showroom",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.create({
    name: d.name,
    address: d.address,
    city: d.city,
    phone: d.phone ?? null,
    hours: d.hours ?? undefined,
    typeTag: d.typeTag ?? null,
    lat: d.lat ?? null,
    lng: d.lng ?? null,
    sortOrder: d.sortOrder ?? 0,
    published: d.published ?? true,
  });
  revalidateTags(TAGS.showrooms);
  return ok(toShowroomDto(row));
}

export async function updateShowroom(
  id: string,
  input: unknown,
): Promise<Result<ShowroomDto>> {
  const parsed = ShowroomUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid showroom update",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.update(id, {
    ...(d.name !== undefined ? { name: d.name } : {}),
    ...(d.address !== undefined ? { address: d.address } : {}),
    ...(d.city !== undefined ? { city: d.city } : {}),
    ...(d.phone !== undefined ? { phone: d.phone } : {}),
    ...(d.hours !== undefined ? { hours: jsonField(d.hours) } : {}),
    ...(d.typeTag !== undefined ? { typeTag: d.typeTag } : {}),
    ...(d.lat !== undefined ? { lat: d.lat } : {}),
    ...(d.lng !== undefined ? { lng: d.lng } : {}),
    ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
    ...(d.published !== undefined ? { published: d.published } : {}),
  });
  revalidateTags(TAGS.showrooms);
  return ok(toShowroomDto(row));
}

export async function deleteShowroom(
  id: string,
): Promise<Result<{ ok: true }>> {
  await repo.remove(id);
  revalidateTags(TAGS.showrooms);
  return ok({ ok: true });
}
