import { unstable_cache } from "next/cache";
import db from "@/db";
import { clients, invoices } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getCachedDashboardData = (userId: string) =>
  unstable_cache(
    async () => {
      const [allClients, allInvoices] = await Promise.all([
        db.select().from(clients).where(eq(clients.userId, userId)),
        db.select().from(invoices).where(eq(invoices.userId, userId)),
      ]);

      const totalRevenue = allInvoices
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + i.amount_cents / 100, 0);

      const pendingRevenue = allInvoices
        .filter((i) => i.status === "pending")
        .reduce((sum, i) => sum + i.amount_cents / 100, 0);

      const overdueRevenue = allInvoices
        .filter((i) => i.status === "overdue")
        .reduce((sum, i) => sum + i.amount_cents / 100, 0);

      const draftRevenue = allInvoices
        .filter((i) => i.status === "draft")
        .reduce((sum, i) => sum + i.amount_cents / 100, 0);

      const statusBreakdown = [
        { status: "paid",    count: allInvoices.filter((i) => i.status === "paid").length,    amount: totalRevenue,    fill: "#22c55e" },
        { status: "pending", count: allInvoices.filter((i) => i.status === "pending").length, amount: pendingRevenue,  fill: "#eab308" },
        { status: "overdue", count: allInvoices.filter((i) => i.status === "overdue").length, amount: overdueRevenue,  fill: "#ef4444" },
        { status: "draft",   count: allInvoices.filter((i) => i.status === "draft").length,   amount: draftRevenue,    fill: "#3b82f6" },
      ].filter((item) => item.count > 0);

      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return {
          month: date.toLocaleDateString("en-US", { month: "short" }),
          year: date.getFullYear(),
          monthIndex: date.getMonth(),
        };
      });

      const revenueByMonth = last6Months.map(({ month, year, monthIndex }) => {
        const monthRevenue = allInvoices
          .filter((i) => {
            if (!i.createdAt) return false;
            const d = new Date(i.createdAt);
            return (
              d.getMonth() === monthIndex &&
              d.getFullYear() === year &&
              i.status === "paid"
            );
          })
          .reduce((sum, i) => sum + i.amount_cents / 100, 0);

        return { month, revenue: monthRevenue };
      });

      return {
        totalClients: allClients.length,
        totalInvoices: allInvoices.length,
        totalRevenue,
        pendingRevenue,
        overdueRevenue,
        draftRevenue,
        statusBreakdown,
        revenueByMonth,
      };
    },
    [`dashboard-${userId}`],
    {
      tags: [`dashboard-${userId}`, `invoices-${userId}`, `clients-${userId}`],
      revalidate: 300,
    }
  )();