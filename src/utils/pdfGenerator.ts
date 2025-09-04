import html2pdf from 'html2pdf.js';
import { getOfferById } from '../api/offerAPI';

// Interface for offer data
interface OfferData {
  _id: string;
  offerName: string;
  to: string;
  project: string;
  subject: string;
  works: Array<{
    workItem: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  taxAmount: number;
  totalWithTax: number;
}

// Generate Invoice HTML content with the same styling as the Invoice component
const generateInvoiceHTML = (data: OfferData): string => {
  const invoiceData = {
    summary: [
      { title: 'الاجمالي', value: `${data?.totalAmount}` },
      { title: 'ضريبة القيمة المضافه %15 ', value: `${data?.taxAmount}` },
      { title: 'الاجمالي شامل ضريبة القيمه المضافه', value: `${data?.totalWithTax}` }
    ],
  };

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice</title>
      <style>
        /* Invoice.css styles */
        .invoice-container {
          font-family: 'Tahoma', 'Arial', sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          direction: rtl;
          background-color: #fff;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .invoice-header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #333;
          padding-bottom: 15px;
        }

        .invoice-header h1 {
          font-size: 24px;
          margin: 0;
          color: #333;
        }

        .invoice-header h2 {
          font-size: 18px;
          margin: 5px 0 0 0;
          color: #555;
        }

        .company-info {
          margin-bottom: 15px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          width: 48%;
        }

        .label {
          font-weight: bold;
          color: #333;
          margin-bottom: 3px;
        }

        .value {
          color: #555;
        }

        .note-section {
          background-color: #f5f5f5;
          padding: 10px;
          margin-bottom: 15px;
          text-align: center;
          border-radius: 4px;
        }

        .note-section p {
          margin: 0;
          color: #555;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        .items-table th,
        .items-table td {
          border: 1px solid #ddd;
          padding: 8px;
        }

        .items-table th {
          background-color: #faf0b1;
          font-weight: bold;
        }

        .summary-section {
          margin-bottom: 20px;
        }

        .summary-table {
          width: 100%;
          border-collapse: collapse;
        }

        .summary-table td {
          padding: 5px 10px;
          border-bottom: 1px solid #eee;
        }

        .summary-table tr:last-child td {
          border-bottom: none;
          font-weight: bold;
        }

        .footer-section {
          border-top: 2px solid #333;
          padding-top: 15px;
        }

        .footer-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .footer-label {
          font-weight: bold;
          color: #333;
        }

        .footer-value {
          color: #555;
        }

        /* ضبط حجم الصفحة A4 للطباعة */
        .invoice-container {
          width: 100%;
          max-width: 210mm;
          margin: 0 auto;
          padding: 10mm;
          font-family: 'Arial', sans-serif;
          direction: rtl;
          background: white;
        }

        @page {
          size: A4;
          margin: 0;
        }

        .print-header img,
        .print-footer img {
          width: 100%;
          height: auto;
          max-height: 40mm;
        }

        table {
          page-break-inside: avoid;
          border-collapse: collapse;
          width: 100%;
        }

        th, td {
          padding: 8px;
          border: 1px solid #000;
        }

        .bg-highlight {
          background-color: #faf0b1 !important;
        }

        .offer-name {
          background-color: #faf0b1;
          padding: 10px;
          border: 1px solid black;
          margin: 20px 0;
          text-align: center;
          font-weight: bold;
        }

        .company-details {
          margin: 20px 0;
        }

        .equal-columns {
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .items-table {
          width: 100%;
          margin: 20px 0;
          border-collapse: collapse;
        }

        .items-table th, .items-table td {
          border: 1px solid #000;
          padding: 8px;
          text-align: right;
        }

        .summary-section {
          margin: 20px 0;
        }

        .text-right {
          text-align: right;
        }

        .flex {
          display: flex;
        }

        .justify-between {
          justify-content: space-between;
        }

        .gap-6 {
          gap: 24px;
        }

        .p-6 {
          padding: 24px;
        }

        .border {
          border: 1px solid #000;
        }

        .border-black {
          border-color: #000;
        }

        .w-full {
          width: 100%;
        }

        .px-4 {
          padding-left: 16px;
          padding-right: 16px;
        }

        .py-3 {
          padding-top: 12px;
          padding-bottom: 12px;
        }

        .font-medium {
          font-weight: 500;
        }

        .bg-gray-50 {
          background-color: #f9fafb;
        }

        .text-blue-600 {
          color: #2563eb;
        }

        .font-bold {
          font-weight: bold;
        }

        .text-2xl {
          font-size: 24px;
        }

        .my-6 {
          margin-top: 24px;
          margin-bottom: 24px;
        }

        .text-center {
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="print-header">
          <img src="/Images/header.png" alt="Header" />
        </div>
        
        <div class="invoice-header">
          <div class='flex justify-between'>
            <h1>تاريخ العرض</h1>
            <h1>عرض رقم</h1>
          </div>

          <div class='offer-name'>
            <p>${data?.offerName}</p>
          </div>

          <div class="company-details">
            <div class="equal-columns gap-6 p-6 flex justify-between">
              <div class="border border-black">
                <table class="w-full">
                  <tbody>
                    <tr>
                      <td class="bg-highlight px-4 py-3 text-right font-medium border border-black">من</td>
                      <td class="px-4 py-3 text-right border border-black">ايفاء لأنظمة الامن والسلامة</td>
                    </tr>
                    <tr class="bg-gray-50">
                      <td class="bg-highlight px-4 py-3 text-right font-medium border border-black">البريد الالكتروني</td>
                      <td class="px-4 py-3 text-right border border-black">
                        <div class="text-blue-600">Hafez@EvaSaudi.com</div>
                      </td>
                    </tr>
                    <tr>
                      <td class="bg-highlight px-4 py-3 text-right font-medium border border-black">التواصل</td>
                      <td class="px-4 py-3 text-right border border-black">
                        <div class="text-blue-600">+966540800987</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="border border-black">
                <table class="w-full">
                  <tbody>
                    <tr>
                      <td class="bg-highlight px-4 py-3 text-right font-medium border border-black">الى</td>
                      <td class="px-4 py-3 text-right border border-black">${data?.to}</td>
                    </tr>
                    <tr class="bg-gray-50">
                      <td class="bg-highlight px-4 py-3 text-right font-medium border border-black">المشروع</td>
                      <td class="px-4 py-3 text-right border border-black">
                        <div class="text-blue-600">${data?.project}</div>
                      </td>
                    </tr>
                    <tr>
                      <td class="bg-highlight px-4 py-3 text-right font-medium border border-black">الموضوع</td>
                      <td class="px-4 py-3 text-right border border-black">
                        <div class="text-blue-600">${data?.subject}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div class='my-6'>
            <p class='font-bold text-2xl'>يسرنا تقديم عرضنا التالي</p>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th class='bg-highlight'>البند</th>
                <th class='bg-highlight text-center'>وصف العمل</th>
                <th class='bg-highlight'>الكمية</th>
                <th class='bg-highlight'>السعر</th>
                <th class='bg-highlight'>الاجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${data?.works?.map((item, idx) => {
                const total = item.price * item.quantity;
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td class='text-right'>${item.workItem}</td>
                    <td class='text-right'>${item.quantity.toLocaleString()}</td>
                    <td class='text-right'>${item.price ? item.price.toLocaleString() : ''}</td>
                    <td class='text-right'>${total ? total.toLocaleString() : ''}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="summary-section">
            <table class="items-table">
              <thead>
                <tr>
                  <th class='bg-highlight'>البند</th>
                  <th class='bg-highlight text-center'>وصف العمل</th>
                  <th class='bg-highlight'>الاجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceData.summary.map((item, index) => `
                  <tr>
                    <td class='bg-highlight'>${index + 1}</td>
                    <td>${item.title}</td>
                    <td>${item.value}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="w-full">
            <table class="w-full">
              <tbody>
                <tr>
                  <td class="bg-highlight px-4 py-3 text-right font-medium border border-black">شروط الدفع</td>
                  <td class="px-4 py-3 text-right border border-black">حسب الاتفاق</td>
                </tr>
                <tr class="bg-gray-50">
                  <td class="bg-highlight px-4 py-3 text-right font-medium border border-black">مدة صلاحية العرض</td>
                  <td class="px-4 py-3 text-right border border-black">30 يوم من تاريخ العرض</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="print-footer">
          <img src="/Images/footer.png" alt="Footer" />
        </div>
      </div>
    </body>
    </html>
  `;
};

// Main function to handle PDF download
export const handleDownloadOffer = async (id: string): Promise<void> => {
  try {
    // Fetch offer data
    const offerData = await getOfferById(id);
    
    // Generate HTML content
    const htmlContent = generateInvoiceHTML(offerData);
    
    // Create a temporary div to hold the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);
    
    // Configure html2pdf options
    const options = {
      margin: [10, 10, 10, 10],
      filename: `عرض-${offerData.offerName || id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };
    
    // Generate and download PDF
    await html2pdf().set(options).from(tempDiv.firstElementChild).save();
    
    // Clean up
    document.body.removeChild(tempDiv);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('فشل في إنشاء ملف PDF');
  }
};