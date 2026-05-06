import db from "@/db";
import { NextResponse } from "next/server";
import {  InvoiceItem, invoices } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getCachedInvoices } from "@/lib/cache/invoices";
import { invalidateInvoices } from "@/lib/cache/invalidate";

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
    const data = await getCachedInvoices(id);
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

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate total from items
    const totalCents = body.items.reduce((sum: number, item: InvoiceItem) => {
      return sum + (item.quantity * item.unitPrice * 100); // convert to cents
    }, 0);


    const newInvoice = await db
      .insert(invoices)
      .values({
        userId,
        clientId: body.clientId,
        description: body.description || null,
        items: body.items || [],
        amount_cents: totalCents,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        status: body.status || "draft",
      })
      .returning();
      invalidateInvoices(userId);

    return NextResponse.json(
      { success: true, invoice: newInvoice[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Invoice creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}