import { InvoiceWithClient } from "@/lib/cache/invoices";
import { useUserStore } from "@/lib/store/user-store";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { CheckCheck, Download, MoreHorizontal, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function InvoiceActions({ invoice }: { invoice: InvoiceWithClient }) {
  const { stripeConnected } = useUserStore(); // ✅ valid — inside a component

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
            try {
              const res = await fetch(`/api/invoices/${invoice.id}/send`, {
                method: "POST",
              });
              if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
              }
              toast.success("Email sent", {
                description: "Email has been sent to the client",
              });
            } catch (err) {
              console.log(err);
              toast.error("Unexpected error while sending email");
            }
          }}
          disabled={invoice.status === "paid" || !stripeConnected}
        >
          <Send className="mr-2 h-4 w-4" />
          Send Email
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600"
          onClick={async () => {
            try {
              const res = await fetch(`/api/invoices/${invoice.id}`, {
                method: "DELETE",
              });
              if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
              }
              toast.success("Invoice deleted");
            } catch (err) {
              console.log(err);
              toast.error("Unexpected error while deleting invoice");
            }
          }}
          disabled={invoice.status === "paid"}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Invoice
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}