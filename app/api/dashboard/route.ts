import db from "@/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { clients, invoices } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const id = session.user.id
    const allClients = await db.select().from(clients).where(eq(clients.userId,id))
    const allInvoices = await db.select().from(invoices).where(eq(invoices.userId,id));

    const totalRevenue = !allInvoices?0:allInvoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + i.amount, 0);

    const pendingRevenue = !allInvoices?0:allInvoices
      .filter((i) => i.status !== "paid")
      .reduce((sum, i) => sum + i.amount, 0);

    return NextResponse.json(
      {
        totalClients: allClients.length,
        totalInvoices: allInvoices.length,
        totalRevenue,
        pendingRevenue,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
