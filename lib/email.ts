// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export async function sendInvoiceEmail({
//   to,
//   pdfBytes,
// }: {
//   to: string;
//   pdfBytes: Uint8Array;
// }) {
//   try{

//     await resend.emails.send({
//       from: "onboarding@resend.dev",
//       to,
//       subject: "Your Invoice",
//       text: "Please find your invoice attached.",
//       attachments: [
//         {
//           filename: "invoice.pdf",
//           content: Buffer.from(pdfBytes),
//         },
//       ],
//     });
//     return{success:true}
//   } catch(error){
//     return {success:false}
//   }
// }
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendInvoiceEmailOptions {
  to: string;
  pdfBytes: Uint8Array;
  clientName: string;
  invoiceNumber: string;
  amount: number;        // in cents
  dueDate?: string | null;
  companyName?: string;
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(date: string | null | undefined) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildEmailHtml({
  clientName,
  invoiceNumber,
  amount,
  dueDate,
  companyName,
}: Omit<SendInvoiceEmailOptions, "to" | "pdfBytes">) {
  const formattedAmount = formatCurrency(amount);
  const formattedDueDate = formatDate(dueDate);
  const sender = companyName ?? "Us";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Invoice #${invoiceNumber}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header bar -->
          <tr>
            <td style="background-color:#18181b;padding:32px 40px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                ${sender}
              </p>
              <p style="margin:6px 0 0;font-size:13px;color:#a1a1aa;">Invoice #${invoiceNumber}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 24px;">
              <p style="margin:0 0 6px;font-size:15px;color:#3f3f46;">Hi <strong>${clientName}</strong>,</p>
              <p style="margin:0 0 28px;font-size:15px;color:#71717a;line-height:1.6;">
                Please find your invoice attached to this email. Here's a summary of what's due:
              </p>

              <!-- Invoice card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background-color:#fafafa;border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e4e4e7;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin:0;font-size:11px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.8px;">Invoice Number</p>
                          <p style="margin:4px 0 0;font-size:15px;color:#18181b;font-weight:600;">#${invoiceNumber}</p>
                        </td>
                        <td align="right">
                          <p style="margin:0;font-size:11px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.8px;">Amount Due</p>
                          <p style="margin:4px 0 0;font-size:22px;color:#18181b;font-weight:700;">${formattedAmount}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${formattedDueDate ? `
                <tr>
                  <td style="padding:16px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin:0;font-size:11px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.8px;">Due Date</p>
                          <p style="margin:4px 0 0;font-size:14px;color:#18181b;">${formattedDueDate}</p>
                        </td>
                        <td align="right">
                          <span style="display:inline-block;background-color:#fef9c3;color:#854d0e;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;letter-spacing:0.3px;">
                            Payment Pending
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>` : ""}
              </table>

              <p style="margin:0 0 6px;font-size:14px;color:#71717a;line-height:1.6;">
                The full invoice is attached as a PDF. If you have any questions about this invoice, feel free to reply to this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid #f4f4f5;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                This is an automated email from ${sender}. Please do not reply unless you have a question about this invoice.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendInvoiceEmail({
  to,
  pdfBytes,
  clientName,
  invoiceNumber,
  amount,
  dueDate,
  companyName,
}: SendInvoiceEmailOptions) {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject: `Invoice #${invoiceNumber} from ${companyName ?? "Us"} — ${formatCurrency(amount)} due`,
      html: buildEmailHtml({ clientName, invoiceNumber, amount, dueDate, companyName }),
      text: `Hi ${clientName},\n\nPlease find your invoice #${invoiceNumber} attached.\n\nAmount due: ${formatCurrency(amount)}${dueDate ? `\nDue date: ${formatDate(dueDate)}` : ""}\n\nIf you have any questions, reply to this email.\n\n${companyName ?? ""}`,
      attachments: [
        {
          filename: `invoice-${invoiceNumber}.pdf`,
          content: Buffer.from(pdfBytes),
        },
      ],
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send invoice email:", error);
    return { success: false, error };
  }
}