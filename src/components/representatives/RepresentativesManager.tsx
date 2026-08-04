import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  DollarSign,
  Phone,
  Boxes,
  MapPin,
  CheckCircle2,
  ArrowRightLeft,
  Calendar,
  UserCheck,
  ShieldCheck,
  Building,
  Trash2,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Representative } from '../../types';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export const RepresentativesManager: React.FC = () => {
  const {
    representatives,
    products,
    customers,
    addRepresentative,
    deleteRepresentative,
    transferStockToRep,
    recordRepCollection,
    recordRepVisit,
    hasUserPermission,
    currentUser,
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [stockTransferRep, setStockTransferRep] = useState<Representative | null>(null);
  const [collectCashRep, setCollectCashRep] = useState<Representative | null>(null);
  const [logVisitRep, setLogVisitRep] = useState<Representative | null>(null);
  const [repToDelete, setRepToDelete] = useState<Representative | null>(null);

  // Transfer Stock Form
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [transferQuantity, setTransferQuantity] = useState<number>(100);

  // Cash Collection Form
  const [collectionAmount, setCollectionAmount] = useState<number>(0);
  const [collectionNotes, setCollectionNotes] = useState<string>('');

  // Log Visit Form
  const [visitCustomerId, setVisitCustomerId] = useState<string>('');
  const [visitAmountCollected, setVisitAmountCollected] = useState<number>(0);
  const [visitNotes, setVisitNotes] = useState<string>('');

  // Add Rep Form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleNo: '',
    notes: '',
  });

  const handleSaveRep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addRepresentative(formData);
    setShowAddModal(false);
    setFormData({ name: '', phone: '', vehicleNo: '', notes: '' });
  };

  const handleConfirmDeleteRep = () => {
    if (repToDelete) {
      deleteRepresentative(repToDelete.id);
      setRepToDelete(null);
    }
  };

  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockTransferRep || !selectedProductId || transferQuantity <= 0) return;

    const res = transferStockToRep(stockTransferRep.id, selectedProductId, transferQuantity);
    if (res.success) {
      alert(res.message);
      setStockTransferRep(null);
      setSelectedProductId('');
      setTransferQuantity(100);
    } else {
      alert(`خطأ: ${res.message}`);
    }
  };

  const handleConfirmCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectCashRep || collectionAmount <= 0) return;

    recordRepCollection(collectCashRep.id, collectionAmount, collectionNotes);
    setCollectCashRep(null);
    setCollectionAmount(0);
    setCollectionNotes('');
  };

  const handleConfirmVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logVisitRep || !visitCustomerId) return;

    const cust = customers.find((c) => c.id === visitCustomerId);
    const custName = cust ? cust.name : 'عميل غير مسجل';

    recordRepVisit(logVisitRep.id, visitCustomerId, custName, visitAmountCollected, visitNotes);
    setLogVisitRep(null);
    setVisitCustomerId('');
    setVisitAmountCollected(0);
    setVisitNotes('');
  };

  const filteredReps = representatives.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.phone.includes(searchQuery) ||
    (r.vehicleNo && r.vehicleNo.includes(searchQuery))
  );

  const totalRepCashHeld = representatives.reduce((acc, r) => acc + r.cashOnHand, 0);
  const totalRepSales = representatives.reduce((acc, r) => acc + r.totalSales, 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-amber-400" />
            <span>إدارة المندوبين والسيارات والتوزيع</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            متابعة مخزون خطوط التوزيع (ستوك السيارة)، الفلوس المحصلة مع المندوبين، وسجل زيارات العملاء.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-left px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-xs text-emerald-300 block">إجمالي النقدية بحوزة المندوبين:</span>
            <strong className="text-base text-emerald-400 font-extrabold">{totalRepCashHeld.toLocaleString('ar-EG')} ج.م</strong>
          </div>

          {hasUserPermission('all') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة مندوب / سائق</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 space-y-1 border-amber-500/30">
          <span className="text-xs text-slate-400 font-semibold">عدد المندوبين بالأسطول</span>
          <p className="text-xl font-black text-white">{representatives.length} مندوبين</p>
        </div>
        <div className="glass-panel p-4 space-y-1 border-emerald-500/30">
          <span className="text-xs text-slate-400 font-semibold">إجمالي عهدة النقدية في الشارع</span>
          <p className="text-xl font-black text-emerald-400">{totalRepCashHeld.toLocaleString('ar-EG')} ج.م</p>
        </div>
        <div className="glass-panel p-4 space-y-1 border-purple-500/30">
          <span className="text-xs text-slate-400 font-semibold">مبيعات المندوبين الإجمالية</span>
          <p className="text-xl font-black text-purple-400">{totalRepSales.toLocaleString('ar-EG')} ج.م</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المندوب، الهاتف، أو رقم السيارة..."
            className="w-full pr-9 pl-4 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Representatives Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReps.map((rep) => {
          return (
            <div key={rep.id} className="glass-panel p-6 space-y-5 border-slate-800 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Rep Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white">{rep.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{rep.phone}</span>
                        </span>
                        {rep.vehicleNo && (
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-amber-400">
                            سيارة: {rep.vehicleNo}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => setRepToDelete(rep)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      title="حذف المندوب مع التأكيد"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Rep Financial Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 font-semibold block">النقدية معه (العهدية الحالية):</span>
                    <strong className="text-lg font-black text-emerald-400">
                      {rep.cashOnHand.toLocaleString('ar-EG')} ج.م
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 font-semibold block">إجمالي مبيعاته المنجزة:</span>
                    <strong className="text-lg font-black text-amber-400">
                      {rep.totalSales.toLocaleString('ar-EG')} ج.م
                    </strong>
                  </div>
                </div>

                {/* Sub-stock Car Inventory */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-amber-400" />
                      <span>مخزون السيارة (ستوك المندوب):</span>
                    </h4>
                    <button
                      onClick={() => setStockTransferRep(rep)}
                      className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>تحويل بضاعة للسيارة</span>
                    </button>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 max-h-36 overflow-y-auto space-y-1.5">
                    {rep.assignedStock.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-2">لا توجد بضاعة محولة لسيارة المندوب حالياً.</p>
                    ) : (
                      rep.assignedStock.map((stk, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-slate-800/60 last:border-0">
                          <span className="text-slate-200 font-medium">{stk.productName}</span>
                          <strong className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {stk.quantityPacks} علبة
                          </strong>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Visited Customers Log */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>العملاء الذين زارهم وسجل التحصيل ({rep.visitedCustomers.length}):</span>
                    </h4>
                    <button
                      onClick={() => setLogVisitRep(rep)}
                      className="text-xs text-emerald-400 hover:underline font-bold"
                    >
                      + تسجيل زيارة عميل
                    </button>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 max-h-36 overflow-y-auto space-y-2">
                    {rep.visitedCustomers.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-2">لم يتم تسجيل زيارات ميدانية بعد.</p>
                    ) : (
                      rep.visitedCustomers.map((v) => (
                        <div key={v.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-xs space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="text-white">{v.customerName}</span>
                            <span className="text-emerald-400">+{v.amountCollected.toLocaleString('ar-EG')} ج.م</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>{v.date}</span>
                            {v.notes && <span>{v.notes}</span>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  disabled={rep.cashOnHand <= 0}
                  onClick={() => {
                    setCollectCashRep(rep);
                    setCollectionAmount(rep.cashOnHand);
                  }}
                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all ${
                    rep.cashOnHand > 0
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-600 shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>استلام كاش ومقاصة الخزينة</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Representative */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" />
              <span>إضافة مندوب مبيعات أو سائق جديد</span>
            </h2>

            <form onSubmit={handleSaveRep} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">اسم المندوب / السائق بالكامل *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: أحمد عبد الله (خط المعادي)"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">رقم الهاتف *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01012345678"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">رقم لوحة السيارة / الموتوسيكل</label>
                <input
                  type="text"
                  value={formData.vehicleNo}
                  onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
                  placeholder="مثال: أ ب ج 1234"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">ملاحظات / المنطقة والتغطية</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="مثال: خط السير المعادي وحلوان وطرة"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
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
                  حفظ المندوب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Transfer Stock to Rep Car */}
      {stockTransferRep && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-400" />
              <span>تحويل سجائر من المخزن الرئيسي إلى: {stockTransferRep.name}</span>
            </h3>

            <form onSubmit={handleConfirmTransfer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">اختر صنف السجائر المراد تحويله</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                >
                  <option value="">اختر الصنف من المخزن الرئيسي...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (المتوفر: {p.currentStockPacks} علبة)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">الكمية المحولة لسيارة المندوب (بالعلب)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={transferQuantity}
                  onChange={(e) => setTransferQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 font-extrabold text-base focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStockTransferRep(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-600"
                >
                  تأكيد تحويل البضاعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Collect Cash from Rep */}
      {collectCashRep && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>توريد كاش من المندوب إلى الخزينة: {collectCashRep.name}</span>
            </h3>
            <p className="text-xs text-slate-400">
              إجمالي الكاش الموجود بحوزته حالياً: <strong className="text-emerald-400">{collectCashRep.cashOnHand.toLocaleString('ar-EG')} ج.م</strong>
            </p>

            <form onSubmit={handleConfirmCollection} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">المبلغ المورد للخزينة الرئيسية (ج.م) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={collectCashRep.cashOnHand}
                  value={collectionAmount}
                  onChange={(e) => setCollectionAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-extrabold text-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">ملاحظات والتفاصيل</label>
                <input
                  type="text"
                  value={collectionNotes}
                  onChange={(e) => setCollectionNotes(e.target.value)}
                  placeholder="مثال: توريد نقدية حصيلة خط اليوم"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCollectCashRep(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-600"
                >
                  استلام المبلغ وتفريغ العهدة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Customer Visit */}
      {logVisitRep && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span>تسجيل زيارة عميل للمندوب: {logVisitRep.name}</span>
            </h3>

            <form onSubmit={handleConfirmVisit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">اختر العميل المزار</label>
                <select
                  required
                  value={visitCustomerId}
                  onChange={(e) => setVisitCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                >
                  <option value="">اختر العميل...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (مديونية: {c.balance.toLocaleString('ar-EG')} ج.م)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">المبلغ المحصل نقداً أثناء الزيارة (ج.م)</label>
                <input
                  type="number"
                  value={visitAmountCollected}
                  onChange={(e) => setVisitAmountCollected(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">ملاحظات الزيارة</label>
                <input
                  type="text"
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  placeholder="مثال: تم تسليم بضاعة وطلب طلبية جديدة غداً"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLogVisitRep(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-600"
                >
                  تسجيل الزيارة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Representative Deletion */}
      <ConfirmDeleteModal
        isOpen={Boolean(repToDelete)}
        title="تأكيد حذف بيانات المندوب"
        message={`هل أنت تأكد من رغبتك في حذف المندوب (${repToDelete?.name}) نهائياً من خطوط التوزيع والنظام؟`}
        confirmText="نعم، حذف المندوب الآن"
        onConfirm={handleConfirmDeleteRep}
        onCancel={() => setRepToDelete(null)}
      />
    </div>
  );
};
