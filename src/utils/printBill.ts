import { format } from 'date-fns';
import { formatDateSafe } from './dateUtils';
import { printInNewWindow } from './printUtils';

export function generateBillNumber(sequence?: number): string {
  const year = new Date().getFullYear();
  if (sequence !== undefined && sequence > 0) {
    return `ZM-${year}-${String(sequence).padStart(4, '0')}`;
  }
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `ZM-${year}-${randomPart}`;
}

export function printBillHtml(billData: any) {
  const isMultiple = billData.items && billData.items.length > 0;
  
  const itemsHtml = isMultiple 
    ? billData.items.map((item: any, i: number) => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${i + 1}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0;">
          <strong>${item.company || ''} ${item.modelName || item.itemName || ''}</strong><br/>
          <span style="font-size: 12px; color: #64748b;">${item.ramRom || ''}</span>
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">
          ${item.imei1 || (item.imei2 ? '' : '-')}
          ${item.imei2 ? `<br/><span style="font-size: 12px; color: #64748b;">IMEI2: ${item.imei2}</span>` : ''}
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">Rs. ${(item.sellPrice || 0).toLocaleString()}</td>
      </tr>
    `).join('')
    : `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">1</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0;">
          <strong>${billData.company || ''} ${billData.itemName || billData.modelName || ''}</strong>
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">
          ${billData.imei1 || (billData.imei2 ? '' : '-')}
          ${billData.imei2 ? `<br/><span style="font-size: 12px; color: #64748b;">IMEI2: ${billData.imei2}</span>` : ''}
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">Rs. ${(billData.sellPrice || billData.totalSellPrice || 0).toLocaleString()}</td>
      </tr>
    `;

  // Robustly determine the total sale price
  let calculatedTotal = 0;
  if (billData.totalSellPrice !== undefined && billData.totalSellPrice !== null && Number(billData.totalSellPrice) > 0) {
    calculatedTotal = Number(billData.totalSellPrice);
  } else if (billData.totalSellAmount !== undefined && billData.totalSellAmount !== null && Number(billData.totalSellAmount) > 0) {
    calculatedTotal = Number(billData.totalSellAmount);
  } else if (billData.sellPrice !== undefined && billData.sellPrice !== null && Number(billData.sellPrice) > 0) {
    calculatedTotal = Number(billData.sellPrice);
  } else if (billData.items && billData.items.length > 0) {
    calculatedTotal = billData.items.reduce((sum: number, it: any) => sum + (Number(it.sellPrice) || 0), 0);
  }

  const totalHtml = `Rs. ${calculatedTotal.toLocaleString()}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bill #${billData.billNumber || billData.id}</title>
      <style>
        body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; margin: 0; padding: 20px; color: #0f0a1e; }
        .bill-container { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        .header { background: #1B4332; color: white; padding: 30px; text-align: center; }
        .header-inner { display: flex; align-items: center; justify-content: center; gap: 15px; }
        .header-icon { font-size: 24px; background: rgba(255,255,255,0.2); width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .title-band { background: #10B981; color: white; text-align: center; padding: 10px; font-weight: bold; letter-spacing: 2px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px; border-bottom: 2px solid #e2e8f0; }
        .info-col p { margin: 5px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .items-table th { background: #f0fdf4; padding: 12px 8px; text-align: left; border-bottom: 2px solid #bbf7d0; color: #166534; }
        .total-row { display: flex; justify-content: space-between; padding: 20px; font-size: 20px; font-weight: bold; background: #f0fdf4; border-bottom: 1px solid #e2e8f0; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .bill-container { border: none; }
        }
      </style>
    </head>
    <body>
      <div class="bill-container">
        <div class="header">
          <div class="header-inner">
            <div class="header-icon">📱</div>
            <div>
              <h1 style="margin:0; font-size: 28px;">ZAMZAM MOBILE CENTER</h1>
              <p style="margin:5px 0 0 0; opacity: 0.9;">Mobile & Accessories</p>
            </div>
          </div>
        </div>
        <div class="title-band">SALE RECEIPT #${billData.billNumber || billData.id.substring(0,8).toUpperCase()}</div>
        
        <div class="info-grid">
          <div class="info-col">
            <p><strong>Customer:</strong> ${billData.customerName || 'Walk-in'}</p>
            <p><strong>Phone:</strong> ${billData.customerPhone || 'N/A'}</p>
            <p><strong>Method:</strong> ${billData.paymentMethod || 'Cash'}</p>
          </div>
          <div class="info-col" style="text-align: right;">
            <p><strong>Date:</strong> ${formatDateSafe(billData.date || new Date(), 'dd/MM/yyyy')}</p>
            <p><strong>Time:</strong> ${formatDateSafe(billData.date || new Date(), 'hh:mm a')}</p>
            <p><strong>Bill #:</strong> ${billData.billNumber || billData.id.substring(0,8).toUpperCase()}</p>
          </div>
        </div>
        <div style="padding: 20px;">
          <h3 style="margin-top: 0; color: #166534;">ITEMS PURCHASED</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th style="text-align: center; width: 50px;">#</th>
                <th>Item</th>
                <th>IMEI</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>
        <div class="total-row">
          <span>TOTAL AMOUNT:</span>
          <span>${totalHtml}</span>
        </div>
        <div class="footer">
          Thank you for your purchase! Visit Again 😊
        </div>
      </div>
    </body>
    </html>
  `;

  
  
  
  printInNewWindow(html, `Bill_${billData.billNumber || billData.id}`);
}