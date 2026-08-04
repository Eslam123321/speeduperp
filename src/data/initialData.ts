import { Product, Customer, Supplier, SystemUser, SaleInvoice, PurchaseInvoice, SystemNotification, Representative, Expense } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'كليوباترا بوكس كينج سايز 20',
    brand: 'كليوباترا',
    category: 'local',
    barcode: '622100100101',
    costPricePerPack: 34,
    wholesalePricePerPack: 37.5,
    retailPricePerPack: 38.5,
    packsPerCarton: 10,
    cartonsPerBox: 50,
    currentStockPacks: 4500, // 9 كراتين
    minStockAlertPacks: 1000,
    createdAt: '2026-01-01',
  },
  {
    id: 'prod-2',
    name: 'كليوباترا سوبر أزرق',
    brand: 'كليوباترا',
    category: 'local',
    barcode: '622100100102',
    costPricePerPack: 34,
    wholesalePricePerPack: 37.5,
    retailPricePerPack: 38.5,
    packsPerCarton: 10,
    cartonsPerBox: 50,
    currentStockPacks: 350, // تنبيه نقص المخزون!
    minStockAlertPacks: 800,
    createdAt: '2026-01-01',
  },
  {
    id: 'prod-3',
    name: 'مارلبورو أحمر (Marlboro Red)',
    brand: 'مارلبورو',
    category: 'imported',
    barcode: '762230011201',
    costPricePerPack: 79,
    wholesalePricePerPack: 84,
    retailPricePerPack: 86,
    packsPerCarton: 10,
    cartonsPerBox: 50,
    currentStockPacks: 2200,
    minStockAlertPacks: 500,
    createdAt: '2026-01-01',
  },
  {
    id: 'prod-4',
    name: 'مارلبورو أبيض (Marlboro Gold/White)',
    brand: 'مارلبورو',
    category: 'imported',
    barcode: '762230011202',
    costPricePerPack: 79,
    wholesalePricePerPack: 84,
    retailPricePerPack: 86,
    packsPerCarton: 10,
    cartonsPerBox: 50,
    currentStockPacks: 1800,
    minStockAlertPacks: 500,
    createdAt: '2026-01-01',
  },
  {
    id: 'prod-5',
    name: 'إل أند إم أزرق (L&M Blue)',
    brand: 'L&M',
    category: 'imported',
    barcode: '762230055101',
    costPricePerPack: 59,
    wholesalePricePerPack: 63,
    retailPricePerPack: 65,
    packsPerCarton: 10,
    cartonsPerBox: 50,
    currentStockPacks: 3100,
    minStockAlertPacks: 600,
    createdAt: '2026-01-01',
  },
  {
    id: 'prod-6',
    name: 'إل أند إم أحمر (L&M Red)',
    brand: 'L&M',
    category: 'imported',
    barcode: '762230055102',
    costPricePerPack: 59,
    wholesalePricePerPack: 63,
    retailPricePerPack: 65,
    packsPerCarton: 10,
    cartonsPerBox: 50,
    currentStockPacks: 240, // تنبيه نقص!
    minStockAlertPacks: 600,
    createdAt: '2026-01-01',
  },
  {
    id: 'prod-7',
    name: 'وينستون أزرق (Winston Blue)',
    brand: 'Winston',
    category: 'imported',
    barcode: '403310022301',
    costPricePerPack: 54,
    wholesalePricePerPack: 58,
    retailPricePerPack: 60,
    packsPerCarton: 10,
    cartonsPerBox: 50,
    currentStockPacks: 1400,
    minStockAlertPacks: 400,
    createdAt: '2026-01-01',
  },
  {
    id: 'prod-8',
    name: 'ميريت أصفر (Merit Yellow)',
    brand: 'Merit',
    category: 'imported',
    barcode: '762230088901',
    costPricePerPack: 88,
    wholesalePricePerPack: 93,
    retailPricePerPack: 95,
    packsPerCarton: 10,
    cartonsPerBox: 50,
    currentStockPacks: 900,
    minStockAlertPacks: 300,
    createdAt: '2026-01-01',
  },
  {
    id: 'prod-9',
    name: 'تارجت أحمر (Target Red)',
    brand: 'تارجت',
    category: 'local',
    barcode: '622100400501',
    costPricePerPack: 28,
    wholesalePricePerPack: 31,
    retailPricePerPack: 33,
    packsPerCarton: 10,
    cartonsPerBox: 50,
    currentStockPacks: 1500,
    minStockAlertPacks: 500,
    createdAt: '2026-01-01',
  },
  {
    id: 'prod-10',
    name: 'فلاتر سجائر ونكهات فيب فاخرة',
    brand: 'إكسسوارات',
    category: 'vape_accessories',
    barcode: '622990033101',
    costPricePerPack: 120,
    wholesalePricePerPack: 150,
    retailPricePerPack: 170,
    packsPerCarton: 1,
    cartonsPerBox: 20,
    currentStockPacks: 120,
    minStockAlertPacks: 30,
    createdAt: '2026-01-01',
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'سوبرماركت الأمانة (أحمد محمود)',
    phone: '01012345678',
    type: 'retail',
    creditLimit: 50000,
    balance: 12450, // عليه 12450 ج.م
    address: 'القاهرة - حي المعادي',
    notes: 'عميل منتظم يدفع كل يوم أربعاء',
    createdAt: '2026-01-10',
  },
  {
    id: 'cust-2',
    name: 'محلات التقوى للجملة (حاج إبراهيم)',
    phone: '01198765432',
    type: 'wholesale',
    creditLimit: 150000,
    balance: 38200, // عليه 38200 ج.م
    address: 'الجيزة - شارع الفيوم',
    notes: 'تاجر جملة ياخذ كراتين مغلقة',
    createdAt: '2026-01-15',
  },
  {
    id: 'cust-3',
    name: 'كشك البرنس (محمد علي)',
    phone: '01234567890',
    type: 'retail',
    creditLimit: 20000,
    balance: 4100,
    address: 'وسط البلد - شوارب',
    notes: 'يشتري خراطيش متفرقة',
    createdAt: '2026-02-01',
  },
  {
    id: 'cust-4',
    name: 'مجمع محلات التوحيد (شريف عادل)',
    phone: '01055443322',
    type: 'distributor',
    creditLimit: 250000,
    balance: 85000,
    address: 'القليوبية - بنها',
    notes: 'موزع إقليمي سداد بشيكات أو تحويلات',
    createdAt: '2026-02-10',
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'supp-1',
    name: 'شركة الشرقية للدخان (Eastern Company)',
    companyName: 'الشرقية للدخان ش.م.م',
    phone: '0224567890',
    balance: 140000, // يطلبنا 140000 ج.م
    address: '6 أكتوبر - المنطقة الصناعية',
    notes: 'المورد الرئيسي للسجائر المحلية (كليوباترا وتارجت)',
    createdAt: '2026-01-01',
  },
  {
    id: 'supp-2',
    name: 'شركة فيليب موريس مصر (Philip Morris)',
    companyName: 'فيليب موريس إنترناشيونال',
    phone: '0229876543',
    balance: 95000,
    address: 'القاهرة الجديدة - التجمع الخامس',
    notes: 'مورد مارلبورو، إل أند إم، ميريت',
    createdAt: '2026-01-01',
  },
  {
    id: 'supp-3',
    name: 'شركة جي تي آي مصر (JTI Egypt)',
    companyName: 'اليابان للتطوير والتوزيع',
    phone: '0221122334',
    balance: 42000,
    address: 'الشيخ زايد - كوريدور 2000',
    notes: 'مورد وينستون وجولد كوست',
    createdAt: '2026-01-05',
  }
];

