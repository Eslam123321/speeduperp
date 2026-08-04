import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  DollarSign,
  Phone,
  Truck,
  PlusCircle,
  CheckCircle,
  Receipt,
  X,
  MapPin,
  FileText,
  Trash2,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Supplier, PurchaseItem, UnitType } from '../../types';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export const SupplierAccounts: React.FC = () => {
  const { suppliers, addSupplier, deleteSupplier, recordSupplierPayment, products, createPurchaseInvoice, currentUser } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [paymentSupplier, setPaymentSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  // New Supplier Form State
  const [supplierData, setSupplierData] = useState({
    name: '',
    companyName: '',
    phone: '',
    address: '',
    notes: '',
  });

  // New Purchase Invoice Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [paidPurchaseAmount, setPaidPurchaseAmount] = useState<number>(0);
  const [purchaseNotes, setPurchaseNotes] = useState<string>('');

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierData.name.trim()) return;

    addSupplier({
      name: supplierData.name.trim(),
      companyName: supplierData.companyName.trim() || supplierData.name.trim(),
      phone: supplierData.phone.trim() || 'غير محدد',
      address: supplierData.address.trim() || '',
      notes: supplierData.notes.trim() || '',
    });

    setShowAddSupplierModal(false);
    setSupplierData({ name: '', companyName: '', phone: '', address: '', notes: '' });
  };

  const handleConfirmSupplierPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentSupplier || paymentAmount <= 0) return;

    recordSupplierPayment(paymentSupplier.id, paymentAmount, paymentNotes);
    setPaymentSupplier(null);
    setPaymentAmount(0);
    setPaymentNotes('');
  };

  const handleConfirmDeleteSupplier = () => {
    if (supplierToDelete) {
      deleteSupplier(supplierToDelete.id);
      setSupplierToDelete(null);
    }
  };

  const handleAddPurchaseItem = (productId: string, unit: UnitType, quantity: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod || quantity <= 0) return;

    let unitLabel = 'قروصة';
    let packsQuantity = prod.packsPerCarton * quantity;
    let unitCostPrice = prod.costPricePerPack * prod.packsPerCarton;

    if (unit === 'pack') {
      unitLabel = 'علبة';
      packsQuantity = quantity;
      unitCostPrice = prod.costPricePerPack;
    } else if (unit === 'box') {
      unitLabel = 'كرتونة';
      packsQuantity = prod.packsPerCarton * prod.cartonsPerBox * quantity;
      unitCostPrice = prod.costPricePerPack * (prod.packsPerCarton * prod.cartonsPerBox);
    }

    const newItem: PurchaseItem = {
      productId: prod.id,
      productName: prod.name,
      unit,
      unitLabel,
      quantity,
      packsQuantity,
      unitCostPrice,
      total: unitCostPrice * quantity,
    };

    setPurchaseItems([...purchaseItems, newItem]);
  };

  const handleSavePurchaseInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || purchaseItems.length === 0) return;

    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    if (!supplier) return;

    createPurchaseInvoice({
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: purchaseItems,
      paidAmount: paidPurchaseAmount,
      notes: purchaseNotes,
    });

    setShowPurchaseModal(false);
    setPurchaseItems([]);
    setPaidPurchaseAmount(0);
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-amber-400" />
            <span>حسابات الموردين وفواتير الشراء والتوريد</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            تسجيل مشتريات شركات السجائر، زيادة الكميات في المخزن آلياً، ومتابعة المستحقات.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 transition-all text-xs sm:text-sm"
          >
            <Truck className="w-5 h-5" />
            <span>تسجيل فاتورة توريد (شراء)</span>
          </button>

          <button
            onClick={() => setShowAddSupplierModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition-all text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>إضافة شركة / مورد +</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن مورد، شركة توريد، أو رقم هاتف..."
          className="w-full pr-10 pl-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="glass-panel glass-card-interactive p-5 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-white">{supplier.name}</h3>
                  <span className="text-xs text-amber-400 font-semibold">{supplier.companyName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <Building2 className="w-5 h-5" />
                  </span>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => setSupplierToDelete(supplier)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      title="حذف المورد مع التأكيد"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{supplier.phone}</span>
              </div>

              {supplier.address && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{supplier.address}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 mt-3">
                <span className="text-xs text-slate-400 block">مستحقات الشركة علينا:</span>
                <strong className="text-lg font-black text-rose-400">
                  {supplier.balance.toLocaleString('ar-EG')} ج.م
                </strong>
              </div>
            </div>

            <button
              onClick={() => setPaymentSupplier(supplier)}
              className="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs border border-rose-500/40 transition-colors flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              <span>تسجيل سداد دفعة للشركة</span>
            </button>
          </div>
        ))}
      </div>

      {/* Add New Supplier / Company Modal */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>إضافة شركة توريد / مورد سجائر جديد</span>
              </h3>
              <button
                onClick={() => setShowAddSupplierModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">اسم المورد / المسؤول *</label>
                <input
                  type="text"
                  required
                  value={supplierData.name}
                  onChange={(e) => setSupplierData({ ...supplierData, name: e.target.value })}
                  placeholder="مثال: شركة الشرقية للدخان - فرع أكتوبر"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">اسم الشركة التجارية / العلامة</label>
                <input
                  type="text"
                  value={supplierData.companyName}
                  onChange={(e) => setSupplierData({ ...supplierData, companyName: e.target.value })}
                  placeholder="مثال: فيليب موريس / JTI"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">رقم الهاتف والتواصل</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={supplierData.phone}
                    onChange={(e) => setSupplierData({ ...supplierData, phone: e.target.value })}
                    placeholder="010xxxxxxxx أو 022xxxxxxx"
                    className="w-full pr-9 pl-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">العنوان / مقر التوزيع</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={supplierData.address}
                    onChange={(e) => setSupplierData({ ...supplierData, address: e.target.value })}
                    placeholder="مثال: المنطقة الصناعية - 6 أكتوبر"
                    className="w-full pr-9 pl-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">ملاحظات وشروط التوريد</label>
                <textarea
                  rows={2}
                  value={supplierData.notes}
                  onChange={(e) => setSupplierData({ ...supplierData, notes: e.target.value })}
                  placeholder="مثال: توريد كراتين مغلقة مع شيكات سداد أسبوعية"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-lg shadow-amber-500/20"
                >
                  حفظ إضافة المورد الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Purchase Invoice Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Truck className="w-6 h-6 text-emerald-400" />
              <span>تسجيل فاتورة توريد (شراء سجائر جديدة)</span>
            </h2>

            <form onSubmit={handleSavePurchaseInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">اختر الشركة الموردة *</label>
                <select
                  required
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                >
                  <option value="">-- اختر المورد --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300">إضافة أصناف للفاتورة:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    id="pur-prod-select"
                    className="px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>

                  <select
                    id="pur-unit-select"
                    className="px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-amber-300"
                  >
                    <option value="box">كرتونة كاملة</option>
                    <option value="carton">قروصة</option>
                    <option value="pack">علبة متفرقة</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      const prodId = (document.getElementById('pur-prod-select') as HTMLSelectElement).value;
                      const unit = (document.getElementById('pur-unit-select') as HTMLSelectElement).value as UnitType;
                      handleAddPurchaseItem(prodId, unit, 1);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-600"
                  >
                    + إضافة للصنف
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pt-2">
                  {purchaseItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-800">
                      <span>{item.productName} ({item.quantity} {item.unitLabel})</span>
                      <strong className="text-emerald-400">{item.total.toLocaleString('ar-EG')} ج.م</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">المبلغ المدفوع للشركة كاش الآن (ج.م)</label>
                <input
                  type="number"
                  value={paidPurchaseAmount}
                  onChange={(e) => setPaidPurchaseAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-bold focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                >
                  حفظ الفاتورة وتحديث المخزون آلياً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Payment Settlement Modal */}
      {paymentSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-400" />
              <span>تسجيل سداد دفعة للمورد: {paymentSupplier.name}</span>
            </h3>

            <form onSubmit={handleConfirmSupplierPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">المبلغ المسدد (ج.م) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-rose-400 font-extrabold text-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ملاحظات / رقم الإيصال</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentSupplier(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600"
                >
                  تأكيد سداد الدفعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Supplier Deletion */}
      <ConfirmDeleteModal
        isOpen={Boolean(supplierToDelete)}
        title="تأكيد حذف شركة المورد"
        message={`هل أنت تأكد من رغبتك في حذف المورد (${supplierToDelete?.name}) نهائياً من النظام؟`}
        confirmText="نعم، حذف المورد الآن"
        onConfirm={handleConfirmDeleteSupplier}
        onCancel={() => setSupplierToDelete(null)}
      />
    </div>
  );
};
