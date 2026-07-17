import type { FaqItem, NewsPost, Page, PolicyDocument } from "@prisma/client";
import {
  LocalizedTextSchema,
  SeoMetaSchema,
  type LocalizedText,
} from "@/server/db/zod";
import { toMediaAssetDto } from "@/server/modules/media/media.mapper";
import type { FaqDto, NewsDto, PageDto, PolicyDto } from "./content.schema";

function loc(value: unknown): LocalizedText {
  return LocalizedTextSchema.parse(value);
}

function locNull(value: unknown): LocalizedText | null {
  if (value == null) return null;
  return LocalizedTextSchema.parse(value);
}

export function toNewsDto(
  row: NewsPost & { featuredMedia?: Parameters<typeof toMediaAssetDto>[0] | null },
): NewsDto & { featuredMedia?: ReturnType<typeof toMediaAssetDto> | null } {
  return {
    id: row.id,
    slug: loc(row.slug),
    title: loc(row.title),
    excerpt: locNull(row.excerpt),
    body: loc(row.body),
    meta: row.meta == null ? null : SeoMetaSchema.parse(row.meta),
    featuredMediaId: row.featuredMediaId,
    publishedAt: row.publishedAt,
    featured: row.featured,
    published: row.published,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    featuredMedia: row.featuredMedia ? toMediaAssetDto(row.featuredMedia) : null,
  };
}

export function toPageDto(row: Page): PageDto {
  return {
    id: row.id,
    pageType: row.pageType,
    slug: loc(row.slug),
    title: loc(row.title),
    body: loc(row.body),
    meta: row.meta == null ? null : SeoMetaSchema.parse(row.meta),
    published: row.published,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toPolicyDto(row: PolicyDocument): PolicyDto {
  return {
    id: row.id,
    slug: loc(row.slug),
    title: loc(row.title),
    body: locNull(row.body),
    pdfMediaId: row.pdfMediaId,
    sortOrder: row.sortOrder,
    published: row.published,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toFaqDto(row: FaqItem): FaqDto {
  return {
    id: row.id,
    question: loc(row.question),
    answer: loc(row.answer),
    sortOrder: row.sortOrder,
    published: row.published,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function pickLocale(
  field: LocalizedText | null | undefined,
  locale: string,
): string {
  if (!field) return "";
  const value = locale === "en" ? field.en : field.vi;
  return value || field.vi || field.en || "";
}
