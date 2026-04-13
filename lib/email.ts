import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail({
  to,
  pdfBytes,
}: {
  to: string;
  pdfBytes: Uint8Array;
}) {
  try{

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject: "Your Invoice",
      text: "Please find your invoice attached.",
      attachments: [
        {
          filename: "invoice.pdf",
          content: Buffer.from(pdfBytes),
        },
      ],
    });
    return{success:true}
  } catch(error){
    return {success:false}
  }
}