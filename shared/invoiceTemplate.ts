export type InvoicePreviewData = {
	invoiceNumber: string;
	businessName: string;
	businessGstin: string;
	clientName: string;
	clientAddressLine1: string;
	clientAddressLine2: string;
	invoiceDate: string;
	dueDate: string;
	itemDescription: string;
	amountInr: string; // e.g. "INR 999"
	qrUrl: string; // absolute URL to QR image
};

// Generates a self-contained HTML document whose visual layout matches the landing page "Invoice Preview" card
export function buildInvoicePreviewHTML(data: InvoicePreviewData): string {
	const safe = (v: string) => String(v ?? "");
	return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Invoice Preview</title>
<style>
  :root{--brand:#6B46C1;--brand2:#7C3AED;--muted:#6b7280;--bg:#ffffff;--panel:#f8fafc;--border:#e6e7eb;--text:#111827}
  body{margin:0;background:#f3f4f6;font-family:Inter,system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:var(--text)}
  .wrap{padding:48px}
  .header{background:#eef2ff;padding:10px 16px;border-bottom:1px solid #e5e7eb;color:#0f172a;font-weight:700}
  .card{width:700px;margin:28px auto;background:var(--bg);border:1px solid var(--border);border-radius:12px}
  .row{display:flex;justify-content:space-between;gap:16px}
  .px{padding-left:20px;padding-right:20px}
  .py{padding-top:20px;padding-bottom:20px}
  .muted{color:var(--muted)}
  .pill-amount{display:inline-block;background:#eef2ff;color:var(--purple);font-weight:800;padding:6px 10px;border-radius:8px}
  .title{color:#4f46e5;font-weight:800}
  .small{font-size:12px}
  .divider{height:1px;background:var(--border);margin:12px 0}
  table{width:100%;border-collapse:collapse}
  th,td{font-size:13px;padding:10px}
  th{background:#f8fafc;text-align:left}
  td{border-top:1px solid var(--border)}
</style>
</head>
<body>
  <div class="wrap">
    <div class="header">Invoice Preview</div>
    <div class="card px py">
      <div class="row" style="align-items:flex-start">
        <div>
          <div class="title">INVOICE</div>
          <div class="muted small">#${safe(data.invoiceNumber)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700">${safe(data.businessName)}</div>
          <div class="muted small">GST: ${safe(data.businessGstin)}</div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="row">
        <div>
          <div style="font-weight:700;margin-bottom:6px">Bill To:</div>
          <div style="font-weight:600">${safe(data.clientName)}</div>
          <div class="muted small">${safe(data.clientAddressLine1)}</div>
          <div class="muted small">${safe(data.clientAddressLine2)}</div>
        </div>
        <div>
          <div style="font-weight:700;margin-bottom:6px">Invoice Date:</div>
          <div class="small">${safe(data.invoiceDate)}</div>
          <div style="font-weight:700;margin:10px 0 6px">Due Date:</div>
          <div class="small">${safe(data.dueDate)}</div>
        </div>
      </div>

      <div class="divider"></div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align:right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${safe(data.itemDescription)}</td>
            <td style="text-align:right">${safe(data.amountInr)}</td>
          </tr>
        </tbody>
      </table>

      <div class="row" style="margin-top:16px;align-items:center">
        <div style="text-align:center">
          <img src="${safe(data.qrUrl)}" alt="UPI QR" width="140" height="140" style="border:1px solid var(--border);border-radius:8px"/>
          <div class="muted small" style="margin-top:6px">Scan to pay instantly</div>
        </div>
        <div style="text-align:right;flex:1">
          <div class="pill-amount">${safe(data.amountInr)}</div>
          <div class="muted small" style="margin-top:6px">Total Amount</div>
        </div>
      </div>
    </div>
  </div>
</body></html>`;
}

// Spec-driven full invoice HTML from user's provided template with placeholders
export function buildInvoiceHTMLFromSpec(vars: Record<string, string>): string {
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
  .small{font-size:12px;color:var(--muted)}
  .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px}
  .brand{display:flex;align-items:center;gap:12px}
  .logo{display:flex;align-items:center;gap:12px}
  .mark{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--brand2),var(--brand));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:18px;box-shadow:0 6px 22px rgba(107,70,193,0.18)}
  .brand-name{font-weight:800;font-size:20px;letter-spacing:0.2px}
  .invoice-box{background:var(--panel);padding:14px 16px;border-radius:10px;border:1px solid var(--border);min-width:260px;box-shadow:0 4px 14px rgba(15,23,42,0.05)}
  .invoice-title{font-weight:700;color:#111827;margin-bottom:6px}
  .meta-item{font-size:13px;color:var(--muted);line-height:1.5}
  .addresses{display:flex;gap:24px;margin:22px 0 12px;flex-wrap:wrap}
  .panel{background:#fff;border:1px solid var(--border);padding:14px;border-radius:8px;min-width:220px;box-shadow:0 6px 18px rgba(15,23,42,0.03)}
  .panel .label{font-size:12px;color:var(--muted);margin-bottom:6px}
  .panel .value{font-weight:600}
  table{width:100%;border-collapse:collapse;margin-top:18px}
  th, td{padding:12px 14px;border-bottom:1px solid #eef2f7;font-size:14px;text-align:left;vertical-align:middle}
  th{background:transparent;color:var(--muted);font-weight:600;font-size:13px}
  td.right{text-align:right}
  tbody tr:last-child td{border-bottom:none}
  .summary{max-width:340px;margin-left:auto;margin-top:18px}
  .summary-row{display:flex;justify-content:space-between;padding:8px 12px}
  .summary-row.total{font-size:20px;color:var(--brand);font-weight:800}
  .payment{display:flex;gap:18px;align-items:center;margin-top:22px;flex-wrap:wrap}
  .qr{width:160px;height:160px;border-radius:12px;background:#fff;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(15,23,42,0.06)}
  .pay-info{flex:1}
  .pay-cta{display:inline-block;background:linear-gradient(135deg,var(--brand2),var(--brand));color:#fff;padding:10px 16px;border-radius:10px;text-decoration:none;font-weight:800;box-shadow:0 8px 20px rgba(107,70,193,0.16)}
  .muted-note{font-size:12px;color:var(--muted);margin-top:8px}
  .footer{margin-top:28px;border-top:1px solid #f1f2f4;padding-top:16px;font-size:13px;color:var(--muted);display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
  @media (max-width:720px){.row{flex-direction:column}.header{flex-direction:column;align-items:flex-start;gap:12px}.invoice-box{min-width:unset;width:100%}.addresses{flex-direction:column}.summary{width:100%;margin-left:0}.qr{width:120px;height:120px}}
</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="brand">
        <div class="logo"><div class="mark">⚡</div>
          <div><div class="brand-name">InvoiceBolt</div><div class="meta">GST-ready invoices · Instant UPI payments</div></div>
        </div>
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
    <div class="footer"><div>GST-compliant | Auto-generated via InvoiceBolt • v{{template_version}}</div><div>InvoiceBolt · Not tax advice · Consult your CA</div></div>
  </div>
</body></html>`;
  return tpl.replace(/\{\{(.*?)\}\}/g, (_, k) => String(vars[k.trim()] ?? ''));
}


