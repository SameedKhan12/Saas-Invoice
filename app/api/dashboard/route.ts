// app/api/dashboard/route.ts
import db from "@/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { clients,  invoices } from "@/db/schema";
import { eq } from "drizzle-orm";

export const GET= auth(async function GET(req) {
  if(!req.auth){
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const session = await req.auth;
    const id = session?.user?.id;
    if (!id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const allClients = await db.select().from(clients).where(eq(clients.userId, id));
    const allInvoices = await db.select().from(invoices).where(eq(invoices.userId, id));

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

    // Status breakdown
 const statusBreakdown = [
  {
    status: "paid",
    count: allInvoices.filter((i) => i.status === "paid").length,
    amount: totalRevenue,
    fill: "#22c55e", // Green
  },
  {
    status: "pending",
    count: allInvoices.filter((i) => i.status === "pending").length,
    amount: pendingRevenue,
    fill: "#eab308", // Yellow
  },
  {
    status: "overdue",
    count: allInvoices.filter((i) => i.status === "overdue").length,
    amount: overdueRevenue,
    fill: "#ef4444", // Red
  },
  {
    status: "draft",
    count: allInvoices.filter((i) => i.status === "draft").length,
    amount: draftRevenue,
    fill: "#3b82f6", // Blue
  },
].filter(item => item.count > 0);

    // Revenue trend (last 6 months)
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
          const invoiceDate = new Date(i.createdAt);
          return (
            invoiceDate.getMonth() === monthIndex &&
            invoiceDate.getFullYear() === year &&
            i.status === "paid"
          );
        })
        .reduce((sum, i) => sum + i.amount_cents / 100, 0);

      return {
        month,
        revenue: monthRevenue,
      };
    });

    return NextResponse.json(
      {
        totalClients: allClients.length,
        totalInvoices: allInvoices.length,
        totalRevenue,
        pendingRevenue,
        overdueRevenue,
        draftRevenue,
        statusBreakdown,
        revenueByMonth,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
})