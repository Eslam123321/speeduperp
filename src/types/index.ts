export type UnitType = 'pack' | 'carton' | 'box';

export type PermissionType =
  | 'all'                 // كافة الصلاحيات
  | 'pos_sales'           // نقطة البيع والمبيعات
  | 'inventory_manage'    // المخزون والجرد
  | 'purchases_suppliers' // المشتريات والموردين
  | 'customers_debts'     // العملاء والديون
  | 'representatives'     // المندوبين والسيارات
  | 'expenses'            // المصاريف والتشغيل
  | 'reports_profits'     // التقارير وصافي الأرباح
  | 'system_settings'    // الإعدادات والربط السحابي والمستخدمين
  | 'employee_store';     // مخزن الموظف ونقطة بيعه المصرح بها

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'local' | 'imported' | 'cigar' | 'vape_accessories';
  barcode: string;
  costPricePerPack: number;        // سعر الشراء للعلبة
  wholesalePricePerPack: number;   // سعر بيع الجملة للعلبة
  retailPricePerPack: number;      // سعر القطاعي للعلبة
  packsPerCarton: number;          // العلب بالخرطوشة (غالباً 10)
  cartonsPerBox: number;           // الخراطيش بالكرتونة (غالباً 50)
  currentStockPacks: number;       // إجمالي العلب بالمخزن الرئيسي
  minStockAlertPacks: number;      // حد إعادة الطلب بالعلب
  expiryDate?: string;             // تاريخ الانتهاء/الدفعة
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  type: 'retail' | 'wholesale' | 'distributor';
  creditLimit: number;    // حد الائتمان بالجنيه
  balance: number;        // المستحق (موجب = ديون عليه، سالب = رصيد دائن له)
  address?: string;
  notes?: string;
  lastPaymentDate?: string; // تاريخ آخر دفعة
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  balance: number;        // المستحق له (موجب = يطلبنا فلوس، سالب = دفعة مقدمة)
  address?: string;
  notes?: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  unit: UnitType;
  unitLabel: string;      // 'علبة' | 'خرطوشة' | 'كرتونة'
  quantity: number;       // العدد المشترى من هذه الوحدة
  packsQuantity: number;  // المعادل بالعلب
  unitPrice: number;      // سعر الوحدة المبيعة بها (قابل للتعديل الفوري)
  unitCost: number;       // تكلفة الوحدة (قابلة للتعديل الفوري)
  total: number;          // الإجمالي لهذه المادة
}

export interface SaleInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId?: string;
  customerName: string;
  representativeId?: string; // المندوب أو السائق المسؤول
  representativeName?: string;
  items: SaleItem[];
  totalCost: number;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  netProfit: number;
  paymentMethod: 'cash' | 'credit' | 'partial';
  paidAmount: number;
  remainingAmount: number;
  createdByRole: 'admin' | 'inventory_manager' | 'cashier' | 'custom';
  createdByName: string;
  notes?: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  unit: UnitType;
  unitLabel: string;
  quantity: number;
  packsQuantity: number;
  unitCostPrice: number;
  total: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
}

export interface CustomerTransaction {
  id: string;
  customerId: string;
  date: string;
  type: 'sale_invoice' | 'payment_received' | 'opening_balance';
  amount: number;         // القيمة (إيجابي يزيد المديونية، سلبي يقلل المديونية)
  description: string;
  referenceId?: string;   // رقم الفاتورة أو رقم سند القبض
}

export interface RepresentativeStockItem {
  productId: string;
  productName: string;
  quantityPacks: number;
}

export interface VisitedCustomerRecord {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  amountCollected: number;
  notes?: string;
}

export interface Representative {
  id: string;
  name: string;
  phone: string;
  vehicleNo?: string;
  cashOnHand: number;       // فلوس معاه من التحصيلات
  totalSales: number;       // إجمالي مبيعات المندوب
  assignedStock: RepresentativeStockItem[]; // ستوك السيارة المحول من المخزن الرئيسي
  visitedCustomers: VisitedCustomerRecord[]; // قائمة العملاء الذين زارهم المندوب
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'fuel' | 'rent' | 'salaries' | 'maintenance' | 'hospitality' | 'other';
  date: string;
  notes?: string;
  createdByName: string;
}

export interface SystemUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: 'admin' | 'inventory_manager' | 'cashier' | 'custom';
  permissions: PermissionType[];   // مصفوفة الصلاحيات الممنوحة
  avatarColor: string;
  isDisabled?: boolean;            // مفعّلية الحساب (موقف أو نشط)
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'low_stock' | 'expiry' | 'credit_warning' | 'info';
  timestamp: string;
  read: boolean;
  productId?: string;
  customerId?: string;
  saleId?: string;
}

export interface EmployeeStockItem {
  productId: string;
  assignedStockPacks: number;
}

export interface EmployeeAssignment {
  userId: string;
  assignedCustomerIds: string[];
  assignedProducts: EmployeeStockItem[];
  lastSaleDate?: string;
}

export interface FirebaseConfigInput {
  apiKey: string;
  authDomain: string;
  databaseURL?: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