export const INITIAL_USERS: SystemUser[] = [
  {
    id: 'usr-1',
    name: 'حسام حسني',
    username: 'hossam',
    password: '123',
    role: 'admin',
    permissions: ['all', 'pos_sales', 'inventory_manage', 'purchases_suppliers', 'customers_debts', 'reports_profits', 'system_settings'],
    avatarColor: 'from-amber-500 to-yellow-600',
    createdAt: '2026-01-01',
  },
  {
    id: 'usr-2',
    name: 'محمود عبد الفتاح',
    username: 'inventory',
    password: '123',
    role: 'inventory_manager',
    permissions: ['inventory_manage', 'purchases_suppliers', 'pos_sales'],
    avatarColor: 'from-emerald-500 to-teal-600',
    createdAt: '2026-01-01',
  },
  {
    id: 'usr-3',
    name: 'حسن الكاشير',
    username: 'cashier',
    password: '123',
    role: 'cashier',
    permissions: ['pos_sales', 'customers_debts'],
    avatarColor: 'from-blue-500 to-indigo-600',
    createdAt: '2026-01-01',
  }
];

export const INITIAL_SALES: SaleInvoice[] = [
  {
    id: 'sale-1',
    invoiceNumber: 'INV-2026-0101',
    date: '2026-07-28 14:30',
    customerId: 'cust-2',
    customerName: 'محلات التقوى للجملة (حاج إبراهيم)',
    items: [
      {
        productId: 'prod-1',
        productName: 'كليوباترا بوكس كينج سايز 20',
        unit: 'box',
        unitLabel: 'كرتونة',
        quantity: 2,
        packsQuantity: 1000,
        unitPrice: 18750, // 37.5 * 500
        unitCost: 17000, // 34 * 500
        total: 37500,
      },
      {
        productId: 'prod-3',
        productName: 'مارلبورو أحمر (Marlboro Red)',
        unit: 'carton',
        unitLabel: 'خرطوشة',
        quantity: 5,
        packsQuantity: 50,
        unitPrice: 840, // 84 * 10
        unitCost: 790, // 79 * 10
        total: 4200,
      }
    ],
    totalCost: 37950,
    totalAmount: 41700,
    discount: 200,
    finalAmount: 41500,
    netProfit: 3550,
    paymentMethod: 'partial',
    paidAmount: 25000,
    remainingAmount: 16500,
    createdByRole: 'admin',
    createdByName: 'حسام حسني',
    notes: 'تم تسليم كراتين مغلقة بحالة ممتازة',
  },
  {
    id: 'sale-2',
    invoiceNumber: 'INV-2026-0102',
    date: '2026-07-29 10:15',
    customerId: 'cust-1',
    customerName: 'سوبرماركت الأمانة (أحمد محمود)',
    items: [
      {
        productId: 'prod-5',
        productName: 'إل أند إم أزرق (L&M Blue)',
        unit: 'carton',
        unitLabel: 'خرطوشة',
        quantity: 10,
        packsQuantity: 100,
        unitPrice: 630,
        unitCost: 590,
        total: 6300,
      }
    ],
    totalCost: 5900,
    totalAmount: 6300,
    discount: 0,
    finalAmount: 6300,
    netProfit: 400,
    paymentMethod: 'cash',
    paidAmount: 6300,
    remainingAmount: 0,
    createdByRole: 'cashier',
    createdByName: 'حسن الكاشير',
    notes: 'سداد نقدي فور الدفع',
  }
];

