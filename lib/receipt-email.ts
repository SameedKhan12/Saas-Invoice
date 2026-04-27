import { Resend } from "resend";
import { ReceiptData } from "@/lib/receipt-pdf";

const resend = new Resend(process.env.RESEND_API_KEY);

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

function buildReceiptEmailHtml(data: ReceiptData): string {
  const shortRef = data.stripePaymentIntentId.slice(0, 16) + "...";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Payment Receipt</title>
</head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0"
        style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.07);">

        <!-- Top green bar -->
        <tr>
          <td style="background:#16a34a;padding:28px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                    ${data.platformName}
                  </p>
                  <p style="margin:4px 0 0;font-size:12px;color:#bbf7d0;">
                    Payment Receipt
                  </p>
                </td>
                <td align="right">
                  <p style="margin:0;font-size:11px;color:#bbf7d0;text-transform:uppercase;letter-spacing:1px;">
                    Amount Paid
                  </p>
                  <p style="margin:4px 0 0;font-size:26px;font-weight:700;color:#ffffff;">
                    ${formatCurrency(data.amountCents)}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 40px 8px;">
            <p style="margin:0 0 4px;font-size:15px;color:#1a1a14;">
              Hi <strong>${data.clientName}</strong>,
            </p>
            <p style="margin:0 0 28px;font-size:14px;color:#78716c;line-height:1.6;">
              Your payment was successful. This email is your official receipt —
              please save it for your records. The PDF receipt is attached.
            </p>

            <!-- Proof of payment card -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f5f4f0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
              <tr>
                <td style="padding:14px 20px;border-bottom:2px solid #e8e6e0;">
                  <p style="margin:0;font-size:9px;font-weight:700;color:#78716c;
                     text-transform:uppercase;letter-spacing:1.2px;">
                    Proof of Payment
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${proofRow("Payment Reference", data.stripePaymentIntentId)}
                    ${proofRow("Checkout Session", data.stripeSessionId)}
                    ${proofRow("Invoice ID", data.invoiceId)}
                    ${proofRow("Invoice #", `#${data.invoiceNumber}`)}
                    ${proofRow("Payment Date", formatDateTime(data.paidAt))}
                    ${proofRowGreen("Status", "PAYMENT SUCCESSFUL")}
                  </table>
                </td>
              </tr>
            </table>

            <!-- Invoice items table -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="border:1px solid #e8e6e0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
              <!-- Table header -->
              <tr style="background:#f5f4f0;">
                <td style="padding:10px 16px;font-size:9px;font-weight:700;
                   color:#78716c;text-transform:uppercase;letter-spacing:0.8px;
                   border-bottom:1px solid #e8e6e0;">Item</td>
                <td style="padding:10px 16px;font-size:9px;font-weight:700;
                   color:#78716c;text-transform:uppercase;letter-spacing:0.8px;
                   border-bottom:1px solid #e8e6e0;text-align:center;">Qty</td>
                <td style="padding:10px 16px;font-size:9px;font-weight:700;
                   color:#78716c;text-transform:uppercase;letter-spacing:0.8px;
                   border-bottom:1px solid #e8e6e0;text-align:right;">Amount</td>
              </tr>
              ${
                data.items && data.items.length > 0
                  ? data.items
                      .map(
                        (item, i) => `
                <tr style="background:${i % 2 === 0 ? "#ffffff" : "#fafaf8"}">
                  <td style="padding:10px 16px;font-size:13px;color:#1a1a14;
                     border-bottom:1px solid #f0ede8;">${item.description}</td>
                  <td style="padding:10px 16px;font-size:13px;color:#78716c;
                     border-bottom:1px solid #f0ede8;text-align:center;">${item.quantity}</td>
                  <td style="padding:10px 16px;font-size:13px;font-weight:600;
                     color:#1a1a14;border-bottom:1px solid #f0ede8;text-align:right;">
                    ${formatCurrency(item.quantity * item.unitPrice * 100)}
                  </td>
                </tr>`
                      )
                      .join("")
                  : `<tr>
                <td style="padding:10px 16px;font-size:13px;color:#1a1a14;">
                  ${data.description || `Invoice #${data.invoiceNumber}`}
                </td>
                <td style="padding:10px 16px;font-size:13px;color:#78716c;text-align:center;">1</td>
                <td style="padding:10px 16px;font-size:13px;font-weight:600;
                   color:#1a1a14;text-align:right;">${formatCurrency(data.amountCents)}</td>
              </tr>`
              }
              <!-- Total row -->
              <tr style="background:#f5f4f0;">
                <td colspan="2" style="padding:12px 16px;font-size:13px;
                   font-weight:700;color:#1a1a14;text-align:right;">
                  Total Paid
                </td>
                <td style="padding:12px 16px;font-size:14px;font-weight:700;
                   color:#16a34a;text-align:right;">
                  ${formatCurrency(data.amountCents)}
                </td>
              </tr>
            </table>

            <p style="margin:0 0 28px;font-size:13px;color:#78716c;line-height:1.6;">
              Questions about this payment? Reply to this email or contact us at
              <a href="mailto:${data.platformEmail}"
                 style="color:#16a34a;text-decoration:none;">
                ${data.platformEmail}
              </a>.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 28px;border-top:1px solid #f0ede8;">
            <p style="margin:0;font-size:11px;color:#a8a29e;line-height:1.6;">
              ${data.platformName} · ${data.platformEmail}<br/>
              Payment reference: ${shortRef}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function proofRow(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:4px 0;font-size:11px;color:#78716c;width:140px;vertical-align:top;">
      ${label}
    </td>
    <td style="padding:4px 0;font-size:11px;font-weight:600;color:#1a1a14;
       word-break:break-all;">
      ${value}
    </td>
  </tr>`;
}

function proofRowGreen(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:4px 0;font-size:11px;color:#78716c;width:140px;">
      ${label}
    </td>
    <td style="padding:4px 0;font-size:11px;font-weight:700;color:#16a34a;">
      ${value}
    </td>
  </tr>`;
}

export async function sendReceiptEmail(
  data: ReceiptData,
  receiptPdfBuffer: Buffer
): Promise<{ success: boolean; error?: unknown }> {
  try {
    await resend.emails.send({
      from: `${data.platformName} <onboarding@resend.dev>`,
      to: "eedsam0@gmail.com",
      subject: `Payment Receipt — ${formatCurrency(data.amountCents)} · Invoice #${data.invoiceNumber}`,
      html: buildReceiptEmailHtml(data),
      text: `
Hi ${data.clientName},

Your payment of ${formatCurrency(data.amountCents)} was successful.

PROOF OF PAYMENT
Payment Reference: ${data.stripePaymentIntentId}
Checkout Session:  ${data.stripeSessionId}
Invoice ID:        ${data.invoiceId}
Invoice #:         ${data.invoiceNumber}
Payment Date:      ${formatDateTime(data.paidAt)}
Status:            PAYMENT SUCCESSFUL

The full receipt is attached as a PDF.

Questions? Contact us at ${data.platformEmail}.

${data.platformName}
      `.trim(),
      attachments: [
        {
          filename: `receipt-${data.invoiceNumber}.pdf`,
          content: receiptPdfBuffer,
        },
      ],
    });

    return { success: true };
  }  catch (error) {
  console.error("Resend error full:", JSON.stringify(error, null, 2));
  // Also log the message if it's an Error instance
  if (error instanceof Error) {
    console.error("Resend error message:", error.message);
  }
  return { success: false, error };
}
}