import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, biFromBody } from "@/lib/admin/auth";
import { bustTags, TAGS } from "@/lib/admin/revalidate";

function buildSeoDefaults(body) {
  return {
    vi: {
      title: body.seoTitleVi || "",
      description: body.seoDescVi || "",
      ...(body.seoOgImageMediaId ? { ogImageMediaId: body.seoOgImageMediaId } : {}),
    },
    en: {
      title: body.seoTitleEn || "",
      description: body.seoDescEn || "",
      ...(body.seoOgImageMediaId ? { ogImageMediaId: body.seoOgImageMediaId } : {}),
    },
  };
}

function buildTradeInBlock(body) {
  return {
    vi: { title: body.tradeInTitleVi || "", body: body.tradeInBodyVi || "" },
    en: { title: body.tradeInTitleEn || "", body: body.tradeInBodyEn || "" },
  };
}

function buildPromoCountdown(body) {
  return {
    enabled: body.promoEnabled === "true" || body.promoEnabled === true,
    endAt: body.promoEndAt ? new Date(body.promoEndAt).toISOString() : null,
    label: { vi: body.promoLabelVi || "", en: body.promoLabelEn || "" },
  };
}

function buildCta(body, prefix) {
  return {
    label: {
      vi: body[`${prefix}LabelVi`] || "",
      en: body[`${prefix}LabelEn`] || "",
    },
    routeKey: body[`${prefix}RouteKey`] || "",
  };
}

function buildSocialLinks(body) {
  /** @type {{ platform: string, url: string }[]} */
  const links = [];
  const entries = [
    ["facebook", body.socialFacebook],
    ["zalo", body.socialZalo],
    ["youtube", body.socialYoutube],
    ["tiktok", body.socialTiktok],
  ];
  for (const [platform, url] of entries) {
    if (typeof url === "string" && url.trim()) {
      links.push({ platform, url: url.trim() });
    }
  }
  return links;
}

function buildBrandStory(body) {
  return {
    vi: { title: body.brandStoryTitleVi || "", body: body.brandStoryBodyVi || "" },
    en: { title: body.brandStoryTitleEn || "", body: body.brandStoryBodyEn || "" },
  };
}

export async function GET(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN"]);
  if (error) return error;

  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    include: { logoMedia: true, faviconMedia: true },
  });
  return NextResponse.json(settings);
}

export async function PATCH(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN"]);
  if (error) return error;

  const body = await request.json();
  const data = {
    dealerName: biFromBody(body, "dealerName"),
    legalEntity: biFromBody(body, "legalEntity"),
    mst: body.mst || null,
    email: body.email || null,
    copyright: biFromBody(body, "copyright"),
    maintenanceMode: body.maintenanceMode === "true" || body.maintenanceMode === true,
    disclaimers: biFromBody(body, "disclaimers"),
    brandStory: buildBrandStory(body),
    consentTemplate: biFromBody(body, "consentTemplate"),
    privacyPolicyUrl: biFromBody(body, "privacyPolicyUrl"),
    socialLinks: buildSocialLinks(body),
    ctaTestDrive: buildCta(body, "ctaTestDrive"),
    ctaDeposit: buildCta(body, "ctaDeposit"),
    logoMediaId: body.logoMediaId !== undefined ? body.logoMediaId || null : undefined,
    faviconMediaId: body.faviconMediaId !== undefined ? body.faviconMediaId || null : undefined,
    seoDefaults: buildSeoDefaults(body),
    tradeInBlock: buildTradeInBlock(body),
    promoCountdown: buildPromoCountdown(body),
  };

  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: {
      id: "singleton",
      dealerName: data.dealerName,
      legalEntity: data.legalEntity,
      ...data,
    },
  });

  bustTags(TAGS.siteSettings);
  return NextResponse.json(settings);
}
