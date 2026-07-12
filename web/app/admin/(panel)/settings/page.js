import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/roles";
import prisma from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import LocaleFields from "@/components/admin/LocaleFields";
import MediaSelect from "@/components/admin/MediaSelect";
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
  const tradeIn = /** @type {{ vi?: { title?: string, body?: string }, en?: { title?: string, body?: string } }} */ (
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
      <h1>Site settings</h1>
      <p className={styles.muted}>
        Dealer identity, legal info, CTAs, social links, and footer copy. Showroom branches and hotlines are managed on the Showrooms page.
      </p>
      <AdminForm action="/api/admin/settings" method="PATCH">
        <h2>Brand & legal</h2>
        <LocaleFields prefix="dealerName" label="Dealer name" vi={dealerName.vi} en={dealerName.en} />
        <LocaleFields prefix="legalEntity" label="Legal entity" vi={legalEntity.vi} en={legalEntity.en} />
        <MediaSelect
          name="logoMediaId"
          label="Logo"
          value={settings?.logoMediaId}
          assets={siteMedia}
          folder="SITE"
        />
        <MediaSelect
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
        <LocaleFields prefix="copyright" label="Copyright" vi={copyright.vi} en={copyright.en} />
        <LocaleFields
          prefix="disclaimers"
          label="Footer site description"
          vi={disclaimers.vi}
          en={disclaimers.en}
          multiline
        />
        <LocaleFields prefix="consentTemplate" label="Consent template" vi={consent.vi} en={consent.en} multiline />

        <h2>About the site</h2>
        <LocaleFields
          prefix="brandStoryTitle"
          label="Brand story title"
          vi={brandStory.vi?.title}
          en={brandStory.en?.title}
        />
        <LocaleFields
          prefix="brandStoryBody"
          label="Brand story body"
          vi={brandStory.vi?.body}
          en={brandStory.en?.body}
          multiline
        />
        <LocaleFields
          prefix="privacyPolicyUrl"
          label="Privacy policy URL"
          vi={privacyPolicyUrl.vi}
          en={privacyPolicyUrl.en}
        />

        <h2>Header CTAs</h2>
        <LocaleFields
          prefix="ctaTestDriveLabel"
          label="Test drive CTA label"
          vi={ctaTestDrive.label?.vi}
          en={ctaTestDrive.label?.en}
        />
        <label>
          Test drive route key
          <input name="ctaTestDriveRouteKey" type="text" defaultValue={ctaTestDrive.routeKey ?? "/book-test-drive"} />
        </label>
        <LocaleFields
          prefix="ctaDepositLabel"
          label="Deposit CTA label"
          vi={ctaDeposit.label?.vi}
          en={ctaDeposit.label?.en}
        />
        <label>
          Deposit route key
          <input name="ctaDepositRouteKey" type="text" defaultValue={ctaDeposit.routeKey ?? "/deposit"} />
        </label>

        <h2>Social links</h2>
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

        <h2>SEO defaults</h2>
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
        <MediaSelect
          name="seoOgImageMediaId"
          label="Default OG image"
          value={seo.vi?.ogImageMediaId}
          assets={siteMedia}
        />

        <h2>Homepage trade-in block</h2>
        <LocaleFields
          prefix="tradeInTitle"
          label="Title"
          vi={tradeIn.vi?.title}
          en={tradeIn.en?.title}
        />
        <LocaleFields
          prefix="tradeInBody"
          label="Body"
          vi={tradeIn.vi?.body}
          en={tradeIn.en?.body}
          multiline
        />

        <h2>Promo countdown</h2>
        <label>
          <input name="promoEnabled" type="checkbox" value="true" defaultChecked={promo.enabled} />
          Enable countdown banner
        </label>
        <label>
          End at
          <input
            name="promoEndAt"
            type="datetime-local"
            defaultValue={promo.endAt ? promo.endAt.slice(0, 16) : ""}
          />
        </label>
        <LocaleFields
          prefix="promoLabel"
          label="Banner label"
          vi={promo.label?.vi}
          en={promo.label?.en}
        />

        <label>
          <input name="maintenanceMode" type="checkbox" value="true" defaultChecked={settings?.maintenanceMode} />
          Maintenance mode
        </label>
      </AdminForm>
    </>
  );
}
