import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { SaleInvoice } from '../types';

export interface GeneratePDFResult {
  pdf: jsPDF;
  pdfBlob: Blob;
  filename: string;
}

/**
 * Generates an A4 PDF from a DOM element using html-to-image, with html2canvas fallback.
 */
export const generatePDFFromElement = async (
  elementId: string,
  customFilename?: string
): Promise<GeneratePDFResult> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`العنصر المطلوبة طباعته (${elementId}) غير موجود في الصفحة.`);
  }

  let dataUrl = '';

  // Method 1: html-to-image (fast, native SVG foreignObject, works with Tailwind v4 & oklch)
  try {
    dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
      filter: (node) => {
        // Exclude elements with class 'no-print'
        if (node instanceof HTMLElement && node.classList.contains('no-print')) {
          return false;
        }
        return true;
      },
    });
  } catch (err1) {
    console.warn('html-to-image failed, attempting html2canvas fallback...', err1);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      dataUrl = canvas.toDataURL('image/png');
    } catch (err2) {
      console.error('html2canvas also failed:', err2);
      throw new Error('تعذر تحويل الفاتورة إلى صورة PDF. يرجى إعادة المحاولة.');
    }
  }

  if (!dataUrl || dataUrl === 'data:,') {
    throw new Error('لم يتم توليد صورة الفاتورة بشكل صحيح.');
  }

  // Load image to get width and height
  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('فشل تحميل صورة الفاتورة المحولة.'));
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
  const pdfHeight = (img.height * pdfWidth) / img.width;

  pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

  const filename = customFilename || `document.pdf`;
  const pdfBlob = pdf.output('blob');

  return { pdf, pdfBlob, filename };
};

/**
 * Triggers PDF download for an element.
 */
export const downloadInvoicePDF = async (
  elementId: string,
  filename: string
): Promise<void> => {
  const { pdf, filename: finalFilename } = await generatePDFFromElement(elementId, filename);
  pdf.save(finalFilename);
};

/**
 * Generates PDF invoice and shares via Web Share API or downloads PDF + opens WhatsApp.
 */
export const shareInvoiceViaWhatsApp = async ({
  invoice,
  phone,
  elementId,
  getWhatsAppShareUrl,
}: {
  invoice: SaleInvoice;
  phone: string;
  elementId: string;
  getWhatsAppShareUrl: (phone: string, textMessage: string) => string;
}): Promise<{ sharedViaNative: boolean }> => {
  const cleanInvoiceNum = invoice.invoiceNumber.replace(/[^a-zA-Z0-9-]/g, '_');
  const filename = `فاتورة_${cleanInvoiceNum}.pdf`;

  // Items summary for text message
  const itemsSummary = invoice.items
    .map((it) => `• ${it.productName} (${it.quantity} ${it.unitLabel}) = ${it.total.toLocaleString('ar-EG')} ج.م`)
    .join('\n');

  const textMessage = `🧾 *فاتورة مبيعات - مؤسسة الدخان والسجائر ERP*
رقم الفاتورة: *${invoice.invoiceNumber}*
التاريخ: ${invoice.date}
العميل: *${invoice.customerName}*
--------------------------------
*الأصناف المباعة:*
${itemsSummary}
--------------------------------
المجموع الصافي: *${invoice.finalAmount.toLocaleString('ar-EG')} ج.م*
المبلغ المدفوع: *${invoice.paidAmount.toLocaleString('ar-EG')} ج.م*
المتبقي الآجل: *${invoice.remainingAmount.toLocaleString('ar-EG')} ج.م*
--------------------------------
📄 *تنبيه:* تم إنشاء فاتورة بصيغة PDF وسوف يتم تنزيلها باسم (*${filename}*). يرجى إرفاق الملف للعميل عبر الواتساب.`;

  let pdfGenerated = false;

  try {
    // Generate PDF
    const { pdf, pdfBlob } = await generatePDFFromElement(elementId, filename);
    pdfGenerated = true;

    const file = new File([pdfBlob], filename, { type: 'application/pdf' });

    // Try Web Share API if supported (Mobile devices)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `فاتورة ${invoice.invoiceNumber}`,
          text: textMessage,
          files: [file],
        });
        return { sharedViaNative: true };
      } catch (err) {
        console.warn('Native share cancelled or failed, falling back to download + WhatsApp link.', err);
      }
    }

    // Trigger PDF download locally
    pdf.save(filename);
  } catch (pdfErr) {
    console.error('Failed to generate PDF for invoice, opening WhatsApp text fallback:', pdfErr);
  }

  // Open WhatsApp Web with text message
  const whatsappUrl = getWhatsAppShareUrl(phone, textMessage);
  window.open(whatsappUrl, '_blank');

  return { sharedViaNative: false };
};

/**
 * Generates Customer Statement PDF and shares via WhatsApp or downloads + opens WhatsApp.
 */
export const shareCustomerStatementViaWhatsApp = async ({
  customerName,
  phone,
  balance,
  totalPurchases,
  elementId,
  getWhatsAppShareUrl,
}: {
  customerName: string;
  phone: string;
  balance: number;
  totalPurchases: number;
  elementId: string;
  getWhatsAppShareUrl: (phone: string, textMessage: string) => string;
}): Promise<{ sharedViaNative: boolean }> => {
  const cleanName = customerName.replace(/\s+/g, '_');
  const filename = `كشف_حساب_${cleanName}.pdf`;

  const textMessage = `📊 *كشف حساب عميل - مؤسسة الدخان والسجائر ERP*
اسم العميل: *${customerName}*
رقم الهاتف: ${phone}
تاريخ كشف الحساب: ${new Date().toLocaleDateString('ar-EG')}
--------------------------------
إجمالي المشتريات: *${totalPurchases.toLocaleString('ar-EG')} ج.م*
الرصيد المتبقي المستحق حالياً: *${balance.toLocaleString('ar-EG')} ج.م*
--------------------------------
📄 *تنبيه:* تم إنشاء كشف الحساب بصيغة PDF وسوف يتم تنزيله باسم (*${filename}*). يرجى إرفاق ملف الـ PDF للعميل.`;

  try {
    const { pdf, pdfBlob } = await generatePDFFromElement(elementId, filename);
    const file = new File([pdfBlob], filename, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `كشف حساب - ${customerName}`,
          text: textMessage,
          files: [file],
        });
        return { sharedViaNative: true };
      } catch (err) {
        console.warn('Native share cancelled or failed, falling back to download + WhatsApp link.', err);
      }
    }

    pdf.save(filename);
  } catch (pdfErr) {
    console.error('Failed to generate PDF statement, opening WhatsApp text fallback:', pdfErr);
  }

  const whatsappUrl = getWhatsAppShareUrl(phone, textMessage);
  window.open(whatsappUrl, '_blank');

  return { sharedViaNative: false };
};

/**
 * Generates and downloads a high resolution PNG image from a DOM element.
 */
export const downloadInvoiceImage = async (
  elementId: string,
  customFilename: string = 'invoice.png'
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('العنصر المطلوب غير موجود.');

  let dataUrl = '';
  try {
    dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
      filter: (node) => !(node instanceof HTMLElement && node.classList.contains('no-print')),
    });
  } catch (err) {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    dataUrl = canvas.toDataURL('image/png');
  }

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = customFilename;
  link.click();
};
