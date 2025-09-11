import nodemailer from "nodemailer";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
// From: always the noreply address for outbound system emails
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply.invoicebolt@gmail.com";
// Reply-to / contact: help inbox
const REPLY_TO = process.env.REPLY_TO || "help.invoicebolt@gmail.com";
const APP_ORIGIN = process.env.APP_ORIGIN || "https://invoicebolt.vercel.app";
const CHECKOUT_URL = process.env.CHECKOUT_URL || "https://invoicebolt.vercel.app";
const WHATSAPP_LINK = process.env.WHATSAPP_LINK || "https://wa.me/918830981744";
const WHATSAPP_DISPLAY = process.env.WHATSAPP_DISPLAY || "+91 88309 81744";

export function emailEnabled(): boolean {
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);
}

function createTransport() {
  if (!emailEnabled()) {
    throw new Error("SMTP not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL");
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

function preheader(text: string) {
  return `<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${text}</span>`;
}

function shell({ title, bodyHtml }: { title: string; bodyHtml: string }) {
  return `<!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>${title}</title>
    <style>
      body{margin:0;background:#f6f7fb;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827}
      .container{max-width:600px;margin:0 auto;background:#fff}
      .px{padding-left:24px;padding-right:24px}
      .py{padding-top:24px;padding-bottom:24px}
      .muted{color:#6b7280;font-size:14px}
      .divider{height:1px;background:#e5e7eb;margin:24px 0}
      .logo{display:inline-block;height:28px;width:28px;border-radius:8px;background:linear-gradient(135deg,#4f46e5,#7c3aed);text-align:center;line-height:28px;color:#fff;font-weight:700}
      .btn{display:inline-block;background:linear-gradient(135deg,#7C3AED,#4F46E5);color:#fff;text-decoration:none;padding:14px 22px;border-radius:12px;font-weight:600}
      .btn-green{background:#128C7E}
      .footer{font-size:12px;color:#6b7280}
      .pill{display:inline-block;background:#eef2ff;color:#4338ca;border-radius:999px;padding:4px 10px;font-size:12px}
      a{color:#4f46e5}
    </style>
  </head>
  <body>
    <table class="container" role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tr><td class="px py">
        <div>
          <span class="logo" aria-hidden="true">⚡</span>
          <span style="font-weight:700;margin-left:8px">InvoiceBolt</span>
        </div>
        ${bodyHtml}
        <div class="divider"></div>
        <p class="footer">© InvoiceBolt · <a href="${APP_ORIGIN}">invoicebolt.vercel.app</a><br/>
        Not tax advice · 7‑day refund policy</p>
      </td></tr>
    </table>
  </body>
  </html>`;
}

export async function sendReservationPaidEmail(to: string, params: { first_name?: string; order_id?: string; amount?: string; payment_method?: string; paid_at?: string; }) {
  const tFirst = params.first_name || "there";
  const subject = `Payment confirmed — your spot is reserved`;
  const html = [
    preheader(`Thanks ${tFirst} — your payment is confirmed. We’ll share access details when the app is live.`),
    shell({
      title: subject,
      bodyHtml: `
        <h1 style="margin:16px 0 8px;font-size:22px">Thanks, ${tFirst}! Your payment is confirmed</h1>
        <p class="muted" style="margin:0 0 16px">We’ve reserved your lifetime access. When the app is live, we’ll email setup instructions and your dashboard link.</p>
        <table role="presentation" style="width:100%;border-collapse:collapse">
          ${params.order_id ? `<tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb">Order</td><td style="text-align:right;border-bottom:1px solid #e5e7eb">${params.order_id}</td></tr>`: ''}
          ${params.amount ? `<tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb">Amount</td><td style="text-align:right;border-bottom:1px solid #e5e7eb">${params.amount}</td></tr>`: ''}
          ${params.payment_method ? `<tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb">Method</td><td style="text-align:right;border-bottom:1px solid #e5e7eb">${params.payment_method}</td></tr>`: ''}
          ${params.paid_at ? `<tr><td style="padding:8px 0">Paid at</td><td style="text-align:right">${params.paid_at}</td></tr>`: ''}
        </table>
        <div class="divider"></div>
        <p style="margin:0 0 10px"><a class="btn btn-green" href="${WHATSAPP_LINK}" role="button" aria-label="Chat on WhatsApp" style="display:inline-block;background:#25D366;color:#FFFFFF!important;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:700">Chat on WhatsApp</a></p>
        <p class="muted">Or reply to this email · ${REPLY_TO} · WhatsApp: ${WHATSAPP_DISPLAY}</p>
      `,
    })
  ].join("");

  const transporter = createTransport();
  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    replyTo: REPLY_TO,
    subject,
    html,
    text: `Thanks ${tFirst}! Your payment is confirmed. Order ${params.order_id || ''} Amount ${params.amount || ''}. We’ll share access details when the app is live. WhatsApp: ${WHATSAPP_DISPLAY} ${WHATSAPP_LINK}`,
    headers: { 'List-Unsubscribe': `mailto:${process.env.UNSUBSCRIBE_EMAIL || 'unsubscribe@invoicebolt.example'}?subject=unsubscribe` },
  });
}

export async function sendReservationUnpaidEmail(to: string, params: { first_name?: string; }) {
  const tFirst = params.first_name || "there";
  const subject = `You’re on the list — we’ll notify you when it’s live`;
  const html = [
    preheader(`Thanks ${tFirst} — your spot is reserved. We’ll email you as soon as InvoiceBolt is live.`),
    shell({
      title: subject,
      bodyHtml: `
        <h1 style="margin:16px 0 8px;font-size:22px">Thanks, ${tFirst}! Your spot is reserved</h1>
        <p class="muted" style="margin:0 0 16px">We’ll email you as soon as InvoiceBolt is live with your setup guide and early‑access details.</p>
        <p class="muted" style="margin:0 0 16px">If you intended to pay now, you can complete checkout anytime:</p>
        <p style="margin:12px 0 8px"><a class="btn" href="${CHECKOUT_URL}" role="button" aria-label="Go to checkout" style="display:inline-block;background:#7C3AED;color:#FFFFFF!important;text-decoration:none;padding:14px 22px;border-radius:12px;font-weight:700">Go to Checkout</a></p>
        <p style="margin:8px 0 0"><a class="btn btn-green" href="${WHATSAPP_LINK}" role="button" aria-label="Chat on WhatsApp" style="display:inline-block;background:#25D366;color:#FFFFFF!important;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:700">Chat on WhatsApp</a></p>
        <div class="divider"></div>
        <p class="muted">Questions? Reply to this email or write to ${REPLY_TO}. WhatsApp: ${WHATSAPP_DISPLAY}. 7‑day refund after purchase. Not tax advice.</p>
      `,
    })
  ].join("");

  const transporter = createTransport();
  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    replyTo: REPLY_TO,
    subject,
    html,
    text: `Thanks ${tFirst}! Your spot is reserved. We’ll notify you when InvoiceBolt is live. Checkout: ${CHECKOUT_URL}. WhatsApp: ${WHATSAPP_DISPLAY} ${WHATSAPP_LINK}`,
    headers: { 'List-Unsubscribe': `mailto:${process.env.UNSUBSCRIBE_EMAIL || 'unsubscribe@invoicebolt.example'}?subject=unsubscribe` },
  });
}

export async function sendGstTemplateEmail(to: string, params: { first_name?: string }) {
  const tFirst = params.first_name || "there";
  const subject = `Your GST Invoice Template — Ready to use`;
  const htmlTemplateAttachment = `<!doctype html>
  <html><head><meta charset=\"utf-8\"><title>GST Invoice Template</title>
  <style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827}
  .wrap{max-width:820px;margin:24px auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px}
  h1{margin:0 0 12px;font-size:22px}
  h2{margin:20px 0 8px;font-size:16px}
  table{width:100%;border-collapse:collapse}
  th,td{border:1px solid #e5e7eb;padding:10px;text-align:left;font-size:14px}
  .muted{color:#6b7280}
  .right{text-align:right}
  .totals td{font-weight:700}
  .note{font-size:12px;color:#6b7280;margin-top:12px}
  .header{display:flex;justify-content:space-between;gap:16px}
  </style></head>
  <body>
    <div class=\"wrap\">
      <h1>GST INVOICE</h1>
      <div class=\"header\">
        <div>
          <h2>Supplier (Your Business)</h2>
          <div><span class=\"muted\">Name:</span> <strong>Your Business Name</strong></div>
          <div><span class=\"muted\">Address:</span> Street, City, State, PIN</div>
          <div><span class=\"muted\">GSTIN:</span> 22AAAAA0000A1Z5</div>
          <div><span class=\"muted\">PAN:</span> ABCDE1234F</div>
        </div>
        <div>
          <h2>Recipient (Bill To)</h2>
          <div><span class=\"muted\">Name:</span> <strong>Client Company</strong></div>
          <div><span class=\"muted\">Address:</span> Street, City, State, PIN</div>
          <div><span class=\"muted\">GSTIN:</span> 27AAAAA0000A1Z5</div>
        </div>
      </div>

      <div class=\"header\" style=\"margin-top:12px\">
        <div><span class=\"muted\">Invoice No.</span><div><strong>INV-0001</strong></div></div>
        <div><span class=\"muted\">Invoice Date</span><div><strong>DD/MM/YYYY</strong></div></div>
        <div><span class=\"muted\">Place of Supply</span><div><strong>Maharashtra</strong></div></div>
        <div><span class=\"muted\">Due Date</span><div><strong>DD/MM/YYYY</strong></div></div>
      </div>

      <h2 style=\"margin-top:16px\">Line Items</h2>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class=\"right\">HSN/SAC</th>
            <th class=\"right\">Qty</th>
            <th class=\"right\">Rate</th>
            <th class=\"right\">Discount</th>
            <th class=\"right\">Taxable Value</th>
            <th class=\"right\">CGST %</th>
            <th class=\"right\">CGST Amt</th>
            <th class=\"right\">SGST %</th>
            <th class=\"right\">SGST Amt</th>
            <th class=\"right\">IGST %</th>
            <th class=\"right\">IGST Amt</th>
            <th class=\"right\">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Professional Services</td>
            <td class=\"right\">998313</td>
            <td class=\"right\">1</td>
            <td class=\"right\">₹999.00</td>
            <td class=\"right\">₹0.00</td>
            <td class=\"right\">₹999.00</td>
            <td class=\"right\">9%</td>
            <td class=\"right\">₹89.91</td>
            <td class=\"right\">9%</td>
            <td class=\"right\">₹89.91</td>
            <td class=\"right\">0%</td>
            <td class=\"right\">₹0.00</td>
            <td class=\"right\">₹1,178.82</td>
          </tr>
        </tbody>
      </table>

      <div style=\"display:flex;justify-content:flex-end;margin-top:12px\">
        <table style=\"width:auto\">
          <tbody>
            <tr><td>Sub‑total</td><td class=\"right\">₹999.00</td></tr>
            <tr><td>CGST (9%)</td><td class=\"right\">₹89.91</td></tr>
            <tr><td>SGST (9%)</td><td class=\"right\">₹89.91</td></tr>
            <tr class=\"totals\"><td>Grand Total</td><td class=\"right\">₹1,178.82</td></tr>
            <tr><td>Amount in words</td><td class=\"right\">One Thousand One Hundred Seventy Eight and Eighty Two Paise Only</td></tr>
          </tbody>
        </table>
      </div>

      <h2>Bank / UPI Details</h2>
      <div><span class=\"muted\">UPI ID:</span> yourname@upi</div>
      <div><span class=\"muted\">Account:</span> Bank Name, A/C 0000 0000 0000</div>
      <div><span class=\"muted\">IFSC:</span> BANK000000</div>

      <h2>Declaration</h2>
      <div class=\"note\">We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.</div>

      <div style=\"margin-top:16px;font-size:12px\" class=\"muted\">Signature (Authorised Signatory)</div>
    </div>
  </body></html>`;

  const csvAttachment = [
    [
      'Description','HSN/SAC','Quantity','Rate','Discount','Taxable Value','CGST %','CGST Amount','SGST %','SGST Amount','IGST %','IGST Amount','Total'
    ].join(','),
    [
      'Professional Services','998313','1','999','0','999','9','89.91','9','89.91','0','0','1178.82'
    ].join(','),
    [
      'Additional Line (optional)','9983','1','0','0','0','0','0','0','0','0','0','0'
    ].join(',')
  ].join('\n');

  const bodyHtml = `
    <h1 style=\"margin:16px 0 8px;font-size:22px\">Here’s your GST Invoice Template</h1>
    <p class=\"muted\" style=\"margin:0 0 16px\">Hi ${tFirst}, we’ve attached a professional, GST‑compliant invoice template (Word‑compatible) and a structured CSV you can import into Excel/Sheets. Duplicate and edit the highlighted fields to create invoices in minutes.</p>
    <ul class=\"muted\" style=\"margin:0 0 16px;padding-left:18px\">
      <li><strong>Attachment 1:</strong> GST‑Invoice‑Template.doc — open in Word/Google Docs, export to PDF</li>
      <li><strong>Attachment 2:</strong> GST‑Line‑Items.csv — item table with GST columns, ready to import</li>
    </ul>
    <p class=\"muted\" style=\"margin:0 0 16px\">When we go live, you’ll connect WhatsApp/Gmail and we’ll auto‑capture client details, generate GST invoices, and share payment links instantly.</p>
    <p style=\"margin:0 0 14px\"><a class=\"btn\" href=\"${CHECKOUT_URL}\" role=\"button\" aria-label=\"Automate invoices from chats\">Automate invoices from chats</a></p>
    <p style=\"margin:0 0 8px\"><a class=\"btn\" href=\"${WHATSAPP_LINK}\" role=\"button\" aria-label=\"Chat on WhatsApp\" style=\"background:#25D366\">Chat on WhatsApp</a></p>
  `;
  async function createPdfTemplate(): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const margin = 40;
    const purple = rgb(0.31, 0.27, 0.90);
    page.drawRectangle({ x: 0, y: 780, width, height: 40, color: purple, opacity: 0.9 });
    page.drawText('GST INVOICE', { x: margin, y: 791, size: 16, font: fontBold, color: rgb(1,1,1) });
    page.drawText('Supplier (Your Business)', { x: margin, y: 740, size: 12, font: fontBold });
    page.drawText('Your Business Name', { x: margin, y: 725, size: 11, font });
    page.drawText('GSTIN: 22AAAAA0000A1Z5  |  PAN: ABCDE1234F', { x: margin, y: 710, size: 10, font, color: rgb(0.3,0.3,0.3) });
    page.drawText('Recipient (Bill To)', { x: width/2, y: 740, size: 12, font: fontBold });
    page.drawText('Client Company', { x: width/2, y: 725, size: 11, font });
    page.drawText('GSTIN: 27AAAAA0000A1Z5', { x: width/2, y: 710, size: 10, font, color: rgb(0.3,0.3,0.3) });
    page.drawText('Invoice No.: INV-0001', { x: margin, y: 680, size: 10, font });
    page.drawText('Invoice Date: DD/MM/YYYY', { x: margin + 180, y: 680, size: 10, font });
    page.drawText('Place of Supply: Maharashtra', { x: margin + 380, y: 680, size: 10, font });
    const tableTop = 650;
    const cols = [margin, 250, 320, 380, 440, 500];
    const headers = ['Description', 'HSN/SAC', 'Qty', 'Rate', 'Taxable', 'Total'];
    for (let i = 0; i < headers.length; i++) {
      page.drawText(headers[i], { x: cols[i], y: tableTop, size: 10, font: fontBold });
    }
    page.drawLine({ start: { x: margin, y: tableTop - 5 }, end: { x: width - margin, y: tableTop - 5 }, thickness: 1, color: rgb(0.85,0.85,0.88)});
    const rowY = tableTop - 22;
    const cells = ['Professional Services', '998313', '1', 'INR 999.00', 'INR 999.00', 'INR 1,178.82'];
    for (let i = 0; i < cells.length; i++) {
      page.drawText(cells[i], { x: cols[i], y: rowY, size: 10, font });
    }
    page.drawText('CGST (9%): INR 89.91', { x: width - 220, y: rowY - 30, size: 10, font });
    page.drawText('SGST (9%): INR 89.91', { x: width - 220, y: rowY - 45, size: 10, font });
    page.drawText('Grand Total: INR 1,178.82', { x: width - 220, y: rowY - 65, size: 12, font: fontBold });
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  let pdfBuffer: Buffer | undefined;
  try {
    pdfBuffer = await createPdfTemplate();
  } catch (e) {
    console.warn('PDF generation error (continuing without PDF):', e);
  }

  const transporter = createTransport();
  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    replyTo: REPLY_TO,
    subject,
    html: shell({ title: subject, bodyHtml }),
    text: `Hi ${tFirst}, your GST invoice template is attached. Open the DOC in Word/Docs, export to PDF, or import the CSV into Excel/Sheets.`,
    attachments: [
      { filename: 'GST-Invoice-Template.doc', content: htmlTemplateAttachment, contentType: 'application/msword' },
      { filename: 'GST-Line-Items.csv', content: csvAttachment, contentType: 'text/csv; charset=utf-8' },
      ...(pdfBuffer ? [{ filename: 'GST-Invoice-Template.pdf', content: pdfBuffer, contentType: 'application/pdf' } as const] : []),
    ],
  });
}


