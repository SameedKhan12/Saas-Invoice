import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock Next.js cache ───────────────────────────────────────────────────────
vi.mock("next/cache", () => ({
  unstable_cache: vi.fn((fn) => fn),
  revalidateTag: vi.fn(),
}));

// ── Mock auth ────────────────────────────────────────────────────────────────
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

// ── Mock DB ──────────────────────────────────────────────────────────────────
vi.mock("@/db", () => ({ default: {} }));

// ── Shared types ─────────────────────────────────────────────────────────────
type InvoiceStatus = "paid" | "pending" | "overdue" | "draft";

interface MockInvoice {
  id: string;
  userId: string;
  clientId: string;
  description: string;
  amount_cents: number;
  status: InvoiceStatus;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: never[];
}

interface MockClient {
  id: string;
  userId: string;
  name: string;
  email: string;
  createdAt: Date;
}

// ── Shared test data ─────────────────────────────────────────────────────────
const MOCK_USER_ID = "user-123";
const MOCK_EMAIL   = "test@example.com";

const MOCK_INVOICES: MockInvoice[] = [
  {
    id: "inv-1",
    userId: MOCK_USER_ID,
    clientId: "client-1",
    description: "Web design",
    amount_cents: 150000,
    status: "paid",
    dueDate: new Date("2025-03-01"),
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
  },
  {
    id: "inv-2",
    userId: MOCK_USER_ID,
    clientId: "client-2",
    description: "Development",
    amount_cents: 200000,
    status: "pending",
    dueDate: new Date("2025-04-01"),
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
  },
  {
    id: "inv-3",
    userId: MOCK_USER_ID,
    clientId: "client-1",
    description: "Consulting",
    amount_cents: 50000,
    status: "overdue",
    dueDate: new Date("2025-01-01"),
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
  },
  {
    id: "inv-4",
    userId: MOCK_USER_ID,
    clientId: "client-3",
    description: "Logo design",
    amount_cents: 80000,
    status: "draft",
    dueDate: null,              // ✅ null is fine with explicit MockInvoice type
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
  },
];

const MOCK_CLIENTS: MockClient[] = [
  { id: "client-1", userId: MOCK_USER_ID, name: "Acme Corp",  email: "acme@example.com",  createdAt: new Date() },
  { id: "client-2", userId: MOCK_USER_ID, name: "Beta Ltd",   email: "beta@example.com",  createdAt: new Date() },
  { id: "client-3", userId: MOCK_USER_ID, name: "Gamma Inc",  email: "gamma@example.com", createdAt: new Date() },
];

