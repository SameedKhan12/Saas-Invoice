// // app/invoices/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Invoice } from "@/db/schema";
import { formatCurrency } from "@/lib/utils/amountConverter";
import { getBadgeColor } from "@/lib/utils/utilityFunctions";
import { ArrowUpDown, MoreHorizontal, Send, CheckCheck, Download } from "lucide-react";

export const columns: ColumnDef<Invoice>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "Invoice ID",
    cell: ({ row }) => (
      <div className="font-mono text-sm">{(row.getValue("id") as string)?.slice(0, 8)}...</div>
    ),
  },
  {
    accessorKey: "clientId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Client
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-mono text-sm">{(row.getValue("clientId")as string)?.slice(0, 8)}...</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return <div className="max-w-50 truncate">{description || "—"}</div>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <Badge className={getBadgeColor(status)}>{status}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "amount_cents",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const amount = row.getValue("amount_cents") as number;
      return (
        <div className="text-right font-medium">
          ${formatCurrency(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Due Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dueDate = row.getValue("dueDate") as Date;
      return dueDate ? new Date(dueDate).toLocaleDateString() : "—";
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const invoice = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(invoice.id)}
            >
              Copy invoice ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                const { markAsPaid } = await import("@/lib/api-calls/markAsPaid");
                await markAsPaid(invoice.id);
                window.location.reload();
              }}
              disabled={invoice.status === "paid"}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark as Paid
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/api/invoices/${invoice.id}/pdf`} download>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await fetch(`/api/invoices/${invoice.id}/send`, {
                  method: "POST",
                });
                alert("Email sent!");
              }}
            >
              <Send className="mr-2 h-4 w-4" />
              Send Email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// components/columns.tsx
// "use client";

// import { ColumnDef } from "@tanstack/react-table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Invoice } from "@/db/schema";
// import { formatCurrency } from "@/lib/utils/amountConverter";
// import { getBadgeColor } from "@/lib/utils/utilityFunctions";
// import {
//   ArrowUpDown,
//   MoreHorizontal,
//   Send,
//   CheckCheck,
//   Download,
//   Copy,
// } from "lucide-react";

// export const columns: ColumnDef<Invoice>[] = [
//   {
//     id: "select",
//     header: ({ table }) => (
//       <Checkbox
//         checked={
//           table.getIsAllPageRowsSelected() ||
//           (table.getIsSomePageRowsSelected() && "indeterminate")
//         }
//         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//         aria-label="Select all"
//       />
//     ),
//     cell: ({ row }) => (
//       <Checkbox
//         checked={row.getIsSelected()}
//         onCheckedChange={(value) => row.toggleSelected(!!value)}
//         aria-label="Select row"
//       />
//     ),
//     enableSorting: false,
//     enableHiding: false,
//   },
//   {
//     accessorKey: "id",
//     header: "Invoice ID",
//     cell: ({ row }) => (
//       <span className="font-mono text-xs sm:text-sm text-muted-foreground">
//         {(row.getValue("id") as string)?.slice(0, 8)}…
//       </span>
//     ),
//   },
//   {
//     accessorKey: "clientId",
//     header: ({ column }) => (
//       <Button
//         variant="ghost"
//         size="sm"
//         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         className="px-0"
//       >
//         Client
//         <ArrowUpDown className="ml-1 h-3 w-3" />
//       </Button>
//     ),
//     cell: ({ row }) => (
//       <span className="font-mono text-xs sm:text-sm text-muted-foreground">
//         {(row.getValue("clientId") as string)?.slice(0, 8)}…
//       </span>
//     ),
//   },
//   {
//     accessorKey: "description",
//     header: "Description",
//     cell: ({ row }) => {
//       const desc = row.getValue("description") as string;
//       return (
//         <span className="block max-w-[160px] truncate text-sm" title={desc}>
//           {desc || "—"}
//         </span>
//       );
//     },
//   },
//   {
//     accessorKey: "status",
//     header: ({ column }) => (
//       <Button
//         variant="ghost"
//         size="sm"
//         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         className="px-0"
//       >
//         Status
//         <ArrowUpDown className="ml-1 h-3 w-3" />
//       </Button>
//     ),
//     cell: ({ row }) => {
//       const status = row.getValue("status") as string;
//       return (
//         <Badge className={`${getBadgeColor(status)} text-xs capitalize`}>
//           {status}
//         </Badge>
//       );
//     },
//     filterFn: (row, id, value) => value.includes(row.getValue(id)),
//   },
//   {
//     accessorKey: "amount_cents",
//     header: ({ column }) => (
//       <div className="text-right">
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//           className="px-0"
//         >
//           Amount
//           <ArrowUpDown className="ml-1 h-3 w-3" />
//         </Button>
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div className="text-right font-medium text-sm">
//         ${formatCurrency(row.getValue("amount_cents") as number)}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "dueDate",
//     header: ({ column }) => (
//       <Button
//         variant="ghost"
//         size="sm"
//         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         className="px-0"
//       >
//         Due Date
//         <ArrowUpDown className="ml-1 h-3 w-3" />
//       </Button>
//     ),
//     cell: ({ row }) => {
//       const dueDate = row.getValue("dueDate") as Date | null;
//       return (
//         <span className="text-sm text-muted-foreground">
//           {dueDate ? new Date(dueDate).toLocaleDateString() : "—"}
//         </span>
//       );
//     },
//   },
//   {
//     id: "actions",
//     enableHiding: false,
//     cell: ({ row }) => {
//       const invoice = row.original;

//       return (
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button
//               variant="ghost"
//               className="h-8 w-8 p-0"
//               aria-label="Open actions"
//             >
//               <MoreHorizontal className="h-4 w-4" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end" className="w-48">
//             <DropdownMenuLabel>Actions</DropdownMenuLabel>

//             <DropdownMenuItem
//               onClick={() => navigator.clipboard.writeText(invoice.id)}
//             >
//               <Copy className="mr-2 h-4 w-4" />
//               Copy invoice ID
//             </DropdownMenuItem>

//             <DropdownMenuSeparator />

//             <DropdownMenuItem
//               disabled={invoice.status === "paid"}
//               onClick={async () => {
//                 const { markAsPaid } = await import(
//                   "@/lib/api-calls/markAsPaid"
//                 );
//                 await markAsPaid(invoice.id);
//                 window.location.reload();
//               }}
//             >
//               <CheckCheck className="mr-2 h-4 w-4" />
//               Mark as Paid
//             </DropdownMenuItem>

//             <DropdownMenuItem asChild>
//               <a href={`/api/invoices/${invoice.id}/pdf`} download>
//                 <Download className="mr-2 h-4 w-4" />
//                 Download PDF
//               </a>
//             </DropdownMenuItem>

//             <DropdownMenuItem
//               onClick={async () => {
//                 await fetch(`/api/invoices/${invoice.id}/send`, {
//                   method: "POST",
//                 });
//                 alert("Email sent!");
//               }}
//             >
//               <Send className="mr-2 h-4 w-4" />
//               Send Email
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       );
//     },
//   },
// ];