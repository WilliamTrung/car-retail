import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export async function listPublishedNews() {
  return prisma.newsPost.findMany({
    where: { published: true },
    include: { featuredMedia: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function listFeaturedNews(limit: number) {
  return prisma.newsPost.findMany({
    where: { published: true },
    include: { featuredMedia: true },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
}

export async function listNewsAdmin() {
  return prisma.newsPost.findMany({
    include: { featuredMedia: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function findNewsById(id: string) {
  return prisma.newsPost.findUnique({
    where: { id },
    include: { featuredMedia: true },
  });
}

export async function createNews(data: Prisma.NewsPostCreateInput) {
  return prisma.newsPost.create({ data });
}

export async function updateNews(id: string, data: Prisma.NewsPostUpdateInput) {
  return prisma.newsPost.update({ where: { id }, data });
}

export async function deleteNews(id: string) {
  return prisma.newsPost.delete({ where: { id } });
}

export async function findPageByType(pageType: string, publishedOnly: boolean) {
  return prisma.page.findFirst({
    where: {
      pageType,
      ...(publishedOnly ? { published: true } : {}),
    },
  });
}

export async function listPages() {
  return prisma.page.findMany({ orderBy: { pageType: "asc" } });
}

export async function createPage(data: Prisma.PageCreateInput) {
  return prisma.page.create({ data });
}

export async function updatePage(id: string, data: Prisma.PageUpdateInput) {
  return prisma.page.update({ where: { id }, data });
}

export async function deletePage(id: string) {
  return prisma.page.delete({ where: { id } });
}

export async function listPublishedPolicies() {
  return prisma.policyDocument.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function listPoliciesAdmin() {
  return prisma.policyDocument.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function createPolicy(data: Prisma.PolicyDocumentCreateInput) {
  return prisma.policyDocument.create({ data });
}

export async function updatePolicy(
  id: string,
  data: Prisma.PolicyDocumentUpdateInput,
) {
  return prisma.policyDocument.update({ where: { id }, data });
}

export async function deletePolicy(id: string) {
  return prisma.policyDocument.delete({ where: { id } });
}

export async function listPublishedFaqs() {
  return prisma.faqItem.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function listFaqsAdmin() {
  return prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function createFaq(data: Prisma.FaqItemCreateInput) {
  return prisma.faqItem.create({ data });
}

export async function updateFaq(id: string, data: Prisma.FaqItemUpdateInput) {
  return prisma.faqItem.update({ where: { id }, data });
}

export async function deleteFaq(id: string) {
  return prisma.faqItem.delete({ where: { id } });
}
