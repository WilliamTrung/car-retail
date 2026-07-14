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
      <h1>Showroom & hotline</h1>
      <p className={styles.muted}>
        Quản lý chi nhánh, địa chỉ, giờ mở cửa và số điện thoại hiển thị trên header, footer và trang liên hệ.
      </p>

      <h2>Showroom</h2>
      {showrooms.map((room) => {
        const name = /** @type {{ vi?: string, en?: string }} */ (room.name);
        const address = /** @type {{ vi?: string, en?: string }} */ (room.address);
        const hours = /** @type {{ vi?: string, en?: string }} */ (room.hours ?? {});
        return (
          <div key={room.id} className={styles.card}>
            <AdminForm action={`/api/admin/showrooms/${room.id}`} method="PATCH">
              <LocaleFields prefix="name" label="Tên" vi={name.vi} en={name.en} />
              <LocaleFields prefix="address" label="Địa chỉ" vi={address.vi} en={address.en} multiline />
              <LocaleFields prefix="hours" label="Giờ mở cửa" vi={hours.vi} en={hours.en} />
              <label>
                Thành phố
                <input name="city" type="text" defaultValue={room.city} />
              </label>
              <label>
                Điện thoại
                <input name="phone" type="text" defaultValue={room.phone ?? ""} />
              </label>
              <label>
                Loại (1S / 2S / 3S)
                <input name="typeTag" type="text" defaultValue={room.typeTag ?? ""} placeholder="2S" />
              </label>
              <label>
                Thứ tự
                <input name="sortOrder" type="number" defaultValue={room.sortOrder} />
              </label>
              <label>
                <input name="published" type="checkbox" value="true" defaultChecked={room.published} />
                Đã xuất bản
              </label>
            </AdminForm>
            <DeleteButton action={`/api/admin/showrooms/${room.id}`} confirmMessage="Xóa showroom này?" />
          </div>
        );
      })}

      <h3>Thêm showroom</h3>
      <AdminForm action="/api/admin/showrooms" successMessage="Đã thêm showroom.">
        <LocaleFields prefix="name" label="Tên" />
        <LocaleFields prefix="address" label="Địa chỉ" multiline />
        <LocaleFields prefix="hours" label="Giờ mở cửa" />
        <label>
          Thành phố
          <input name="city" type="text" required />
        </label>
        <label>
          Điện thoại
          <input name="phone" type="text" />
        </label>
        <label>
          Loại
          <input name="typeTag" type="text" placeholder="2S" />
        </label>
        <label>
          Thứ tự
          <input name="sortOrder" type="number" defaultValue={showrooms.length} />
        </label>
      </AdminForm>

      <h2>Hotline</h2>
      {hotlines.map((h) => {
        const label = /** @type {{ vi?: string, en?: string }} */ (h.label);
        return (
          <div key={h.id} className={styles.card}>
            <AdminForm action={`/api/admin/hotlines/${h.id}`} method="PATCH">
              <LocaleFields prefix="label" label="Nhãn" vi={label.vi} en={label.en} />
              <label>
                Số điện thoại
                <input name="phone" type="text" defaultValue={h.phone} required />
              </label>
              <label>
                Thứ tự
                <input name="sortOrder" type="number" defaultValue={h.sortOrder} />
              </label>
              <label>
                Showroom (tuỳ chọn)
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
            <DeleteButton action={`/api/admin/hotlines/${h.id}`} confirmMessage="Xóa hotline này?" />
          </div>
        );
      })}

      <h3>Thêm hotline</h3>
      <AdminForm action="/api/admin/hotlines" successMessage="Đã thêm hotline.">
        <LocaleFields prefix="label" label="Nhãn" />
        <label>
          Số điện thoại
          <input name="phone" type="text" required />
        </label>
        <label>
          Thứ tự
          <input name="sortOrder" type="number" defaultValue={hotlines.length} />
        </label>
        <label>
          Showroom (tuỳ chọn)
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
