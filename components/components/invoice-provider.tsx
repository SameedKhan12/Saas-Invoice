"use client";

import { useEffect } from "react";
import { useInvoiceStore } from "@/lib/store/invoice-store";

export default function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const fetch = useInvoiceStore((s) => s.fetch);

  useEffect(() => {
    fetch();
  }, []);

  return <>{children}</>;
}