import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/modules/leads/leads.repository", () => ({
  create: vi.fn(),
  findById: vi.fn(),
  list: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/server/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import * as repo from "@/server/modules/leads/leads.repository";
import { LEAD_CSV_COLUMNS } from "@/server/modules/leads/leads.schema";
import { create, exportCsv } from "@/server/modules/leads/leads.service";

const validPayload = {
  name: "Nguyen Van A",
  phone: "0901234567",
  email: "a@example.com",
  consent: true as const,
};

describe("leads.create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects missing consent", async () => {
    const result = await create({
      type: "CONSULT",
      locale: "vi",
      payload: { name: "A", phone: "090", consent: false },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("VALIDATION_ERROR");
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("rejects missing name", async () => {
    const result = await create({
      type: "TEST_DRIVE",
      locale: "vi",
      payload: { name: "", phone: "0901234567", consent: true },
    });
    expect(result.ok).toBe(false);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("rejects missing phone", async () => {
    const result = await create({
      type: "DEPOSIT",
      locale: "en",
      payload: { name: "Alex", phone: "  ", consent: true },
    });
    expect(result.ok).toBe(false);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("persists a valid lead", async () => {
    const now = new Date();
    vi.mocked(repo.create).mockResolvedValue({
      id: "lead-1",
      type: "CONSULT",
      status: "NEW",
      locale: "vi",
      payload: validPayload,
      modelId: null,
      variantId: null,
      showroomId: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
    });

    const result = await create({
      type: "CONSULT",
      locale: "vi",
      payload: validPayload,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.id).toBe("lead-1");
      expect(result.data.payload.consent).toBe(true);
    }
    expect(repo.create).toHaveBeenCalledOnce();
  });
});

describe("leads.exportCsv", () => {
  it("uses expected column header", async () => {
    vi.mocked(repo.list).mockResolvedValue([]);
    const csv = await exportCsv();
    const header = csv.split("\n")[0];
    expect(header).toBe(LEAD_CSV_COLUMNS.join(","));
  });
});
