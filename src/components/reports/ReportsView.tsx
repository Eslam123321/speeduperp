import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  FileSpreadsheet,
  Printer,
  ShieldAlert,
  Wallet,
  Boxes,
  Users,
  Receipt,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { SaleInvoice } from '../../types';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export const ReportsView: React.FC = () => {
  const {
    sales,
    products,
    customers,
    suppliers,
    expenses,
    representatives,
    currentUser,
    deleteSaleInvoice,
    setPrintingInvoice,
    resetRepCash,
    initialCapitalCash,
    netTotalCapital,
    inventoryCostCapital,
    inventoryWholesaleCapital,
  } = useERP();
  const [activeTab, setActiveTab] = useState<'executive' | 'invoices' | 'customers' | 'expenses'>('executive');
  const [invoiceToDelete, setInvoiceToDelete] = useState<SaleInvoice | null>(null);

  if (currentUser.role !== 'admin') {
    return (
      <div className="glass-panel p-8 text-center space-y-3 max-w-md mx-auto my-12">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-extrabold text-white">عفواً، هذه الصفحة مقتصرة على المدير العام</h2>
        <p className="text-xs text-slate-400">تقارير صافي الأرباح، تقرير "إداني دايماً"، ورأس المال محجوبة عن الكاشير والمندوب لضمان السرية.</p>
      </div>
    );
  }

  const handleConfirmDeleteInvoice = () => {
    if (invoiceToDelete) {
      deleteSaleInvoice(invoiceToDelete.id);
      setInvoiceToDelete(null);
    }
  };

  // 1. Executive Metrics ("تقرير إداني دايماً")
  const totalReceivablesInMarket = customers.reduce((acc, c) => acc + Math.max(0, c.balance), 0);
  const stockValuationCost = products.reduce((acc, p) => acc + (p.currentStockPacks * p.costPricePerPack), 0);
  const stockValuationWholesale = products.reduce((acc, p) => acc + (p.currentStockPacks * p.wholesalePricePerPack), 0);

  const totalCashWithReps = representatives.reduce((acc, r) => acc + r.cashOnHand, 0);
  const totalCashCollectedFromSales = sales.reduce((acc, s) => acc + s.paidAmount, 0);
  const totalExpensesAmount = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalNetCashInSafe = Math.max(0, totalCashCollectedFromSales - totalExpensesAmount);
  const grandTotalCashOnHand = totalNetCashInSafe + totalCashWithReps;

  // Sales & Profits Metrics
  const totalSalesCount = sales.length;
  const totalRevenue = sales.reduce((acc, s) => acc + s.finalAmount, 0);
  const totalCost = sales.reduce((acc, s) => acc + s.totalCost, 0);
  const grossProfit = sales.reduce((acc, s) => acc + s.netProfit, 0);
  const realNetProfit = grossProfit;

  // Today's Sales Filter
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter((s) => s.date.includes(todayStr) || s.date.startsWith(todayStr));
  const todayRevenue = todaySales.reduce((acc, s) => acc + s.finalAmount, 0);

  return (
    <div id="printable-report-area" className="space-y-6 animate-fadeIn pb-12">
      {/* Print Only Header */}
      <div className="hidden print:block text-center border-b border-slate-300 pb-4 mb-4">
        <h1 className="text-xl font-black text-slate-900">مؤسسة الدخان والسجائر ERP - التقرير المالي الشامل</h1>
        <p className="text-xs text-slate-600 font-medium mt-1">
          تاريخ الاستخراج: {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-amber-400" />
            <span>التقارير المالية وتقرير "إداني دايماً" الشامل</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            متابعة فلوسك بالسوق، قيمة بضاعتك بالمخزن، الفلوس الجاهزة معك، والأرباح الصافية الحقيقية بعد المصاريف.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="no-print flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة التقرير الشامل</span>
        </button>
      </div>

      {/* EXECUTIVE MANDATORY STATEMENT CARD ("تقرير إداني دايماً") */}
      <div className="glass-panel p-6 border-amber-500/40 bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/20 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
            <Wallet className="w-6 h-6" />
            <span>تقرير "إداني دايماً" (ملخص الموقف المالي للنشاط)</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">تحديث فوري مباشر</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: ليا كام في السوق */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-300 font-bold">1. ليا كام في السوق (ديون العملاء)</span>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-purple-400">
              {totalReceivablesInMarket.toLocaleString('ar-EG')} <span className="text-xs font-semibold">ج.م</span>
            </p>
            <p className="text-[11px] text-slate-400">مجموع المستحقات والديون على محلات التجزئة والتجار.</p>
          </div>

          {/* Card 2: معايا بضاعة بكام */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-300 font-bold">2. معايا بضاعة بكام (تقييم المخزن)</span>
              <Boxes className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-black text-blue-400">
              {stockValuationCost.toLocaleString('ar-EG')} <span className="text-xs font-semibold">ج.م (تكلفة)</span>
            </p>
            <p className="text-[11px] text-blue-300">
              قيمة البيع للجملة المتوقعة: <strong className="font-bold">{stockValuationWholesale.toLocaleString('ar-EG')} ج.م</strong>
            </p>
          </div>

          {/* Card 3: معايا فلوس كام */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-300 font-bold">3. معايا فلوس كام (نقدية متوفرة)</span>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-black text-emerald-400">
                {grandTotalCashOnHand.toLocaleString('ar-EG')} <span className="text-xs font-semibold">ج.م</span>
              </p>
              {totalCashWithReps > 0 && currentUser.role === 'admin' && (
                <button
                  onClick={() => {
                    if (window.confirm('هل تريد تصفير المبلغ المتبقي مع المندوبين؟')) {
                      resetRepCash();
                    }
                  }}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition-colors font-bold cursor-pointer"
                  title="تصفير المبلغ المتبقي مع المندوبين"
                >
                  تصفير عهدة المندوبين 🔄
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              (الخزينة الرئيسية: {totalNetCashInSafe.toLocaleString('ar-EG')} ج.م + مع المندوبين: {totalCashWithReps.toLocaleString('ar-EG')} ج.م)
            </p>
          </div>
        </div>
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 space-y-1 border-emerald-500/30">
          <span className="text-xs text-slate-400 font-semibold">الربح الصافي الحقيقي</span>
          <p className="text-2xl font-black text-emerald-400">
            {realNetProfit.toLocaleString('ar-EG')} <span className="text-xs font-normal">ج.م</span>
          </p>
          <p className="text-[11px] text-emerald-500">إجمالي صافي أرباح الفواتير (سعر البيع - سعر الشراء)</p>
        </div>

        <div className="glass-panel p-4 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">مبيعات اليوم</span>
          <p className="text-2xl font-black text-amber-400">
            {todayRevenue.toLocaleString('ar-EG')} <span className="text-xs font-normal">ج.م</span>
          </p>
          <p className="text-[11px] text-slate-400">عدد عمليات اليوم: {todaySales.length}</p>
        </div>

        <div className="glass-panel p-4 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">إجمالي إيرادات المبيعات</span>
          <p className="text-2xl font-black text-white">
            {totalRevenue.toLocaleString('ar-EG')} <span className="text-xs font-normal">ج.م</span>
          </p>
          <p className="text-[11px] text-slate-400">من {totalSalesCount} عمليات بيع</p>
        </div>
      </div>

      {/* Tabs Switcher for Detailed Reports */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 no-print">
        {[
          { id: 'executive', label: 'تقرير الأرباح والمبيعات' },
          { id: 'invoices', label: 'سجل فواتير المبيعات' },
          { id: 'customers', label: 'مشتريات وديون العملاء والإنذارات' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Executive Profits */}
      {activeTab === 'executive' && (
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <span>تحليل هامش ربح الفواتير والتكاليف</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">الفاتورة</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">العميل</th>
                  <th className="p-3">التكلفة الفعلية</th>
                  <th className="p-3">إجمالي البيع</th>
                  <th className="p-3">الربح الصافي</th>
                  <th className="p-3">المندوب/البائع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    onClick={() => setPrintingInvoice(sale)}
                    className="hover:bg-slate-800/80 cursor-pointer transition-colors"
                    title="انقر لفتح الفاتورة بالمشتملات التفصيلية"
                  >
                    <td className="p-3 font-bold text-amber-400 font-mono underline flex items-center gap-1">
                      <span>{sale.invoiceNumber}</span>
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded border border-amber-500/30">معاينة 🔍</span>
                    </td>
                    <td className="p-3 text-slate-400">{sale.date}</td>
                    <td className="p-3 text-slate-200 font-semibold">{sale.customerName}</td>
                    <td className="p-3 text-slate-400">{sale.totalCost.toLocaleString('ar-EG')} ج.م</td>
                    <td className="p-3 font-bold text-amber-400">{sale.finalAmount.toLocaleString('ar-EG')} ج.م</td>
                    <td className="p-3 font-extrabold text-emerald-400">{sale.netProfit.toLocaleString('ar-EG')} ج.م</td>
                    <td className="p-3 text-slate-400">{sale.representativeName || sale.createdByName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Invoices Log */}
      {activeTab === 'invoices' && (
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <span>سجل الفواتير الصادرة بالكامل</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">الفاتورة</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">العميل</th>
                  <th className="p-3">عدد الأصناف</th>
                  <th className="p-3">الإجمالي</th>
                  <th className="p-3">المدفوع</th>
                  <th className="p-3">المتبقي</th>
                  <th className="p-3">طريقة الدفع</th>
                  <th className="p-3 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white font-mono">{sale.invoiceNumber}</td>
                    <td className="p-3 text-slate-400">{sale.date}</td>
                    <td className="p-3 text-slate-200 font-semibold">{sale.customerName}</td>
                    <td className="p-3 text-slate-400">{sale.items.length} أصناف</td>
                    <td className="p-3 font-bold text-amber-400">{sale.finalAmount.toLocaleString('ar-EG')} ج.م</td>
                    <td className="p-3 text-emerald-400">{sale.paidAmount.toLocaleString('ar-EG')} ج.م</td>
                    <td className="p-3 text-red-400 font-bold">{sale.remainingAmount.toLocaleString('ar-EG')} ج.م</td>
                    <td className="p-3 text-slate-300">
                      {sale.paymentMethod === 'cash' ? 'كاش' : sale.paymentMethod === 'credit' ? 'آجل' : 'جزئي'}
                    </td>
                    <td className="p-3 text-center flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setPrintingInvoice(sale)}
                        className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 transition-colors cursor-pointer"
                        title="معاينة الفاتورة / طباعة / إرسال PDF"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setInvoiceToDelete(sale)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-red-400 border border-slate-700 transition-colors cursor-pointer"
                        title="إلغاء وحذف الفاتورة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Customer Debts & Purchasing Report */}
      {activeTab === 'customers' && (
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>تقرير مشتريات وتأخيرات سداد العملاء</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">اسم العميل/المحل</th>
                  <th className="p-3">الهاتف</th>
                  <th className="p-3">إجمالي مشترياته</th>
                  <th className="p-3">الرصيد المتبقي (الديون)</th>
                  <th className="p-3">حالة المديونية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {customers.map((cust) => {
                  const custInvoices = sales.filter((s) => s.customerId === cust.id);
                  const totalPurchased = custInvoices.reduce((acc, s) => acc + s.finalAmount, 0);

                  return (
                    <tr key={cust.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white">{cust.name}</td>
                      <td className="p-3 font-mono text-slate-400">{cust.phone}</td>
                      <td className="p-3 font-bold text-amber-400">{totalPurchased.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-3 font-black text-red-400">{cust.balance.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-3">
                        {cust.balance > 0 ? (
                          <span className="px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-bold">
                            مدين (عليه ديون)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            خالي الديون
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Expenses Log */}
      {activeTab === 'expenses' && (
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <span>تفاصيل المصاريف التشغيلية الخصمية</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">بيان المصروف</th>
                  <th className="p-3">الفئة</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">المبلغ</th>
                  <th className="p-3">الملاحظات</th>
                  <th className="p-3">المسجل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white">{exp.title}</td>
                    <td className="p-3 text-slate-400">{exp.category}</td>
                    <td className="p-3 text-slate-400 font-mono">{exp.date}</td>
                    <td className="p-3 font-extrabold text-red-400">{exp.amount.toLocaleString('ar-EG')} ج.م</td>
                    <td className="p-3 text-slate-400">{exp.notes || '-'}</td>
                    <td className="p-3 text-slate-300">{exp.createdByName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Sale Invoice Deletion */}
      <ConfirmDeleteModal
        isOpen={Boolean(invoiceToDelete)}
        title="تأكيد إلغاء وحذف الفاتورة"
        message={`هل أنت تأكد من رغبتك في إلغاء وحذف الفاتورة رقم (${invoiceToDelete?.invoiceNumber} بقيمة ${invoiceToDelete?.finalAmount} ج.م)؟`}
        confirmText="نعم، إلغاء وحذف الفاتورة الآن"
        onConfirm={handleConfirmDeleteInvoice}
        onCancel={() => setInvoiceToDelete(null)}
      />
    </div>
  );
};