// ── Pure computation helper ───────────────────────────────────────────────────
// Mirrors the logic inside getCachedDashboardData so we can test it
// without hitting the DB or cache
function computeDashboardData(
  allClients: MockClient[],
  allInvoices: MockInvoice[]
) {
  const totalRevenue   = allInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount_cents / 100, 0);
  const pendingRevenue = allInvoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount_cents / 100, 0);
  const overdueRevenue = allInvoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount_cents / 100, 0);
  const draftRevenue   = allInvoices.filter((i) => i.status === "draft").reduce((s, i) => s + i.amount_cents / 100, 0);

  const statusBreakdown = [
    { status: "paid",    count: allInvoices.filter((i) => i.status === "paid").length,    amount: totalRevenue,   fill: "#22c55e" },
    { status: "pending", count: allInvoices.filter((i) => i.status === "pending").length, amount: pendingRevenue, fill: "#eab308" },
    { status: "overdue", count: allInvoices.filter((i) => i.status === "overdue").length, amount: overdueRevenue, fill: "#ef4444" },
    { status: "draft",   count: allInvoices.filter((i) => i.status === "draft").length,   amount: draftRevenue,   fill: "#3b82f6" },
  ].filter((item) => item.count > 0);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return {
      month:      date.toLocaleDateString("en-US", { month: "short" }),
      year:       date.getFullYear(),
      monthIndex: date.getMonth(),
    };
  });

  const revenueByMonth = last6Months.map(({ month, year, monthIndex }) => {
    const revenue = allInvoices
      .filter((i) => {
        if (!i.createdAt) return false;
        const d = new Date(i.createdAt);
        return d.getMonth() === monthIndex && d.getFullYear() === year && i.status === "paid";
      })
      .reduce((s, i) => s + i.amount_cents / 100, 0);
    return { month, revenue };
  });

  return {
    totalClients:  allClients.length,
    totalInvoices: allInvoices.length,
    totalRevenue,
    pendingRevenue,
    overdueRevenue,
    draftRevenue,
    statusBreakdown,
    revenueByMonth,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 1. DASHBOARD BUSINESS LOGIC
// ────────────────────────────────────────────────────────────────────────────
describe("Dashboard business logic", () => {
  it("calculates totalRevenue from paid invoices only", () => {
    const result = computeDashboardData(MOCK_CLIENTS, MOCK_INVOICES);
    expect(result.totalRevenue).toBe(1500); // 150000 / 100
  });

  it("calculates pendingRevenue correctly", () => {
    const result = computeDashboardData(MOCK_CLIENTS, MOCK_INVOICES);
    expect(result.pendingRevenue).toBe(2000);
  });

  it("calculates overdueRevenue correctly", () => {
    const result = computeDashboardData(MOCK_CLIENTS, MOCK_INVOICES);
    expect(result.overdueRevenue).toBe(500);
  });

  it("calculates draftRevenue correctly", () => {
    const result = computeDashboardData(MOCK_CLIENTS, MOCK_INVOICES);
    expect(result.draftRevenue).toBe(800);
  });

  it("returns correct totalClients and totalInvoices", () => {
    const result = computeDashboardData(MOCK_CLIENTS, MOCK_INVOICES);
    expect(result.totalClients).toBe(3);
    expect(result.totalInvoices).toBe(4);
  });

  it("builds statusBreakdown with correct counts", () => {
    const result = computeDashboardData(MOCK_CLIENTS, MOCK_INVOICES);
    expect(result.statusBreakdown.find((s) => s.status === "paid")?.count).toBe(1);
    expect(result.statusBreakdown.find((s) => s.status === "pending")?.count).toBe(1);
    expect(result.statusBreakdown.find((s) => s.status === "overdue")?.count).toBe(1);
    expect(result.statusBreakdown.find((s) => s.status === "draft")?.count).toBe(1);
  });

  it("filters out statuses with count 0 from statusBreakdown", () => {
    const paidOnly = MOCK_INVOICES.filter((i) => i.status === "paid");
    const result = computeDashboardData(MOCK_CLIENTS, paidOnly);
    expect(result.statusBreakdown).toHaveLength(1);
    expect(result.statusBreakdown[0].status).toBe("paid");
  });

  it("assigns correct fill colors to each status", () => {
    const result = computeDashboardData(MOCK_CLIENTS, MOCK_INVOICES);
    expect(result.statusBreakdown.find((s) => s.status === "paid")?.fill).toBe("#22c55e");
    expect(result.statusBreakdown.find((s) => s.status === "pending")?.fill).toBe("#eab308");
    expect(result.statusBreakdown.find((s) => s.status === "overdue")?.fill).toBe("#ef4444");
    expect(result.statusBreakdown.find((s) => s.status === "draft")?.fill).toBe("#3b82f6");
  });

  it("returns 6 months in revenueByMonth", () => {
    const result = computeDashboardData(MOCK_CLIENTS, MOCK_INVOICES);
    expect(result.revenueByMonth).toHaveLength(6);
  });

  it("most recent month in revenueByMonth is current month", () => {
    const result = computeDashboardData(MOCK_CLIENTS, MOCK_INVOICES);
    const currentMonth = new Date().toLocaleDateString("en-US", { month: "short" });
    expect(result.revenueByMonth[5].month).toBe(currentMonth);
  });

  it("returns zero revenue for months with no paid invoices", () => {
    const oldInvoices = MOCK_INVOICES.map((i) => ({
      ...i,
      createdAt: new Date("2020-01-01"),
    }));
    const result = computeDashboardData(MOCK_CLIENTS, oldInvoices);
    const totalMonthRevenue = result.revenueByMonth.reduce((s, m) => s + m.revenue, 0);
    expect(totalMonthRevenue).toBe(0);
  });

  it("handles empty invoices and clients", () => {
    const result = computeDashboardData([], []);
    expect(result.totalRevenue).toBe(0);
    expect(result.totalClients).toBe(0);
    expect(result.totalInvoices).toBe(0);
    expect(result.statusBreakdown).toHaveLength(0);
  });

  it("only counts paid invoices in monthly revenue", () => {
    const now = new Date();
    const invoicesThisMonth: MockInvoice[] = [
      { ...MOCK_INVOICES[0], status: "paid",    createdAt: now, amount_cents: 100000 },
      { ...MOCK_INVOICES[1], status: "pending", createdAt: now, amount_cents: 200000 },
    ];
    const result = computeDashboardData(MOCK_CLIENTS, invoicesThisMonth);
    expect(result.revenueByMonth[5].revenue).toBe(1000); // only paid counts
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 2. DASHBOARD HANDLER — tests the exported dashboardHandler directly
//    (avoids NextAuth ctx requirement on the GET wrapper)
//    Make sure your route exports: export async function dashboardHandler(...)
// ────────────────────────────────────────────────────────────────────────────
describe("dashboardHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 401 if userId is empty string", async () => {
    vi.doMock("@/lib/cache/dashboard", () => ({
      getCachedDashboardData: vi.fn(),
    }));

    const { dashboardHandler } = await import("@/app/api/dashboard/route");
    const res = await dashboardHandler("", "");

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 if email is empty string", async () => {
    vi.doMock("@/lib/cache/dashboard", () => ({
      getCachedDashboardData: vi.fn(),
    }));

    const { dashboardHandler } = await import("@/app/api/dashboard/route");
    const res = await dashboardHandler(MOCK_USER_ID, "");

    expect(res.status).toBe(401);
  });

  it("returns 200 with correct dashboard data", async () => {
    const mockData = {
      totalClients:  3,
      totalInvoices: 4,
      totalRevenue:  1500,
      pendingRevenue: 2000,
      overdueRevenue: 500,
      draftRevenue:  800,
      statusBreakdown: [],
      revenueByMonth: [],
    };

    vi.doMock("@/lib/cache/dashboard", () => ({
      getCachedDashboardData: vi.fn().mockResolvedValue(mockData),
    }));

    const { dashboardHandler } = await import("@/app/api/dashboard/route");
    const res = await dashboardHandler(MOCK_USER_ID, MOCK_EMAIL);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.totalRevenue).toBe(1500);
    expect(body.totalClients).toBe(3);
    expect(body.totalInvoices).toBe(4);
  });

  it("returns all expected fields in response body", async () => {
    vi.doMock("@/lib/cache/dashboard", () => ({
      getCachedDashboardData: vi.fn().mockResolvedValue({
        totalClients: 1, totalInvoices: 1, totalRevenue: 100,
        pendingRevenue: 50, overdueRevenue: 25, draftRevenue: 10,
        statusBreakdown: [], revenueByMonth: [],
      }),
    }));

    const { dashboardHandler } = await import("@/app/api/dashboard/route");
    const body = await (await dashboardHandler(MOCK_USER_ID, MOCK_EMAIL)).json();

    expect(body).toHaveProperty("totalClients");
    expect(body).toHaveProperty("totalInvoices");
    expect(body).toHaveProperty("totalRevenue");
    expect(body).toHaveProperty("pendingRevenue");
    expect(body).toHaveProperty("overdueRevenue");
    expect(body).toHaveProperty("draftRevenue");
    expect(body).toHaveProperty("statusBreakdown");
    expect(body).toHaveProperty("revenueByMonth");
  });

  it("returns 500 when cache throws", async () => {
    vi.doMock("@/lib/cache/dashboard", () => ({
      getCachedDashboardData: vi.fn().mockRejectedValue(new Error("DB failed")),
    }));

    const { dashboardHandler } = await import("@/app/api/dashboard/route");
    const res = await dashboardHandler(MOCK_USER_ID, MOCK_EMAIL);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 3. REVENUE CALCULATIONS — pure unit tests
// ────────────────────────────────────────────────────────────────────────────
describe("Revenue calculations", () => {
  it("correctly converts cents to dollars", () => {
    expect(150000 / 100).toBe(1500);
    expect(0 / 100).toBe(0);
    expect(1 / 100).toBe(0.01);
  });

  it("sums only paid invoices for totalRevenue", () => {
    const total = MOCK_INVOICES
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + i.amount_cents / 100, 0);
    expect(total).toBe(1500);
  });

  it("handles zero invoices without throwing", () => {
    const total = ([] as MockInvoice[])
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + i.amount_cents / 100, 0);
    expect(total).toBe(0);
  });

  it("all revenue types sum to grand total", () => {
    const result = computeDashboardData(MOCK_CLIENTS, MOCK_INVOICES);
    const sumAllRevenue =
      result.totalRevenue +
      result.pendingRevenue +
      result.overdueRevenue +
      result.draftRevenue;
    const expectedTotal = MOCK_INVOICES.reduce((s, i) => s + i.amount_cents / 100, 0);
    expect(sumAllRevenue).toBe(expectedTotal);
  });

  it("multiple paid invoices in same month sum correctly", () => {
    const now = new Date();
    const twoPayments: MockInvoice[] = [
      { ...MOCK_INVOICES[0], status: "paid", createdAt: now, amount_cents: 50000 },
      { ...MOCK_INVOICES[1], status: "paid", createdAt: now, amount_cents: 75000 },
    ];
    const result = computeDashboardData([], twoPayments);
    expect(result.revenueByMonth[5].revenue).toBe(1250); // (50000 + 75000) / 100
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 4. CACHE INVALIDATION
// ────────────────────────────────────────────────────────────────────────────
describe("Cache invalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("invalidateInvoices calls revalidateTag with correct tag", async () => {
    const { revalidateTag } = await import("next/cache");
    const { invalidateInvoices } = await import("@/lib/cache/invalidate");

    invalidateInvoices(MOCK_USER_ID);

    expect(revalidateTag).toHaveBeenCalledWith(`invoices-${MOCK_USER_ID}`);
  });

  it("invalidateClients calls revalidateTag with correct tag", async () => {
    const { revalidateTag } = await import("next/cache");
    const { invalidateClients } = await import("@/lib/cache/invalidate");

    invalidateClients(MOCK_USER_ID);

    expect(revalidateTag).toHaveBeenCalledWith(`clients-${MOCK_USER_ID}`);
  });

  it("invalidateInvoices does not touch clients tag", async () => {
    const { revalidateTag } = await import("next/cache");
    const { invalidateInvoices } = await import("@/lib/cache/invalidate");

    invalidateInvoices(MOCK_USER_ID);

    expect(revalidateTag).not.toHaveBeenCalledWith(`clients-${MOCK_USER_ID}`);
  });

  it("each userId gets its own isolated cache tag", async () => {
    const { revalidateTag } = await import("next/cache");
    const { invalidateInvoices } = await import("@/lib/cache/invalidate");

    invalidateInvoices("user-aaa");
    invalidateInvoices("user-bbb");

    expect(revalidateTag).toHaveBeenCalledWith("invoices-user-aaa");
    expect(revalidateTag).toHaveBeenCalledWith("invoices-user-bbb");
    expect(revalidateTag).toHaveBeenCalledTimes(2);
  });
});