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
    throw new Error("SMTP not configured");
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
  return `<!doctype html><html><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width"/><title>${title}</title></head><body>${bodyHtml}</body></html>`;
}

export async function sendReservationPaidEmail(to: string, params: { first_name?: string; order_id?: string; amount?: string; payment_method?: string; paid_at?: string; }) {
  const tFirst = params.first_name || "there";
  const subject = `Payment confirmed — your spot is reserved`;
  const html = [
    preheader(`Thanks ${tFirst} — your payment is confirmed.`),
    shell({ title: subject, bodyHtml: `<h1>Thanks, ${tFirst}! Your payment is confirmed</h1>` })
  ].join("");
  const transporter = createTransport();
  await transporter.sendMail({ from: FROM_EMAIL, to, replyTo: REPLY_TO, subject, html, text: `Thanks ${tFirst}! Your payment is confirmed.` });
}

export async function sendReservationUnpaidEmail(to: string, params: { first_name?: string; }) {
  const tFirst = params.first_name || "there";
  const subject = `You’re on the list — we’ll notify you when it’s live`;
  const html = [
    preheader(`Thanks ${tFirst} — your spot is reserved.`),
    shell({ title: subject, bodyHtml: `<h1>Thanks, ${tFirst}! Your spot is reserved</h1><p><a href="${CHECKOUT_URL}">Go to Checkout</a></p><p><a href="${WHATSAPP_LINK}">Chat on WhatsApp</a></p>` })
  ].join("");
  const transporter = createTransport();
  await transporter.sendMail({ from: FROM_EMAIL, to, replyTo: REPLY_TO, subject, html, text: `Thanks ${tFirst}! Your spot is reserved. Checkout: ${CHECKOUT_URL}` });
}


