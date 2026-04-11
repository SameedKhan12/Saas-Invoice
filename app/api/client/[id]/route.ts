"use server";
import db from "@/db";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { clients, invoices } from "@/db/schema";
import { UUID } from "crypto";

export async function DELETE(
  req: Request,
  { params }: { params: { id: UUID } },
) {
  const { id } = await params;
  try {
    await db.delete(clients).where(eq(clients.id, id));
    await db.delete(invoices).where(eq(invoices.clientId,id))
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: UUID } }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updated = await db
      .update(clients)
      .set({
        name: body.name,
        email: body.email,
      })
      .where(eq(clients.id, id))
      .returning();
    return NextResponse.json(
      { success: true, client: updated[0] },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
