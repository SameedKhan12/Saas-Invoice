import { Invoice } from "@/db/schema";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateInvoicePDF(invoice: Invoice, clientName: string) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();

  page.drawText("INVOICE", {
    x: 50,
    y: height - 50,
    size: 20,
    font,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Client: ${clientName}`, {
    x: 50,
    y: height - 100,
    size: 12,
    font,
  });

  page.drawText(`Amount: $${(invoice.amount_cents/10000).toFixed(2)}`, {
    x: 50,
    y: height - 130,
    size: 12,
    font,
  });

  page.drawText(`Status: ${invoice.status}`, {
    x: 50,
    y: height - 160,
    size: 12,
    font,
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}