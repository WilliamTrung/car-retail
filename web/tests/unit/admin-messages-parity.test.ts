import { describe, expect, it } from "vitest";

import en from "../../messages/en.json";
import vi from "../../messages/vi.json";

/** Flatten nested message objects into dotted leaf keys. */
function flattenKeys(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    if (child !== null && typeof child === "object" && !Array.isArray(child)) {
      return flattenKeys(child, next);
    }
    return [next];
  });
}

describe("admin.* message key parity", () => {
  it("en.json and vi.json share the same admin.* key set", () => {
    const enKeys = new Set(flattenKeys(en.admin));
    const viKeys = new Set(flattenKeys(vi.admin));

    const onlyInEn = [...enKeys].filter((key) => !viKeys.has(key)).sort();
    const onlyInVi = [...viKeys].filter((key) => !enKeys.has(key)).sort();

    expect(
      { onlyInEn, onlyInVi },
      `admin.* key mismatch — onlyInEn=${onlyInEn.join(", ") || "∅"} onlyInVi=${onlyInVi.join(", ") || "∅"}`,
    ).toEqual({ onlyInEn: [], onlyInVi: [] });
  });
});
