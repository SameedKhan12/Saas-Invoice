import db from "@/db";
import { NextResponse } from "next/server";
import { eq, gte } from "drizzle-orm";
import { clients, invoices } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const id = session.user.id;
    if(!id){
      return NextResponse.json({message:'Unauthorized'},{status:401})
    }
    const data = await db
      .select({
        id: invoices.id,
        clientId: clients.name,
        amount_cents: invoices.amount_cents,
        status: invoices.status,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.userId, id));
    return NextResponse.json(
      { success: true, invoices: data },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch invoices", error:error },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const id = session.user.id;
    const newInvoice = await db
      .insert(invoices)
      .values({
        userId: id,
        clientId: body.clientId,
        amount_cents: body.amount * 100,
        status: body.status || "draft",
      })
      .returning();
    return NextResponse.json(
      { success: true, invoice: newInvoice[0] },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create invoice" },
      { status: 500 },
    );
  }
}
