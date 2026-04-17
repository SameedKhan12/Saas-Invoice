import { Invoice, InvoiceItem } from "@/db/schema";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from "@react-pdf/renderer";
import React from "react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
    paddingHorizontal: 48,
    paddingVertical: 48,
    backgroundColor: "#ffffff",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  invoiceTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
    letterSpacing: 1,
  },
  invoiceNumber: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 4,
  },
  invoiceDescription: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 3,
  },
  balanceDueBlock: {
    alignItems: "flex-end",
  },
  balanceDueAmount: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
  },
  balanceDueLabel: {
    fontSize: 8,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 2,
  },

  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginVertical: 14,
  },

  // Bill To / Ship To
  addressRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 4,
  },
  addressBlock: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  addressValue: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.5,
  },

  // Meta grid
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "48%",
  },
  metaLabel: {
    fontSize: 8,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontFamily: "Helvetica-Bold",
  },
  metaValue: {
    fontSize: 10,
    color: "#374151",
  },

  // Items table
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 7,
  },
  colItem: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colRate: { flex: 1.2, textAlign: "right" },
  colAmount: { flex: 1.2, textAlign: "right" },
  cellText: {
    fontSize: 10,
    color: "#374151",
  },
  cellTextBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
  },

  // Totals
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  totalsBlock: {
    width: 200,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  totalValue: {
    fontSize: 10,
    color: "#374151",
  },
  totalLabelBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
  },
  totalValueBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
  },
  balanceDueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    marginTop: 2,
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
  clientName: string;
  invoiceNumber: string;
}

function InvoiceDocument({ invoice, clientName, invoiceNumber }: InvoicePDFProps) {
  const items: InvoiceItem[] = (invoice.items as InvoiceItem[]) || [];

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const taxPercent = 0;
  const tax = subtotal * (taxPercent / 100);
  const total = subtotal + tax;
  const balanceDue = invoice.status === "paid" ? 0 : total;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}># {invoiceNumber}</Text>
            {invoice.description ? (
              <Text style={styles.invoiceDescription}>
                {invoice.description}
              </Text>
            ) : null}
          </View>
          <View style={styles.balanceDueBlock}>
            <Text style={styles.balanceDueAmount}>
              {formatCurrency(balanceDue)}
            </Text>
            <Text style={styles.balanceDueLabel}>Balance Due</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bill To / Ship To */}
        <View style={styles.addressRow}>
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>Bill To</Text>
            <Text style={styles.addressValue}>{clientName}</Text>
          </View>
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>Ship To</Text>
            <Text style={styles.addressValue}>—</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Meta */}
        <View style={styles.metaGrid}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>
              {formatDate(invoice.createdAt)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Payment Terms</Text>
            <Text style={styles.metaValue}>—</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text style={styles.metaValue}>
              {formatDate(invoice.dueDate)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>PO Number</Text>
            <Text style={styles.metaValue}>—</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Items Table */}
        <View style={styles.tableHeader}>
          <View style={styles.colItem}>
            <Text style={styles.tableHeaderText}>Item</Text>
          </View>
          <View style={styles.colQty}>
            <Text style={styles.tableHeaderText}>Quantity</Text>
          </View>
          <View style={styles.colRate}>
            <Text style={styles.tableHeaderText}>Rate</Text>
          </View>
          <View style={styles.colAmount}>
            <Text style={styles.tableHeaderText}>Amount</Text>
          </View>
        </View>

        {items.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <View style={styles.colItem}>
              <Text style={styles.cellText}>{item.description}</Text>
            </View>
            <View style={styles.colQty}>
              <Text style={styles.cellText}>{item.quantity}</Text>
            </View>
            <View style={styles.colRate}>
              <Text style={styles.cellText}>
                {formatCurrency(item.unitPrice)}
              </Text>
            </View>
            <View style={styles.colAmount}>
              <Text style={styles.cellTextBold}>
                {formatCurrency(item.quantity * item.unitPrice)}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.divider} />

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBlock}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({taxPercent}%)</Text>
              <Text style={styles.totalValue}>{formatCurrency(tax)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelBold}>Total</Text>
              <Text style={styles.totalValueBold}>{formatCurrency(total)}</Text>
            </View>
            <View style={styles.balanceDueRow}>
              <Text style={styles.totalLabelBold}>Balance Due</Text>
              <Text style={styles.totalValueBold}>
                {formatCurrency(balanceDue)}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function generateInvoicePDF(
  invoice: Invoice,
  clientName: string,
  invoiceNumber?: string
) {
  const number = invoiceNumber ?? invoice.id.slice(0, 8).toUpperCase();
  const element =( <InvoiceDocument
  invoice={invoice}
  clientName={clientName}
  invoiceNumber={number}
  />);
  const buffer = await renderToBuffer(element);
  return buffer;
}
