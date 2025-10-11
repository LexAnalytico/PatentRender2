// Quotation HTML builder extracted from page.tsx for reuse and testability.
// Accepts dynamic cart items, totals, and optional payment/order metadata.

export interface QuotationItem { name: string; category: string; price: number }
export interface BuildQuotationOptions {
  cartItems: QuotationItem[]
  total: number
  payment?: any
  orders?: any[]
  company?: { name?: string; address?: string; phone?: string; email?: string }
}

export interface BuildInvoiceWithFormsOptions {
  bundle: { orders: any[]; paymentKey?: string; totalAmount?: number; date?: string | null }
  company?: { name?: string; address?: string; phone?: string; email?: string }
  // Orders may already include embedded form responses in various shapes
  // Accept optional pre-normalized mapping: orderId -> array of { field, value }
  normalizedForms?: Record<string | number, Array<{ field: string; value: any }>>
  // Optional attachments mapping: orderId -> array of downloadable items
  attachments?: Record<string | number, Array<{ name: string; url: string; size?: number; type?: string }>>
}

export function buildQuotationHtml({ cartItems, total, payment, orders, company }: BuildQuotationOptions): string {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const quotationNumber = `LIP-${Date.now().toString().slice(-6)}`
  const paymentMode = payment?.payment_method || payment?.paymentMode || 'N/A'
  const paymentId = payment?.razorpay_payment_id || payment?.id || 'N/A'
  const orderIds = (orders || []).map((o: any) => o.id).filter(Boolean)
  const orderIdsLabel = orderIds.length ? orderIds.join(', ') : 'N/A'
  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
  const co = {
    name: company?.name || 'LegalIP Pro',
    address: company?.address || '123 Legal Street, IP City, LC 12345',
    phone: company?.phone || '(555) 123-4567',
    email: company?.email || 'info@legalippro.com',
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${co.name} - Service Quotation</title><style>
    body { font-family: Arial, sans-serif; line-height:1.6; color:#333; max-width:800px; margin:0 auto; padding:20px; }
    .header { text-align:center; border-bottom:3px solid #2563eb; padding-bottom:20px; margin-bottom:30px; }
    .logo { font-size:28px; font-weight:bold; color:#2563eb; margin-bottom:10px; }
    .company-info { color:#666; font-size:14px; }
    .quotation-info { display:flex; justify-content:space-between; margin-bottom:30px; background:#f8fafc; padding:20px; border-radius:8px; }
    .quotation-info h3 { margin:0 0 10px 0; color:#2563eb; font-size:16px; }
    table { width:100%; border-collapse:collapse; margin-bottom:30px; }
    th, td { padding:12px; text-align:left; border-bottom:1px solid #e2e8f0; }
    th { background:#f1f5f9; font-weight:bold; color:#374151; }
    .price { text-align:right; font-weight:bold; }
    .total-section { background:#f8fafc; padding:20px; border-radius:8px; margin-bottom:30px; }
    .total-row { display:flex; justify-content:space-between; margin-bottom:10px; }
    .total-final { font-size:18px; font-weight:bold; color:#2563eb; border-top:2px solid #2563eb; padding-top:10px; }
    .terms { background:#fefce8; padding:20px; border-radius:8px; border-left:4px solid #eab308; }
    .terms h3 { margin-top:0; color:#a16207; }
    .terms ul { margin:10px 0; padding-left:20px; }
    .terms li { margin-bottom:5px; }
    .footer { text-align:center; margin-top:40px; padding-top:20px; border-top:1px solid #e2e8f0; color:#666; font-size:12px; }
    @media print { body { margin:0; padding:15px; } .quotation-info { display:block; } .quotation-info div { margin-bottom:15px; } }
  </style></head><body>
  <div class="header"><div class="logo">⚖️ ${co.name}</div><div class="company-info">Professional Intellectual Property Services<br/>${co.address}<br/>Phone: ${co.phone} | Email: ${co.email}</div></div>
  <div class="quotation-info"><div><h3>Quotation Details</h3><strong>Quotation #:</strong> ${quotationNumber}<br/><strong>Date:</strong> ${currentDate}<br/><strong>Order ID(s):</strong> ${orderIdsLabel}<br/><strong>Payment ID:</strong> ${paymentId}<br/><strong>Payment Mode:</strong> ${paymentMode}<br/><strong>Valid Until:</strong> ${new Date(Date.now()+30*24*60*60*1000).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</div><div><h3>Client Information</h3><strong>Prepared For:</strong> Prospective Client<br/><strong>Services:</strong> IP Protection Services<br/><strong>Status:</strong> Preliminary Estimate</div></div>
  <table><thead><tr><th>Service Description</th><th>Category</th><th class="price">Estimated Cost</th></tr></thead><tbody>
  ${cartItems.map(i => `<tr><td>${i.name}</td><td>${i.category}</td><td class=price>${fmt(i.price)}</td></tr>`).join('')}
  </tbody></table>
  <div class="total-section"><div class="total-row"><span>Subtotal:</span><span>${fmt(total)}</span></div><div class="total-row"><span>Consultation (Included):</span><span>${fmt(0)}</span></div><div class="total-row total-final"><span>Total Estimated Cost:</span><span>${fmt(total)}</span></div>${paymentId!=='N/A'?`<div class="total-row" style="margin-top:8px;font-size:12px;color:#555;">Reference: Payment ${paymentId} (${paymentMode})</div>`:''}</div>
  <div class="terms"><h3>Terms & Conditions</h3><ul><li><strong>Validity:</strong> This quotation is valid for 30 days.</li><li><strong>Estimates:</strong> Prices may vary with complexity.</li><li><strong>Payment:</strong> 50% advance to commence services.</li><li><strong>Timeline:</strong> Provided upon engagement.</li><li><strong>Consultation:</strong> Free initial consultation included.</li><li><strong>Additional Costs:</strong> Government & third-party fees extra.</li></ul></div>
  <div class="footer"><p>This quotation was generated on ${currentDate} by ${co.name}.<br/>For questions or to proceed, contact us at ${co.email} or ${co.phone}.</p></div>
  </body></html>`
}

// Build an invoice HTML that appends printable form responses for each order in the bundle.
// Attempts to detect form response shapes: order.formResponses (array), order.form_values (object), order.forms (array of { field, value }).
export function buildInvoiceWithFormsHtml({ bundle, company, normalizedForms, attachments }: BuildInvoiceWithFormsOptions): string {
  const co = {
    name: company?.name || 'LegalIP Pro',
    address: company?.address || '123 Legal Street, IP City, LC 12345',
    phone: company?.phone || '(555) 123-4567',
    email: company?.email || 'support@legalippro.com',
  }
  const orders = bundle.orders || []
  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
  const totalAmount = fmt(Number(bundle.totalAmount || 0))
  const paymentId = bundle.paymentKey || '—'
  const generatedAt = new Date().toLocaleString()

  const lineRows = orders.map(o => {
    const category = (o.categories as any)?.name || 'N/A'
    const service = (o.services as any)?.name || 'N/A'
    const amount = o.amount != null ? fmt(Number(o.amount)) : '—'
    const date = o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'
    const appType = o.type || '—'
    return `<tr><td>${o.id}</td><td>${category}</td><td>${service}</td><td>${appType}</td><td style="text-align:right;">${amount}</td><td>${date}</td></tr>`
  }).join('') || `<tr><td colspan="6" style="text-align:center;color:#999;">No orders</td></tr>`

  const renderFormBlock = (o: any): string => {
    const oid = o.id
    let pairs: Array<{ field: string; value: any }> = []
    if (normalizedForms && normalizedForms[oid]) {
      pairs = normalizedForms[oid]
    } else if (Array.isArray(o.formResponses)) {
      pairs = o.formResponses.map((r: any) => ({ field: r.field || r.name || r.key || 'Field', value: r.value ?? r.val ?? r.answer ?? '' }))
    } else if (o.form_values && typeof o.form_values === 'object') {
      pairs = Object.entries(o.form_values).map(([k,v]) => ({ field: k, value: v }))
    } else if (Array.isArray(o.forms)) {
      pairs = o.forms.map((f: any) => ({ field: f.field || f.name || 'Field', value: f.value ?? '' }))
    }
    if (!pairs.length) {
      return `<div class="form-section"><h4>Order #${oid} – Form Responses</h4><div style="font-size:11px;margin:4px 0 8px;color:#555;">Application Type: ${(o.type||'—')}</div><em>No form data available</em></div>`
    }
    const rows = pairs.map(p => `<tr><td>${escapeHtml(p.field)}</td><td>${formatValue(p.value)}</td></tr>`).join('')
    return `<div class="form-section"><h4>Order #${oid} – Form Responses</h4><div style="font-size:11px;margin:4px 0 8px;color:#555;">Application Type: ${(o.type||'—')}</div><table class="form-table"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>${rows}</tbody></table></div>`
  }

  const escapeHtml = (s: any): string => {
    if (s == null) return ''
    return String(s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;')
  }
  const formatValue = (v: any): string => {
    if (Array.isArray(v)) return escapeHtml(v.join(', '))
    if (typeof v === 'object' && v !== null) return escapeHtml(JSON.stringify(v))
    return escapeHtml(v)
  }

  const humanSize = (bytes?: number) => {
    if (!bytes || isNaN(bytes as any)) return ''
    const units = ['B','KB','MB','GB']
    let b = Number(bytes)
    let i = 0
    while (b >= 1024 && i < units.length - 1) { b /= 1024; i++ }
    return `${b.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
  }

  const renderAttachmentsBlock = (o: any): string => {
    const oid = o.id
    const list = attachments?.[oid] || attachments?.[String(oid)] || []
    if (!list || list.length === 0) {
      return `<div class="form-section"><h4>Order #${oid} – Attachments</h4><em>No attachments uploaded</em></div>`
    }
    const rows = list.map((a) => {
      const name = escapeHtml(a.name)
      const size = humanSize(a.size)
      const type = escapeHtml(a.type || '')
      const url = a.url ? String(a.url) : ''
      // Do not open a new tab; rely on download attribute and signed URL Content-Disposition to trigger direct download
      const link = url ? `<a href="${url}" download="${name}">Download</a>` : '<span style="color:#9ca3af;">N/A</span>'
      return `<tr><td>${name}</td><td>${type || 'file'}</td><td>${size}</td><td>${link}</td></tr>`
    }).join('')
    return `<div class="form-section"><h4>Order #${oid} – Attachments</h4><table class="form-table"><thead><tr><th>Name</th><th>Type</th><th>Size</th><th>Link</th></tr></thead><tbody>${rows}</tbody></table></div>`
  }

  const formsHtml = orders.map(o => [renderFormBlock(o), renderAttachmentsBlock(o)].join('')).join('<div class="page-break"></div>')

  // Removed bundle-level Application Type summary; now shown per order section
  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${co.name} Invoice & Forms</title><style>
    body { font-family: Arial, sans-serif; margin:24px; color:#111827; }
    h1 { font-size:22px; margin:0 0 4px; }
    h2 { font-size:18px; margin:32px 0 12px; }
    h4 { margin:0 0 8px; font-size:14px; color:#1f2937; }
    table { width:100%; border-collapse:collapse; font-size:12px; }
    th, td { padding:6px; border-bottom:1px solid #e5e7eb; vertical-align:top; }
    th { background:#f3f4f6; text-align:left; font-weight:600; }
    .meta { font-size:11px; color:#555; line-height:1.4; }
    .totals { margin-top:14px; font-size:13px; }
    .totals strong { color:#1d4ed8; }
    .footer { margin-top:40px; font-size:10px; color:#6b7280; border-top:1px solid #e5e7eb; padding-top:8px; }
    .form-section { margin-top:28px; page-break-inside:avoid; }
    .form-table th { background:#e0f2fe; }
    .page-break { page-break-after:always; height:0; }
    @media print { .no-print { display:none; } body { margin:12px; } }
  </style></head><body>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <h1>Invoice & Form Summary</h1>
  <div class="meta">Generated: ${generatedAt}<br/>Payment / Bundle Key: ${paymentId}<br/>Orders: ${orders.map(o=>o.id).join(', ') || '—'}</div>
      </div>
      <div style="text-align:right;font-size:12px;">
        <strong>${co.name}</strong><br/>${co.address}<br/>${co.phone} | ${co.email}
      </div>
    </div>
    <table style="margin-top:16px;">
      <thead><tr><th>Order ID</th><th>Category</th><th>Service</th><th>App Type</th><th style="text-align:right;">Amount (INR)</th><th>Date</th></tr></thead>
      <tbody>${lineRows}</tbody>
    </table>
    <div class="totals">Total Bundle Amount: <strong>${totalAmount}</strong></div>
    <h2>Forms</h2>
    <p class="meta">Below are the captured form responses for each order. Structured data objects serialized as JSON. Empty sections indicate no stored responses.</p>
    ${formsHtml || '<div class="form-section"><em>No forms available.</em></div>'}
    <div class="footer">System generated document combining invoice lines and associated form responses. For official invoicing, contact support.</div>
    <button class="no-print" onclick="window.print()" style="margin-top:24px;padding:8px 14px;font-size:12px;cursor:pointer;">Print / Save PDF</button>
  </body></html>`
}
