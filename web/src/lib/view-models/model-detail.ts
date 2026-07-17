import type { ModelCardVM } from "./model-card";

export interface VariantVM {
  id: string;
  name: string;
  priceVnd: number | null;
  chips: string[];
  isDefault: boolean;
  allowsDeposit: boolean;
  allowsTestDrive: boolean;
}

export interface ModelDetailVM {
  id: string;
  slug: string;
  name: string;
  taglineOverline: string;
  isEv: boolean;
  gallery: { mainUrl: string | null; thumbs: string[]; alt: string };
  colorSwatches: { name: string; hex: string; imageUrl?: string | null }[];
  priceFromVnd: number | null;
  variants: VariantVM[];
  promo: { bullets: string[]; dateRange: string | null } | null;
  featureSections: {
    title: string;
    body: string;
    imageUrl: string | null;
    imageLeft: boolean;
  }[];
  specStrip: { key: string; display: string; label: string }[];
  related: ModelCardVM[];
  faqs: { q: string; a: string }[];
}
