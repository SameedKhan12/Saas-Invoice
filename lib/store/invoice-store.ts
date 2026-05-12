import { create } from "zustand";
import { InvoiceWithClient } from "../cache/invoices";

type InvoiceStore = InvoiceWithClient & {
  fetched: boolean;
  fetching: boolean;
  fetch: () => Promise<void>;
};

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  id: "",
  userId: "",
  clientId: "",
  description: null,
  amount_cents: 0,
  dueDate: null,
  status: "draft",
  items: null,
  fetched: false,
  fetching: false,
  fetch: async () => {
    if (get().fetched || get().fetching) return;

    set({ fetching: true });

    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();

      set({
        id: data.id ?? "",
        userId: data.userId ?? "",
        clientId: data.clientId ?? null,
        description: data.description ?? null,
        amount_cents: data.amount_cents ?? 0,
        dueDate:data.dueDate ?? null,
        status: data.status ?? "draft",
        items: data.items ?? null,
        fetched: false,
      });
    } catch {
      set({ fetched: true }); // mark as fetched even on error to avoid infinite retries
    } finally {
      set({ fetching: false });
    }
  },
}));
