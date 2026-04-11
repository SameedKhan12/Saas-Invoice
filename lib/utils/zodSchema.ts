import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().trim().min(3, "Name is required").max(255, "Name must be 255 characters or fewer"),
  email: z.string().email("Invalid email address"),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  amount: z.coerce.number().min(0, "Amount must be at least 0"),
});

export type ClientSchema = z.infer<typeof clientSchema>;
export type InvoiceSchema = z.infer<typeof invoiceSchema>;
