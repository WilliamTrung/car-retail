import { describe, expect, it } from "vitest";
import { daysUntil, formatCardPrice, formatVnd } from "@/lib/format";
import {
  composeAttributeDisplay,
  type UnitsMap,
} from "@/lib/view-models/common";
import {
  toModelCardVM,
  toModelDetailVM,
  toShowroomVM,
  toSiteChromeVM,
} from "@/lib/view-models/mappers";
import {
  toCreateLeadInput,
  type LeadFormValues,
} from "@/lib/view-models/lead";
import type { CreateLeadInput } from "@/server/modules/leads/leads.schema";
import { renderToStaticMarkup } from "react-dom/server";
import { PriceText } from "@/components/ui/PriceText";
import { createElement } from "react";

const units: UnitsMap = {
  km: { vi: "km", en: "km" },
  nm: { vi: "Nm", en: "Nm" },
  cho: { vi: "chỗ", en: "seats" },
  kW: { vi: "kW", en: "kW" },
};

const viSpec: Record<string, string> = {
  range: "Quãng đường",
  seats: "Số chỗ",
  torque: "Mô-men xoắn",
  power: "Công suất",
  battery: "Pin",
  motor: "Động cơ",
  chargeTimeFast: "Sạc nhanh (10–70%)",
  accel050: "0–50",
  notAvailable: "Chưa có",
};

const enSpec: Record<string, string> = {
  range: "Range",
  seats: "Seats",
  torque: "Torque",
  power: "Power",
  battery: "Battery",
  motor: "Motor",
  chargeTimeFast: "Fast charge (10–70%)",
  accel050: "0–50",
  notAvailable: "N/A",
};

function tVi(key: string): string {
  return viSpec[key] ?? key;
}

function tEn(key: string): string {
  return enSpec[key] ?? key;
}

describe("formatVnd", () => {
  it('formats vi as "749.000.000đ"', () => {
    expect(formatVnd(749000000, "vi")).toBe("749.000.000đ");
  });

  it('formats en as "₫749,000,000"', () => {
    expect(formatVnd(749000000, "en")).toBe("₫749,000,000");
  });

  it("returns empty for null/undefined", () => {
    expect(formatVnd(null)).toBe("");
    expect(formatVnd(undefined)).toBe("");
  });

  it("formatCardPrice never emits VND suffix", () => {
    expect(formatCardPrice(749000000, "en")).toBe("₫749,000,000");
    expect(formatCardPrice(749000000, "vi")).toBe("749.000.000đ");
    expect(formatCardPrice(749000000, "en")).not.toMatch(/VND/);
  });
});

describe("daysUntil", () => {
  it("returns at most 14 for near deadlines and greater than 14 for far ones", () => {
    const now = Date.parse("2026-07-19T00:00:00.000Z");
    expect(daysUntil("2026-07-25T00:00:00.000Z", now)).toBe(6);
    expect(daysUntil("2026-08-20T00:00:00.000Z", now)).toBeGreaterThan(14);
  });
});

describe("composeAttributeDisplay", () => {
  it('composes {key:"range",value:326,unit:"km"} to "326 km"', () => {
    const { label, display } = composeAttributeDisplay(
      { key: "range", value: 326, unit: "km" },
      units,
      "vi",
      tVi,
    );
    expect(label).toBe("Quãng đường");
    expect(display).toBe("326 km");
  });

  it("unknown key falls back to raw key without throwing", () => {
    expect(() =>
      composeAttributeDisplay(
        { key: "unknown_spec", value: 1, unit: "km" },
        units,
        "vi",
        (k) => {
          if (k === "unknown_spec") throw new Error("missing");
          return k;
        },
      ),
    ).not.toThrow();

    const { label, display } = composeAttributeDisplay(
      { key: "unknown_spec", value: 99, unit: null },
      units,
      "vi",
      (k) => k,
    );
    expect(label).toBe("unknown_spec");
    expect(display).toBe("99");
  });
});

