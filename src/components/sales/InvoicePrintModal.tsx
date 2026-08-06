import React, { useState } from 'react';
import { Printer, X, CheckCircle2, Cigarette, MessageSquareShare, Download, Loader2, Image as ImageIcon, Mail } from 'lucide-react';
import { SaleInvoice } from '../../types';
import { useERP } from '../../context/ERPContext';
import { downloadInvoicePDF, shareInvoiceViaWhatsApp, shareInvoiceImageViaWhatsApp, downloadInvoiceImage } from '../../utils/pdfGenerator';

interface InvoicePrintModalProps {
  invoice: SaleInvoice | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ invoice, onClose }) => {
  const { customers, getWhatsAppShareUrl, confirmSaleInvoice, cancelDraftInvoice, sendInvoiceEmailNotification } = useERP();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{ success?: boolean; text?: string }>({});

  if (!invoice) return null;

  const handlePrint = () => {
    if (invoice.isDraft) {
      confirmSaleInvoice(invoice);
    }
    window.print();
  };

  const ensureInvoiceSaved = (): SaleInvoice => {
    if (invoice.isDraft) {
      return confirmSaleInvoice(invoice);
    }
    return invoice;
  };

  const handleSendEmail = async () => {
    try {
      setIsSendingEmail(true);
      setEmailFeedback({});
      const activeInvoice = ensureInvoiceSaved();
      const res = await sendInvoiceEmailNotification(activeInvoice, 'sale');
      setEmailFeedback({ success: res.success, text: res.message });
      setTimeout(() => setEmailFeedback({}), 4000);
    } catch (err: any) {
      console.error('Email send error:', err);
      setEmailFeedback({ success: false, text: 'حدث خطأ أثناء إرسال البريد.' });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleWhatsAppSend = async () => {
    try {
      setIsGeneratingPDF(true);
      const activeInvoice = ensureInvoiceSaved();
      const customer = customers.find((c) => c.id === activeInvoice.customerId);
      const phone = customer ? customer.phone : '';

      await shareInvoiceViaWhatsApp({
        invoice: activeInvoice,
        phone,
        elementId: 'printable-invoice-area',
        getWhatsAppShareUrl,
      });
    } catch (err) {
      console.error('Error sharing PDF via WhatsApp:', err);
      alert('حدث خطأ أثناء تحضير ملف PDF للفاتورة.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleWhatsAppImageSend = async () => {
    try {
      setIsGeneratingPDF(true);
      const activeInvoice = ensureInvoiceSaved();
      const customer = customers.find((c) => c.id === activeInvoice.customerId);
      const phone = customer ? customer.phone : '';

      await shareInvoiceImageViaWhatsApp({
        invoice: activeInvoice,
        phone,
        elementId: 'printable-invoice-area',
        getWhatsAppShareUrl,
      });
    } catch (err) {
      console.error('Error sharing Image via WhatsApp:', err);
      alert('حدث خطأ أثناء تحضير صورة الفاتورة للواتساب.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      const activeInvoice = ensureInvoiceSaved();
      const cleanInvoiceNum = activeInvoice.invoiceNumber.replace(/[^a-zA-Z0-9-]/g, '_');
      await downloadInvoicePDF('printable-invoice-area', `فاتورة_${cleanInvoiceNum}.pdf`);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('حدث خطأ أثناء تنزيل ملف PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadImage = async () => {
    try {
      setIsGeneratingPDF(true);
      const activeInvoice = ensureInvoiceSaved();
      const cleanInvoiceNum = activeInvoice.invoiceNumber.replace(/[^a-zA-Z0-9-]/g, '_');
      await downloadInvoiceImage('printable-invoice-area', `فاتورة_${cleanInvoiceNum}.png`);
    } catch (err) {
      console.error('Error downloading Image:', err);
      alert('حدث خطأ أثناء استخراج الفاتورة كصورة.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleConfirmInvoice = () => {
    if (invoice.isDraft) {
      confirmSaleInvoice(invoice);
    } else {
      onClose();
    }
  };

  const handleCloseOrCancel = () => {
    if (invoice.isDraft) {
      cancelDraftInvoice();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 animate-scaleUp no-print-modal">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 no-print">
          <div className="flex items-center gap-2">
            {invoice.isDraft ? (
              <CheckCircle2 className="w-6 h-6 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            )}
            <div>
              <h2 className="text-base font-extrabold text-white">
                {invoice.isDraft ? 'معاينة ومراجعة الفاتورة قبل الإتمام' : 'تم حفظ وإتمام الفاتورة بنجاح'}
              </h2>
              <p className={`text-xs ${invoice.isDraft ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                {invoice.isDraft
                  ? 'الفاتورة لم تُسجل بعد - اضغط "إتمام الفاتورة" للتأكيد والحفظ'
                  : `فاتورة رقم: ${invoice.invoiceNumber}`}
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseOrCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Area */}
        <div id="printable-invoice-area" className="bg-white text-slate-950 p-6 rounded-xl shadow-inner font-sans border">
          {/* Header Store Info */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Cigarette className="w-6 h-6 text-amber-600" />
              <h1 className="text-xl font-black text-slate-900">مؤسسة الدخان والسجائر ERP</h1>
            </div>
            <p className="text-xs text-slate-600 font-medium">تجارة الجملة والتجزئة • سجائر محلية ومستوردة</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">س.ت: 104928 • هاتف: 01012345678</p>
          </div>

          {/* Invoice Metadata */}
          <div className="grid grid-cols-2 gap-2 text-xs py-3 border-b border-dashed border-slate-300 font-medium">
            <div>
              <span className="text-slate-500 block">رقم الفاتورة:</span>
              <strong className="text-slate-900 font-mono text-sm">{invoice.invoiceNumber}</strong>
            </div>
            <div className="text-left">
              <span className="text-slate-500 block">التاريخ والوقت:</span>
              <strong className="text-slate-900">{invoice.date}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">اسم العميل/التاجر:</span>
              <strong className="text-slate-900">{invoice.customerName}</strong>
            </div>
            <div className="text-left">
              <span className="text-slate-500 block">طريقة الدفع:</span>
              <strong className="text-amber-700 font-bold">
                {invoice.paymentMethod === 'cash' ? 'نقدي (كاش)' : invoice.paymentMethod === 'credit' ? 'آجل' : 'دفعة جزئية'}
              </strong>
            </div>
            {invoice.representativeName && (
              <div className="col-span-2 text-right pt-1 border-t border-slate-100">
                <span className="text-slate-500 text-[11px]">المندوب/السائق المسلم: </span>
                <strong className="text-slate-800 text-[11px]">{invoice.representativeName}</strong>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-3">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold text-[11px]">
                  <th className="pb-1.5">الصنف</th>
                  <th className="pb-1.5">الوحدة</th>
                  <th className="pb-1.5">الكمية</th>
                  <th className="pb-1.5">السعر</th>
                  <th className="pb-1.5 text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => {
                  const effectiveUnitPrice = item.quantity > 0 ? (item.total / item.quantity) : item.unitPrice;
                  return (
                    <tr key={idx} className="text-slate-800">
                      <td className="py-2 font-semibold text-slate-900">{item.productName}</td>
                      <td className="py-2 text-slate-600">{item.unitLabel}</td>
                      <td className="py-2 font-bold font-mono">{item.quantity}</td>
                      <td className="py-2 font-mono">{effectiveUnitPrice.toLocaleString('ar-EG')}</td>
                      <td className="py-2 text-left font-extrabold font-mono text-slate-900">
                        {item.total.toLocaleString('ar-EG')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs font-semibold">
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-between text-slate-900">
              <span>إجمالي عدد الأصناف بالفاتورة:</span>
              <strong className="text-amber-900 font-extrabold text-sm">
                {invoice.items.length} صنف ({invoice.items.reduce((acc, it) => acc + (it.unit === 'box' ? (it.packsQuantity / 500) : it.unit === 'carton' ? (it.packsQuantity / 10) : it.quantity), 0)} {invoice.items[0]?.unitLabel || 'وحدة'})
              </strong>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>المجموع قبل الخصم:</span>
              <span>{invoice.totalAmount.toLocaleString('ar-EG')} ج.م</span>
            </div>

            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>الخصم الممنوح:</span>
                <span>-{invoice.discount.toLocaleString('ar-EG')} ج.م</span>
              </div>
            )}

            <div className="flex justify-between text-slate-900 text-sm font-black border-t border-slate-200 pt-1">
              <span>إجمالي قيمة المشتريات:</span>
              <span className="text-amber-700">{invoice.finalAmount.toLocaleString('ar-EG')} ج.م</span>
            </div>

            <div className="flex justify-between text-slate-700 pt-1">
              <span>المبلغ المدفوع كاش:</span>
              <span className="font-bold text-emerald-700">{invoice.paidAmount.toLocaleString('ar-EG')} ج.م</span>
            </div>

            {invoice.remainingAmount > 0 && (
              <div className="flex justify-between text-red-600 font-bold border-t border-slate-200 pt-1">
                <span>المتبقي الآجل مستحق السداد:</span>
                <span>{invoice.remainingAmount.toLocaleString('ar-EG')} ج.م</span>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="text-center pt-4 mt-4 border-t border-dashed border-slate-300 text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">شكراً لتعاملكم معنا! البضاعة المباعة لا تُرد بعد الاستلام.</p>
            <p className="text-[10px] font-mono text-slate-400">البائع: {invoice.createdByName}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 no-print">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleWhatsAppSend}
              disabled={isGeneratingPDF}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-bold shadow-lg shadow-emerald-600/20 transition-all text-xs cursor-pointer"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageSquareShare className="w-4 h-4" />
              )}
              <span>إرسال PDF واتساب</span>
            </button>

            <button
              onClick={handleWhatsAppImageSend}
              disabled={isGeneratingPDF}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 text-slate-950 font-extrabold shadow-lg shadow-amber-600/20 transition-all text-xs cursor-pointer"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
              <span>إرسال صورة واتساب</span>
            </button>

            <button
              onClick={handleSendEmail}
              disabled={isSendingEmail || isGeneratingPDF}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 text-white font-bold shadow-lg shadow-cyan-600/20 transition-all text-xs cursor-pointer"
            >
              {isSendingEmail ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              <span>إرسال نسخة للإيميل</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-slate-200 hover:text-white font-semibold border border-slate-700 transition-all text-xs cursor-pointer"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-blue-400" />
              )}
              <span>تنزيل PDF</span>
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={isGeneratingPDF}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-slate-200 hover:text-white font-semibold border border-slate-700 transition-all text-xs cursor-pointer"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4 text-amber-400" />
              )}
              <span>تنزيل صورة</span>
            </button>
          </div>

          {emailFeedback.text && (
            <div className={`p-2.5 rounded-xl text-xs font-bold text-center ${emailFeedback.success ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {emailFeedback.text}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleCloseOrCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 cursor-pointer"
            >
              إغلاق
            </button>

            <button
              onClick={handleConfirmInvoice}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 transition-all text-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{invoice.isDraft ? 'إتمام الفاتورة' : 'تم الإتمام'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
