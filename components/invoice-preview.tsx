"use client";

import { InvoiceItem } from "@/db/schema";
import { Separator } from "@/components/ui/separator";

export interface InvoicePreviewData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  paymentTerms: string;
  poNumber: string;
  billTo: string;
  shipTo: string;
  description: string;
  items: InvoiceItem[];
  taxPercent: number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function InvoicePreview({ data }: { data: InvoicePreviewData }) {
  const subtotal = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const tax = subtotal * (data.taxPercent / 100);
  const total = subtotal + tax;
  const balanceDue = total;

  return (
    <div className="bg-white text-black rounded-lg shadow-sm border border-gray-200 w-full max-w-2xl text-sm font-sans">
      {/* Header */}
      <div className="flex items-start justify-between p-8 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            INVOICE
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            # {data.invoiceNumber || "—"}
          </p>
          {data.description && (
            <p className="text-gray-600 mt-1 text-sm">{data.description}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-gray-800">
            {formatCurrency(balanceDue)}
          </p>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
            Balance Due
          </p>
        </div>
      </div>

      <Separator />

      {/* Bill To / Ship To */}
      <div className="grid grid-cols-2 gap-6 px-8 py-5">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Bill To
          </p>
          <p className="text-gray-800 whitespace-pre-line">
            {data.billTo || <span className="text-gray-300">—</span>}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Ship To
          </p>
          <p className="text-gray-800 whitespace-pre-line">
            {data.shipTo || <span className="text-gray-300">—</span>}
          </p>
        </div>
      </div>

      <Separator />

      {/* Invoice Meta */}
      <div className="grid grid-cols-2 gap-2 px-8 py-5">
        <MetaRow label="Date" value={data.date || "—"} />
        <MetaRow label="Payment Terms" value={data.paymentTerms || "—"} />
        <MetaRow label="Due Date" value={data.dueDate || "—"} />
        <MetaRow label="PO Number" value={data.poNumber || "—"} />
      </div>

      <Separator />

      {/* Items Table */}
      <div className="px-8 py-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/2">
                Item
              </th>
              <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/6">
                Qty
              </th>
              <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/6">
                Rate
              </th>
              <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/6">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-6 text-center text-gray-300 italic"
                >
                  No items yet
                </td>
              </tr>
            ) : (
              data.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 text-gray-800">
                    {item.description || "—"}
                  </td>
                  <td className="py-3 text-center text-gray-600">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right text-gray-600">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-3 text-right text-gray-800 font-medium">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Separator />

      {/* Totals */}
      <div className="px-8 py-5 flex justify-end">
        <div className="w-56 space-y-2">
          <TotalRow label="Subtotal" value={formatCurrency(subtotal)} />
          <TotalRow
            label={`Tax (${data.taxPercent}%)`}
            value={formatCurrency(tax)}
          />
          <Separator />
          <TotalRow
            label="Total"
            value={formatCurrency(total)}
            bold
          />
          <TotalRow
            label="Balance Due"
            value={formatCurrency(balanceDue)}
            bold
            highlight
          />
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className="text-gray-800 text-sm">{value}</span>
    </div>
  );
}

function TotalRow({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center ${
        highlight ? "text-gray-900" : ""
      }`}
    >
      <span
        className={`text-sm ${
          bold ? "font-semibold text-gray-800" : "text-gray-500"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-sm ${
          bold ? "font-semibold text-gray-800" : "text-gray-600"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