describe("PriceText", () => {
  it('renders "Liên hệ" when amount is null (vi)', () => {
    const html = renderToStaticMarkup(
      createElement(PriceText, { amount: null, locale: "vi" }),
    );
    expect(html).toContain("Liên hệ");
  });

  it('renders "Contact us" when amount is null (en)', () => {
    const html = renderToStaticMarkup(
      createElement(PriceText, { amount: null, locale: "en" }),
    );
    expect(html).toContain("Contact us");
    expect(html).not.toContain("Liên hệ");
  });

  it("renders en dong-prefixed price when locale=en", () => {
    const html = renderToStaticMarkup(
      createElement(PriceText, { amount: 749000000, locale: "en" }),
    );
    expect(html).toContain("₫749,000,000");
    expect(html).not.toContain("VND");
  });
});

describe("toCreateLeadInput assignability", () => {
  it("maps LeadFormValues to CreateLeadInput", () => {
    const values: LeadFormValues = {
      type: "CONSULT",
      fullName: "Nguyen Van A",
      phone: "0901234567",
      consent: true,
      modelId: "m1",
      locale: "vi",
    };
    const input: CreateLeadInput = toCreateLeadInput(values);
    expect(input.type).toBe("CONSULT");
    expect(input.payload.name).toBe("Nguyen Van A");
    expect(input.payload.consent).toBe(true);
    expect(input.locale).toBe("vi");
  });
});

