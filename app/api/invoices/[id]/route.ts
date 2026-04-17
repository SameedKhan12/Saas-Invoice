import db from "@/db";
import { invoices } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type RouteParams = Promise<{ id: string }>;

export async function PATCH(request: Request, { params }: { params: RouteParams }) {
    try{        
        const { id } = await params;
        console.log("Received request to mark invoice as paid with ID:", id);
        const updated = await db
        .update(invoices)
        .set({ status: "paid"})
        .where(eq(invoices.id, id))
        .returning();
        
        return NextResponse.json(updated, { status: 200 });
    }catch(error){
        console.error("Error updating invoice:", error);
        return NextResponse.json({ error: "Failed to update invoice", err: error }, { status: 500 });
    }
}