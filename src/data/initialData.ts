import { Product, Customer, Supplier, SystemUser, SaleInvoice, PurchaseInvoice, SystemNotification, Representative, Expense } from '../types';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_SUPPLIERS: Supplier[] = [];

export const INITIAL_USERS: SystemUser[] = [
  {
    id: 'usr-1',
    name: 'حسام حسني',
    username: 'hossam',
    password: '123',
    role: 'admin',
    permissions: ['all', 'pos_sales', 'inventory_manage', 'customers_debts', 'reports_profits', 'system_settings'],
    avatarColor: 'from-amber-500 to-yellow-600',
    createdAt: '2026-01-01',
  }
];

export const INITIAL_SALES: SaleInvoice[] = [];

export const INITIAL_PURCHASES: PurchaseInvoice[] = [];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [];

export const INITIAL_REPRESENTATIVES: Representative[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

