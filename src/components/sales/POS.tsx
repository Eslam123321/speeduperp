import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  UserCheck,
  CreditCard,
  Printer,
  Cigarette,
  AlertCircle,
  Tag,
  Truck,
  Edit2,
  X,
  Users,
  Sliders,
  Shield,
  User,
  Check,
  PackageCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Product, SaleItem, UnitType, SystemUser, EmployeeStockItem } from '../../types';

export const POS: React.FC = () => {
  const {
    products,
    customers,
    representatives,
    createSaleInvoice,
    currentUser,
    users,
    deleteUser,
    toggleDisableUser,
    updateUserPassword,
    employeeAssignments,
    updateEmployeeAssignment,
    sales,
    printingInvoice,
    setPrintingInvoice,
  } = useERP();

  const [passwordChangeUser, setPasswordChangeUser] = useState<SystemUser | null>(null);
  const [newEmployeePassword, setNewEmployeePassword] = useState('');

  const [posMode, setPosMode] = useState<'admin' | 'staff_management' | 'employee_pos'>(
    currentUser.role !== 'admin' ? 'employee_pos' : 'admin'
  );
  const [activeEmployee, setActiveEmployee] = useState<SystemUser | null>(
    currentUser.role !== 'admin' ? currentUser : null
  );

  // Today's Employee Invoices Modal State
  const [showTodayInvoicesModal, setShowTodayInvoicesModal] = useState(false);

  // Assignment Modal State
  const [assigningUser, setAssigningUser] = useState<SystemUser | null>(null);
  const [assignedCustomersForm, setAssignedCustomersForm] = useState<string[]>([]);
  const [assignedProductsForm, setAssignedProductsForm] = useState<{ [productId: string]: number }>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedRepId, setSelectedRepId] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'partial'>('partial');
  const [paidAmountInput, setPaidAmountInput] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Editing Item Price & Item Discount in Cart Modal
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editPriceInput, setEditPriceInput] = useState<number>(0);
  const [editCostInput, setEditCostInput] = useState<number>(0);
  const [editDiscountInput, setEditDiscountInput] = useState<number>(0);

  // Helper: Open assignment modal for employee
  const handleOpenAssignModal = (empUser: SystemUser) => {
    setAssigningUser(empUser);
    const existing = employeeAssignments.find((a) => a.userId === empUser.id);
    if (existing) {
      setAssignedCustomersForm(existing.assignedCustomerIds || []);
      const prodMap: { [key: string]: number } = {};
      existing.assignedProducts.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const packsPerCarton = prod ? prod.packsPerCarton || 10 : 10;
        prodMap[item.productId] = Math.floor(item.assignedStockPacks / packsPerCarton);
      });
      setAssignedProductsForm(prodMap);
    } else {
      setAssignedCustomersForm([]);
      setAssignedProductsForm({});
    }
  };

  const handleSaveEmployeeAssignment = () => {
    if (!assigningUser) return;

    for (const [prodId, qtyCartons] of Object.entries(assignedProductsForm)) {
      if (qtyCartons > 0) {
        const prod = products.find((p) => p.id === prodId);
        if (prod) {
          const mainWarehouseCartons = Math.floor(prod.currentStockPacks / (prod.packsPerCarton || 10));
          if (qtyCartons > mainWarehouseCartons) {
            alert(`⚠️ الكمية غير متوفرة بالمخزن الرئيسي!\nالصنف: (${prod.name})\nالكمية المتاحة حالياً بالمخزن: ${mainWarehouseCartons} قروصة فقط.\nالكمية المطلوبة للموظف: ${qtyCartons} قروصة.`);
            return;
          }
        }
      }
    }

    const assignedProducts: EmployeeStockItem[] = Object.entries(assignedProductsForm)
      .filter(([_, qtyCartons]) => qtyCartons > 0)
      .map(([prodId, qtyCartons]) => {
        const prod = products.find((p) => p.id === prodId);
        const packsPerCarton = prod ? prod.packsPerCarton || 10 : 10;
        return { productId: prodId, assignedStockPacks: qtyCartons * packsPerCarton };
      });

    updateEmployeeAssignment(assigningUser.id, assignedCustomersForm, assignedProducts);
    setAssigningUser(null);
  };

  const handleEnterEmployeePOS = (empUser: SystemUser) => {
    setActiveEmployee(empUser);
    setPosMode('employee_pos');
    setCartItems([]);
    setSelectedCustomerId('');
  };

  const handleExitEmployeePOS = () => {
    setActiveEmployee(null);
    setPosMode('admin');
    setCartItems([]);
    setSelectedCustomerId('');
  };

  const handleAddToCart = (product: Product, unit: UnitType = 'carton') => {
    let unitLabel = 'قروصة';
    let packsQuantity = product.packsPerCarton;
    let unitPrice = product.wholesalePricePerPack * product.packsPerCarton;
    let unitCost = product.costPricePerPack * product.packsPerCarton;

    if (unit === 'pack') {
      unitLabel = 'علبة';
      packsQuantity = 1;
      unitPrice = product.retailPricePerPack;
      unitCost = product.costPricePerPack;
    } else if (unit === 'box') {
      unitLabel = 'كرتونة';
      packsQuantity = product.packsPerCarton * product.cartonsPerBox;
      unitPrice = product.wholesalePricePerPack * packsQuantity;
      unitCost = product.costPricePerPack * packsQuantity;
    }

    const existingIdx = cartItems.findIndex(
      (it) => it.productId === product.id && it.unit === unit
    );

    if (existingIdx >= 0) {
      const updated = [...cartItems];
      const existing = updated[existingIdx];
      const newQty = existing.quantity + 1;
      const discountVal = existing.discount || 0;
      updated[existingIdx] = {
        ...existing,
        quantity: newQty,
        packsQuantity: newQty * (existing.packsQuantity / existing.quantity),
        total: Math.max(0, (newQty * existing.unitPrice) - discountVal),
      };
      setCartItems(updated);
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        unit,
        unitLabel,
        quantity: 1,
        packsQuantity,
        unitPrice,
        unitCost,
        discount: 0,
        total: unitPrice,
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const handleUpdateCartQty = (idx: number, delta: number) => {
    const updated = [...cartItems];
    const item = updated[idx];
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      updated.splice(idx, 1);
    } else {
      const singlePackRatio = item.packsQuantity / item.quantity;
      const discountVal = item.discount || 0;
      updated[idx] = {
        ...item,
        quantity: newQty,
        packsQuantity: newQty * singlePackRatio,
        total: Math.max(0, (newQty * item.unitPrice) - discountVal),
      };
    }
    setCartItems(updated);
  };

  const handleSetCartQty = (idx: number, exactQty: number) => {
    const updated = [...cartItems];
    const item = updated[idx];
    const newQty = Math.max(1, exactQty);
    const singlePackRatio = item.packsQuantity / item.quantity;
    const discountVal = item.discount || 0;
    updated[idx] = {
      ...item,
      quantity: newQty,
      packsQuantity: newQty * singlePackRatio,
      total: Math.max(0, (newQty * item.unitPrice) - discountVal),
    };
    setCartItems(updated);
  };

  const handleRemoveFromCart = (idx: number) => {
    const updated = [...cartItems];
    updated.splice(idx, 1);
    setCartItems(updated);
  };

  const handleOpenEditItem = (idx: number) => {
    setEditingItemIndex(idx);
    setEditPriceInput(cartItems[idx].unitPrice);
    setEditCostInput(cartItems[idx].unitCost);
    setEditDiscountInput(cartItems[idx].discount || 0);
  };

  const handleSaveItemEdit = () => {
    if (editingItemIndex === null) return;

    const updated = [...cartItems];
    const item = updated[editingItemIndex];
    const itemDiscount = Math.max(0, editDiscountInput);
    updated[editingItemIndex] = {
      ...item,
      unitPrice: editPriceInput,
      unitCost: editCostInput,
      discount: itemDiscount,
      total: Math.max(0, (item.quantity * editPriceInput) - itemDiscount),
    };
    setCartItems(updated);
    setEditingItemIndex(null);
  };

  const rawCartTotal = cartItems.reduce((acc, item) => acc + item.total, 0);
  const finalCartTotal = Math.max(0, rawCartTotal - discount);

  // Clear POS cart once an invoice is confirmed and saved (isDraft is false)
  React.useEffect(() => {
    if (printingInvoice && !printingInvoice.isDraft && cartItems.length > 0) {
      setCartItems([]);
      setDiscount(0);
      setPaidAmountInput(0);
      setSelectedRepId('');
      setNotes('');
    }
  }, [printingInvoice]);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    const customer = customers.find((c) => c.id === selectedCustomerId);
    const rep = representatives.find((r) => r.id === selectedRepId);

    const customerName = customer ? customer.name : 'عميل نقدي (كاش)';
    const representativeName = rep ? rep.name : undefined;

    let totalCost = 0;
    let totalAmount = 0;

    cartItems.forEach((item) => {
      totalCost += item.unitCost * item.quantity;
      totalAmount += item.total;
    });

    const finalAmount = Math.max(0, totalAmount - discount);
    const netProfit = finalAmount - totalCost;
    const actualPaid = paymentMethod === 'cash' ? finalAmount : Math.min(paidAmountInput, finalAmount);
    const remainingAmount = Math.max(0, finalAmount - actualPaid);

    const draftInvoice = {
      id: `draft-${Date.now()}`,
      invoiceNumber: `INV-2026-${String(sales.length + 1001)}`,
      date: new Date().toLocaleString('ar-EG'),
      customerId: selectedCustomerId || undefined,
      customerName,
      representativeId: selectedRepId || undefined,
      representativeName,
      items: [...cartItems],
      totalCost,
      totalAmount,
      discount,
      finalAmount,
      netProfit,
      paymentMethod,
      paidAmount: actualPaid,
      remainingAmount,
      createdByRole: currentUser.role,
      createdByName: currentUser.name,
      notes,
      isDraft: true,
    };

    setPrintingInvoice(draftInvoice);
  };

  // Employees List (Filter for logged in non-admin employee to only see their own card)
  const staffMembers = currentUser.role !== 'admin'
    ? users.filter((u) => u.id === currentUser.id)
    : users.filter((u) => u.role !== 'admin');

  // Active Employee Assignment Details
  const activeAssignment = activeEmployee
    ? employeeAssignments.find((a) => a.userId === activeEmployee.id)
    : null;

  // Filtered Customers (for Employee POS or Admin POS)
  const availableCustomers = (posMode === 'employee_pos' || currentUser.role !== 'admin')
    ? (activeAssignment ? customers.filter((c) => (activeAssignment.assignedCustomerIds || []).includes(c.id)) : [])
    : customers;

  // Filtered Products (for Employee POS or Admin POS)
  const filteredProducts = products.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    if (posMode === 'employee_pos' || currentUser.role !== 'admin') {
      if (!activeAssignment || !activeAssignment.assignedProducts) {
        return false;
      }
      const assignedItem = activeAssignment.assignedProducts.find((item) => item.productId === p.id);
      return matchesQuery && matchesCategory && Boolean(assignedItem && assignedItem.assignedStockPacks > 0);
    }

    return matchesQuery && matchesCategory;
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-12 w-full">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
            <span>
              {posMode === 'employee_pos' && activeEmployee
                ? `نقطة بيع الموظف: ${activeEmployee.name}`
                : 'نقطة البيع السريعة وتعديل أسعار اليوم (POS)'}
            </span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {posMode === 'employee_pos'
              ? 'إصدار الفواتير الفورية للأصناف والعملاء المخصصين فقط لهذا الموظف.'
              : 'بيع بالقروصة والعلبة والكرتونة، إدارة نقاط بيع الموظفين، والتصدير الفوري.'}
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {posMode === 'employee_pos' && (
            <button
              onClick={() => setShowTodayInvoicesModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold border border-slate-700 transition-all text-xs cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>فواتير اليوم للموظف</span>
            </button>
          )}

          {currentUser.role === 'admin' && (
            <div>
              {posMode === 'employee_pos' ? (
                <button
                  onClick={handleExitEmployeePOS}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-md shadow-red-500/20 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>الخروج والعودة لنقطة بيع المدير</span>
                </button>
              ) : (
                <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700 text-xs font-bold gap-1">
                  <button
                    type="button"
                    onClick={() => setPosMode('admin')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      posMode === 'admin' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    نقطة البيع الرئيسية
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosMode('staff_management')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      posMode === 'staff_management' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>نقطة بيع الموظفين ({staffMembers.length})</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: STAFF POS MANAGEMENT (Cards for each employee) */}
      {posMode === 'staff_management' && currentUser.role === 'admin' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>إدارة وتخصيص نقاط البيع لموظفي المؤسسة</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">اختر موظفاً لتعديل أصنافه وعملائه أو الدخول لنقطة بيعه</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffMembers.length === 0 ? (
              <div className="col-span-full glass-panel p-8 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50 text-amber-400" />
                <p className="font-bold">لا يوجد موظفين مسجلين حالياً للنظام.</p>
                <p className="text-xs text-slate-500 mt-1">يمكنك إضافة موظفين جدد من صفحة الإعدادات والمستخدمين.</p>
              </div>
            ) : (
              staffMembers.map((emp) => {
                const assignment = employeeAssignments.find((a) => a.userId === emp.id);
                const assignedProdsCount = assignment ? assignment.assignedProducts.length : 0;
                const assignedCustsCount = assignment ? assignment.assignedCustomerIds.length : 0;
                const totalAssignedCartons = assignment
                  ? assignment.assignedProducts.reduce((acc, ap) => {
                      const prod = products.find((p) => p.id === ap.productId);
                      const packsPerCarton = prod ? prod.packsPerCarton || 10 : 10;
                      return acc + Math.floor(ap.assignedStockPacks / packsPerCarton);
                    }, 0)
                  : 0;

                // Check 3-day inactivity status for this employee
                const now = new Date();
                const lastDate = assignment?.lastSaleDate ? new Date(assignment.lastSaleDate) : new Date(emp.createdAt);
                const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
                const isInactive3Days = assignedProdsCount > 0 && diffDays >= 3;

                // Calculate employee's today total sales
                const empTodaySalesTotal = sales
                  .filter((s) => s.createdByName === emp.name || (s.createdByRole === 'cashier' && s.createdByName === emp.name))
                  .reduce((acc, s) => acc + s.finalAmount, 0);

                return (
                  <div
                    key={emp.id}
                    className={`glass-panel p-5 space-y-4 border flex flex-col justify-between transition-all ${
                      isInactive3Days ? 'border-red-500/50 bg-red-950/10' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${emp.avatarColor} flex items-center justify-center text-white font-black text-sm shadow-md`}
                          >
                            {emp.name[0]}
                          </div>
                          <div>
                            <h3 className="font-black text-sm text-white">{emp.name}</h3>
                            <span className="text-[11px] text-slate-400 font-mono">@{emp.username}</span>
                          </div>
                        </div>

                        {isInactive3Days ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-black animate-pulse flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>لم يبع منذ {diffDays} أيام!</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            نشط
                          </span>
                        )}
                      </div>

                      {/* Stats & Assignment Pills */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">الأصناف والكميات</span>
                          <strong className="text-amber-400 text-xs font-bold">
                            {assignedProdsCount} أصناف ({totalAssignedCartons} قروصة)
                          </strong>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">العملاء المخصصين</span>
                          <strong className="text-emerald-400 text-xs font-bold">{assignedCustsCount} عملاء</strong>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 col-span-2 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">إجمالي مبيعات اليوم للموظف:</span>
                          <strong className="text-emerald-400 text-xs font-bold">{empTodaySalesTotal.toLocaleString('ar-EG')} ج.م</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEnterEmployeePOS(emp)}
                          className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-amber-500/20 transition-colors"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>دخول نقطة بيعه</span>
                        </button>

                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => handleOpenAssignModal(emp)}
                            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/20 font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>تخصيص الصلاحيات</span>
                          </button>
                        )}
                      </div>

                      {currentUser.role === 'admin' && (
                        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-800/60">
                          <button
                            onClick={() => toggleDisableUser(emp.id)}
                            className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] transition-colors border ${
                              emp.isDisabled
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25'
                            }`}
                          >
                            {emp.isDisabled ? 'تفعيل الحساب' : 'إيقاف الحساب'}
                          </button>

                          <button
                            onClick={() => {
                              setPasswordChangeUser(emp);
                              setNewEmployeePassword('');
                            }}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-[11px] flex items-center justify-center gap-1"
                            title="تغيير كلمة السر"
                          >
                            <Edit2 className="w-3 h-3 text-amber-400" />
                            <span>كلمة السر</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: POS CATALOG & CART (Admin POS or Active Employee POS) */}
      {(posMode === 'admin' || posMode === 'employee_pos') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Side: Catalog (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glass-panel p-3.5 sm:p-4 space-y-3">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم، الماركة، أو امسح الباركود..."
                  className="w-full pr-9 pl-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'local', label: 'كليوباترا ومحلي' },
                  { id: 'imported', label: 'مارلبورو وأجنبي' },
                  { id: 'vape_accessories', label: 'فيب وإكسسوارات' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                (posMode === 'employee_pos' || currentUser.role !== 'admin') && (!activeAssignment || !activeAssignment.assignedProducts || activeAssignment.assignedProducts.length === 0) ? (
                  <div className="col-span-full glass-panel p-8 text-center space-y-3">
                    <AlertTriangle className="w-12 h-12 mx-auto text-amber-400 animate-bounce" />
                    <h3 className="font-extrabold text-base text-white">لم يتم تخصيص أصناف أو عهدة لهذا الموظف حتى الآن</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      يرجى التواصل مع المدير العام (حسام حسني) لتخصيص أصناف وبضاعة ومحلات للموظف من خيار "تخصيص الصلاحيات والعهد".
                    </p>
                  </div>
                ) : (
                  <div className="col-span-full glass-panel p-8 text-center text-slate-400">
                    <Cigarette className="w-10 h-10 mx-auto mb-2 opacity-50 text-amber-500" />
                    <p className="font-bold">لا توجد أصناف سجائر متاحة وفقاً للبحث والمصرح بها.</p>
                  </div>
                )
              ) : (
                filteredProducts.map((prod) => {
                  const isLowStock = prod.currentStockPacks <= prod.minStockAlertPacks;

                  // If in employee mode, show assigned stock for this employee
                  let displayStockPacks = prod.currentStockPacks;
                  if ((posMode === 'employee_pos' || currentUser.role !== 'admin') && activeAssignment) {
                    const empStock = activeAssignment.assignedProducts.find((p) => p.productId === prod.id);
                    displayStockPacks = empStock ? empStock.assignedStockPacks : 0;
                  }

                  return (
                    <div
                      key={prod.id}
                      className={`glass-panel p-3.5 sm:p-4 space-y-3 flex flex-col justify-between border transition-all ${
                        isLowStock ? 'border-red-500/40 bg-red-950/10' : 'border-slate-800 hover:border-emerald-500/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-black text-xs sm:text-sm text-white">{prod.name}</h3>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {prod.barcode}
                          </span>
                        </div>

                        <div className="mt-2 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[11px]">سعر القروصة:</span>
                            <strong className="text-amber-400 font-extrabold text-sm">
                              {(prod.wholesalePricePerPack * prod.packsPerCarton).toLocaleString('ar-EG')} ج.م
                            </strong>
                          </div>

                          <div className="flex items-center justify-between">
                            <span
                              className={`font-bold text-[11px] ${
                                isLowStock && currentUser.role === 'admin' && posMode === 'admin'
                                  ? 'text-red-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {posMode === 'employee_pos' || currentUser.role !== 'admin' ? 'العهدة المتاحة للموظف:' : 'المتاح بالمخزن:'}
                            </span>
                            <strong className="font-extrabold text-white text-xs font-mono">
                              {Math.floor(displayStockPacks / (prod.packsPerCarton || 10))} قروصة
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Primary Add Cartridge Button */}
                      <div className="pt-2 border-t border-slate-800">
                        <button
                          onClick={() => handleAddToCart(prod, 'carton')}
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>إضافة (+1 قروصة) بسعر {(prod.wholesalePricePerPack * prod.packsPerCarton).toLocaleString('ar-EG')} ج</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Side: Cart Invoice Panel (5 Cols) */}
          <div className="lg:col-span-5 glass-panel p-4 sm:p-5 space-y-4 flex flex-col justify-between border-amber-500/30">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <span>الفاتورة وتصفية الحساب</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">{cartItems.length} أصناف في السلة</span>
              </div>

              {/* Customer Selector (Filtered for employee if in employee mode) */}
              <div className="space-y-1">
                <label className="block text-slate-300 font-bold text-xs">اختر العميل المشتري *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- بيع مباشر لعميل كاش نقدي --</option>
                  {availableCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type === 'retail' ? 'تجزئة' : 'جملة'}) - مديونية: {c.balance} ج
                    </option>
                  ))}
                </select>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {cartItems.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    الفاتورة فارغة. اضغط على خيارات الأصناف لإضافتها إلى السلة.
                  </div>
                ) : (
                  cartItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs space-x-2 space-x-reverse"
                    >
                      <div>
                        <span className="font-extrabold text-white block leading-tight">{item.productName}</span>
                        <span className="text-[10px] text-amber-400 font-bold block">
                          {item.unitPrice} ج.م / {item.unitLabel}
                        </span>
                        {item.discount && item.discount > 0 ? (
                          <span className="text-[10px] text-emerald-400 font-extrabold block">
                            خصم صنف: -{item.discount} ج.م
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                          <button
                            onClick={() => handleUpdateCartQty(idx, -1)}
                            className="p-0.5 rounded text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleSetCartQty(idx, Number(e.target.value))}
                            className="w-12 px-1 py-0.5 text-center font-mono font-bold bg-slate-900 border border-slate-700 rounded text-amber-400 focus:outline-none"
                          />
                          <button
                            onClick={() => handleUpdateCartQty(idx, 1)}
                            className="p-0.5 rounded text-slate-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <strong className="text-emerald-400 font-extrabold font-mono text-xs min-w-[55px] text-left">
                          {item.total.toLocaleString('ar-EG')}ج
                        </strong>

                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => handleOpenEditItem(idx)}
                            className="p-1 text-slate-400 hover:text-blue-400"
                            title="تعديل سعر هذا اليوم"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleRemoveFromCart(idx)}
                          className="p-1 text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Calculations Summary */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>المجموع الكلي:</span>
                  <span className="font-bold text-white font-mono">{rawCartTotal.toLocaleString('ar-EG')} ج.م</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">خصم للفاتورة (ج.م):</span>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-left focus:outline-none"
                  />
                </div>

                {/* Payment Method Option */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-slate-400">طريقة الدفع:</span>
                  <div className="flex gap-1">
                    {[{ id: 'partial', label: 'جزئي' }].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-slate-950"
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-slate-400">المبلغ المدفوع الآن:</span>
                  <input
                    type="number"
                    value={paidAmountInput}
                    onChange={(e) => setPaidAmountInput(Number(e.target.value))}
                    className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-mono text-left focus:outline-none font-bold"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-sm">
                  <span className="font-extrabold text-white">إجمالي الفاتورة المطلوب:</span>
                  <strong className="text-amber-400 text-lg font-black font-mono">
                    {finalCartTotal.toLocaleString('ar-EG')} ج.م
                  </strong>
                </div>
              </div>
            </div>

            <button
              disabled={cartItems.length === 0}
              onClick={handleCheckout}
              className={`w-full py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                cartItems.length > 0
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/20 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>فتح الفاتورة</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Employee Product & Customer Assignment */}
      {assigningUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-4 overflow-y-auto max-h-[90vh] animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <span>تخصيص المنتجات والعملاء للموظف: {assigningUser.name}</span>
              </h3>
              <button
                onClick={() => setAssigningUser(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Section 1: Customers Assignment */}
              <div className="space-y-2">
                <h4 className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>العملاء المسموح للموظف البيع لهم:</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {customers.map((c) => {
                    const isChecked = assignedCustomersForm.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-colors ${
                          isChecked ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssignedCustomersForm([...assignedCustomersForm, c.id]);
                            } else {
                              setAssignedCustomersForm(assignedCustomersForm.filter((id) => id !== c.id));
                            }
                          }}
                          className="rounded text-amber-500"
                        />
                        <span className="font-semibold text-xs">{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Products Stock Assignment */}
              <div className="space-y-2">
                <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                  <Cigarette className="w-4 h-4" />
                  <span>تحديد كميات أصناف السجائر المخصصة للموظف (بالقروصة):</span>
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {products.map((p) => {
                    const qtyCartons = assignedProductsForm[p.id] || 0;

                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800"
                      >
                        <div>
                          <span className="font-bold text-white block text-xs">{p.name}</span>
                          <span className="text-[10px] text-slate-400">
                            متوفر بالمخزن الرئيسي: {Math.floor(p.currentStockPacks / (p.packsPerCarton || 10))} قروصة
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={Math.floor(p.currentStockPacks / (p.packsPerCarton || 10))}
                            value={qtyCartons}
                            onChange={(e) => {
                              const inputVal = Math.max(0, Number(e.target.value));
                              const mainCartons = Math.floor(p.currentStockPacks / (p.packsPerCarton || 10));
                              if (inputVal > mainCartons) {
                                alert(`⚠️ غير متوفر بالمخزن الرئيسي أكثر من (${mainCartons} قروصة) لصنف (${p.name})!`);
                                setAssignedProductsForm({
                                  ...assignedProductsForm,
                                  [p.id]: mainCartons,
                                });
                              } else {
                                setAssignedProductsForm({
                                  ...assignedProductsForm,
                                  [p.id]: inputVal,
                                });
                              }
                            }}
                            placeholder="0 قروصة"
                            className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-bold text-xs focus:outline-none font-mono text-center"
                          />
                          <span className="text-[10px] text-amber-400 font-bold min-w-[45px]">قروصة</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssigningUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveEmployeeAssignment}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-md shadow-amber-500/20"
                >
                  حفظ التخصيص للموظف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editing Price Modal */}
      {editingItemIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-4 sm:p-5 shadow-2xl space-y-3 my-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>تعديل سعر وتكلفة اليوم للصنف</span>
              </h3>
              <button
                onClick={() => setEditingItemIndex(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">سعر بيع اليوم لهذه الوحدة (ج.م)</label>
                <input
                  type="number"
                  step="0.5"
                  value={editPriceInput}
                  onChange={(e) => setEditPriceInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">خصم خاص بهذا الصنف (ج.م)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={editDiscountInput}
                  onChange={(e) => setEditDiscountInput(Math.max(0, Number(e.target.value)))}
                  placeholder="0 ج.م"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-bold focus:outline-none"
                />
              </div>

              {currentUser.role === 'admin' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">تكلفة الشراء اليوم للوحدة (ج.م)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editCostInput}
                    onChange={(e) => setEditCostInput(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 font-bold focus:outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItemIndex(null)}
                  className="px-3.5 py-1.5 rounded-xl font-semibold text-slate-400 hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveItemEdit}
                  className="px-4 py-1.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-600"
                >
                  حفظ السعر الجديد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL: Today's Employee Invoices Log */}
      {showTodayInvoicesModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 my-4 overflow-y-auto max-h-[90vh] animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>سجل فواتير اليوم للموظف ({activeEmployee?.name || currentUser.name})</span>
              </h3>
              <button
                onClick={() => setShowTodayInvoicesModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {(() => {
                const empName = activeEmployee ? activeEmployee.name : currentUser.name;
                const empSales = sales.filter(
                  (s) => s.createdByName === empName || (s.createdByRole === 'cashier' && activeEmployee && s.createdByName === activeEmployee.name)
                );

                if (empSales.length === 0) {
                  return (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      لا توجد فواتير بيع مسجلة لهذا الموظف اليوم حتى الآن.
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-2.5">الفاتورة</th>
                          <th className="p-2.5">التاريخ</th>
                          <th className="p-2.5">العميل</th>
                          <th className="p-2.5">الإجمالي</th>
                          <th className="p-2.5">المدفوع</th>
                          <th className="p-2.5 text-center">إجراء المعاينة / إرسال</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {empSales.map((sale) => (
                          <tr key={sale.id} className="hover:bg-slate-800/40">
                            <td className="p-2.5 font-bold text-amber-400 font-mono">{sale.invoiceNumber}</td>
                            <td className="p-2.5 text-slate-400">{sale.date}</td>
                            <td className="p-2.5 text-slate-200 font-semibold">{sale.customerName}</td>
                            <td className="p-2.5 font-bold text-white">{sale.finalAmount.toLocaleString('ar-EG')} ج.م</td>
                            <td className="p-2.5 text-emerald-400">{sale.paidAmount.toLocaleString('ar-EG')} ج.م</td>
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => setPrintingInvoice(sale)}
                                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm flex items-center justify-center gap-1 mx-auto cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>معاينة / PDF / صورة</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Change Employee Password by Admin */}
      {passwordChangeUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>تغيير كلمة السر لـ ({passwordChangeUser.name})</span>
              </h3>
              <button
                onClick={() => setPasswordChangeUser(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newEmployeePassword.trim()) return;
                updateUserPassword(passwordChangeUser.id, newEmployeePassword);
                setPasswordChangeUser(null);
                setNewEmployeePassword('');
                alert(`تم تحديث كلمة السر للموظف (${passwordChangeUser.name}) بنجاح!`);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-300 mb-1">كلمة السر الجديدة *</label>
                <input
                  type="password"
                  required
                  value={newEmployeePassword}
                  onChange={(e) => setNewEmployeePassword(e.target.value)}
                  placeholder="أدخل كلمة السر الجديدة..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPasswordChangeUser(null)}
                  className="px-3.5 py-1.5 rounded-xl font-semibold text-slate-400 hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-md shadow-amber-500/20"
                >
                  تأكيد وتغيير كلمة السر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
