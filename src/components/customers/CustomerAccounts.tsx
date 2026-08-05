import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  DollarSign,
  Phone,
  MapPin,
  CreditCard,
  Receipt,
  FileText,
  CheckCircle2,
  AlertCircle,
  Printer,
  History,
  MessageSquareShare,
  AlertTriangle,
  Trash2,
  Download,
  Loader2,
  Cigarette,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Customer } from '../../types';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { downloadInvoicePDF, shareCustomerStatementViaWhatsApp } from '../../utils/pdfGenerator';

export const CustomerAccounts: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, recordCustomerPayment, sales, getWhatsAppShareUrl, currentUser, setPrintingInvoice } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [statementCustomer, setStatementCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: 'retail' as 'retail' | 'wholesale' | 'distributor',
    creditLimit: 50000,
    address: '',
    notes: '',
  });

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addCustomer(formData);
    setShowAddModal(false);
    setFormData({
      name: '',
      phone: '',
      type: 'retail',
      creditLimit: 50000,
      address: '',
      notes: '',
    });
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentCustomer || paymentAmount <= 0) return;

    recordCustomerPayment(paymentCustomer.id, paymentAmount, paymentNotes, selectedInvoiceId || undefined);
    setPaymentCustomer(null);
    setPaymentAmount(0);
    setPaymentNotes('');
    setSelectedInvoiceId('');
  };

  const handleConfirmDeleteCustomer = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
    }
  };

  const handleSendWhatsAppStatement = async (cust: Customer) => {
    try {
      setIsGeneratingPDF(true);
      if (!statementCustomer || statementCustomer.id !== cust.id) {
        setStatementCustomer(cust);
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      const custInvoices = sales.filter((s) => s.customerId === cust.id);
      const totalPurchased = custInvoices.reduce((acc, s) => acc + s.finalAmount, 0);

      await shareCustomerStatementViaWhatsApp({
        customerName: cust.name,
        phone: cust.phone,
        balance: cust.balance,
        totalPurchases: totalPurchased,
        elementId: 'printable-customer-statement-area',
        getWhatsAppShareUrl,
      });
    } catch (err) {
      console.error('Error generating PDF statement:', err);
      alert('حدث خطأ أثناء إنشاء كشف الحساب بصيغة PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadStatementPDF = async (cust: Customer) => {
    try {
      setIsGeneratingPDF(true);
      if (!statementCustomer || statementCustomer.id !== cust.id) {
        setStatementCustomer(cust);
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
      const cleanName = cust.name.replace(/\s+/g, '_');
      await downloadInvoicePDF('printable-customer-statement-area', `كشف_حساب_${cleanName}.pdf`);
    } catch (err) {
      console.error('Error downloading statement PDF:', err);
      alert('حدث خطأ أثناء تنزيل كشف الحساب بصيغة PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
    if (selectedFilter === 'all') return matchesQuery;
    if (selectedFilter === 'overdue') return matchesQuery && (c.balance > c.creditLimit || c.balance > 0);
    if (selectedFilter === 'retail') return matchesQuery && c.type === 'retail';
    if (selectedFilter === 'wholesale') return matchesQuery && c.type === 'wholesale';
    if (selectedFilter === 'distributor') return matchesQuery && c.type === 'distributor';
    return matchesQuery;
  });

  const totalDebts = customers.reduce((acc, c) => acc + Math.max(0, c.balance), 0);
  const overdueCount = customers.filter((c) => c.balance > c.creditLimit).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-amber-400" />
            <span>إدارة العملاء والديون وكشوف الحسابات</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            متابعة مشتريات ودفعات العملاء ("اشترى بـ X ودفع Y والمتبقي Z")، تنبيهات تأخير السداد، وإرسال كشوف الحساب واتساب.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-left px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <span className="text-xs text-purple-300 block">إجمالي الديون بالسوق:</span>
            <strong className="text-base text-purple-400 font-extrabold">{totalDebts.toLocaleString('ar-EG')} ج.م</strong>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة تاجر/عميل</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث السريع باسم العميل أو رقم الهاتف..."
            className="w-full pr-9 pl-4 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setSelectedFilter('all')}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
          >
            كافة العملاء
          </button>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          const custSales = sales.filter((s) => s.customerId === cust.id);
          const latestSaleTime = custSales.length > 0
            ? Math.max(...custSales.map((s) => new Date(s.date).getTime()))
            : 0;
          const diffDaysInactive = latestSaleTime > 0
            ? Math.floor((Date.now() - latestSaleTime) / (1000 * 3600 * 24))
            : 0;

          const totalPurchases = custSales.reduce((acc, s) => acc + s.finalAmount, 0);
          const totalPaid = custSales.reduce((acc, s) => acc + s.paidAmount, 0);

          return (
            <div
              key={cust.id}
              className="glass-panel glass-card-interactive p-5 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-base text-white">{cust.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-xs text-amber-400 font-semibold">
                        {cust.type === 'retail' ? 'محل تجزئة' : cust.type === 'wholesale' ? 'تاجر جملة' : 'موزع إقليمي'}
                      </span>
                      {diffDaysInactive >= 3 && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>متوقف عن الشراء منذ {diffDaysInactive} أيام</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-full font-bold border ${
                        cust.balance > 0
                          ? 'bg-red-500/15 text-red-400 border-red-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {cust.balance > 0 ? 'مدين (عليه ديون)' : 'خالي الديون'}
                    </span>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => setCustomerToDelete(cust)}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                        title="حذف العميل مع التأكيد"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{cust.phone}</span>
                  </div>
                  {cust.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cust.address}</span>
                    </div>
                  )}
                  {cust.lastPaymentDate && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <History className="w-3.5 h-3.5 text-emerald-400" />
                      <span>آخر دفعة مسددة: {cust.lastPaymentDate}</span>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
                    <div className="p-1 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">إجمالي مشترياته</span>
                      <strong className="text-amber-400">{totalPurchases.toLocaleString('ar-EG')}</strong>
                    </div>
                    <div className="p-1 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">المبلغ المدفوع</span>
                      <strong className="text-emerald-400">{totalPaid.toLocaleString('ar-EG')}</strong>
                    </div>
                    <div className="p-1 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">المتبقي الحالي</span>
                      <strong className="text-red-400">{cust.balance.toLocaleString('ar-EG')}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setPaymentCustomer(cust);
                    setSelectedInvoiceId('');
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/40 transition-colors"
                >
                  <Receipt className="w-4 h-4" />
                  <span>سند قبض</span>
                </button>

                <button
                  onClick={() => setStatementCustomer(cust)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>كشف حساب</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Customer */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>إضافة عميل / محل تجزئة جديد</span>
            </h2>

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">اسم العميل / المحل *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: سوبرماركت التقوى"
                  className="w-full px-3.5 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">رقم الهاتف *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01012345678"
                  className="w-full px-3.5 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">نوع التاجر</label>
                <select
                  value={formData.type}
                  onChange={(e: any) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                >
                  <option value="retail">تجزئة / كشك / محل صغير</option>
                  <option value="wholesale">تاجر جملة كبير</option>
                  <option value="distributor">موزع إقليمي</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">العنوان</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-600"
                >
                  حفظ العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Payment Receipt */}
      {paymentCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <span>تسجيل سند تحصيل / قبض: {paymentCustomer.name}</span>
            </h3>
            <p className="text-xs text-slate-400">
              الدين الحالي المستحق عليه: <strong className="text-red-400">{paymentCustomer.balance.toLocaleString('ar-EG')} ج.م</strong>
            </p>

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">اختر الفاتورة المراد سدادها *</label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    const invId = e.target.value;
                    setSelectedInvoiceId(invId);
                    if (invId) {
                      const inv = sales.find((s) => s.id === invId);
                      if (inv) setPaymentAmount(inv.remainingAmount);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                >
                  <option value="">-- سداد عام لمديونية الحساب الإجمالية --</option>
                  {sales
                    .filter((s) => s.customerId === paymentCustomer.id && s.remainingAmount > 0)
                    .map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        فاتورة رقم {inv.invoiceNumber} (بتاريخ {inv.date.split('T')[0]}) - متبقي {inv.remainingAmount.toLocaleString('ar-EG')} ج.م
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">المبلغ المحصل نقداً / تحويل (ج.م) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={paymentCustomer.balance || 9999999}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-extrabold text-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ملاحظات / رقم الإيصال أو الشيك</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="مثال: تحصيل كاش أو تحويل بنكي"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentCustomer(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                >
                  تأكيد سند القبض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statement Drawer Modal */}
      {statementCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-6 animate-scaleUp">
            {/* Modal Header Actions */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>كشف حساب عميل: {statementCustomer.name}</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">هاتف العميل: {statementCustomer.phone}</p>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                <button
                  onClick={() => handleSendWhatsAppStatement(statementCustomer)}
                  disabled={isGeneratingPDF}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageSquareShare className="w-4 h-4" />
                  )}
                  <span>إرسال PDF واتساب</span>
                </button>

                <button
                  onClick={() => handleDownloadStatementPDF(statementCustomer)}
                  disabled={isGeneratingPDF}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                  title="تحميل كشف الحساب بصيغة PDF"
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 text-blue-400" />
                  )}
                  <span>تحميل PDF</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة</span>
                </button>

                <button
                  onClick={() => setStatementCustomer(null)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>

            {/* Printable Statement Area (White theme for high-res PDF export) */}
            <div id="printable-customer-statement-area" className="bg-white text-slate-950 p-6 rounded-xl shadow-inner font-sans border space-y-4">
              {/* Store Header */}
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Cigarette className="w-6 h-6 text-amber-600" />
                  <h1 className="text-xl font-black text-slate-900">مؤسسة الدخان والسجائر ERP</h1>
                </div>
                <p className="text-xs text-slate-600 font-medium">كشف حساب مالي تفصيلي • تجارة السجائر والدخان</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">تاريخ التقرير: {new Date().toLocaleDateString('ar-EG')}</p>
              </div>

              {/* Customer Metadata Block */}
              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-b border-dashed border-slate-300 font-medium bg-slate-50 p-3 rounded-lg">
                <div>
                  <span className="text-slate-500 block">اسم العميل / المحل:</span>
                  <strong className="text-slate-900 text-sm font-extrabold">{statementCustomer.name}</strong>
                </div>
                <div className="text-left">
                  <span className="text-slate-500 block">رقم الهاتف:</span>
                  <strong className="text-slate-900 font-mono">{statementCustomer.phone}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">تصنيف العميل:</span>
                  <strong className="text-amber-700">
                    {statementCustomer.type === 'retail' ? 'تجزئة / كشك' : statementCustomer.type === 'wholesale' ? 'تاجر جملة' : 'موزع إقليمي'}
                  </strong>
                </div>
                <div className="text-left">
                  <span className="text-slate-500 block">حد الائتمان:</span>
                  <strong className="text-slate-900 font-mono">{statementCustomer.creditLimit.toLocaleString('ar-EG')} ج.م</strong>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-slate-600 block text-[11px]">إجمالي قيمة المشتريات</span>
                  <strong className="text-amber-800 text-sm font-black">
                    {sales
                      .filter((s) => s.customerId === statementCustomer.id)
                      .reduce((acc, s) => acc + s.finalAmount, 0)
                      .toLocaleString('ar-EG')}{' '}
                    ج.م
                  </strong>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-slate-600 block text-[11px]">إجمالي الدفعات المسددة</span>
                  <strong className="text-emerald-800 text-sm font-black">
                    {sales
                      .filter((s) => s.customerId === statementCustomer.id)
                      .reduce((acc, s) => acc + s.paidAmount, 0)
                      .toLocaleString('ar-EG')}{' '}
                    ج.م
                  </strong>
                </div>

                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200">
                  <span className="text-slate-600 block text-[11px]">الرصيد المتبقي المستحق</span>
                  <strong className="text-red-700 text-base font-black">
                    {statementCustomer.balance.toLocaleString('ar-EG')} ج.م
                  </strong>
                </div>
              </div>

              {/* Invoices Log Table */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">سجل فواتير ومعاملات العميل:</h4>
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-600 font-bold bg-slate-100">
                      <th className="p-2">رقم الفاتورة</th>
                      <th className="p-2 text-center">التاريخ</th>
                      <th className="p-2 text-center">الأصناف</th>
                      <th className="p-2 text-left">الإجمالي</th>
                      <th className="p-2 text-left">المدفوع</th>
                      <th className="p-2 text-left">المتبقي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sales.filter((s) => s.customerId === statementCustomer.id).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-slate-500">لا توجد فواتير آاجلة مسجلة لهذا العميل.</td>
                      </tr>
                    ) : (
                      sales
                        .filter((s) => s.customerId === statementCustomer.id)
                        .map((s) => (
                          <tr
                            key={s.id}
                            onClick={() => setPrintingInvoice(s)}
                            className="hover:bg-amber-50 cursor-pointer transition-colors"
                            title="انقر لفتح الفاتورة الكاملة والمشتملات"
                          >
                            <td className="p-2 font-bold font-mono text-amber-700 underline flex items-center gap-1">
                              <span>{s.invoiceNumber}</span>
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-sans">عرض 🔍</span>
                            </td>
                            <td className="p-2 text-center text-slate-600">{s.date}</td>
                            <td className="p-2 text-center text-slate-600">{s.items.length} أصناف</td>
                            <td className="p-2 text-left font-bold text-slate-900">{s.finalAmount.toLocaleString('ar-EG')} ج.م</td>
                            <td className="p-2 text-left text-emerald-700 font-semibold">{s.paidAmount.toLocaleString('ar-EG')} ج.م</td>
                            <td className="p-2 text-left text-red-600 font-bold">{s.remainingAmount.toLocaleString('ar-EG')} ج.م</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Statement Footer */}
              <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[11px] text-slate-500 space-y-0.5">
                <p className="font-semibold text-slate-700">برجاء سرعة مراجعة وحصر الديون وسداد الرصيد المستحق. شكراً لتعاملكم معنا!</p>
                <p className="text-[10px] font-mono text-slate-400">توقيع الـ ERP والمسؤول: {currentUser.name}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Customer Deletion */}
      <ConfirmDeleteModal
        isOpen={Boolean(customerToDelete)}
        title="تأكيد حذف بيانات العميل"
        message={`هل أنت تأكد من رغبتك في حذف العميل (${customerToDelete?.name}) نهائياً من النظام والدفاتر؟`}
        confirmText="نعم، حذف العميل الآن"
        onConfirm={handleConfirmDeleteCustomer}
        onCancel={() => setCustomerToDelete(null)}
      />
    </div>
  );
};