export const INITIAL_PURCHASES: PurchaseInvoice[] = [
  {
    id: 'purch-1',
    invoiceNumber: 'PUR-2026-0044',
    date: '2026-07-25 11:00',
    supplierId: 'supp-1',
    supplierName: 'شركة الشرقية للدخان (Eastern Company)',
    items: [
      {
        productId: 'prod-1',
        productName: 'كليوباترا بوكس كينج سايز 20',
        unit: 'box',
        unitLabel: 'كرتونة',
        quantity: 10,
        packsQuantity: 5000,
        unitCostPrice: 17000,
        total: 170000,
      }
    ],
    totalAmount: 170000,
    paidAmount: 100000,
    remainingAmount: 70000,
    notes: 'توريد كراتين فابريقة حديثة الانتاج',
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    title: 'تنبيه حد إعادة الطلب!',
    message: 'المخزون الحالي لصنف (كليوباترا سوبر أزرق) هو 350 علبة فقط، وهو أقل من حد إعادة الطلب (800 علبة).',
    type: 'low_stock',
    timestamp: '2026-07-29 08:30',
    read: false,
    productId: 'prod-2',
  },
  {
    id: 'notif-2',
    title: 'تنبيه مخزون حرج!',
    message: 'المخزون الحالي لصنف (إل أند إم أحمر) هو 240 علبة فقط، يرجى إجراء طلب توريد جديد.',
    type: 'low_stock',
    timestamp: '2026-07-29 09:10',
    read: false,
    productId: 'prod-6',
  },
  {
    id: 'notif-3',
    title: 'تنبيه مديونية عميل!',
    message: 'تجاوز العميل (مجمع محلات التوحيد) مبلغ 80,000 ج.م من حد الائتمان المقرر.',
    type: 'credit_warning',
    timestamp: '2026-07-28 16:45',
    read: true,
  }
];

export const INITIAL_REPRESENTATIVES: Representative[] = [
  {
    id: 'rep-1',
    name: 'أحمد السائق (سيارة 1 - خط المعادي)',
    phone: '01011223344',
    vehicleNo: 'أ ب ج 1234',
    cashOnHand: 14500, // فلوس معاه محصلة
    totalSales: 45200,
    assignedStock: [
      { productId: 'prod-1', productName: 'كليوباترا بوكس كينج سايز 20', quantityPacks: 500 }, // 1 كرتونة
      { productId: 'prod-3', productName: 'مارلبورو أحمر (Marlboro Red)', quantityPacks: 200 }, // 20 خرطوشة
    ],
    visitedCustomers: [
      { id: 'v-1', customerId: 'cust-1', customerName: 'سوبرماركت الأمانة (أحمد محمود)', date: '2026-07-29 11:30', amountCollected: 5000, notes: 'تحصيل كاش جزئي من المديونية' },
      { id: 'v-2', customerId: 'cust-3', customerName: 'كشك البرنس (محمد علي)', date: '2026-07-29 13:10', amountCollected: 2500, notes: 'زيارة دورية وتوريد خراطيش' },
    ],
    notes: 'مسؤول خط المعادي وحلوان',
    createdAt: '2026-01-15',
  },
  {
    id: 'rep-2',
    name: 'محمود المندوب (سيارة 2 - خط الجيزة)',
    phone: '01122334455',
    vehicleNo: 'ط ي ر 5678',
    cashOnHand: 8200,
    totalSales: 31000,
    assignedStock: [
      { productId: 'prod-5', productName: 'إل أند إم أزرق (L&M Blue)', quantityPacks: 300 },
      { productId: 'prod-7', productName: 'وينستون أزرق (Winston Blue)', quantityPacks: 150 },
    ],
    visitedCustomers: [
      { id: 'v-3', customerId: 'cust-2', customerName: 'محلات التقوى للجملة (حاج إبراهيم)', date: '2026-07-28 15:00', amountCollected: 8200, notes: 'سداد دفعة من فاتورة INV-2026-0101' },
    ],
    notes: 'مسؤول خط الجيزة وفيصل والفيوم',
    createdAt: '2026-01-20',
  }
];

export const INITIAL_EXPENSES: Expense[] = [];

