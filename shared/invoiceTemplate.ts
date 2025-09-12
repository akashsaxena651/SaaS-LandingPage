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
  :root{--bg:#f7f8fb;--card:#ffffff;--muted:#6b7280;--border:#e5e7eb;--purple:#4f46e5;--purple2:#7c3aed;--text:#0f172a}
  body{margin:0;background:var(--bg);font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:var(--text)}
  .wrap{padding:48px}
  .header{background:#eef2ff;padding:10px 16px;border-bottom:1px solid #e5e7eb;color:#0f172a;font-weight:700}
  .card{width:700px;margin:28px auto;background:var(--card);border:1px solid var(--border);border-radius:12px}
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


