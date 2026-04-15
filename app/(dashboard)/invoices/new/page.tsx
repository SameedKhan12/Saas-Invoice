// "use client";
// import {
//   Field,
//   FieldDescription,
//   FieldGroup,
//   FieldLabel,
//   FieldLegend,
//   FieldSet,
// } from "@/components/ui/field";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectTrigger,
//   SelectValue,
//   SelectItem,
//   SelectLabel,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useEffect, useState, FormEvent } from "react";
// import { invoiceSchema } from "@/lib/utils";
// import { toCents } from "@/lib/utils/amountConverter";
// type InvoiceFormError = {
//   clientId?: string[];
//     amount?: string[];
// }

// export default function InvoicesPage() {
//   const [clients, setClients] = useState([]);
//   const [errors, setErrors] = useState<InvoiceFormError>({});

//   async function fetchClients() {
//     try {
//       const res = await fetch("/api/client", {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setClients(data);
//       } else {
//         console.error("Failed to fetch clients:", data);
//       }
//     } catch (error) {
//       console.error("Error fetching clients:", error);
//     }
//   }
//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     // const session = await auth()

//     const formData = new FormData(e.target as HTMLFormElement);
//     const clientId = formData.get("clientId") as string;
//     const amount = formData.get("amount") as string;
//     const amountInCents = toCents(parseFloat(amount));
//     const validationResilt = invoiceSchema.safeParse(
//       Object.fromEntries(formData),
//     );
//     if (!validationResilt.success) {
//       const fieldErrors = validationResilt.error.flatten().fieldErrors;
//       setErrors(fieldErrors);
//       return;
//     }
//     try {
//       const res = await fetch("/api/invoices", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           clientId,
//           amount: amountInCents,
//         }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         console.log("Invoice created:", data);
//       } else {
//         console.error("Failed to create invoice:", data);
//       }
//     } catch (error) {
//       console.error("Error creating invoice:", error);
//     }
//   }
//   useEffect(() => {
//     fetchClients();
//   }, []);

//   return (
//     <form className="max-w-xl" onSubmit={handleSubmit}>
//       <FieldGroup>
//         <FieldSet>
//           <FieldLegend className="text-3xl font-semibold tracking-tight">
//             New Invoice
//           </FieldLegend>
//           <FieldDescription>create a new invoice</FieldDescription>
//           <FieldGroup>
//             <Field data-invalid={!!errors.clientId}>
//               <FieldLabel>Client</FieldLabel>
//               <Select name="clientId" defaultValue="">
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select a client" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectGroup>
//                     {clients.length === 0 ? (
//                       <SelectLabel>No clients found</SelectLabel>
//                     ) : (
//                       clients.map((client: any) => (
//                         <SelectItem key={client.id} value={client.id}>
//                           {client.name}
//                         </SelectItem>
//                       ))
//                     )}
//                   </SelectGroup>
//                 </SelectContent>
//               </Select>
//               {errors.clientId && (
//                 <FieldDescription className="text-destructive">
//                   {errors.clientId}
//                 </FieldDescription>
//               )}
//             </Field>
//             <Field data-invalid={!!errors.amount}>
//               <FieldLabel>Amount</FieldLabel>
//               <Input
//                 name="amount"
//                 type="number"
//                 placeholder="Enter amount"
//                 min={0}
//                 step={0.01}
//               />
//               {errors.amount && (
//                 <FieldDescription className="text-destructive">
//                   {errors.amount}
//                 </FieldDescription>
//               )}
//             </Field>
//           </FieldGroup>
//         </FieldSet>
//         <Button type="submit" className="mt-4">
//           Create Invoice
//         </Button>
//       </FieldGroup>
//     </form>
//   );
// }


"use client";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState, FormEvent } from "react";
import { invoiceSchema} from "@/lib/utils";
import { X, Plus } from "lucide-react";

type InvoiceFormError = {
  clientId?: string[];
  description?: string[];
  items?: string[];
  dueDate?: string[];
};

type InvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export default function InvoicesPage() {
  const [clients, setClients] = useState([]);
  const [errors, setErrors] = useState<InvoiceFormError>({});
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  async function fetchClients() {
    try {
      const res = await fetch("/api/client", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) {
        setClients(data);
      } else {
        console.error("Failed to fetch clients:", data);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  }

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.target as HTMLFormElement);
    const clientId = formData.get("clientId") as string;
    const description = formData.get("description") as string;
    const dueDate = formData.get("dueDate") as string;

    const invoiceData = {
      clientId,
      description,
      items,
      dueDate,
    };

    const validationResult = invoiceSchema.safeParse(invoiceData);
    
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      return;
    }

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      const data = await res.json();
      
      if (res.ok) {
        console.log("Invoice created:", data);
        // Reset form
        setItems([{ description: "", quantity: 1, unitPrice: 0 }]);
        (e.target as HTMLFormElement).reset();
      } else {
        console.error("Failed to create invoice:", data);
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  }

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <form className="max-w-2xl" onSubmit={handleSubmit}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend className="text-3xl font-semibold tracking-tight">
            New Invoice
          </FieldLegend>
          <FieldDescription>Create a new invoice</FieldDescription>

          <FieldGroup>
            {/* Client Selection */}
            <Field data-invalid={!!errors.clientId}>
              <FieldLabel>Client</FieldLabel>
              <Select name="clientId" defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {clients.length === 0 ? (
                      <SelectLabel>No clients found</SelectLabel>
                    ) : (
                      clients.map((client: any) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.clientId && (
                <FieldDescription className="text-destructive">
                  {errors.clientId}
                </FieldDescription>
              )}
            </Field>

            {/* Description */}
            <Field data-invalid={!!errors.description}>
              <FieldLabel>Description (Optional)</FieldLabel>
              <Textarea
                name="description"
                placeholder="Invoice description or notes"
                rows={3}
              />
              {errors.description && (
                <FieldDescription className="text-destructive">
                  {errors.description}
                </FieldDescription>
              )}
            </Field>

            {/* Due Date */}
            <Field data-invalid={!!errors.dueDate}>
              <FieldLabel>Due Date (Optional)</FieldLabel>
              <Input name="dueDate" type="date" />
              {errors.dueDate && (
                <FieldDescription className="text-destructive">
                  {errors.dueDate}
                </FieldDescription>
              )}
            </Field>

            {/* Invoice Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FieldLabel>Items</FieldLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {errors.items && (
                <FieldDescription className="text-destructive">
                  {errors.items}
                </FieldDescription>
              )}

              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 p-4 border rounded-lg"
                >
                  <div className="col-span-12 sm:col-span-5">
                    <Input
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-3">
                    <Input
                      type="number"
                      placeholder="Qty"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", parseInt(e.target.value) || 1)
                      }
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-3">
                    <Input
                      type="number"
                      placeholder="Price"
                      min={0}
                      step={0.01}
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="col-span-12 text-sm text-muted-foreground text-right">
                    Subtotal: ${(item.quantity * item.unitPrice).toFixed(2)}
                  </div>
                </div>
              ))}

              <div className="text-right text-lg font-semibold">
                Total: ${calculateTotal().toFixed(2)}
              </div>
            </div>
          </FieldGroup>
        </FieldSet>

        <Button type="submit" className="mt-4">
          Create Invoice
        </Button>
      </FieldGroup>
    </form>
  );
}
