import type { CartItem } from "@/types"

export const downloadQuotationPDF = (cartItems: CartItem[], getTotalPrice: () => number) => {
  // Create the PDF content as HTML
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const quotationNumber = `LIP-${Date.now().toString().slice(-6)}`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>LegalIP Pro - Service Quotation</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .company-info {
          color: #666;
          font-size: 14px;
        }
        .quotation-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
        }
        .quotation-info div {
          flex: 1;
        }
        .quotation-info h3 {
          margin: 0 0 10px 0;
          color: #2563eb;
          font-size: 16px;
        }
        .services-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .services-table th,
        .services-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        .services-table th {
          background-color: #f1f5f9;
          font-weight: bold;
          color: #374151;
        }
        .price {
          text-align: right;
          font-weight: bold;
        }
        .total-section {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .total-final {
          font-size: 18px;
          font-weight: bold;
          color: #2563eb;
          border-top: 2px solid #2563eb;
          padding-top: 10px;
        }
        .terms {
          background: #fefce8;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #eab308;
        }
        .terms h3 {
          margin-top: 0;
          color: #a16207;
        }
        .terms ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .terms li {
          margin-bottom: 5px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #666;
          font-size: 12px;
        }
        @media print {
          body { margin: 0; padding: 15px; }
          .quotation-info { display: block; }
          .quotation-info div { margin-bottom: 15px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">⚖️ LegalIP Pro</div>
        <div class="company-info">
          Professional Intellectual Property Services<br>
          123 Legal Street, IP City, LC 12345<br>
          Phone: (555) 123-4567 | Email: info@legalippro.com
        </div>
      </div>

      <div class="quotation-info">
        <div>
          <h3>Quotation Details</h3>
          <strong>Quotation #:</strong> ${quotationNumber}<br>
          <strong>Date:</strong> ${currentDate}<br>
          <strong>Valid Until:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
        <div>
          <h3>Client Information</h3>
          <strong>Prepared For:</strong> Prospective Client<br>
          <strong>Services:</strong> IP Protection Services<br>
          <strong>Status:</strong> Preliminary Estimate
        </div>
      </div>

      <table class="services-table">
        <thead>
          <tr>
            <th>Service Description</th>
            <th>Category</th>
            <th class="price">Estimated Cost</th>
          </tr>
        </thead>
        <tbody>
          ${cartItems
            .map(
              (item) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.category}</td>
              <td class="price">$${item.price.toLocaleString()}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>$${getTotalPrice().toLocaleString()}</span>
        </div>
        <div class="total-row">
          <span>Consultation (Included):</span>
          <span>$0</span>
        </div>
        <div class="total-row total-final">
          <span>Total Estimated Cost:</span>
          <span>$${getTotalPrice().toLocaleString()}</span>
        </div>
      </div>

      <div class="terms">
        <h3>Terms & Conditions</h3>
        <ul>
          <li><strong>Validity:</strong> This quotation is valid for 30 days from the date of issue.</li>
          <li><strong>Estimates:</strong> All prices are estimates and may vary based on complexity and specific requirements.</li>
          <li><strong>Payment:</strong> 50% advance payment required to commence services, balance upon completion.</li>
          <li><strong>Timeline:</strong> Service timelines will be provided upon engagement and may vary by service type.</li>
          <li><strong>Consultation:</strong> Free initial consultation included with any service package.</li>
          <li><strong>Additional Costs:</strong> Government fees, filing fees, and third-party costs are additional.</li>
        </ul>
      </div>

      <div class="footer">
        <p>This quotation was generated on ${currentDate} by LegalIP Pro.<br>
        For questions or to proceed with services, please contact us at info@legalippro.com or (555) 123-4567.</p>
      </div>
    </body>
    </html>
  `

  // Create a new window and write the HTML content
  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }
}
