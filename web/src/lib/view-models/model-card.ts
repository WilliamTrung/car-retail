export interface ModelCardVM {
  id: string;
  slug: string;
  name: string;
  taglineOverline: string;
  imageUrl: string | null;
  imageAlt: string;
  isEv: boolean;
  specChips: string[];
  priceFromVnd: number | null;
  promoLine: string | null;
  segment: "personal" | "commercial";
  detailHref: string;
  leadHref: string;
}
