import { cachedRead, revalidateTags, TAGS } from "@/server/cache/tags";
import { jsonField } from "@/server/modules/json-field";
import { err, ok, type Result } from "@/server/result";
import {
  pickLocale,
  toFaqDto,
  toNewsDto,
  toPageDto,
  toPolicyDto,
} from "./content.mapper";
import * as repo from "./content.repository";
import {
  FaqCreateSchema,
  FaqUpdateSchema,
  NewsCreateSchema,
  NewsUpdateSchema,
  PageCreateSchema,
  PageUpdateSchema,
  PolicyCreateSchema,
  PolicyUpdateSchema,
  type FaqDto,
  type NewsDto,
  type PageDto,
  type PolicyDto,
} from "./content.schema";

export function getAllNews() {
  return cachedRead(
    ["public-news-all"],
    async () => {
      const rows = await repo.listPublishedNews();
      return rows.map(toNewsDto);
    },
    [TAGS.news],
  );
}

export function getFeaturedNews(limit = 3) {
  return cachedRead(
    ["public-news-featured", String(limit)],
    async () => {
      const rows = await repo.listFeaturedNews(limit);
      return rows.map(toNewsDto);
    },
    [TAGS.news],
  );
}

export async function getNewsBySlug(locale: string, slug: string) {
  const posts = await getAllNews();
  return posts.find((p) => pickLocale(p.slug, locale) === slug) ?? null;
}

export function getPageByType(pageType: string) {
  return cachedRead(
    ["public-page", pageType],
    async () => {
      const row = await repo.findPageByType(pageType, true);
      return row ? toPageDto(row) : null;
    },
    [TAGS.pages],
  );
}

export function getPolicies() {
  return cachedRead(
    ["public-policies"],
    async () => {
      const rows = await repo.listPublishedPolicies();
      return rows.map(toPolicyDto);
    },
    [TAGS.policies],
  );
}

export function getGlobalFaqs() {
  return cachedRead(
    ["public-faqs"],
    async () => {
      const rows = await repo.listPublishedFaqs();
      return rows.map(toFaqDto);
    },
    [TAGS.faqs],
  );
}

export async function listNewsAdmin() {
  return (await repo.listNewsAdmin()).map(toNewsDto);
}

export async function createNews(input: unknown): Promise<Result<NewsDto>> {
  const parsed = NewsCreateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid news",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.createNews({
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt ?? undefined,
    body: d.body,
    meta: d.meta ?? undefined,
    publishedAt: d.publishedAt ?? undefined,
    featured: d.featured ?? false,
    published: d.published ?? false,
    ...(d.featuredMediaId
      ? { featuredMedia: { connect: { id: d.featuredMediaId } } }
      : {}),
  });
  revalidateTags(TAGS.news);
  return ok(toNewsDto(row));
}

export async function updateNews(
  id: string,
  input: unknown,
): Promise<Result<NewsDto>> {
  const parsed = NewsUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid news update",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.updateNews(id, {
    ...(d.slug !== undefined ? { slug: d.slug } : {}),
    ...(d.title !== undefined ? { title: d.title } : {}),
    ...(d.excerpt !== undefined ? { excerpt: jsonField(d.excerpt) } : {}),
    ...(d.body !== undefined ? { body: d.body } : {}),
    ...(d.meta !== undefined ? { meta: jsonField(d.meta) } : {}),
    ...(d.publishedAt !== undefined ? { publishedAt: d.publishedAt } : {}),
    ...(d.featured !== undefined ? { featured: d.featured } : {}),
    ...(d.published !== undefined ? { published: d.published } : {}),
    ...(d.featuredMediaId !== undefined
      ? d.featuredMediaId
        ? { featuredMedia: { connect: { id: d.featuredMediaId } } }
        : { featuredMedia: { disconnect: true } }
      : {}),
  });
  revalidateTags(TAGS.news);
  return ok(toNewsDto(row));
}

export async function deleteNews(id: string): Promise<Result<{ ok: true }>> {
  await repo.deleteNews(id);
  revalidateTags(TAGS.news);
  return ok({ ok: true });
}

