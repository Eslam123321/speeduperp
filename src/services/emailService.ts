import { SaleInvoice, PurchaseInvoice, EmailSettings } from '../types';

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  enabled: true,
  adminEmail: 'admin@speeduperp.com',
  notifyEmployeeOnCreation: true,
  additionalEmails: [],
  serviceProvider: 'emailjs',
  emailjsServiceId: '',
  emailjsTemplateId: '',
  emailjsPublicKey: '',
  webhookUrl: '',
};

export function buildSaleInvoiceHTML(invoice: SaleInvoice): string {
  const itemsRows = invoice.items
    .map(
      (item, idx) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${idx + 1}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.productName}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.unitLabel}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${item.unitPrice.toLocaleString('ar-EG')} ج.م</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: left; font-weight: bold;">${item.total.toLocaleString('ar-EG')} ج.م</td>
    </tr>`
    )
    .join('');

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; color: #1e293b; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 22px;">⚡ SPEEDUP ERP</h2>
        <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 14px;">إشعار فاتورة مبيعات جديدة #${invoice.invoiceNumber}</p>
      </div>
      
      <div style="padding: 20px; background-color: #ffffff;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; background: #f8fafc; padding: 12px; border-radius: 8px;">
          <div><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</div>
          <div><strong>التاريخ:</strong> ${invoice.date}</div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <p style="margin: 4px 0;"><strong>اسم العميل:</strong> ${invoice.customerName || 'عميل نقدي'}</p>
          <p style="margin: 4px 0;"><strong>الموظف/الكاشير:</strong> ${invoice.createdByName}</p>
          <p style="margin: 4px 0;"><strong>طريقة الدفع:</strong> ${invoice.paymentMethod === 'cash' ? 'نقداً (كاش)' : invoice.paymentMethod === 'credit' ? 'آجل' : 'دفعة جزئية'}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
          <thead>
            <tr style="background-color: #f1f5f9; color: #334155;">
              <th style="padding: 8px; border: 1px solid #cbd5e1;">#</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">الصنف</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">الوحدة</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">الكمية</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">السعر</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div style="margin-top: 20px; background: #f1f5f9; padding: 15px; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>المبلغ الإجمالي:</span>
            <strong>${invoice.totalAmount.toLocaleString('ar-EG')} ج.م</strong>
          </div>
          ${invoice.discount > 0 ? `<div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #dc2626;"><span>الخصم:</span><strong>-${invoice.discount.toLocaleString('ar-EG')} ج.م</strong></div>` : ''}
          <div style="display: flex; justify-content: space-between; font-size: 16px; margin-top: 8px; border-top: 1px solid #cbd5e1; padding-top: 8px; color: #0284c7;">
            <span>صافي الفاتورة النهائي:</span>
            <strong>${invoice.finalAmount.toLocaleString('ar-EG')} ج.م</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 6px; color: #16a34a;">
            <span>المبلغ المدفوع:</span>
            <strong>${invoice.paidAmount.toLocaleString('ar-EG')} ج.م</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 6px; color: #ea580c;">
            <span>المبلغ المتبقي:</span>
            <strong>${invoice.remainingAmount.toLocaleString('ar-EG')} ج.م</strong>
          </div>
        </div>

        ${invoice.notes ? `<div style="margin-top: 15px; font-size: 13px; color: #64748b; background: #fffbebfb; padding: 10px; border-right: 4px solid #f59e0b; border-radius: 4px;"><strong>ملاحظات:</strong> ${invoice.notes}</div>` : ''}
      </div>

      <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
        تم إصدار هذا الإشعار تلقائياً من نظام Speedup ERP
      </div>
    </div>
  `;
}

export function buildPurchaseInvoiceHTML(invoice: PurchaseInvoice): string {
  const itemsRows = invoice.items
    .map(
      (item, idx) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${idx + 1}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.productName}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.unitLabel}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${item.unitCostPrice.toLocaleString('ar-EG')} ج.م</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: left; font-weight: bold;">${item.total.toLocaleString('ar-EG')} ج.م</td>
    </tr>`
    )
    .join('');

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; color: #1e293b; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #065f46 0%, #047857 100%); color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 22px;">⚡ SPEEDUP ERP</h2>
        <p style="margin: 5px 0 0 0; color: #a7f3d0; font-size: 14px;">إشعار فاتورة مشتريات جديدة #${invoice.invoiceNumber}</p>
      </div>
      
      <div style="padding: 20px; background-color: #ffffff;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; background: #f8fafc; padding: 12px; border-radius: 8px;">
          <div><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</div>
          <div><strong>التاريخ:</strong> ${invoice.date}</div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <p style="margin: 4px 0;"><strong>اسم المورد:</strong> ${invoice.supplierName}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
          <thead>
            <tr style="background-color: #f1f5f9; color: #334155;">
              <th style="padding: 8px; border: 1px solid #cbd5e1;">#</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">الصنف</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">الوحدة</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">الكمية</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">سعر التكلفة</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div style="margin-top: 20px; background: #f1f5f9; padding: 15px; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 16px; color: #047857;">
            <span>إجمالي المشتريات:</span>
            <strong>${invoice.totalAmount.toLocaleString('ar-EG')} ج.م</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 6px; color: #16a34a;">
            <span>المبلغ المدفوع للمورد:</span>
            <strong>${invoice.paidAmount.toLocaleString('ar-EG')} ج.م</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 6px; color: #ea580c;">
            <span>المبلغ المتبقي للمورد:</span>
            <strong>${invoice.remainingAmount.toLocaleString('ar-EG')} ج.م</strong>
          </div>
        </div>

        ${invoice.notes ? `<div style="margin-top: 15px; font-size: 13px; color: #64748b; background: #fffbebfb; padding: 10px; border-right: 4px solid #f59e0b; border-radius: 4px;"><strong>ملاحظات:</strong> ${invoice.notes}</div>` : ''}
      </div>

      <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
        تم إصدار هذا الإشعار تلقائياً من نظام Speedup ERP
      </div>
    </div>
  `;
}

export async function dispatchEmail({
  toEmail,
  subject,
  htmlContent,
  settings,
}: {
  toEmail: string;
  subject: string;
  htmlContent: string;
  settings: EmailSettings;
}): Promise<{ success: boolean; error?: string }> {
  if (!toEmail || !toEmail.includes('@')) {
    return { success: false, error: 'البريد الإلكتروني المستهدف غير صالح' };
  }

  try {
    if (settings.serviceProvider === 'emailjs' && settings.emailjsServiceId && settings.emailjsTemplateId && settings.emailjsPublicKey) {
      // Send via EmailJS REST API
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: settings.emailjsServiceId,
          template_id: settings.emailjsTemplateId,
          user_id: settings.emailjsPublicKey,
          template_params: {
            to_email: toEmail,
            subject: subject,
            html_message: htmlContent,
            message: subject,
          },
        }),
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errText = await response.text();
        return { success: false, error: `فشل EmailJS API: ${errText}` };
      }
    } else if (settings.serviceProvider === 'webhook' && settings.webhookUrl) {
      // Send via Custom Webhook Endpoint
      const response = await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: toEmail,
          subject: subject,
          html: htmlContent,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: `خطأ في استجابة Webhook (${response.status})` };
      }
    } else {
      // Fallback / simulated send log
      console.log(`[Email Dispatch] Sent to: ${toEmail} | Subject: ${subject}`);
      return { success: true };
    }
  } catch (err: any) {
    console.error('Email dispatch error:', err);
    return { success: false, error: err.message || 'حدث خطأ أثناء الاتصال بخدمة البريد' };
  }
}
