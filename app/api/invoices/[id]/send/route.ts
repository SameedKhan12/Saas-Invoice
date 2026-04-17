import db from "@/db";
import { invoices, clients } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateInvoicePDF } from "@/lib/pdf";
import { sendInvoiceEmail } from "@/lib/email";

type RouteParams = Promise<{ id: string }>;

export async function POST(
  req: Request,
  { params }: { params: RouteParams}
) {
  try{

    const session = await auth();
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { id } = await params;
    
    
    const invoice = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, session.user.id)));
    
    
    if (!invoice) {
      return new NextResponse("Not found", { status: 404 });
    }
    
    const client = await db
    .select()
    .from(clients)
    .where(eq(clients.id, invoice[0].clientId));
    
    const pdfBytes = await generateInvoicePDF(
      invoice[0],
      client[0]?.name || "Unknown"
    );
    
  const {success}=await sendInvoiceEmail({
  to: client[0].email,
  pdfBytes,
  clientName: client[0].name,
  invoiceNumber: invoice[0].id.slice(0, 8).toUpperCase(),
  amount: invoice[0].amount_cents,
  dueDate: invoice[0].dueDate?.toISOString(),
  companyName: "Your Company Name",
});
  if(invoice[0].status!=='pending' && success){
    await db
    .update(invoices)
    .set({ status: "pending"})
    .where(eq(invoices.id, id))
    .returning();
  }
  return NextResponse.json({ success: true },{status:201});
} catch(error){
  return NextResponse.json({success:false,error:error},{status:401})
}
}