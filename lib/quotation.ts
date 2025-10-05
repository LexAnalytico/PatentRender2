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
