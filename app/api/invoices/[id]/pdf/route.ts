import db from "@/db";
import { invoices, clients } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateInvoicePDF } from "@/lib/pdf";
import { pgTable, PgTable } from "drizzle-orm/pg-core";
import { UUID } from "crypto";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: UUID }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await params;

  // get invoice
  const invoice = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, session.user.id)));

  if (!invoice) {
    return new NextResponse("Not found", { status: 404 });
  }

  // get client
  //   const client = await db.query.clients.findFirst({
  //     where: (c, { eq }) => eq(c.id, invoice.clientId),
  //   });
  const client = await db
    .select()
    .from(clients)
    .where(eq(clients.id, invoice[0].clientId));

  const pdfBytes = await generateInvoicePDF(
    invoice[0],
    client[0]?.name || "Unknown",
  );
  console.log("invoice:", invoice);
  console.log("client:", client);
  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${invoice[0].id}.pdf`,
    },
  });
}
