"use client";

import { Button } from "@/components/ui/button";
import { InvoiceItem } from "@/db/schema";
import { useEffect, useState } from "react";

type RouteParams = Promise<{ id: string }>;
type Invoice = {
    invoices: {
        id: string;
        userId: string;
        clientId: string;
        description: string | null;
        items: InvoiceItem[] | null;
        amount_cents: number;
        dueDate: Date | null;
        status: "draft" | "pending" | "paid" | "overdue";
        createdAt: Date | null;
        updatedAt: Date | null;
    };
    users: {
        id: string;
        email: string;
        password: string;
        stripeAccountId: string | null;
        createdAt: Date | null;
    } | null;
}

export default function PayPage({ params }: { params: RouteParams }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [invoice, setInvoice] = useState<Invoice>();

  const handlePay = async () => {
  // 1. Check if invoice actually exists before proceeding
  if (!invoice) return;

  setLoading(true);
  try {
    const { id } = await params;

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // 2. REMOVE Number(). Use the string ID directly.
        invoiceId: id, 
      }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      console.error("No redirect URL received:", data);
    }
  } catch (error) {
    console.error("Payment Error:", error);
  } finally {
    setLoading(false);
  }
};

  const fetchInvoice = async () => {
    try {
      const { id } = await params;
      setLoading(true);
      const res = await fetch(`/api/invoices/${id}`);
      const invoiceData = await res.json();

      setInvoice(invoiceData as Invoice);
    } catch (error) {
      console.error("Failed to fetch invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    fetchInvoice();
  },[])
if (loading || !invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg animate-pulse">Loading Invoice Details...</p>
      </div>
    );
  }

  // 2. Once we are here, TypeScript and React know 'invoice' is defined.
  // No more "Cannot read properties of undefined" errors!
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="border p-8 rounded-2xl shadow w-[400px] space-y-4">
        <h1 className="text-xl font-semibold">
          Invoice #{invoice.invoices.id}
        </h1>
        
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <strong>Amount:</strong> ${(invoice.invoices.amount_cents / 100).toFixed(2)}
          </p>
          <p>
            <strong>Status:</strong> {invoice.invoices.status}
          </p>
          <p>
            <strong>Issued By:</strong> {invoice.users?.email}
          </p>
        </div>

        <Button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl"
        >
          {loading ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </div>
  );
}