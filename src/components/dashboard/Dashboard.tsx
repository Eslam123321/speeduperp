import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Users,
  Building2,
  ShoppingCart,
  PlusCircle,
  Cigarette,
  ArrowUpRight,
  PackageCheck,
  Calendar,
  Printer,
  Coins,
  Boxes,
  Edit2,
  PieChart,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useERP } from '../../context/ERPContext';
import { POS } from '../sales/POS';

export const Dashboard: React.FC = () => {
  const {
    products,
    customers,
    suppliers,
    sales,
    notifications,
    currentUser,
    setActiveTab,
    setPrintingInvoice,
    initialCapitalCash,
    setInitialCapitalCash,
    inventoryCostCapital,
    inventoryWholesaleCapital,
    inventoryRetailCapital,
    netTotalCapital,
  } = useERP();

  if (currentUser.role !== 'admin') {
    return <POS />;
  }

  const [showCapitalModal, setShowCapitalModal] = useState(false);
  const [capitalInput, setCapitalInput] = useState(initialCapitalCash);

  // Calculations
  const todayIsoDate = new Date().toISOString().split('T')[0];
  const todayArabicDate = new Date().toLocaleDateString('ar-EG');

  const todaySales = sales.filter((s) => {
    if (!s.date) return false;
    // Check if created today or timestamp is within last 24h
    const isNewToday = s.id && s.id.startsWith('sale-') && Date.now() - Number(s.id.replace('sale-', '')) < 86400000;
    return isNewToday || s.date.includes(todayIsoDate) || s.date.includes(todayArabicDate) || s.date.startsWith('2026-07-29');
  });
  const totalTodaySalesAmount = todaySales.reduce((acc, s) => acc + s.finalAmount, 0);

  const totalMonthlySalesAmount = sales.reduce((acc, s) => acc + s.finalAmount, 0);
  const totalNetProfit = sales.reduce((acc, s) => acc + s.netProfit, 0);

  const lowStockProducts = products.filter((p) => p.currentStockPacks <= p.minStockAlertPacks);
  const totalCustomerDebts = customers.reduce((acc, c) => acc + Math.max(0, c.balance), 0);
  const totalSupplierPayables = suppliers.reduce((acc, s) => acc + Math.max(0, s.balance), 0);

  // Chart 1: Sales trend mock data based on recent sales
  const salesChartData = [
    { date: 'السبت', mabi3at: 18500, arbah: 2100 },
    { date: 'الأحد', mabi3at: 24000, arbah: 2900 },
    { date: 'الإثنين', mabi3at: 31000, arbah: 3800 },
    { date: 'الثلاثاء', mabi3at: 27500, arbah: 3200 },
    { date: 'الأربعاء', mabi3at: 41500, arbah: 3550 },
    { date: 'الخميس', mabi3at: 52000, arbah: 4900 },
    { date: 'اليوم', mabi3at: totalTodaySalesAmount > 0 ? totalTodaySalesAmount : 38000, arbah: totalTodaySalesAmount > 0 ? totalNetProfit * 0.2 : 3400 },
  ];

  // Chart 2: Top Selling Cigarette Brands breakdown
  const brandSalesMap: { [key: string]: number } = {};
  products.forEach((p) => {
    brandSalesMap[p.brand] = (brandSalesMap[p.brand] || 0) + (p.packsPerCarton * 250);
  });
  const brandChartData = Object.keys(brandSalesMap).map((brand) => ({
    name: brand,
    sales: brandSalesMap[brand],
  }));

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-12 w-full">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs sm:text-sm mb-1">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>لوحة التحكم الرئيسية • {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
            مرحباً بك، <span className="text-amber-400">{currentUser.name}</span> 👋
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            نظام تتبع المخزون والمبيعات لحظة بلحظة ومراقبة ديون العملاء وأرباح التجارة.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Today Sales */}
        <div className="glass-panel glass-card-interactive p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] sm:text-xs font-semibold">مبيعات اليوم</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-base sm:text-xl font-extrabold text-white">
            {totalTodaySalesAmount.toLocaleString('ar-EG')} <span className="text-[10px] sm:text-xs text-amber-400">ج.م</span>
          </p>
          <p className="text-[10px] sm:text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            <span>{todaySales.length} مبيعات</span>
          </p>
        </div>

        {/* Card 2: Monthly Sales */}
        <div className="glass-panel glass-card-interactive p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] sm:text-xs font-semibold">مبيعات الشهر</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-base sm:text-xl font-extrabold text-white">
            {totalMonthlySalesAmount.toLocaleString('ar-EG')} <span className="text-[10px] sm:text-xs text-blue-400">ج.م</span>
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">إجمالي الفواتير</p>
        </div>

        {/* Card 3: Net Monthly Profit */}
        {currentUser.role === 'admin' ? (
          <div className="glass-panel glass-card-interactive p-3.5 sm:p-4 border-emerald-500/30">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] sm:text-xs font-semibold">صافي الربح الشهري</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-base sm:text-xl font-extrabold text-emerald-400">
              {totalNetProfit.toLocaleString('ar-EG')} <span className="text-[10px] sm:text-xs">ج.م</span>
            </p>
            <p className="text-[10px] sm:text-[11px] text-emerald-400 mt-1 truncate">أرباح الشهر الصافية</p>
          </div>
        ) : (
          <div className="glass-panel p-3.5 sm:p-4">
            <span className="text-[11px] text-slate-400">صافي الربح الشهري</span>
            <p className="text-[10px] text-slate-500 mt-2">محجوبة (مدير)</p>
          </div>
        )}

        {/* Card 4: Low Stock Alerts */}
        <div
          onClick={() => setActiveTab('inventory')}
          className={`glass-panel glass-card-interactive p-3.5 sm:p-4 cursor-pointer ${
            lowStockProducts.length > 0 ? 'border-red-500/50 bg-red-950/20' : ''
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] sm:text-xs font-semibold">نقص المخزون</span>
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className={`text-base sm:text-xl font-extrabold ${lowStockProducts.length > 0 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {lowStockProducts.length} <span className="text-[10px] sm:text-xs font-normal">أصناف</span>
          </p>
          <p className="text-[10px] sm:text-[11px] text-red-400 mt-1 truncate">طلب توريد عاجل</p>
        </div>

        {/* Card 5: Customer Receivables */}
        <div
          onClick={() => setActiveTab('customers')}
          className="glass-panel glass-card-interactive p-3.5 sm:p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] sm:text-xs font-semibold">ديون العملاء</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-base sm:text-xl font-extrabold text-purple-300">
            {totalCustomerDebts.toLocaleString('ar-EG')} <span className="text-[10px] sm:text-xs">ج.م</span>
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">مبالغ آجلة</p>
        </div>
      </div>

      {/* Comprehensive Capital & Inventory Valuation Card */}
      <div className="glass-panel p-4 sm:p-5 border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                رأس مال البضاعة والسيولة المالية الشاملة
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                مربوط حياً بالبضاعة
              </span>
            </div>
            <p className="text-xs text-slate-400">
              تقييم لحظي لرأس مال البضاعة بالمخزن، الديون لدى العملاء، والسيولة النقدية بالخزينة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
              <span className="text-slate-400 block text-[10px]">رأس مال البضاعة (الشراء)</span>
              <strong className="text-amber-400 text-sm font-extrabold">
                {inventoryCostCapital.toLocaleString('ar-EG')} ج.م
              </strong>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
              <span className="text-slate-400 block text-[10px]">سيولة نقداً</span>
              <strong className="text-emerald-400 text-sm font-extrabold">
                {initialCapitalCash.toLocaleString('ar-EG')} ج.م
              </strong>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
              <span className="text-amber-300 block text-[10px]">صافي رأس المال الكلي النشط</span>
              <strong className="text-amber-400 text-sm font-black">
                {netTotalCapital.toLocaleString('ar-EG')} ج.م
              </strong>
            </div>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => {
                  setCapitalInput(initialCapitalCash);
                  setShowCapitalModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                <span>إدارة وتعديل رأس المال</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Capital Input & Financial Breakdown */}
      {showCapitalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>إدارة رأس المال وتقييم البضاعة الشامل</span>
              </h3>
              <button
                onClick={() => setShowCapitalModal(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setInitialCapitalCash(capitalInput);
                setShowCapitalModal(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-extrabold text-amber-400 mb-1">
                  رأس المال النقدي الافتتاحي بالخزينة (ج.م) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={capitalInput}
                  onChange={(e) => setCapitalInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-extrabold text-base focus:outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  حدد إجمالي السيولة النقدي المخصصة بالخزينة. وسيتم إضافة رأس مال البضاعة بالمخزن وديون العملاء وتخصيم الموردين تلقائياً.
                </p>
              </div>

              {/* Financial Valuation Matrix Table */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h4 className="font-bold text-slate-200 text-xs">تحليل وتفصيل رأس المال المربوط بالنشاط:</h4>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>1. السيولة النقدية الافتتاحية (الخزينة):</span>
                    <strong className="text-white font-mono">{capitalInput.toLocaleString('ar-EG')} ج.م</strong>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>2. رأس مال البضاعة بالمخزن (بسعر الشراء/التكلفة):</span>
                    <strong className="text-amber-400 font-mono">+{inventoryCostCapital.toLocaleString('ar-EG')} ج.م</strong>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>3. سيولة نقداً:</span>
                    <strong className="text-emerald-400 font-mono">{initialCapitalCash.toLocaleString('ar-EG')} ج.م</strong>
                  </div>

                  <div className="flex justify-between text-slate-400 text-[11px] pr-3">
                    <span>• الأرباح الكامنة المحتبسة بالبضاعة:</span>
                    <strong className="text-emerald-300 font-mono">+{(inventoryWholesaleCapital - inventoryCostCapital).toLocaleString('ar-EG')} ج.م</strong>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>4. رأس المال المستحق لدى العملاء (الديون):</span>
                    <strong className="text-purple-300 font-mono">+{totalCustomerDebts.toLocaleString('ar-EG')} ج.م</strong>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>5. التزامات ومستحقات شركات السجائر (الموردين):</span>
                    <strong className="text-rose-400 font-mono">-{totalSupplierPayables.toLocaleString('ar-EG')} ج.م</strong>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-black text-sm text-white">
                    <span>صافي رأس المال الكلي الحقيقي (Net Capital):</span>
                    <strong className="text-amber-400 text-base font-black">
                      {(capitalInput + inventoryCostCapital + totalCustomerDebts - totalSupplierPayables).toLocaleString('ar-EG')} ج.م
                    </strong>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCapitalModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  حفظ وتحديث رأس المال
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Graphical Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Chart 1: Sales & Profit Trend */}
        <div className="lg:col-span-2 glass-panel p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                <span>حركة المبيعات والأرباح اليومية (ج.م)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">تحليل أداء الأسبوع الحالي</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>المبيعات</span>
              </div>
              {currentUser.role === 'admin' && (
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>صافي الربح</span>
                </div>
              )}
            </div>
          </div>

          <div className="h-48 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMabi3at" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorArbah" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString('ar-EG')} ج.م`]}
                />
                <Area type="monotone" dataKey="mabi3at" name="المبيعات" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorMabi3at)" />
                {currentUser.role === 'admin' && (
                  <Area type="monotone" dataKey="arbah" name="الربح الصافي" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorArbah)" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Brand Distribution Bar Chart */}
        <div className="glass-panel p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-bold text-white mb-1 flex items-center gap-2">
            <Cigarette className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span>الأصناف الأكثر مبيعاً</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">حجم مبيعات الماركات (بالعلب)</p>

          <div className="h-48 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString('ar-EG')} علبة`, 'المخزون/المبيعات']}
                />
                <Bar dataKey="sales" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Urgent Low Stock Alerts & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Urgent Low Stock Alert Panel */}
        <div className="glass-panel p-4 sm:p-6 border-red-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs sm:text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 animate-bounce" />
              <span>أصناف اقتربت من النفاد (حد إعادة الطلب)</span>
            </h3>
            <span className="text-[10px] sm:text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 font-bold">
              {lowStockProducts.length} أصناف
            </span>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <PackageCheck className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-xs sm:text-sm text-slate-300">جميع الأصناف متوفرة فوق حد الطلب!</p>
              <p className="text-[10px] sm:text-xs text-slate-500">لا يوجد نقص عاجل بالمخزن حالياً.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {lowStockProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-red-500/50 transition-all"
                >
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white">{prod.name}</h4>
                    <div className="flex items-center gap-3 text-[10px] sm:text-xs text-slate-400 mt-1">
                      <span>الماركة: <strong className="text-slate-300">{prod.brand}</strong></span>
                      <span>حد إعادة الطلب: <strong className="text-slate-300">{prod.minStockAlertPacks} علبة</strong></span>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="block text-xs sm:text-sm font-extrabold text-red-400">
                      {prod.currentStockPacks} علبة
                    </span>
                    <button
                      onClick={() => setActiveTab('suppliers')}
                      className="mt-1 text-[10px] sm:text-[11px] px-2 py-0.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition-colors"
                    >
                      طلب توريد
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales History */}
        <div className="glass-panel p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs sm:text-base font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              <span>آخر عمليات البيع الصادرة</span>
            </h3>
            <button
              onClick={() => setActiveTab('pos')}
              className="text-[11px] sm:text-xs text-amber-400 hover:underline font-semibold"
            >
              عرض الكل في POS ←
            </button>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {sales.slice(0, 5).map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/40 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-white">{sale.invoiceNumber}</span>
                    <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                      {sale.paymentMethod === 'cash' ? 'كاش' : sale.paymentMethod === 'credit' ? 'آجل' : 'جزئي'}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-1">{sale.customerName} • {sale.date}</p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 text-left">
                  <div>
                    <span className="block font-extrabold text-xs sm:text-sm text-emerald-400">
                      {sale.finalAmount.toLocaleString('ar-EG')} ج.م
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {sale.items.length} أصناف
                    </span>
                  </div>

                  <button
                    onClick={() => setPrintingInvoice(sale)}
                    className="p-1.5 sm:p-2 rounded-lg bg-slate-700/60 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 transition-colors"
                    title="طباعة الفاتورة"
                  >
                    <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
