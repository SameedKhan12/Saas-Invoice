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
import { useEffect, useState, FormEvent } from "react";
import { invoiceSchema } from "@/lib/utils";
import { toCents } from "@/lib/utils/amountConverter";
type InvoiceFormError = {
  clientId?: string[];
    amount?: string[];
}

export default function InvoicesPage() {
  const [clients, setClients] = useState([]);
  const [errors, setErrors] = useState<InvoiceFormError>({});

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
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // const session = await auth()

    const formData = new FormData(e.target as HTMLFormElement);
    const clientId = formData.get("clientId") as string;
    const amount = formData.get("amount") as string;
    const amountInCents = toCents(parseFloat(amount));
    const validationResilt = invoiceSchema.safeParse(
      Object.fromEntries(formData),
    );
    if (!validationResilt.success) {
      const fieldErrors = validationResilt.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      return;
    }
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          amount: amountInCents,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log("Invoice created:", data);
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
    <form className="max-w-xl" onSubmit={handleSubmit}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend className="text-3xl font-semibold tracking-tight">
            New Invoice
          </FieldLegend>
          <FieldDescription>create a new invoice</FieldDescription>
          <FieldGroup>
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
            <Field data-invalid={!!errors.amount}>
              <FieldLabel>Amount</FieldLabel>
              <Input
                name="amount"
                type="number"
                placeholder="Enter amount"
                min={0}
                step={0.01}
              />
              {errors.amount && (
                <FieldDescription className="text-destructive">
                  {errors.amount}
                </FieldDescription>
              )}
            </Field>
          </FieldGroup>
        </FieldSet>
        <Button type="submit" className="mt-4">
          Create Invoice
        </Button>
      </FieldGroup>
    </form>
  );
}
