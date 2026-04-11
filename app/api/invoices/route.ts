import db from "@/db";
import { NextResponse } from "next/server";
import { eq, gte } from "drizzle-orm";
import { clients, invoices } from "@/db/schema";

export async function GET() {
    try{
        const data = await db.select({
            id: invoices.id,
            clientId: clients.name,
            amount: invoices.amount,
            status: invoices.status
        }).from(invoices).leftJoin(clients, eq(invoices.clientId, clients.id)).where(eq(invoices.userId, 'c839abdb-f472-4416-a7b9-d82565b9d9d4'));
        return NextResponse.json({ success: true, invoices: data }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to fetch invoices" }, { status: 500 });
    }
}

export async function POST (req: Request) {
    try {
        const body = await req.json();
        const newInvoice = await db.insert(invoices).values({
            userId: body.userId,
            clientId: body.clientId,
            amount: body.amount,
            status: body.status || "draft",
        }).returning();
        return NextResponse.json({ success: true, invoice: newInvoice[0] }, { status: 201 });   
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to create invoice" }, { status: 500 });
    }
}