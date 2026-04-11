import db from "@/db";
import { NextResponse } from "next/server";
import { clients, invoices } from "@/db/schema";

export async function GET() {
  try {
  const allClients = await db.select().from(clients);
  const allInvoices = await db.select().from(invoices);

  const totalRevenue = allInvoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);

  const pendingRevenue = allInvoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + i.amount, 0);
console.log("Total Clients:", allClients.length);
console.log("Total Invoices:", allInvoices.length);
console.log("Total Revenue:", totalRevenue);
console.log("Pending Revenue:", pendingRevenue);
  return NextResponse.json({
    totalClients: allClients.length,
    totalInvoices: allInvoices.length,
    totalRevenue,
    pendingRevenue,
  }, { status: 200 });
} catch (error) {
  console.error("Error fetching dashboard data:", error);
  return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
}
}