import { afterEach, describe, expect, it, vi } from "vitest";
import { IntlError, IntlErrorCode } from "next-intl";
import { getMessageFallback, onError } from "@/lib/i18n/request";

function missing(originalMessage?: string): IntlError {
  return new IntlError(IntlErrorCode.MISSING_MESSAGE, originalMessage);
}

describe("getMessageFallback", () => {
  it("returns the last dot-segment of a namespaced key", () => {
    expect(
      getMessageFallback({
        key: "settings.saveButton",
        namespace: "admin",
        error: missing(),
      }),
    ).toBe("saveButton");
  });

  it("returns a bare key unchanged", () => {
    expect(
      getMessageFallback({
        key: "title",
        error: missing(),
      }),
    ).toBe("title");
  });

  it("returns last segment for missing spec.* keys (SSG-safe)", () => {
    expect(
      getMessageFallback({
        key: "fastCharge",
        namespace: "spec",
        error: missing("Could not resolve `spec.fastCharge`"),
      }),
    ).toBe("fastCharge");
    expect(
      getMessageFallback({
        key: "zeroToFifty",
        namespace: "spec",
        error: missing("Could not resolve `spec.zeroToFifty`"),
      }),
    ).toBe("zeroToFifty");
  });
});

describe("onError", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("logs MISSING_MESSAGE with console.error in non-production and does not throw", () => {
    vi.stubEnv("NODE_ENV", "development");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const err = missing("Could not resolve `spec.fastCharge`");

    expect(() => onError(err)).not.toThrow();
    expect(errorSpy).toHaveBeenCalledWith(err);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("logs MISSING_MESSAGE with console.warn in production and does not throw", () => {
    vi.stubEnv("NODE_ENV", "production");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const err = missing("Could not resolve `spec.zeroToFifty`");

    expect(() => onError(err)).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith(err);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("rethrows non-MISSING_MESSAGE codes", () => {
    const err = new IntlError(
      IntlErrorCode.INVALID_MESSAGE,
      "Invalid message",
    );
    expect(() => onError(err)).toThrow(err);
  });
});
