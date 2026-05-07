"use server";
import db from "@/db";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { clients } from "@/db/schema";
import { auth } from "@/lib/auth";
import { invalidateClients } from "@/lib/cache/invalidate";

type RouteParams = Promise<{ id:string }>

export const DELETE = auth(async function DELETE(req,{ params }: { params: RouteParams },) {
  const userId = req.auth?.user?.id
  if(!userId){
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    if(!id){

      throw new Error('id not found')

    }
      await db.delete(clients).where(and(eq(clients.id, id),eq(clients.userId,userId)));
      invalidateClients(userId)
      return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
})

export  const PUT = auth(async function PUT(req,{ params }: { params: RouteParams },) {
   const userId = req.auth?.user?.id
  if(!userId){
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    if(!id){
      throw new Error('id not found')
    }
    const updated = await db
      .update(clients)
      .set({
        name: body.name,
        email: body.email,
      })
      .where(and(eq(clients.id, id),eq(clients.id,userId)))
      .returning();
      invalidateClients(userId)
    return NextResponse.json(
      { success: true, client: updated[0] },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
})
