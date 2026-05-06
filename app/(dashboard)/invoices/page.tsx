import InvoicesClient from "@/components/invoice-client";
import { auth } from "@/lib/auth";
import { getCachedInvoices } from "@/lib/cache/invoices";
import { redirect } from "next/navigation";

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const invoices = await getCachedInvoices(session.user.id);

  return <InvoicesClient data={invoices} />;
}