import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { InvoiceItem } from "@/db/schema";

export interface ReceiptData {
  // Platform
  platformName: string;
  platformEmail: string;
  // Payment proof
  stripeSessionId: string;
  stripePaymentIntentId: string;
  paidAt: Date;
  // Invoice
  invoiceId: string;
  invoiceNumber: string;
  description?: string | null;
  items: InvoiceItem[];
  amountCents: number;
  // Parties
  clientName: string;
  clientEmail: string;
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDateTime(date: Date) {
  return (
    new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(date) + " UTC"
  );
}

function shortRef(id: string) {
  return id.slice(0, 8).toUpperCase();
}

const c = {
  black: "#0f0f0d",
  green: "#16a34a",
  greenLight: "#f0fdf4",
  greenBorder: "#bbf7d0",
  gray: "#78716c",
  grayLight: "#f5f4f0",
  border: "#e8e6e0",
  white: "#ffffff",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: c.black,
    backgroundColor: c.white,
    paddingHorizontal: 48,
    paddingVertical: 48,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  platformName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: c.black,
  },
  platformEmail: { fontSize: 8, color: c.gray, marginTop: 3 },
  stamp: {
    backgroundColor: c.greenLight,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: c.greenBorder,
    alignItems: "center",
  },
  stampLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: c.green,
    letterSpacing: 2,
  },
  stampAmount: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: c.green,
    marginTop: 2,
  },
  // Title
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: c.black,
    letterSpacing: -0.5,
    marginBottom: 3,
  },
  titleSub: { fontSize: 9, color: c.gray },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    marginVertical: 16,
  },
  // Proof block
  proofBox: {
    backgroundColor: c.grayLight,
    borderRadius: 6,
    padding: 14,
    marginBottom: 20,
  },
  proofBoxTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: c.gray,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  proofRow: { flexDirection: "row", marginBottom: 6 },
  proofLabel: { fontSize: 8, color: c.gray, width: 130, flexShrink: 0 },
  proofValue: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: c.black,
    flex: 1,
  },
  proofValueGreen: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: c.green,
    flex: 1,
  },
  // Parties
  partiesRow: { flexDirection: "row", gap: 16, marginBottom: 20 },
  partyBlock: { flex: 1 },
  partyLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: c.gray,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 5,
  },
  partyName: { fontSize: 10, fontFamily: "Helvetica-Bold", color: c.black },
  partyEmail: { fontSize: 8, color: c.gray, marginTop: 2 },
  // Table
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    paddingBottom: 6,
    marginBottom: 2,
  },
  thText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: c.gray,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: c.grayLight,
    paddingVertical: 7,
  },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colRate: { flex: 1.2, textAlign: "right" },
  colAmt: { flex: 1.2, textAlign: "right" },
  cell: { fontSize: 9, color: c.black },
  cellMuted: { fontSize: 9, color: c.gray },
  cellBold: { fontSize: 9, fontFamily: "Helvetica-Bold", color: c.black },
  // Totals
  totalsWrap: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  totalsBlock: { width: 190 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalLabel: { fontSize: 9, color: c.gray },
  totalValue: { fontSize: 9, color: c.black },
  totalLabelBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: c.black,
  },
  totalValueBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: c.green,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7, color: c.gray },
  footerRef: { fontSize: 7, color: c.gray, fontFamily: "Helvetica-Oblique" },
});

