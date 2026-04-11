"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { markAsPaid } from "@/lib/api-calls/markAsPaid";
import { getBadgeColor } from "@/lib/utils/utilityFunctions"; 
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const router = useRouter();
  async function fetchInvoices() {
    setFetching(true);
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices);
        setFetching(false);
      } else {
        console.error("Failed to fetch invoices:", data.error);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setFetching(false);
    }
  }
  useEffect(() => {
    fetchInvoices();
  }, []);
  return (
    <div className="space-x-2">
      <div className="flex justify-between space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Invoices</h1>
        <Button onClick={() => router.push("/invoices/new")}>
          <Plus className="mr-1 h-4 w-4" />
          New Invoice
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice ID</TableHead>
            <TableHead>Client</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead >Action</TableHead>
          </TableRow>
        </TableHeader>
        {invoices.length === 0 && !fetching ? (
          <TableCaption>No invoices found.</TableCaption>
        ) : (
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{invoice.clientId}</TableCell>
                <TableCell align="center">
                  {
                  <Badge className={getBadgeColor(invoice.status)}>{invoice.status}</Badge>
                  }
                </TableCell>
                <TableCell align="right">${invoice.amount}</TableCell>
                <TableCell>
                  <Button onClick={async () => {
                    await markAsPaid(invoice.id);
                    fetchInvoices();
                  }}>Mark as Paid</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
    </div>
  );
}
