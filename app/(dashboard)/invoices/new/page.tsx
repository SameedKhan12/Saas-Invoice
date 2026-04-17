"use client";

import {
  Field,
  FieldDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, FormEvent } from "react";
import { Trash, Plus } from "lucide-react";
import InvoicePreview, { InvoicePreviewData } from "@/components/invoice-preview";
import { InvoiceItem } from "@/db/schema";

interface Client {
  id: string;
  name: string;
  email: string;
}

const emptyItem = (): InvoiceItem => ({
  description: "",
  quantity: 1,
  unitPrice: 0,
});

export default function NewInvoicePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state
  const [selectedClientId, setSelectedClientId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("1");
  const [description, setDescription] = useState("");
  const [billTo, setBillTo] = useState("");
  const [shipTo, setShipTo] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [taxPercent, setTaxPercent] = useState(0);
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const tax = subtotal * (taxPercent / 100);
  const total = subtotal + tax;

  async function fetchClients() {
    try {
      const res = await fetch("/api/client");
      const data = await res.json();
      if (res.ok) setClients(data);
    } catch (e) {
      console.error("Failed to fetch clients", e);
    }
  }

  useEffect(() => {
    fetchClients();
  }, []);

  // Auto-fill billTo when client is selected
  useEffect(() => {
    const client = clients.find((c) => c.id === selectedClientId);
    if (client) setBillTo(client.name);
  }, [selectedClientId, clients]);

  function addItem() {
    setItems([...items, emptyItem()]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) {
    setItems(
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!selectedClientId) newErrors.clientId = "Client is required";
    if (items.length === 0) newErrors.items = "Add at least one item";
    if (
      items.some(
        (item) => !item.description || item.quantity < 1 || item.unitPrice < 0
      )
    ) {
      newErrors.items = "All items must have a description, quantity, and price";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          description,
          items,
          amount_cents: Math.round(total * 100),
          dueDate: dueDate || null,
          status: "draft",
        }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setErrors({ submit: data.error || "Failed to create invoice" });
      }
    } catch {
      setErrors({ submit: "Failed to create invoice" });
    } finally {
      setSubmitting(false);
    }
  }

  const previewData: InvoicePreviewData = {
    invoiceNumber,
    date,
    dueDate,
    paymentTerms,
    poNumber,
    billTo,
    shipTo,
    description,
    items,
    taxPercent,
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-2xl font-semibold">Invoice created!</p>
        <Button onClick={() => { setSuccess(false); setItems([emptyItem()]); }}>
          Create Another
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-8 w-full min-h-screen items-start">
      {/* ── Left: Form ── */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md shrink-0 space-y-6"
      >
        <FieldSet>
          <FieldLegend className="text-2xl font-semibold tracking-tight">
            New Invoice
          </FieldLegend>
          <FieldDescription>Fill in the details below</FieldDescription>
        </FieldSet>

        {/* Client */}
        <Field data-invalid={!!errors.clientId}>
          <FieldLabel>Client</FieldLabel>
          <Select
            name="clientId"
            value={selectedClientId}
            onValueChange={setSelectedClientId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {clients.length === 0 ? (
                  <SelectLabel>No clients found</SelectLabel>
                ) : (
                  clients.map((client) => (
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

        {/* Invoice Number */}
        <Field>
          <FieldLabel>Invoice #</FieldLabel>
          <Input
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="1"
          />
        </Field>

        {/* Description */}
        <Field>
          <FieldLabel>Description</FieldLabel>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Web development services"
          />
        </Field>

        {/* Bill To / Ship To */}
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel>Bill To</FieldLabel>
            <Textarea
              value={billTo}
              onChange={(e) => setBillTo(e.target.value)}
              placeholder="Client name & address"
              rows={3}
            />
          </Field>
          <Field>
            <FieldLabel>Ship To</FieldLabel>
            <Textarea
              value={shipTo}
              onChange={(e) => setShipTo(e.target.value)}
              placeholder="Shipping address"
              rows={3}
            />
          </Field>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel>Date</FieldLabel>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Due Date</FieldLabel>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Field>
        </div>

        {/* Payment Terms / PO Number */}
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel>Payment Terms</FieldLabel>
            <Input
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="e.g. Net 30"
            />
          </Field>
          <Field>
            <FieldLabel>PO Number</FieldLabel>
            <Input
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="e.g. 7685774"
            />
          </Field>
        </div>

        <Separator />

        {/* Line Items */}
        <div>
          <p className="text-sm font-semibold mb-3">Line Items</p>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_60px_80px_36px] gap-2 items-end"
              >
                <Field>
                  {index === 0 && <FieldLabel>Description</FieldLabel>}
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                    placeholder="Item description"
                  />
                </Field>
                <Field>
                  {index === 0 && <FieldLabel>Qty</FieldLabel>}
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", parseInt(e.target.value) || 1)
                    }
                  />
                </Field>
                <Field>
                  {index === 0 && <FieldLabel>Price</FieldLabel>}
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "unitPrice",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={index === 0 ? "mt-5" : ""}
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {errors.items && (
            <p className="text-destructive text-xs mt-1">{errors.items}</p>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={addItem}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>

        {/* Tax */}
        <Field>
          <FieldLabel>Tax (%)</FieldLabel>
          <Input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={taxPercent}
            onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
        </Field>

        {errors.submit && (
          <p className="text-destructive text-sm">{errors.submit}</p>
        )}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating..." : "Create Invoice"}
        </Button>
      </form>

      {/* ── Right: Live Preview ── */}
      <div className="flex-1 sticky top-6">
        <p className="text-sm font-medium text-muted-foreground mb-3">
          Preview
        </p>
        <InvoicePreview data={previewData} />
      </div>
    </div>
  );
}
