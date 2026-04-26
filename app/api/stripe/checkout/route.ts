import { stripe } from "@/lib/stripe";
import db from "@/db";
import { invoices, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { invoiceId } = await req.json();

  // 1️⃣ Get invoice + owner
  const [invoice] = await db.select().from(invoices).leftJoin(users,eq(users.id,invoices.userId)).where(eq(invoices.id,invoiceId))

  if (!invoice) {
    return  NextResponse.json({message:"Invoice not found"}, { status: 404 });
  }

  // 2️⃣ Check Stripe connection
  if (!invoice.users?.stripeAccountId) {
    return  NextResponse.json({message:"User not connected to Stripe"},{status:404});
  }

  // 3️⃣ Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card","wallets"],
    mode: "payment",
    metadata:{
      invoiceId: String(invoice.invoices.id),
    },
    

    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          product_data: {
            name: `Invoice #${invoice.invoices.id}`,
          },
          unit_amount: invoice.invoices.amount_cents,
        },
      },
    ],

    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/invoices`,

    payment_intent_data: {
      transfer_data: {
        destination: invoice.users.stripeAccountId,
      },
    },
  });

  return NextResponse.json({message:"Redirecting" ,url: session.url });
}