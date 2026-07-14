import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/roles";
import prisma from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import LocaleFields from "@/components/admin/LocaleFields";
import MediaPicker from "@/components/admin/MediaPicker";
import styles from "../panel.module.css";

export default async function SettingsPage() {
  const session = await getSession();
  if (!canAccess(session?.role, "settings")) redirect("/admin");

  const [settings, siteMedia] = await Promise.all([
    prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      include: { logoMedia: true, faviconMedia: true },
    }),
    prisma.mediaAsset.findMany({
      where: { folder: "SITE" },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const dealerName = /** @type {{ vi?: string, en?: string }} */ (settings?.dealerName ?? {});
  const legalEntity = /** @type {{ vi?: string, en?: string }} */ (settings?.legalEntity ?? {});
  const copyright = /** @type {{ vi?: string, en?: string }} */ (settings?.copyright ?? {});
  const disclaimers = /** @type {{ vi?: string, en?: string }} */ (settings?.disclaimers ?? {});
  const consent = /** @type {{ vi?: string, en?: string }} */ (settings?.consentTemplate ?? {});
  const seo = /** @type {{ vi?: { title?: string, description?: string, ogImageMediaId?: string }, en?: { title?: string, description?: string } }} */ (
    settings?.seoDefaults ?? {}
  );
  const tradeIn = /** @type {{ vi?: { title?: string, body?: string }, en?: { title?: string, body?: string }, imageMediaId?: string }} */ (
    settings?.tradeInBlock ?? {}
  );
  const promo = /** @type {{ enabled?: boolean, endAt?: string, label?: { vi?: string, en?: string } }} */ (
    settings?.promoCountdown ?? {}
  );
  const ctaTestDrive = /** @type {{ label?: { vi?: string, en?: string }, routeKey?: string }} */ (
    settings?.ctaTestDrive ?? {}
  );
  const ctaDeposit = /** @type {{ label?: { vi?: string, en?: string }, routeKey?: string }} */ (
    settings?.ctaDeposit ?? {}
  );
  const brandStory = /** @type {{ vi?: { title?: string, body?: string }, en?: { title?: string, body?: string } }} */ (
    settings?.brandStory ?? {}
  );
  const privacyPolicyUrl = /** @type {{ vi?: string, en?: string }} */ (settings?.privacyPolicyUrl ?? {});
  const socialLinks = /** @type {{ platform: string, url: string }[]} */ (settings?.socialLinks ?? []);
  const socialByPlatform = Object.fromEntries(socialLinks.map((l) => [l.platform, l.url]));

  return (
    <>
      <h1>Cài đặt site</h1>
      <p className={styles.muted}>
        Thông tin đại lý, pháp lý, CTA, mạng xã hội và nội dung chân trang. Showroom và hotline quản lý tại trang Showroom.
      </p>
      <AdminForm action="/api/admin/settings" method="PATCH">
        <h2>Thương hiệu & pháp lý</h2>
        <LocaleFields prefix="dealerName" label="Tên đại lý" vi={dealerName.vi} en={dealerName.en} />
        <LocaleFields prefix="legalEntity" label="Pháp nhân" vi={legalEntity.vi} en={legalEntity.en} />
        <MediaPicker
          name="logoMediaId"
          label="Logo"
          value={settings?.logoMediaId}
          assets={siteMedia}
          folder="SITE"
        />
        <MediaPicker
          name="faviconMediaId"
          label="Favicon"
          value={settings?.faviconMediaId}
          assets={siteMedia}
          folder="SITE"
        />
        <label>
          MST
          <input name="mst" type="text" defaultValue={settings?.mst ?? ""} />
        </label>
        <label>
          Email
          <input name="email" type="email" defaultValue={settings?.email ?? ""} />
        </label>
        <LocaleFields prefix="copyright" label="Bản quyền" vi={copyright.vi} en={copyright.en} />
        <LocaleFields
          prefix="disclaimers"
          label="Mô tả chân trang"
          vi={disclaimers.vi}
          en={disclaimers.en}
          multiline
        />
        <LocaleFields prefix="consentTemplate" label="Mẫu đồng ý" vi={consent.vi} en={consent.en} multiline />

        <h2>Giới thiệu</h2>
        <LocaleFields
          prefix="brandStoryTitle"
          label="Tiêu đề giới thiệu"
          vi={brandStory.vi?.title}
          en={brandStory.en?.title}
        />
        <LocaleFields
          prefix="brandStoryBody"
          label="Nội dung giới thiệu"
          vi={brandStory.vi?.body}
          en={brandStory.en?.body}
          multiline
        />
        <LocaleFields
          prefix="privacyPolicyUrl"
          label="URL chính sách bảo mật"
          vi={privacyPolicyUrl.vi}
          en={privacyPolicyUrl.en}
        />

        <h2>CTA header</h2>
        <LocaleFields
          prefix="ctaTestDriveLabel"
          label="Nhãn lái thử"
          vi={ctaTestDrive.label?.vi}
          en={ctaTestDrive.label?.en}
        />
        <label>
          Route lái thử
          <input name="ctaTestDriveRouteKey" type="text" defaultValue={ctaTestDrive.routeKey ?? "/book-test-drive"} />
        </label>
        <LocaleFields
          prefix="ctaDepositLabel"
          label="Nhãn đặt cọc"
          vi={ctaDeposit.label?.vi}
          en={ctaDeposit.label?.en}
        />
        <label>
          Route đặt cọc
          <input name="ctaDepositRouteKey" type="text" defaultValue={ctaDeposit.routeKey ?? "/deposit"} />
        </label>

        <h2>Mạng xã hội</h2>
        <label>
          Facebook URL
          <input name="socialFacebook" type="url" defaultValue={socialByPlatform.facebook ?? ""} />
        </label>
        <label>
          Zalo URL
          <input name="socialZalo" type="url" defaultValue={socialByPlatform.zalo ?? ""} />
        </label>
        <label>
          YouTube URL
          <input name="socialYoutube" type="url" defaultValue={socialByPlatform.youtube ?? ""} />
        </label>
        <label>
          TikTok URL
          <input name="socialTiktok" type="url" defaultValue={socialByPlatform.tiktok ?? ""} />
        </label>

        <h2>SEO mặc định</h2>
        <label>
          Title VI
          <input name="seoTitleVi" type="text" defaultValue={seo.vi?.title ?? ""} />
        </label>
        <label>
          Title EN
          <input name="seoTitleEn" type="text" defaultValue={seo.en?.title ?? ""} />
        </label>
        <label>
          Description VI
          <textarea name="seoDescVi" rows={2} defaultValue={seo.vi?.description ?? ""} />
        </label>
        <label>
          Description EN
          <textarea name="seoDescEn" rows={2} defaultValue={seo.en?.description ?? ""} />
        </label>
        <MediaPicker
          name="seoOgImageMediaId"
          label="Ảnh OG mặc định"
          value={seo.vi?.ogImageMediaId}
          assets={siteMedia}
          folder="SITE"
        />

        <h2>Khối thu cũ đổi mới (trang chủ)</h2>
        <LocaleFields
          prefix="tradeInTitle"
          label="Tiêu đề"
          vi={tradeIn.vi?.title}
          en={tradeIn.en?.title}
        />
        <LocaleFields
          prefix="tradeInBody"
          label="Nội dung"
          vi={tradeIn.vi?.body}
          en={tradeIn.en?.body}
          multiline
        />
        <MediaPicker
          name="tradeInImageMediaId"
          label="Ảnh minh họa"
          value={tradeIn.imageMediaId}
          assets={siteMedia}
          folder="SITE"
        />

        <h2>Đếm ngược khuyến mãi</h2>
        <label>
          <input name="promoEnabled" type="checkbox" value="true" defaultChecked={promo.enabled} />
          Bật banner đếm ngược
        </label>
        <label>
          Kết thúc lúc
          <input
            name="promoEndAt"
            type="datetime-local"
            defaultValue={promo.endAt ? promo.endAt.slice(0, 16) : ""}
          />
        </label>
        <LocaleFields
          prefix="promoLabel"
          label="Nhãn banner"
          vi={promo.label?.vi}
          en={promo.label?.en}
        />

        <label>
          <input name="maintenanceMode" type="checkbox" value="true" defaultChecked={settings?.maintenanceMode} />
          Chế độ bảo trì
        </label>
      </AdminForm>
    </>
  );
}
