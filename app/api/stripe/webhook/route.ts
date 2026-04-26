import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import db from "@/db";
import { invoices, clients, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateReceiptPDF } from "@/lib/receipt-pdf";
import { sendReceiptEmail } from "@/lib/receipt-email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) {
    return new NextResponse("Missing stripe-signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature failed:", msg);
    return new NextResponse(`Webhook error: ${msg}`, { status: 400 });
  }

  console.log("✅ Stripe event received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId = session.metadata?.invoiceId;

    if (!invoiceId) {
      console.warn("No invoiceId in session metadata");
      return NextResponse.json({ received: true });
    }

    try {
      // 1. Mark invoice as paid
      await db
        .update(invoices)
        .set({ status: "paid" })
        .where(eq(invoices.id, invoiceId));

      console.log(`Invoice ${invoiceId} marked as paid`);

      // 2. Fetch invoice + client + user for the receipt
      const [row] = await db
        .select()
        .from(invoices)
        .leftJoin(clients, eq(clients.id, invoices.clientId))
        .leftJoin(users, eq(users.id, invoices.userId))
        .where(eq(invoices.id, invoiceId));

      if (!row?.invoices || !row?.clients) {
        console.error("Could not find invoice/client for receipt");
        return NextResponse.json({ received: true });
      }

      const invoice = row.invoices;
      const client = row.clients;

      // 3. Build receipt data
      const receiptData = {
        platformName: process.env.PLATFORM_NAME ?? "Invoice SaaS",
        platformEmail:
          process.env.PLATFORM_EMAIL ?? "support@invoicesaas.com",
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? "N/A",
        paidAt: new Date(),
        invoiceId: invoice.id,
        // Use first 8 chars of UUID as a short invoice number
        invoiceNumber: invoice.id.slice(0, 8).toUpperCase(),
        description: invoice.description,
        items: (invoice.items as any[]) ?? [],
        amountCents: invoice.amount_cents,
        clientName: client.name,
        clientEmail: client.email,
      };

      // 4. Generate receipt PDF
      const pdfBuffer = await generateReceiptPDF(receiptData);

      // 5. Send receipt email with PDF attached
      const { success, error } = await sendReceiptEmail(receiptData, pdfBuffer);

      if (!success) {
        // Log but don't fail the webhook — invoice is already marked paid
        console.error("Receipt email failed to send:", error);
      } else {
        console.log(`Receipt email sent to ${client.email}`);
      }
    } catch (err) {
      console.error("Error processing checkout.session.completed:", err);
      // Return 500 so Stripe retries — but only if marking paid also failed.
      // If paid was marked successfully and only email failed, return 200.
      return new NextResponse("Internal error", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}