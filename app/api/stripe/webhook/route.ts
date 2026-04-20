import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import db from "@/db";
import { invoices } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse("Missing signature or secret", { status: 400 });
  }

  try {
    // 1. Use the v2 parser for Thin Events
    const event = stripe.parseEventNotification(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Cast as 'any' to bypass strict v2 vs v1 type conflicts
    const eventType = event.type as string;

    if (eventType === "checkout.session.completed") {
      // 2. Safely extract the Session ID from the thin payload
      const thinEvent = event as any;
      const sessionId = thinEvent.context?.object_id || thinEvent.data?.object?.id;

      if (!sessionId) {
        throw new Error("Session ID missing in thin event payload");
      }

      // 3. FETCH the full session to access metadata (since Thin events skip it)
      const fullSession = await stripe.checkout.sessions.retrieve(sessionId);
      const invoiceId = fullSession.metadata?.invoiceId;

      if (invoiceId) {
        await db
          .update(invoices)
          .set({ status: "paid" })
          .where(eq(invoices.id, invoiceId));
        
        console.log(`✅ Success: Invoice ${invoiceId} updated to paid.`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }
}