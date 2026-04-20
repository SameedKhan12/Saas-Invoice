// app/(dashboard)/invoices/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { Plus } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Invoice } from "@/db/schema";
// import { columns } from "@/components/columns";
// import { DataTable } from "@/components/data-table";

// export default function InvoicesPage() {
//   const [invoices, setInvoices] = useState<Invoice[]>([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

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
//       <div className="flex h-64 items-center justify-center">
//         <p className="text-muted-foreground">Loading invoices...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full overflow-x-hidden sm:w-screen px-4 py-6 sm:px-6 lg:px-8">
//       {/* Header */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
//             Invoices
//           </h1>
//           <p className="text-sm text-muted-foreground mt-1">
//             Manage your invoices and view their payment status.
//           </p>
//         </div>
//         <Button
//           onClick={() => router.push("/invoices/new")}
//           className="w-full sm:w-auto"
//         >
//           <Plus className="mr-2 h-4 w-4" />
//           New Invoice
//         </Button>
//       </div>

//       <DataTable columns={columns} data={invoices} />
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
import { Toaster } from "@/components/ui/sonner";

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
      <Toaster/>
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