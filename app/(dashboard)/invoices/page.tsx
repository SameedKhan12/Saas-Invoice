// "use client";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Invoice } from "@/db/schema";
// import { markAsPaid } from "@/lib/api-calls/markAsPaid";
// import { formatCurrency } from "@/lib/utils/amountConverter";
// import { getBadgeColor } from "@/lib/utils/utilityFunctions";
// import { Plus } from "lucide-react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { Send, CheckCheck, Download } from "lucide-react";

// export default function InvoicesPage() {
//   const [invoices, setInvoices] = useState<Invoice[]>();
//   const [fetching, setFetching] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(false);
//   const router = useRouter();
//   async function fetchInvoices() {
//     setFetching(true);
//     try {
//       const res = await fetch("/api/invoices");
//       const data = await res.json();
//       if (data.success) {
//         setInvoices(data.invoices);
//         setFetching(false);
//       } else {
//         console.error("Failed to fetch invoices:", data.error);
//       }
//     } catch (error) {
//       console.error("Error fetching invoices:", error);
//       setFetching(false);
//     }
//   }
//   useEffect(() => {
//     fetchInvoices();
//   }, []);
//   return (
//     <div className="space-x-2">
//       <div className="flex justify-between space-y-3">
//         <h1 className="text-3xl font-semibold tracking-tight">Invoices</h1>
//         <Button onClick={() => router.push("/invoices/new")}>
//           <Plus className="mr-1 h-4 w-4" />
//           New Invoice
//         </Button>
//       </div>
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Invoice ID</TableHead>
//             <TableHead>Client</TableHead>
//             <TableHead className="text-center">Status</TableHead>
//             <TableHead className="text-right">Amount</TableHead>
//             <TableHead className="text-center">Action</TableHead>
//           </TableRow>
//         </TableHeader>
//         {invoices?.length === 0 && !fetching ? (
//           <TableCaption>No invoices found.</TableCaption>
//         ) : (
//           <TableBody>
//             {invoices?.map((invoice) => (
//               <TableRow key={invoice.id}>
//                 <TableCell>{invoice.id}</TableCell>
//                 <TableCell>{invoice.clientId}</TableCell>
//                 <TableCell align="center">
//                   {
//                     <Badge className={getBadgeColor(invoice.status)}>
//                       {invoice.status}
//                     </Badge>
//                   }
//                 </TableCell>
//                 <TableCell align="right">
//                   ${formatCurrency(invoice.amount_cents)}
//                 </TableCell>
//                 <TableCell align="center">
//                   <Button
//                     disabled={fetching || loading}
//                     onClick={async () => {
//                       await markAsPaid(invoice.id);
//                       fetchInvoices();
//                     }}
//                   >
//                     <CheckCheck className="w-4 h-4" />
//                     Mark as Paid
//                   </Button>
//                   <Link
//                     className=""
//                     href={`/api/invoices/${invoice.id}/pdf`}
//                     download
//                   >
//                     <Button>
//                       <Download className="w-4 h-4" />
//                       PDF
//                     </Button>
//                   </Link>
//                   <Button
//                     disabled={loading}
//                     onClick={async () => {
//                       setLoading(true);

//                       await fetch(`/api/invoices/${invoice.id}/send`, {
//                         method: "POST",
//                       });
//                       alert("Email sent!");
//                       setLoading(false);
//                       return;
//                     }}
//                   >
//                     <Send className="w-4 h-4" />
//                     Send Email
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         )}
//       </Table>
//     </div>
//   );
// }


// app/invoices/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Invoice } from "@/db/schema";
import { columns } from "@/components/columns"; 
import { DataTable } from "@/components/data-table";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function fetchInvoices() {
    setLoading(true);
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices);
      } else {
        console.error("Failed to fetch invoices:", data.error);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInvoices();
  }, []);

  if (loading) {
    return (
      <div className="flex h-112.5 items-center justify-center">
        <p className="text-muted-foreground">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
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
      <DataTable columns={columns} data={invoices} />
    </div>
  );
}