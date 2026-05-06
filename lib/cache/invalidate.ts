import { revalidateTag } from "next/cache";

export function invalidateInvoices(userId: string) {
  revalidateTag(`invoices-${userId}`,{});
}

export function invalidateClients(userId: string) {
  revalidateTag(`clients-${userId}`, {});
}