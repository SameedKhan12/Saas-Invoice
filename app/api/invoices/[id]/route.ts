import db from "@/db";
import { invoices, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type RouteParams = Promise<{ id: string }>;

export const PATCH = auth(async function PATCH(
  request,
  { params }: { params: RouteParams },
) {
  try {
    if (!request.auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    console.log("Received request to mark invoice as paid with ID:", id);
    const updated = await db
      .update(invoices)
      .set({ status: "paid" })
      .where(eq(invoices.id, id))
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


export async function GET(request:Request,{params}:{params:RouteParams}){
    try {
        const {id} = await params;
        const invoice = await db.select().from(invoices).leftJoin(users,eq(users.id,invoices.userId)).where(eq(invoices.id,id));

        return NextResponse.json(invoice[0],{status:200})
    } catch (error) {
        return NextResponse.json({error:error},{status:500})
    }
}