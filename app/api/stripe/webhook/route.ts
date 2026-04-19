import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { invoices } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const sig = headerList.get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new NextResponse("Webhook error", { status: 400 });
  }

  // 🎯 Handle only what you need
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    const invoiceId = session.metadata?.invoiceId;

    if (invoiceId) {
      await db
        .update(invoices)
        .set({ status: "paid" })
        .where(eq(invoices.id, invoiceId));
    }
  }

  // ✅ ALWAYS RETURN (this fixes your crash)
  return NextResponse.json({ received: true });
}