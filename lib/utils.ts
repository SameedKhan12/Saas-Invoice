import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { clientSchema, invoiceSchema } from "./utils/zodSchema"
export type { ClientSchema, InvoiceSchema } from "./utils/zodSchema"
