import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/roles";
import prisma from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import LocaleFields from "@/components/admin/LocaleFields";
import DeleteButton from "@/components/admin/DeleteButton";
import { pickLocale } from "@/lib/attributes";
import styles from "../panel.module.css";

export default async function ShowroomsPage() {
  const session = await getSession();
  if (!canAccess(session?.role, "showrooms")) redirect("/admin");

  const [showrooms, hotlines] = await Promise.all([
    prisma.showroom.findMany({
      include: { hotlines: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.hotline.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <>
      <h1>Showrooms & hotlines</h1>
      <p className={styles.muted}>
        Manage showroom branches, addresses, hours, and phone hotlines shown in the header, footer, and contact page.
      </p>

      <h2>Showrooms</h2>
      {showrooms.map((room) => {
        const name = /** @type {{ vi?: string, en?: string }} */ (room.name);
        const address = /** @type {{ vi?: string, en?: string }} */ (room.address);
        const hours = /** @type {{ vi?: string, en?: string }} */ (room.hours ?? {});
        return (
          <div key={room.id} className={styles.card}>
            <AdminForm action={`/api/admin/showrooms/${room.id}`} method="PATCH">
              <LocaleFields prefix="name" label="Name" vi={name.vi} en={name.en} />
              <LocaleFields prefix="address" label="Address" vi={address.vi} en={address.en} multiline />
              <LocaleFields prefix="hours" label="Opening hours" vi={hours.vi} en={hours.en} />
              <label>
                City
                <input name="city" type="text" defaultValue={room.city} />
              </label>
              <label>
                Phone
                <input name="phone" type="text" defaultValue={room.phone ?? ""} />
              </label>
              <label>
                Type tag (1S / 2S / 3S)
                <input name="typeTag" type="text" defaultValue={room.typeTag ?? ""} placeholder="2S" />
              </label>
              <label>
                Sort order
                <input name="sortOrder" type="number" defaultValue={room.sortOrder} />
              </label>
              <label>
                <input name="published" type="checkbox" value="true" defaultChecked={room.published} />
                Published
              </label>
            </AdminForm>
            <DeleteButton action={`/api/admin/showrooms/${room.id}`} confirmMessage="Delete this showroom?" />
          </div>
        );
      })}

      <h3>Add showroom</h3>
      <AdminForm action="/api/admin/showrooms" successMessage="Showroom created.">
        <LocaleFields prefix="name" label="Name" />
        <LocaleFields prefix="address" label="Address" multiline />
        <LocaleFields prefix="hours" label="Opening hours" />
        <label>
          City
          <input name="city" type="text" required />
        </label>
        <label>
          Phone
          <input name="phone" type="text" />
        </label>
        <label>
          Type tag
          <input name="typeTag" type="text" placeholder="2S" />
        </label>
        <label>
          Sort order
          <input name="sortOrder" type="number" defaultValue={showrooms.length} />
        </label>
      </AdminForm>

      <h2>Hotlines</h2>
      {hotlines.map((h) => {
        const label = /** @type {{ vi?: string, en?: string }} */ (h.label);
        return (
          <div key={h.id} className={styles.card}>
            <AdminForm action={`/api/admin/hotlines/${h.id}`} method="PATCH">
              <LocaleFields prefix="label" label="Label" vi={label.vi} en={label.en} />
              <label>
                Phone
                <input name="phone" type="text" defaultValue={h.phone} required />
              </label>
              <label>
                Sort order
                <input name="sortOrder" type="number" defaultValue={h.sortOrder} />
              </label>
              <label>
                Showroom (optional)
                <select name="showroomId" defaultValue={h.showroomId ?? ""}>
                  <option value="">—</option>
                  {showrooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {pickLocale(r.name, "vi")}
                    </option>
                  ))}
                </select>
              </label>
            </AdminForm>
            <DeleteButton action={`/api/admin/hotlines/${h.id}`} confirmMessage="Delete this hotline?" />
          </div>
        );
      })}

      <h3>Add hotline</h3>
      <AdminForm action="/api/admin/hotlines" successMessage="Hotline created.">
        <LocaleFields prefix="label" label="Label" />
        <label>
          Phone
          <input name="phone" type="text" required />
        </label>
        <label>
          Sort order
          <input name="sortOrder" type="number" defaultValue={hotlines.length} />
        </label>
        <label>
          Showroom (optional)
          <select name="showroomId">
            <option value="">—</option>
            {showrooms.map((r) => (
              <option key={r.id} value={r.id}>
                {pickLocale(r.name, "vi")}
              </option>
            ))}
          </select>
        </label>
      </AdminForm>
    </>
  );
}
