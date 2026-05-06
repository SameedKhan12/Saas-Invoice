

"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Invoice } from "@/db/schema";
import { columns } from "./columns"; 
import { DataTable } from "./data-table"; 
import { Toaster } from "./ui/sonner"; 
import { InvoiceWithClient } from "@/lib/cache/invoices";


export default function InvoicesClient({data}:{ data: InvoiceWithClient[]}) {
//   const [loading, setLoading] = useState(true);
  const router = useRouter();

//   async function fetchInvoices() {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/invoices");
//       const data = await res.json();
//       if (data.success) {
//         setInvoices(data.invoices);
//       } else {
//         console.error("Failed to fetch invoices:", data.error);
//       }
//     } catch (error) {
//       console.error("Error fetching invoices:", error);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     fetchInvoices();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex h-112.5 items-center justify-center">
//         <p className="text-muted-foreground">Loading invoices...</p>
//       </div>
//     );
//   }

  return (
    <div className="container mx-auto py-10">
      <Toaster/>
      <div className="container w-xs sm:w-sm md:w-md lg:w-auto max-md:mx-auto  flex max-md:flex-col md:items-center justify-start gap-1 md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage your invoices and view their payment status.
          </p>
        </div>
        <Button onClick={() => router.push("/invoices/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>
      <div className="mx-auto w-xs sm:w-sm md:w-md lg:w-auto ">

      <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}