function ReceiptDocument({ data }: { data: ReceiptData }) {
  const items: InvoiceItem[] = data.items ?? [];
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice * 100,
    0
  );

  return (
    <Document
      title={`Receipt — Invoice #${data.invoiceNumber}`}
      author={data.platformName}
      subject="Payment Receipt"
    >
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.platformName}>{data.platformName}</Text>
            <Text style={s.platformEmail}>{data.platformEmail}</Text>
          </View>
          <View style={s.stamp}>
            <Text style={s.stampLabel}>PAID</Text>
            <Text style={s.stampAmount}>{formatCurrency(data.amountCents)}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={s.title}>Payment Receipt</Text>
        <Text style={s.titleSub}>
          Invoice #{data.invoiceNumber}
          {data.description ? `  ·  ${data.description}` : ""}
        </Text>

        <View style={s.divider} />

        {/* Proof of Payment */}
        <View style={s.proofBox}>
          <Text style={s.proofBoxTitle}>Proof of Payment</Text>

          <View style={s.proofRow}>
            <Text style={s.proofLabel}>Payment Reference</Text>
            <Text style={s.proofValue}>{data.stripePaymentIntentId}</Text>
          </View>
          <View style={s.proofRow}>
            <Text style={s.proofLabel}>Checkout Session</Text>
            <Text style={s.proofValue}>{data.stripeSessionId}</Text>
          </View>
          <View style={s.proofRow}>
            <Text style={s.proofLabel}>Invoice ID</Text>
            <Text style={s.proofValue}>{data.invoiceId}</Text>
          </View>
          <View style={s.proofRow}>
            <Text style={s.proofLabel}>Payment Date</Text>
            <Text style={s.proofValue}>{formatDateTime(data.paidAt)}</Text>
          </View>
          <View style={{ ...s.proofRow, marginBottom: 0 }}>
            <Text style={s.proofLabel}>Status</Text>
            <Text style={s.proofValueGreen}>PAYMENT SUCCESSFUL</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={s.partiesRow}>
          <View style={s.partyBlock}>
            <Text style={s.partyLabel}>Issued By</Text>
            <Text style={s.partyName}>{data.platformName}</Text>
            <Text style={s.partyEmail}>{data.platformEmail}</Text>
          </View>
          <View style={s.partyBlock}>
            <Text style={s.partyLabel}>Paid By</Text>
            <Text style={s.partyName}>{data.clientName}</Text>
            <Text style={s.partyEmail}>{data.clientEmail}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Line Items */}
        <View style={s.tableHeader}>
          <View style={s.colDesc}><Text style={s.thText}>Item</Text></View>
          <View style={s.colQty}><Text style={s.thText}>Qty</Text></View>
          <View style={s.colRate}><Text style={s.thText}>Rate</Text></View>
          <View style={s.colAmt}><Text style={s.thText}>Amount</Text></View>
        </View>

        {items.length > 0 ? (
          items.map((item, i) => (
            <View key={i} style={s.tableRow}>
              <View style={s.colDesc}>
                <Text style={s.cell}>{item.description}</Text>
              </View>
              <View style={s.colQty}>
                <Text style={s.cellMuted}>{item.quantity}</Text>
              </View>
              <View style={s.colRate}>
                <Text style={s.cellMuted}>
                  {formatCurrency(item.unitPrice * 100)}
                </Text>
              </View>
              <View style={s.colAmt}>
                <Text style={s.cellBold}>
                  {formatCurrency(item.quantity * item.unitPrice * 100)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          // Fallback if no items — show a single line with the total
          <View style={s.tableRow}>
            <View style={s.colDesc}>
              <Text style={s.cell}>
                {data.description || `Invoice #${data.invoiceNumber}`}
              </Text>
            </View>
            <View style={s.colQty}>
              <Text style={s.cellMuted}>1</Text>
            </View>
            <View style={s.colRate}>
              <Text style={s.cellMuted}>{formatCurrency(data.amountCents)}</Text>
            </View>
            <View style={s.colAmt}>
              <Text style={s.cellBold}>{formatCurrency(data.amountCents)}</Text>
            </View>
          </View>
        )}

        {/* Totals */}
        <View style={s.totalsWrap}>
          <View style={s.totalsBlock}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Subtotal</Text>
              <Text style={s.totalValue}>
                {items.length > 0
                  ? formatCurrency(subtotal)
                  : formatCurrency(data.amountCents)}
              </Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Tax (0%)</Text>
              <Text style={s.totalValue}>$0.00</Text>
            </View>
            <View style={s.divider} />
            <View style={s.totalRow}>
              <Text style={s.totalLabelBold}>Total Paid</Text>
              <Text style={s.totalValueBold}>
                {formatCurrency(data.amountCents)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            {data.platformName} · {data.platformEmail}
          </Text>
          <Text style={s.footerRef}>
            ref: {shortRef(data.stripePaymentIntentId)}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateReceiptPDF(data: ReceiptData): Promise<Buffer> {
  const element = (<ReceiptDocument data={data} />  );
  return await renderToBuffer(element);
}