describe("mappers", () => {
  it("toModelCardVM emits fixed Range Power Seats SpecChipVM array", () => {
    const vm = toModelCardVM(
      {
        id: "m1",
        name: { vi: "Volta Neo", en: "Volta Neo" },
        slug: { vi: "volta-neo", en: "volta-neo" },
        tagline: { vi: "Công nghệ xanh", en: "Green tech" },
        attributes: [
          { key: "range", value: 326, unit: "km" },
          { key: "seats", value: 5, unit: "cho" },
          { key: "torque", value: 130, unit: "nm" },
          { key: "power", value: 100, unit: "kW" },
        ],
        variants: [{ price: 285000000, published: true }],
        isEv: true,
      },
      units,
      tVi,
      "vi",
    );
    expect(vm.name).toBe("Volta Neo");
    expect(vm.taglineOverline).toBe("CÔNG NGHỆ XANH");
    expect(vm.specChips).toHaveLength(3);
    expect(vm.specChips.map((c) => c.key)).toEqual([
      "range",
      "power",
      "seats",
    ]);
    expect(vm.specChips[0]).toMatchObject({
      key: "range",
      value: "326",
      unit: "km",
    });
    expect(vm.specChips[1]).toMatchObject({
      key: "power",
      value: "100",
      unit: "kW",
    });
    expect(vm.specChips[2]).toMatchObject({
      key: "seats",
      value: "5",
      unit: "chỗ",
    });
    expect(vm.specChips.every((c) => c.icon)).toBe(true);
    expect(vm.priceFromVnd).toBe(285000000);
    expect(vm.isEv).toBe(true);
    expect(vm.detailHref).toContain("volta-neo");
  });

  it("toModelCardVM pads missing slots with labeled graceful value, never bare dash chip", () => {
    const vm = toModelCardVM(
      {
        id: "m2",
        name: { vi: "Sparse", en: "Sparse" },
        slug: { vi: "sparse", en: "sparse" },
        attributes: [{ key: "torque", value: 130, unit: "nm" }],
      },
      units,
      tVi,
      "vi",
    );
    expect(vm.specChips).toHaveLength(3);
    expect(vm.specChips.map((c) => c.key)).toEqual([
      "range",
      "power",
      "seats",
    ]);
    for (const chip of vm.specChips) {
      expect(chip.icon).toBeTruthy();
      expect(chip.value).not.toBe("—");
      expect(chip.unit).toBe("Chưa có");
      expect(chip.value).toBe(viSpec[chip.key]);
    }

    const enVm = toModelCardVM(
      {
        id: "m2",
        name: { vi: "Sparse", en: "Sparse" },
        slug: { vi: "sparse", en: "sparse" },
        attributes: [{ key: "torque", value: 130, unit: "nm" }],
      },
      units,
      tEn,
      "en",
    );
    for (const chip of enVm.specChips) {
      expect(chip.value).not.toBe("—");
      expect(chip.unit).toBe("N/A");
      expect(chip.value).toBe(enSpec[chip.key]);
    }
  });

  it("toModelCardVM never throws on empty CMS data", () => {
    expect(() => toModelCardVM(null, {}, tVi, "vi")).not.toThrow();
    const vm = toModelCardVM(undefined, units, tVi, "en");
    expect(vm.name).toBe("—");
    expect(vm.specChips).toHaveLength(3);
    expect(vm.specChips.map((c) => c.key)).toEqual([
      "range",
      "power",
      "seats",
    ]);
  });

  it("toModelDetailVM builds variants + fixed 7-slot specStrip", () => {
    const vm = toModelDetailVM(
      {
        id: "m1",
        name: { vi: "Volta City", en: "Volta City" },
        slug: { vi: "volta-city", en: "volta-city" },
        attributes: [
          { key: "range", value: 300, unit: "km" },
          { key: "power", value: 100, unit: "kW" },
        ],
        variants: [
          {
            id: "v1",
            name: { vi: "Base", en: "Base" },
            price: 200000000,
            published: true,
            attributes: [{ key: "seats", value: 5, unit: "cho" }],
          },
        ],
        faqs: [
          {
            question: { vi: "Pin bao lâu?", en: "Battery life?" },
            answer: { vi: "8 năm", en: "8 years" },
          },
        ],
      },
      units,
      tVi,
      "vi",
    );
    expect(vm.variants).toHaveLength(1);
    expect(vm.variants[0]?.isDefault).toBe(true);
    expect(vm.specStrip).toHaveLength(7);
    expect(vm.specStrip.map((c) => c.key)).toEqual([
      "range",
      "seats",
      "torque",
      "battery",
      "motor",
      "chargeTimeFast",
      "accel050",
    ]);
    expect(vm.specStrip[0]).toEqual({
      key: "range",
      label: "Quãng đường",
      display: "300 km",
    });
    expect(vm.specStrip[4]).toEqual({
      key: "motor",
      label: "Động cơ",
      display: "100 kW",
    });
    expect(vm.specStrip[1]?.display).toBe("Chưa có");
    expect(vm.specStrip[6]?.display).toBe("Chưa có");
    expect(vm.faqs[0]?.q).toBe("Pin bao lâu?");
  });

  it("toShowroomVM normalizes typeTag and maps URL", () => {
    const vm = toShowroomVM(
      {
        id: "s1",
        name: { vi: "Showroom Q7", en: "Showroom D7" },
        address: { vi: "123 Đường A", en: "123 A St" },
        city: "TP.HCM",
        phone: "0900111222",
        typeTag: "3S",
        lat: 10.7,
        lng: 106.7,
      },
      "vi",
    );
    expect(vm.typeTag).toBe("3S");
    expect(vm.cityKey).toBe("hcm");
    expect(vm.mapsUrl).toContain("10.7");
    expect(vm.bookHref).toContain("showroom=s1");
    expect(vm.hotline).toMatch(/0900/);
  });

  it("toSiteChromeVM composes chrome from partial settings", () => {
    const vm = toSiteChromeVM(
      {
        dealerName: { vi: "VOLTA AUTO", en: "VOLTA AUTO" },
        legalEntity: { vi: "CÔNG TY TNHH VOLTA", en: "VOLTA LLC" },
        mst: "0312345678",
        email: "hello@volta.example",
        socialLinks: [
          { platform: "facebook", url: "https://facebook.com/x" },
          { platform: "zalo", url: "https://zalo.me/123" },
        ],
      },
      [{ phone: "1900234567", sortOrder: 0 }],
      [
        {
          id: "s1",
          name: { vi: "Q7", en: "D7" },
          city: "TP.HCM",
          typeTag: "2S",
        },
      ],
      {
        header: [
          { label: { vi: "Trang chủ", en: "Home" }, routeKey: "home" },
        ],
        footer: [
          { label: { vi: "Chính sách", en: "Policies" }, routeKey: "policies" },
        ],
      },
      "vi",
      { workingHours: "8:00–20:00" },
    );
    expect(vm.logoText.primary).toBe("VOLTA");
    expect(vm.logoText.accent).toBe("AUTO");
    expect(vm.nav[0]?.href).toBe("/");
    expect(vm.zaloUrl).toContain("zalo.me");
    expect(vm.showrooms).toHaveLength(1);
    expect(vm.workingHours).toBe("8:00–20:00");
  });
});