export async function listPagesAdmin() {
  return (await repo.listPages()).map(toPageDto);
}

export async function createPage(input: unknown): Promise<Result<PageDto>> {
  const parsed = PageCreateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid page",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.createPage({
    pageType: d.pageType,
    slug: d.slug,
    title: d.title,
    body: d.body,
    meta: d.meta ?? undefined,
    published: d.published ?? true,
  });
  revalidateTags(TAGS.pages);
  return ok(toPageDto(row));
}

export async function updatePage(
  id: string,
  input: unknown,
): Promise<Result<PageDto>> {
  const parsed = PageUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid page update",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.updatePage(id, {
    ...(d.pageType !== undefined ? { pageType: d.pageType } : {}),
    ...(d.slug !== undefined ? { slug: d.slug } : {}),
    ...(d.title !== undefined ? { title: d.title } : {}),
    ...(d.body !== undefined ? { body: d.body } : {}),
    ...(d.meta !== undefined ? { meta: jsonField(d.meta) } : {}),
    ...(d.published !== undefined ? { published: d.published } : {}),
  });
  revalidateTags(TAGS.pages);
  return ok(toPageDto(row));
}

export async function deletePage(id: string): Promise<Result<{ ok: true }>> {
  await repo.deletePage(id);
  revalidateTags(TAGS.pages);
  return ok({ ok: true });
}

export async function listPoliciesAdmin() {
  return (await repo.listPoliciesAdmin()).map(toPolicyDto);
}

export async function createPolicy(input: unknown): Promise<Result<PolicyDto>> {
  const parsed = PolicyCreateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid policy",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.createPolicy({
    slug: d.slug,
    title: d.title,
    body: d.body ?? undefined,
    sortOrder: d.sortOrder ?? 0,
    published: d.published ?? true,
    ...(d.pdfMediaId
      ? { pdfMedia: { connect: { id: d.pdfMediaId } } }
      : {}),
  });
  revalidateTags(TAGS.policies);
  return ok(toPolicyDto(row));
}

export async function updatePolicy(
  id: string,
  input: unknown,
): Promise<Result<PolicyDto>> {
  const parsed = PolicyUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid policy update",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.updatePolicy(id, {
    ...(d.slug !== undefined ? { slug: d.slug } : {}),
    ...(d.title !== undefined ? { title: d.title } : {}),
    ...(d.body !== undefined ? { body: jsonField(d.body) } : {}),
    ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
    ...(d.published !== undefined ? { published: d.published } : {}),
    ...(d.pdfMediaId !== undefined
      ? d.pdfMediaId
        ? { pdfMedia: { connect: { id: d.pdfMediaId } } }
        : { pdfMedia: { disconnect: true } }
      : {}),
  });
  revalidateTags(TAGS.policies);
  return ok(toPolicyDto(row));
}

export async function deletePolicy(id: string): Promise<Result<{ ok: true }>> {
  await repo.deletePolicy(id);
  revalidateTags(TAGS.policies);
  return ok({ ok: true });
}

export async function listFaqsAdmin() {
  return (await repo.listFaqsAdmin()).map(toFaqDto);
}

export async function createFaq(input: unknown): Promise<Result<FaqDto>> {
  const parsed = FaqCreateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid FAQ",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.createFaq({
    question: d.question,
    answer: d.answer,
    sortOrder: d.sortOrder ?? 0,
    published: d.published ?? true,
  });
  revalidateTags(TAGS.faqs);
  return ok(toFaqDto(row));
}

export async function updateFaq(
  id: string,
  input: unknown,
): Promise<Result<FaqDto>> {
  const parsed = FaqUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid FAQ update",
      details: parsed.error.flatten(),
    });
  }
  const row = await repo.updateFaq(id, parsed.data);
  revalidateTags(TAGS.faqs);
  return ok(toFaqDto(row));
}

export async function deleteFaq(id: string): Promise<Result<{ ok: true }>> {
  await repo.deleteFaq(id);
  revalidateTags(TAGS.faqs);
  return ok({ ok: true });
}
