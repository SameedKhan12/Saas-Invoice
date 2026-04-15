import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().trim().min(3, "Name is required").max(255, "Name must be 255 characters or fewer"),
  email: z.string().email("Invalid email address"),
});

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Item description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
});

export const invoiceSchema = z.object({
  clientId: z.string().uuid("Please select a client"),
  description: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  dueDate: z.string().optional(),
  status: z.enum(["draft", "pending", "paid", "overdue"]).optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

// Keep your existing helper
export const toCents = (amount: number) => Math.round(amount * 100);
export const fromCents = (cents: number) => cents / 100;
export type ClientSchema = z.infer<typeof clientSchema>;
export type InvoiceSchema = z.infer<typeof invoiceSchema>;
