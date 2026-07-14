# Reference site layouts (scraped)

> Dev reference only — scraped 2026-07-13T05:59:32.356Z. Replace assets/copy before launch per [project-context.md](./project-context.md).

## Product list (dealer home)

Home/nav lineup grid with model cards linking to detail pages.

| Pattern | car-retail component |
|---------|---------------------|
| Model card grid | `VehicleCard` on home lineup |
| Price-from | `formatPriceFrom()` from variants |
| Nav model links | Header `MenuItem` |

## Model detail (dealer)

Hero image + marketing H2 sections + optional spec/price blocks + test-drive CTA.

| Reference section | car-retail component |
|-------------------|---------------------|
| Hero image | `heroMedia` |
| Spec strip | `SpecStrip` |
| Variants / pricing | Model page variant list |
| Feature blocks | `FeatureSection` |
| Test-drive CTA | `ctaTestDrive` |

## OEM (vinfastauto.com)

JS SPA — Playwright required. OEM preferred for specs; dealers for pricing/images.

## Catalog (13 models)

- **EC Van** (`ec-van`) — vinfastdongsaigon, vinfast3sgiatothcm, vinfastsaigoncenter, vinfastnamthaibinhduong
- **Herio Green** (`herio-green`) — vinfastauto, vinfastdongsaigon, vinfast3sgiatothcm, vinfastsaigoncenter, vinfastsaigoncenter, vinfastnamthaibinhduong, vinfastnamthaibinhduong
- **Limo Green** (`limo-green`) — vinfastdongsaigon, vinfast3sgiatothcm, vinfastsaigoncenter, vinfastnamthaibinhduong
- **Minio Green** (`minio-green`) — vinfastauto, vinfastdongsaigon, vinfast3sgiatothcm, vinfastsaigoncenter, vinfastsaigoncenter, vinfastnamthaibinhduong, vinfastnamthaibinhduong
- **VF MPV 7** (`mpv-7`) — vinfastauto, vinfastdongsaigon, vinfast3sgiatothcm, vinfastsaigoncenter, vinfastnamthaibinhduong
- **Nerio Green** (`nerio-green`) — vinfastauto, vinfastdongsaigon, vinfast3sgiatothcm, vinfastsaigoncenter, vinfastnamthaibinhduong
- **VF 3** (`vf-3`) — vinfastauto, vinfastdongsaigon, vinfast3sgiatothcm, vinfast3sgiatothcm, vinfastsaigoncenter, vinfastnamthaibinhduong
- **VF 5** (`vf-5`) — vinfastauto, vinfastdongsaigon, vinfast3sgiatothcm, vinfastsaigoncenter, vinfastnamthaibinhduong
- **VF 6** (`vf-6`) — vinfastauto, vinfastdongsaigon, vinfast3sgiatothcm, vinfastsaigoncenter, vinfastnamthaibinhduong
- **VF 7** (`vf-7`) — vinfastauto, vinfastdongsaigon, vinfast3sgiatothcm, vinfastsaigoncenter, vinfastnamthaibinhduong
- **VF 8** (`vf-8`) — vinfastauto, vinfastauto, vinfastdongsaigon, vinfast3sgiatothcm, vinfast3sgiatothcm, vinfastsaigoncenter, vinfastnamthaibinhduong
- **VF 9** (`vf-9`) — vinfastauto, vinfastdongsaigon, vinfast3sgiatothcm, vinfastsaigoncenter, vinfastnamthaibinhduong
- **VF e34** (`vf-e34`) — vinfastdongsaigon
