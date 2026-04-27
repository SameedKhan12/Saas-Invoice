import db from "@/db";
import { invoices, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq, not } from "drizzle-orm";
import { NextResponse } from "next/server";

type RouteParams = Promise<{ id: string }>;

export const PATCH = auth(async function PATCH(
  request,
  { params }: { params: RouteParams },
) {
  try {
    const userId = await request.auth?.user?.id;
    if (!request.auth || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    console.log("Received request to mark invoice as paid with ID:", id);

    const updated = await db
      .update(invoices)
      .set({ status: "paid" })
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
      .returning();

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice", err: error },
      { status: 500 },
    );
  }
});

export async function GET(
  request: Request,
  { params }: { params: RouteParams },
) {
  try {
    const { id } = await params;
    const invoice = await db
      .select()
      .from(invoices)
      .leftJoin(users, eq(users.id, invoices.userId))
      .where(eq(invoices.id, id));

    return NextResponse.json(invoice[0], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export const DELETE = auth(async function DELETE(
  req,
  { params }: { params: RouteParams },
) {
  const userId = await req.auth?.user?.id;
  const invoiceId = await (await params).id;
  if (!userId || !invoiceId) {
    return new NextResponse("Unauthorized", { status: 404 });
  }
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, invoiceId));
  if (invoice.userId !== userId)
    return new NextResponse("This invoice doesnot belongs to you", {
      status: 404,
    });

  await db
    .delete(invoices)
    .where(and(
      eq(invoices.id, invoiceId), 
      eq(invoices.userId,userId),
      not(eq(invoices.status, "paid"))
  ));
});
