import db from "@/db";
import { invoices, clients, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateInvoicePDF } from "@/lib/pdf";
import { sendInvoiceEmail } from "@/lib/email";
import { stripe } from "@/lib/stripe";

type RouteParams = Promise<{ id: string }>;

export async function POST(
  req: Request,
  { params }: { params: RouteParams}
) {
  try{

    const session = await auth();
    const userId =  session?.user?.id;
    
    if (!userId) {
       throw new Error("Unauthorized")
    }
    
    const { id } = await params;

    const user = await db.select().from(users).where(eq(users.id,userId))
    
    if(!user[0].stripeAccountId){
      throw new Error("stripe account not connected")
    }
    
    const invoice = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
    
    
    if (!invoice) {
      throw new Error("invoice not found")
    }

    if(invoice[0].status === "paid") {
      throw new Error("Invoice has already been paid")
    }
    
    const client = await db
    .select()
    .from(clients)
    .where(eq(clients.id, invoice[0].clientId));
    
const account=await stripe.account.retrieve(user[0].stripeAccountId)
if(!account.details_submitted){
   throw new Error("Stripe detailes not submitted")
}

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
  paymentUrl:`${process.env.NEXT_PUBLIC_BASE_URL}/pay/${invoice[0].id}`
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
  console.error(error,"POST /api/invoices/[id]/send")
  return NextResponse.json({success:false,error:error},{status:404})
}
}