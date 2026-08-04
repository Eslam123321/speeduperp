import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  Sliders,
  Cigarette,
  ArrowUpDown,
  CheckCircle,
  Package,
  TrendingUp,
  Tag,
  Coins,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Product } from '../../types';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export const InventoryManager: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    bulkUpdatePrices,
    currentUser,
    inventoryCostCapital,
    inventoryWholesaleCapital,
    initialCapitalCash,
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustStockProduct, setAdjustStockProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [adjustStockMode, setAdjustStockMode] = useState<'set_exact' | 'add_subtract'>('set_exact');
  const [adjustBoxes, setAdjustBoxes] = useState<number>(0);
  const [adjustCartons, setAdjustCartons] = useState<number>(0);
  const [adjustPacks, setAdjustPacks] = useState<number>(0);
  const [stockAdjustReason, setStockAdjustReason] = useState<string>('تعديل مخزون وجرد');

  const [bulkPricesMap, setBulkPricesMap] = useState<Record<string, { cost: number; wholesale: number; retail: number }>>({});

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'local' as 'local' | 'imported' | 'cigar' | 'vape_accessories',
    barcode: '',
    costPricePerPack: 34,
    wholesalePricePerPack: 37.5,
    retailPricePerPack: 38.5,
    packsPerCarton: 10,
    cartonsPerBox: 50,
    currentStockPacks: 1000,
    minStockAlertPacks: 500,
    initialBoxes: 0,
    initialCartons: 0,
    initialPacks: 0,
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      brand: 'كليوباترا',
      category: 'local',
      barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      costPricePerPack: 35,
      wholesalePricePerPack: 39,
      retailPricePerPack: 40,
      packsPerCarton: 10,
      cartonsPerBox: 50,
      currentStockPacks: 0,
      minStockAlertPacks: 400,
      initialBoxes: 0,
      initialCartons: 0,
      initialPacks: 0,
    });
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    const packsPerCarton = p.packsPerCarton || 10;
    const qaroosaCount = Math.floor(p.currentStockPacks / packsPerCarton);

    setFormData({
      name: p.name,
      brand: p.brand,
      category: p.category,
      barcode: p.barcode,
      costPricePerPack: p.costPricePerPack,
      wholesalePricePerPack: p.wholesalePricePerPack,
      retailPricePerPack: p.retailPricePerPack,
      packsPerCarton,
      cartonsPerBox: p.cartonsPerBox || 50,
      currentStockPacks: p.currentStockPacks,
      minStockAlertPacks: p.minStockAlertPacks,
      initialBoxes: 0,
      initialCartons: qaroosaCount,
      initialPacks: 0,
    });
    setShowAddModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const packsPerCarton = formData.packsPerCarton || 10;
    const calculatedTotalPacks = (formData.initialCartons * packsPerCarton) + (formData.initialBoxes * packsPerCarton * (formData.cartonsPerBox || 50)) + formData.initialPacks;

    const productPayload = {
      name: formData.name,
      brand: formData.brand,
      category: formData.category,
      barcode: formData.barcode,
      costPricePerPack: formData.costPricePerPack,
      wholesalePricePerPack: formData.wholesalePricePerPack,
      retailPricePerPack: formData.retailPricePerPack,
      packsPerCarton,
      cartonsPerBox: formData.cartonsPerBox || 50,
      currentStockPacks: Math.max(0, calculatedTotalPacks),
      minStockAlertPacks: formData.minStockAlertPacks,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productPayload);
    } else {
      addProduct(productPayload);
    }
    setShowAddModal(false);
  };

  const handleOpenBulkPriceModal = () => {
    const initialMap: Record<string, { cost: number; wholesale: number; retail: number }> = {};
    products.forEach((p) => {
      initialMap[p.id] = {
        cost: p.costPricePerPack,
        wholesale: p.wholesalePricePerPack,
        retail: p.retailPricePerPack,
      };
    });
    setBulkPricesMap(initialMap);
    setShowBulkPriceModal(true);
  };

  const handleSaveBulkPrices = () => {
    const updates = Object.entries(bulkPricesMap).map(([id, prices]) => ({
      productId: id,
      costPricePerPack: prices.cost,
      wholesalePricePerPack: prices.wholesale,
      retailPricePerPack: prices.retail,
    }));

    bulkUpdatePrices(updates);
    setShowBulkPriceModal(false);
    alert('تم تحديث أسعار كافة أصناف السجائر بنجاح!');
  };

  const handleOpenAdjustStock = (p: Product) => {
    setAdjustStockProduct(p);
    setAdjustStockMode('set_exact');
    const packsInBox = p.packsPerCarton * p.cartonsPerBox;
    const boxes = Math.floor(p.currentStockPacks / (packsInBox || 1));
    const remPacksAfterBox = p.currentStockPacks % (packsInBox || 1);
    const cartons = Math.floor(remPacksAfterBox / (p.packsPerCarton || 1));
    const packs = remPacksAfterBox % (p.packsPerCarton || 1);

    setAdjustBoxes(boxes);
    setAdjustCartons(cartons);
    setAdjustPacks(packs);
    setStockAdjustReason('تعديل مخزون وجرد');
  };

  const handleConfirmStockAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustStockProduct) return;

    const packsInBox = adjustStockProduct.packsPerCarton * adjustStockProduct.cartonsPerBox;

    if (adjustStockMode === 'set_exact') {
      const newTotalPacks = Math.max(0, (adjustBoxes * packsInBox) + (adjustCartons * adjustStockProduct.packsPerCarton) + adjustPacks);
      updateProduct(adjustStockProduct.id, { currentStockPacks: newTotalPacks });
    } else {
      const deltaPacks = (adjustBoxes * packsInBox) + (adjustCartons * adjustStockProduct.packsPerCarton) + adjustPacks;
      if (deltaPacks === 0) return;
      adjustStock(adjustStockProduct.id, deltaPacks, stockAdjustReason);
    }

    setAdjustStockProduct(null);
  };

  const handleExecuteDeleteProduct = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  // Unit breakdown converter helper
  const formatStockBreakdown = (p: Product) => {
    const cartons = Math.floor(p.currentStockPacks / (p.packsPerCarton || 10));
    return (
      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold font-mono">
        {cartons} قروصة
      </span>
    );
  };

  const filteredProducts = products.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="space-y-4 lg:space-y-6 animate-fadeIn pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 lg:p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-amber-400" />
            <span>إدارة المخزون والتعديل السريع للسعر</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            متابعة كميات الكراتين والخراطيش بالمخزن، تحديث أسعار البيع والشراء السريعة عند تغير أسعار السوق.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentUser.role === 'admin' && (
            <button
              onClick={handleOpenBulkPriceModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all"
            >
              <Tag className="w-4 h-4" />
              <span>تعديل سريع للسعر</span>
            </button>
          )}

          {currentUser.role !== 'cashier' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صنف جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Inventory Capital Valuation Banner */}
      <div className="glass-panel p-3.5 lg:p-4 border-amber-500/20 bg-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-xs sm:text-sm">تقييم رأس مال البضاعة بالمخزن لحظياً</h3>
            <p className="text-[11px] text-slate-400">محسوب مباشرة بناءً على كميات الكراتين والخراطيش والعلب المتوفرة</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
            <span className="text-[10px] text-slate-400 block">رأس المال (تكلفة الشراء)</span>
            <strong className="text-amber-400 font-extrabold text-xs">
              {inventoryCostCapital.toLocaleString('ar-EG')} ج.م
            </strong>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
            <span className="text-[10px] text-slate-400 block">سيولة نقداً</span>
            <strong className="text-emerald-400 font-extrabold text-xs">
              {initialCapitalCash.toLocaleString('ar-EG')} ج.م
            </strong>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] text-emerald-300 block">الأرباح المحتبسة بالبضاعة</span>
            <strong className="text-emerald-400 font-black text-xs">
              +{(inventoryWholesaleCapital - inventoryCostCapital).toLocaleString('ar-EG')} ج.م
            </strong>
          </div>
        </div>
      </div>

      {/* Search & Category Filters */}
      <div className="glass-panel p-3.5 space-y-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث السريع باسم الصنف، الماركة، أو رقم الباركود..."
            className="w-full pr-9 pl-4 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'local', label: 'كليوباترا/محلي' },
            { id: 'imported', label: 'مستورد' },
            { id: 'vape_accessories', label: 'إكسسوارات' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE VIEW CARDS */}
      <div className="block md:hidden space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-50 text-amber-500" />
            <p className="font-bold text-xs">لا توجد أصناف تطابق البحث</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isLowStock = product.currentStockPacks <= product.minStockAlertPacks;
            return (
              <div
                key={product.id}
                className={`glass-panel p-4 space-y-3 border ${
                  isLowStock ? 'border-red-500/50 bg-red-950/10' : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                      <Cigarette className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white leading-tight">{product.name}</h4>
                      <span className="text-[10px] text-amber-400 font-bold">{product.brand}</span>
                    </div>
                  </div>

                  {isLowStock ? (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-black animate-pulse whitespace-nowrap">
                      وصل حد الطلب ({product.minStockAlertPacks})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold whitespace-nowrap">
                      متوفر
                    </span>
                  )}
                </div>

                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">المخزون بالقروصة:</span>
                  <span className={`font-black ${isLowStock ? 'text-red-400' : 'text-emerald-400'}`}>
                    {Math.floor(product.currentStockPacks / (product.packsPerCarton || 10)).toLocaleString('ar-EG')} قروصة
                  </span>
                </div>
                {formatStockBreakdown(product)}

                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] pt-1">
                  {currentUser.role === 'admin' && (
                    <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
                      <span className="text-slate-400 block">شراء</span>
                      <strong className="text-slate-200">{product.costPricePerPack} ج.م</strong>
                    </div>
                  )}
                  <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 block">جملة</span>
                    <strong className="text-amber-400">{product.wholesalePricePerPack} ج.م</strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 block">قطاعي</span>
                    <strong className="text-emerald-400">{product.retailPricePerPack} ج.م</strong>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenAdjustStock(product)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-200 hover:text-amber-400 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>تعديل الجرد</span>
                  </button>

                  {currentUser.role !== 'cashier' && (
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-blue-500/20 text-slate-300 hover:text-blue-400 border border-slate-700"
                      title="تعديل"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP VIEW TABLE - Complete Full Width View Without Slider */}
      <div className="hidden md:block glass-panel w-full overflow-hidden">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 text-[11px] font-bold">
            <tr>
              <th className="py-2.5 px-2">الصنف</th>
              <th className="py-2.5 px-2">الباركود</th>
              <th className="py-2.5 px-2">المخزون</th>
              <th className="py-2.5 px-2">القروصة</th>
              {currentUser.role === 'admin' && <th className="py-2.5 px-2">سعر الشراء</th>}
              <th className="py-2.5 px-2">سعر البيع</th>
              <th className="py-2.5 px-2 text-center">الحالة / حد الطلب</th>
              <th className="py-2.5 px-2 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-10 text-slate-400">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-50 text-amber-500" />
                  <p className="font-bold">لا توجد أصناف تطابق البحث</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const isLowStock = product.currentStockPacks <= product.minStockAlertPacks;
                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isLowStock ? 'bg-red-950/10' : ''
                    }`}
                  >
                    <td className="py-2.5 px-2">
                      <div>
                        <span className="font-bold text-white block leading-tight">{product.name}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-2 font-mono text-[10px] text-slate-400">{product.barcode}</td>

                    <td className="py-2.5 px-2">
                      <span className={`font-black text-xs ${isLowStock ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                        {Math.floor(product.currentStockPacks / (product.packsPerCarton || 10)).toLocaleString('ar-EG')} قروصة
                      </span>
                    </td>

                    <td className="py-2.5 px-2">{formatStockBreakdown(product)}</td>

                    {currentUser.role === 'admin' && (
                      <td className="py-2.5 px-2 font-bold text-slate-300">
                        {product.costPricePerPack} ج.م
                      </td>
                    )}

                    <td className="py-2.5 px-2 font-bold text-amber-400">
                      {product.wholesalePricePerPack} ج.م
                    </td>

                    <td className="py-2.5 px-2 text-center">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-black animate-bounce">
                          <AlertTriangle className="w-3 h-3" />
                          <span>وصل حد الطلب ({product.minStockAlertPacks})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          <CheckCircle className="w-3 h-3" />
                          <span>متوفر</span>
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-2">
                      <div className="flex items-center justify-center gap-1">
                        {currentUser.role !== 'cashier' && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(product)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-500/20 text-slate-300 hover:text-blue-400 border border-slate-700 transition-colors"
                              title="تعديل الصف والبيانات"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {currentUser.role === 'admin' && (
                              <button
                                onClick={() => setProductToDelete(product)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 transition-colors"
                                title="حذف الصنف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Bulk Price Change */}
      {showBulkPriceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 my-4 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-400" />
                <span>تعديل سريع للسعر لجميع الأصناف</span>
              </h2>
              <button
                onClick={() => setShowBulkPriceModal(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
              >
                إلغاء
              </button>
            </div>

            <p className="text-xs text-slate-400">
              تتيح لك هذه الأداة التحديث الفوري المباشر لأسعار الشراء والبيع لجميع أنواع السجائر بنقرة واحدة عند حدوث تغيرات أسعار بالأسواق.
            </p>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold">
                  <tr>
                    <th className="p-2">الصنف</th>
                    <th className="p-2">سعر شراء القروصة (ج.م)</th>
                    <th className="p-2">سعر بيع القروصة (ج.م)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products.map((prod) => {
                    const prices = bulkPricesMap[prod.id] || {
                      cost: prod.costPricePerPack,
                      wholesale: prod.wholesalePricePerPack,
                      retail: prod.retailPricePerPack,
                    };

                    return (
                      <tr key={prod.id} className="hover:bg-slate-800/40">
                        <td className="p-2">
                          <strong className="text-white block">{prod.name}</strong>
                          <span className="text-[10px] text-amber-400">{prod.brand}</span>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.5"
                            value={prices.cost}
                            onChange={(e) =>
                              setBulkPricesMap({
                                ...bulkPricesMap,
                                [prod.id]: { ...prices, cost: Number(e.target.value) },
                              })
                            }
                            className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.5"
                            value={prices.wholesale}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setBulkPricesMap({
                                ...bulkPricesMap,
                                [prod.id]: { cost: prices.cost, wholesale: val, retail: val },
                              });
                            }}
                            className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-amber-400 font-bold font-mono"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowBulkPriceModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveBulkPrices}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20"
              >
                تطبيـق وتحديث كافة الأسعار الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-4 lg:p-6 shadow-2xl space-y-3 my-4 overflow-y-auto max-h-[90vh]">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Boxes className="w-5 h-5 text-amber-400" />
              <span>{editingProduct ? 'تعديل بيانات الصنف' : 'إضافة صنف سجائر جديد'}</span>
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">اسم الصنف بالكامل *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value, brand: e.target.value })}
                    placeholder="مثال: مارلبورو أحمر"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">الباركود (Barcode)</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">سعر شراء القروصة (ج.م) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.costPricePerPack}
                    onChange={(e) => setFormData({ ...formData, costPricePerPack: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">سعر بيع القروصة (ج.م) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.wholesalePricePerPack}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        wholesalePricePerPack: Number(e.target.value),
                        retailPricePerPack: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">حد تنبيه الطلب (بالعلب)</label>
                  <input
                    type="number"
                    required
                    value={formData.minStockAlertPacks}
                    onChange={(e) => setFormData({ ...formData, minStockAlertPacks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-amber-300 mb-1">الكمية بالمخزن (بالقروصة)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.initialCartons}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        initialCartons: Math.max(0, Number(e.target.value)),
                        initialBoxes: 0,
                        initialPacks: 0,
                        packsPerCarton: 10,
                      })
                    }
                    placeholder="0 قروصة"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-300 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-xl font-semibold text-slate-400 hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-md shadow-amber-500/20"
                >
                  حفظ الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustStockProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-4 lg:p-6 shadow-2xl space-y-4 my-4 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>تعديل الجرد والمخزون: {adjustStockProduct.name}</span>
              </h3>
              <button
                onClick={() => setAdjustStockProduct(null)}
                className="px-2 py-0.5 rounded text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>

            {/* Current Stock Banner */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">المخزون المسجل حالياً:</span>
                <strong className="text-amber-400 text-sm font-black">
                  {adjustStockProduct.currentStockPacks.toLocaleString('ar-EG')} علبة
                </strong>
              </div>
              <div className="text-left font-mono">
                {formatStockBreakdown(adjustStockProduct)}
              </div>
            </div>

            {/* Adjust Mode Selector */}
            <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700 text-xs font-bold gap-1">
              <button
                type="button"
                onClick={() => {
                  setAdjustStockMode('set_exact');
                  const packsInBox = adjustStockProduct.packsPerCarton * adjustStockProduct.cartonsPerBox;
                  const b = Math.floor(adjustStockProduct.currentStockPacks / (packsInBox || 1));
                  const rem = adjustStockProduct.currentStockPacks % (packsInBox || 1);
                  const c = Math.floor(rem / (adjustStockProduct.packsPerCarton || 1));
                  const pk = rem % (adjustStockProduct.packsPerCarton || 1);
                  setAdjustBoxes(b);
                  setAdjustCartons(c);
                  setAdjustPacks(pk);
                }}
                className={`flex-1 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                  adjustStockMode === 'set_exact'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                تحديث المخزون الفعلي المباشر
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdjustStockMode('add_subtract');
                  setAdjustBoxes(0);
                  setAdjustCartons(0);
                  setAdjustPacks(0);
                }}
                className={`flex-1 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                  adjustStockMode === 'add_subtract'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                إضافة / خصم كمية (صادر/وارد)
              </button>
            </div>

            <form onSubmit={handleConfirmStockAdjust} className="space-y-3 text-xs">
              {adjustStockMode === 'set_exact' ? (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-300 font-medium">
                    أدخل الرصيد الفعلي الموجود حالياً في المخزن بالوحدات الثلاث:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-300 mb-1">الكراتين</label>
                      <input
                        type="number"
                        min="0"
                        value={adjustBoxes}
                        onChange={(e) => setAdjustBoxes(Math.max(0, Number(e.target.value)))}
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-amber-300 font-bold text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-300 mb-1">الخراطيش</label>
                      <input
                        type="number"
                        min="0"
                        value={adjustCartons}
                        onChange={(e) => setAdjustCartons(Math.max(0, Number(e.target.value)))}
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-emerald-300 font-bold text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-blue-300 mb-1">العلب المتبقية</label>
                      <input
                        type="number"
                        min="0"
                        value={adjustPacks}
                        onChange={(e) => setAdjustPacks(Math.max(0, Number(e.target.value)))}
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-blue-300 font-bold text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {(() => {
                    const packsInBox = adjustStockProduct.packsPerCarton * adjustStockProduct.cartonsPerBox;
                    const calculatedNewPacks = (adjustBoxes * packsInBox) + (adjustCartons * adjustStockProduct.packsPerCarton) + adjustPacks;
                    const diff = calculatedNewPacks - adjustStockProduct.currentStockPacks;
                    return (
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs mt-2">
                        <span className="text-slate-400">الإجمالي الفعلي الجديد:</span>
                        <div className="text-left font-extrabold">
                          <span className="text-amber-400 block text-sm">{calculatedNewPacks.toLocaleString('ar-EG')} علبة</span>
                          <span className={`text-[10px] ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            ({diff >= 0 ? `+${diff.toLocaleString('ar-EG')}` : diff.toLocaleString('ar-EG')} علبة فارق)
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-300 font-medium">
                    أدخل الكمية المضافة (+) أو المخصومة (-) بالوحدات الثلاث:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-300 mb-1">الكراتين (+ / -)</label>
                      <input
                        type="number"
                        value={adjustBoxes}
                        onChange={(e) => setAdjustBoxes(Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-300 mb-1">الخراطيش (+ / -)</label>
                      <input
                        type="number"
                        value={adjustCartons}
                        onChange={(e) => setAdjustCartons(Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-blue-300 mb-1">العلب (+ / -)</label>
                      <input
                        type="number"
                        value={adjustPacks}
                        onChange={(e) => setAdjustPacks(Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {(() => {
                    const packsInBox = adjustStockProduct.packsPerCarton * adjustStockProduct.cartonsPerBox;
                    const deltaPacks = (adjustBoxes * packsInBox) + (adjustCartons * adjustStockProduct.packsPerCarton) + adjustPacks;
                    const resultingTotalPacks = Math.max(0, adjustStockProduct.currentStockPacks + deltaPacks);
                    return (
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs mt-2">
                        <span className="text-slate-400">صافي التعديل والصافي النهائي:</span>
                        <div className="text-left font-extrabold">
                          <span className="text-emerald-400 block text-sm">{resultingTotalPacks.toLocaleString('ar-EG')} علبة جديدة</span>
                          <span className="text-[10px] text-amber-400">
                            (تعديل {deltaPacks >= 0 ? `+${deltaPacks.toLocaleString('ar-EG')}` : deltaPacks.toLocaleString('ar-EG')} علبة)
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">السبب / الملاحظات</label>
                <input
                  type="text"
                  value={stockAdjustReason}
                  onChange={(e) => setStockAdjustReason(e.target.value)}
                  placeholder="مثال: جرد دقيق / بضاعة واردة / تالف"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustStockProduct(null)}
                  className="px-3.5 py-1.5 rounded-xl font-semibold text-slate-400 hover:bg-slate-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  حفظ وتأكيد المخزون
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(productToDelete)}
        title="تأكيد حذف صنف السجائر"
        message={`هل أنت تأكد من رغبتك في حذف صنف (${productToDelete?.name}) نهائياً من قائمة المخزون والمنتجات؟`}
        confirmText="نعم، حذف الصنف الآن"
        onConfirm={handleExecuteDeleteProduct}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
};
