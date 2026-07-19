export type { Locale, Localized, VehicleAttribute, UnitsMap, SpecTranslate } from "./common";
export { composeAttributeDisplay, resolveLocalized } from "./common";

export type { ModelCardVM, SpecChipVM } from "./model-card";
export type { VariantVM, ModelDetailVM } from "./model-detail";
export type { ShowroomVM } from "./showroom";
export type {
  LeadType,
  LeadFormValues,
  LeadSubmitState,
} from "./lead";
export { toCreateLeadInput } from "./lead";
export type {
  HeroSlideVM,
  PromoVM,
  PromoTiming,
  NewsTeaserVM,
  DeliveryItemVM,
} from "./home";
export type { SiteChromeVM } from "./site";

export {
  toModelCardVM,
  toModelDetailVM,
  toShowroomVM,
  toSiteChromeVM,
  unitsToMap,
  formatHotlineDisplay,
  toTelHref,
} from "./mappers";
