import nodemailer from "nodemailer";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
// keep PDF rendering self-contained for serverless bundle

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
      'Description','HSN/SAC','Quantity','Rate','Discount','Taxable Value',
      'CGST %','CGST Amount','SGST %','SGST Amount','IGST %','IGST Amount','Total',
      'Place of Supply','Invoice No','Invoice Date','Due Date','Buyer GSTIN','Seller GSTIN'
    ].join(','),
    [
      'Professional Services','998313','1','999','0','999','9','89.91','9','89.91','0','0','1178.82',
      'Maharashtra','INV-0001','2025-01-15','2025-01-30','27AAAAA0000A1Z5','22AAAAA0000A1Z5'
    ].join(',')
  ].join('\n');

  const bodyHtml = `
    <h1 style=\"margin:16px 0 8px;font-size:22px\">Here’s your GST Invoice Template</h1>
    <p class=\"muted\" style=\"margin:0 0 16px\">Hi ${tFirst}, we’ve attached two files you can use right away to create professional invoices that match the preview on our site.</p>
    <ul class=\"muted\" style=\"margin:0 0 16px;padding-left:18px\">
      <li><strong>GST‑Invoice‑Template.pdf</strong> — clean A4 template styled like our preview</li>
      <li><strong>GST‑Line‑Items.csv</strong> — professional columns: HSN/SAC, Qty, Rate, taxes, totals, GSTINs</li>
    </ul>
    <p class=\"muted\" style=\"margin:0 0 16px\">When we launch, you’ll connect WhatsApp/Gmail. We’ll auto‑capture client details from chats, generate a GST invoice in this style, and share a UPI payment link instantly. You’ll also get proper numbering, tax breakdowns, and receipts.</p>
    <p style=\"margin:0 0 14px\"><a class=\"btn\" href=\"${CHECKOUT_URL}\" role=\"button\" aria-label=\"Automate invoices from chats\" style=\"color:#ffffff\">Automate invoices from chats</a></p>
    <p style=\"margin:0 0 8px\"><a class=\"btn\" href=\"${WHATSAPP_LINK}\" role=\"button\" aria-label=\"Chat on WhatsApp\" style=\"background:#25D366;color:#ffffff\">Chat on WhatsApp</a></p>
  `;
  function buildInvoiceHTMLFromSpec(vars: Record<string,string>): string {
    const tpl = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Invoice — {{invoice_number}}</title>
<style>
  :root{--brand:#6B46C1;--muted:#6b7280;--bg:#ffffff;--panel:#f8fafc;--border:#e6e7eb;--text:#111827}
  html,body{height:100%;margin:0;background:#f3f4f6;font-family:Inter,system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:var(--text);-webkit-font-smoothing:antialiased}
  .page{max-width:800px;margin:30px auto;padding:32px;background:var(--bg);box-shadow:0 8px 30px rgba(15,23,42,0.06);border-radius:10px}
  .row{display:flex;gap:24px;align-items:flex-start}
  .col{flex:1}
  .right{text-align:right}
  h1,h2,h3{margin:0;padding:0}
  h1{font-size:20px;color:var(--brand);letter-spacing:0.2px}
  .meta{font-size:13px;color:var(--muted)}
  .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
  .brand{display:flex;align-items:center;gap:12px}
  .logo{display:inline-flex;align-items:center;gap:10px}
  .mark{width:40px;height:40px;border-radius:8px;background:linear-gradient(135deg,#7c3aed,#5b21b6);display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:20px;box-shadow:0 6px 18px rgba(107,70,193,0.16)}
  .brand-name{font-weight:700;font-size:18px}
  .invoice-box{background:var(--panel);padding:14px;border-radius:8px;border:1px solid var(--border);min-width:240px}
  .invoice-title{font-weight:700;color:#111827;margin-bottom:6px}
  .meta-item{font-size:13px;color:var(--muted);line-height:1.5}
  .addresses{display:flex;gap:24px;margin:22px 0 12px;flex-wrap:wrap}
  .panel{background:#fff;border:1px solid var(--border);padding:14px;border-radius:8px;min-width:220px;box-shadow:0 6px 18px rgba(15,23,42,0.03)}
  .panel .label{font-size:12px;color:var(--muted);margin-bottom:6px}
  .panel .value{font-weight:600}
  table{width:100%;border-collapse:collapse;margin-top:18px}
  th, td{padding:12px 14px;border-bottom:1px solid #eef2f7;font-size:14px;text-align:left}
  th{background:transparent;color:var(--muted);font-weight:600;font-size:13px}
  td.right{text-align:right}
  .summary{max-width:320px;margin-left:auto;margin-top:18px}
  .summary-row{display:flex;justify-content:space-between;padding:8px 12px}
  .summary-row.total{font-size:18px;color:var(--brand);font-weight:800}
  .payment{display:flex;gap:18px;align-items:center;margin-top:22px;flex-wrap:wrap}
  .qr{width:160px;height:160px;border-radius:8px;background:#fff;border:1px solid var(--border);display:flex;align-items:center;justify-content:center}
  .pay-info{flex:1}
  .pay-cta{display:inline-block;background:var(--brand);color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;font-weight:700}
  .muted-note{font-size:12px;color:var(--muted);margin-top:8px}
</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="brand">
        <div class="logo"><div class="mark">⚡</div><div><div class="brand-name">InvoiceBolt</div><div class="meta">GST-ready invoices · Instant UPI payments</div></div></div>
      </div>
      <div class="invoice-box right">
        <div class="invoice-title">INVOICE</div>
        <div class="meta-item"># {{invoice_number}}</div>
        <div style="height:6px"></div>
        <div class="meta-item"><strong>Date:</strong> {{invoice_date}}</div>
        <div class="meta-item"><strong>Due:</strong> {{due_date}}</div>
        <div style="height:6px"></div>
        <div class="meta-item"><strong>GSTIN:</strong> {{seller_gstin}}</div>
      </div>
    </div>
    <div class="addresses">
      <div class="panel col">
        <div class="label">BILL TO</div>
        <div class="value">{{client_name}}</div>
        <div class="meta">{{client_address_line1}}</div>
        <div class="meta">{{client_address_line2}}</div>
        <div class="meta">{{client_city}} — {{client_postcode}}</div>
      </div>
      <div class="panel col">
        <div class="label">FROM</div>
        <div class="value">{{seller_name}}</div>
        <div class="meta">GSTIN: {{seller_gstin}}</div>
        <div class="meta">{{seller_address_line1}}</div>
        <div class="meta">{{seller_address_line2}}</div>
        <div class="meta">{{seller_city}} — {{seller_postcode}}</div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:60%">DESCRIPTION</th>
          <th style="width:20%">HSN/SAC</th>
          <th style="width:10%" class="right">QTY</th>
          <th style="width:10%" class="right">AMOUNT (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{item_description}}</td>
          <td>{{item_hsn}}</td>
          <td class="right">{{item_qty}}</td>
          <td class="right">{{item_amount}}</td>
        </tr>
      </tbody>
    </table>
    <div class="summary">
      <div class="summary-row"><div>Subtotal</div><div>₹ {{subtotal}}</div></div>
      <div class="summary-row"><div>GST ({{gst_percent}}%)</div><div>₹ {{gst_amount}}</div></div>
      <div class="summary-row total"><div>Total</div><div>₹ {{total_amount}}</div></div>
    </div>
    <div class="payment" style="align-items:flex-start">
      <div class="qr"><img src="{{qr_image_data}}" alt="UPI QR" style="max-width:98%;max-height:98%;display:block;border-radius:6px"/></div>
      <div class="pay-info">
        <div style="font-weight:700;font-size:16px;margin-bottom:6px">Pay via UPI</div>
        <div class="meta">UPI ID: <strong>{{upi_id}}</strong></div>
        <div class="muted-note">Scan the QR code or tap the pay button to complete payment instantly.</div>
        <div style="height:10px"></div>
        <a class="pay-cta" href="{{payment_link}}">Pay ₹ {{total_amount}}</a>
      </div>
    </div>
  </div>
</body></html>`;
    return tpl.replace(/\{\{(.*?)\}\}/g, (_, k) => String(vars[k.trim()] ?? ''));
  }

  async function createPdfTemplate(): Promise<Buffer> {
    const html = buildInvoiceHTMLFromSpec({
      invoice_number: 'INV-001',
      invoice_date: 'Jan 15, 2025',
      due_date: 'Jan 30, 2025',
      seller_gstin: '22AAAAA0000A1Z5',
      client_name: 'Acme Co.',
      client_address_line1: '123 Business Street',
      client_address_line2: '',
      client_city: 'Mumbai, MH',
      client_postcode: '400001',
      seller_name: 'InvoiceBolt',
      seller_address_line1: '',
      seller_address_line2: '',
      seller_city: '',
      seller_postcode: '',
      item_description: 'Web Development Services',
      item_hsn: '998313',
      item_qty: '1',
      item_amount: '4,500',
      subtotal: '4,500',
      gst_percent: '18',
      gst_amount: '810',
      total_amount: '5,310',
      qr_image_data: 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=upi://pay?pa=invoicebolt@upi&am=5310',
      upi_id: 'invoicebolt@upi',
      payment_link: 'upi://pay?pa=invoicebolt@upi&am=5310',
      template_version: '2025-09-13-1'
    });
    try {
      const executablePath = await chromium.executablePath();
      const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: executablePath || undefined,
        headless: chromium.headless,
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' } });
      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch (e) {
      const pdfDoc = await PDFDocument.create();
      const p = pdfDoc.addPage([612,792]);
      const fB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      p.drawText('INVOICE', { x: 60, y: 720, size: 16, font: fB });
      const bytes = await pdfDoc.save();
      return Buffer.from(bytes);
    }
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
    text: `Hi ${tFirst}, your GST invoice template is attached (PDF + CSV). Import the CSV into Excel/Sheets and edit the PDF template or recreate it in your tool.`,
    attachments: [
      { filename: 'GST-Line-Items.csv', content: csvAttachment, contentType: 'text/csv; charset=utf-8' },
      ...(pdfBuffer ? [{ filename: 'GST-Invoice-Template.pdf', content: pdfBuffer, contentType: 'application/pdf' } as const] : []),
    ],
  });
}


