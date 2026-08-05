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

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_SUPPLIERS: Supplier[] = [];

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
  }
];

export const INITIAL_SALES: SaleInvoice[] = [];

export const INITIAL_PURCHASES: PurchaseInvoice[] = [];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [];

export const INITIAL_REPRESENTATIVES: Representative[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

