import { unstable_cache } from "next/cache";
import db from "@/db";
import { clients, InvoiceItem, invoices } from "@/db/schema";
import { eq } from "drizzle-orm";

export type InvoiceWithClient = {
  id: string;
  clientId: string | null; // client name now, not UUID
  description: string | null;
  amount_cents: number;
  dueDate: Date | null;
  status: "draft" | "pending" | "paid" | "overdue";
  items: InvoiceItem[] | null;
};

// Cache invoices per user — revalidates every 30 seconds
// or when you manually call revalidateTag("invoices")
export const getCachedInvoices = (userId: string) =>
  unstable_cache(
    async () => {
      return  db
      .select({
        id: invoices.id,
        clientId: clients.name,
        description: invoices.description,
        amount_cents: invoices.amount_cents,
        dueDate: invoices.dueDate,
        status: invoices.status,
        items:invoices.items,


      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.userId, userId));
    },
    [`invoices-${userId}`],         // unique cache key per user
    {
      tags: [`invoices-${userId}`], // tag for manual invalidation
      revalidate: 300,               // auto-revalidate every 30s
    }
  )();
