import { htmlToPlainText } from "@/lib/html-content";

const NOISE_FRAGMENT =
  /THÔNG\s+TIN\s+LIÊN HỆ|HỖ TRỢ KHÁCH HÀNG|SHOWROOM NETWORK|QUICK LINKS|KẾT NỐI VỚI/i;

export function cleanParagraph(text: string | null | undefined): string {
  return htmlToPlainText(text);
}

export function isNoiseCopy(text: string | null | undefined): boolean {
  const t = cleanParagraph(text);
  if (!t) return true;
  if (NOISE_FRAGMENT.test(t)) return true;
  if (/^VinFast\s+[\w\s]+\.\s*(Mô tả|THÔNG)/i.test(t)) return true;
  if (/^Mô tả\.?\s*Mô tả\.?$/i.test(t)) return true;
  if (/để biết thêm thông tin về sản phẩm và giá cả/i.test(t)) return true;
  if (/liên hệ trực tiếp/i.test(t) && t.length < 120) return true;
  return false;
}

export function isUsableDescription(
  description: string | null | undefined,
  tagline: string | null | undefined,
): boolean {
  const plain = htmlToPlainText(description);
  const plainTagline = htmlToPlainText(tagline);
  if (!plain) return false;
  if (plain === plainTagline) return false;
  return !isNoiseCopy(plain);
}
