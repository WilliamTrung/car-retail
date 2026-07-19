export interface SpecChipVM {
  key: "range" | "power" | "seats";
  icon: string;
  value: string;
  unit: string;
}

export interface ModelCardVM {
  id: string;
  slug: string;
  name: string;
  taglineOverline: string;
  imageUrl: string | null;
  imageAlt: string;
  isEv: boolean;
  /** Exactly 3 chips in fixed order: Range · Power · Seats. */
  specChips: SpecChipVM[];
  priceFromVnd: number | null;
  promoLine: string | null;
  segment: "personal" | "commercial";
  detailHref: string;
  leadHref: string;
}
