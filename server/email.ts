import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || "InvoiceBolt <no-reply@invoicebolt.example>";
const REPLY_TO = process.env.REPLY_TO || process.env.FROM_EMAIL || "support@invoicebolt.example";
const APP_ORIGIN = process.env.APP_ORIGIN || "https://invoicebolt.example";
const CHECKOUT_URL = process.env.CHECKOUT_URL || `${APP_ORIGIN}/?startPayment=1#pricing`;
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
      .btn{display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:14px 20px;border-radius:10px}
      .footer{font-size:12px;color:#6b7280}
      .pill{display:inline-block;background:#eef2ff;color:#4338ca;border-radius:999px;padding:4px 10px;font-size:12px}
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
        <p class="footer">© InvoiceBolt · <a href="${APP_ORIGIN}" style="color:#4f46e5">invoicebolt.example</a><br/>
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
        <p style="margin:0 0 10px"><a class="btn" href="${WHATSAPP_LINK}" aria-label="Chat on WhatsApp" style="display:inline-block;background:#22c55e;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600">Chat on WhatsApp</a></p>
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
        <p style="margin:12px 0 8px"><a class="btn" href="${CHECKOUT_URL}" aria-label="Go to checkout" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:12px;font-weight:600">Go to Checkout</a></p>
        <p style="margin:8px 0 0"><a class="btn" href="${WHATSAPP_LINK}" aria-label="Chat on WhatsApp" style="display:inline-block;background:#22c55e;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600">Chat on WhatsApp</a></p>
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


