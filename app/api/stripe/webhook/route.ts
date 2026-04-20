import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { invoices } from "@/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const sig = headerList.get("stripe-signature");

  if (!sig) {
    console.error("Missing stripe-signature header");
    return new NextResponse("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature failed:", message);
    return new NextResponse(`Webhook error: ${message} 😒`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId = session.metadata?.invoiceId;

    if (invoiceId) {
      try {
        await db
          .update(invoices)
          .set({ status: "paid" })
          .where(eq(invoices.id, invoiceId));
        console.log(`Invoice ${invoiceId} marked as paid`);
      } catch (err) {
        console.error("DB update failed:", err);
        return new NextResponse("DB error", { status: 500 });
      }
    } else {
      console.warn("checkout.session.completed — no invoiceId in metadata");
    }
  }

  return NextResponse.json({ received: true });
}