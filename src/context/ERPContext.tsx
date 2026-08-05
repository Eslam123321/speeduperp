import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Customer,
  Supplier,
  SaleInvoice,
  PurchaseInvoice,
  SystemUser,
  SystemNotification,
  FirebaseConfigInput,
  SaleItem,
  PurchaseItem,
  Representative,
  Expense,
  PermissionType,
  EmployeeAssignment,
  EmployeeStockItem,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_USERS,
  INITIAL_SALES,
  INITIAL_PURCHASES,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPRESENTATIVES,
  INITIAL_EXPENSES,
} from '../data/initialData';
import { initializeFirebaseService, DEFAULT_FIREBASE_CONFIG, syncToFirebase, syncToFirestore, deleteFromFirestore, fetchFromFirebase, subscribeToFirebase } from '../services/firebase';

interface ERPContextType {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: SaleInvoice[];
  purchases: PurchaseInvoice[];
  representatives: Representative[];
  expenses: Expense[];
  notifications: SystemNotification[];
  users: SystemUser[];
  currentUser: SystemUser;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Authentication & Permissions
  loggedInUser: SystemUser | null;
  login: (username: string, pass: string) => { success: boolean; message: string };
  logout: () => void;
  hasUserPermission: (permission: PermissionType) => boolean;
  createUserAccount: (userData: {
    name: string;
    username: string;
    password?: string;
    role: 'admin' | 'inventory_manager' | 'cashier' | 'custom';
    permissions: PermissionType[];
  }) => { success: boolean; message: string };
  updateUserAccount: (id: string, updatedData: Partial<SystemUser>) => { success: boolean; message: string };
  deleteUserAccount: (id: string) => void;

  // Firebase & Backup
  firebaseConfig: FirebaseConfigInput | null;
  firebaseStatus: { connected: boolean; message: string };
  saveFirebaseConfig: (config: FirebaseConfigInput) => void;
  exportBackupJSON: () => string;
  importBackupJSON: (jsonStr: string) => boolean;
  resetToDefaultData: () => void;

  // Product Operations
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, changePacks: number, reason: string) => void;
  bulkUpdatePrices: (updates: { productId: string; costPricePerPack?: number; wholesalePricePerPack?: number; retailPricePerPack?: number }[]) => void;

  // Sales Operations
  createSaleInvoice: (invoice: {
    customerId?: string;
    customerName: string;
    representativeId?: string;
    representativeName?: string;
    items: SaleItem[];
    discount: number;
    paymentMethod: 'cash' | 'credit' | 'partial';
    paidAmount: number;
    notes?: string;
  }) => SaleInvoice;
  confirmSaleInvoice: (draft: SaleInvoice) => SaleInvoice;
  cancelDraftInvoice: () => void;
  deleteSaleInvoice: (id: string) => void;

  // Purchase Operations
  createPurchaseInvoice: (invoice: {
    supplierId: string;
    supplierName: string;
    items: PurchaseItem[];
    paidAmount: number;
    notes?: string;
  }) => PurchaseInvoice;
  deletePurchaseInvoice: (id: string) => void;

  // Customer Operations
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'balance'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  recordCustomerPayment: (customerId: string, amount: number, notes?: string, invoiceId?: string) => void;

  // Supplier Operations
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'balance'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  recordSupplierPayment: (supplierId: string, amount: number, notes?: string) => void;

  // Representative Operations
  addRepresentative: (repData: Omit<Representative, 'id' | 'createdAt' | 'cashOnHand' | 'totalSales' | 'assignedStock' | 'visitedCustomers'>) => void;
  updateRepresentative: (id: string, repData: Partial<Representative>) => void;
  deleteRepresentative: (id: string) => void;
  transferStockToRep: (repId: string, productId: string, quantityPacks: number) => { success: boolean; message: string };
  recordRepCollection: (repId: string, amountCollected: number, notes?: string) => void;
  recordRepVisit: (repId: string, customerId: string, customerName: string, amountCollected: number, notes?: string) => void;
  resetRepCash: (repId?: string) => void;

  // Expenses Operations
  addExpense: (expense: Omit<Expense, 'id' | 'createdByName'>) => void;
  deleteExpense: (id: string) => void;

  // WhatsApp Helper
  getWhatsAppShareUrl: (phone: string, textMessage: string) => string;

  // User & Permission
  setCurrentUser: (user: SystemUser) => void;
  switchRole: (role: 'admin' | 'inventory_manager' | 'cashier') => void;
  deleteUser: (id: string) => void;
  toggleDisableUser: (id: string) => void;
  updateUserPassword: (id: string, newPass: string) => void;

  // Notification Operations
  deleteNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  // Print Invoice Modal State
  printingInvoice: SaleInvoice | null;
  setPrintingInvoice: (inv: SaleInvoice | null) => void;

  // Capital & Inventory Valuation Operations
  initialCapitalCash: number;
  setInitialCapitalCash: (amount: number) => void;
  inventoryCostCapital: number;
  inventoryWholesaleCapital: number;
  inventoryRetailCapital: number;
  netTotalCapital: number;

  // Employee Assignment Operations
  employeeAssignments: EmployeeAssignment[];
  updateEmployeeAssignment: (userId: string, assignedCustomerIds: string[], assignedProducts: EmployeeStockItem[]) => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('dukhan_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('dukhan_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('dukhan_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [sales, setSales] = useState<SaleInvoice[]>(() => {
    const saved = localStorage.getItem('dukhan_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [purchases, setPurchases] = useState<PurchaseInvoice[]>(() => {
    const saved = localStorage.getItem('dukhan_purchases');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });

  const [representatives, setRepresentatives] = useState<Representative[]>(() => {
    const saved = localStorage.getItem('dukhan_representatives');
    return saved ? JSON.parse(saved) : INITIAL_REPRESENTATIVES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('dukhan_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('dukhan_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [users, setUsers] = useState<SystemUser[]>(() => {
    const saved = localStorage.getItem('dukhan_users');
    if (saved) {
      const parsed: SystemUser[] = JSON.parse(saved);
      return parsed.map((u) => ({
        ...u,
        permissions: u.permissions || (u.role === 'admin' ? ['all'] : u.role === 'inventory_manager' ? ['inventory_manage'] : ['pos_sales', 'customers_debts']),
      }));
    }
    return INITIAL_USERS;
  });

  const [loggedInUser, setLoggedInUser] = useState<SystemUser | null>(null);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [printingInvoice, setPrintingInvoice] = useState<SaleInvoice | null>(null);

  // Capital & Inventory Valuation State
  const [initialCapitalCash, setInitialCapitalCashState] = useState<number>(() => {
    const saved = localStorage.getItem('dukhan_capital_cash');
    return saved && saved !== '500000' ? Number(saved) : 0;
  });

  // Employee Assignments State
  const [employeeAssignments, setEmployeeAssignments] = useState<EmployeeAssignment[]>(() => {
    const saved = localStorage.getItem('dukhan_employee_assignments');
    return saved ? JSON.parse(saved) : [];
  });

  // Automated complete legacy mock data cleanup (wipes legacy mock products, customers, suppliers, sales, reps, users, 500k capital from local state & Firebase)
  React.useEffect(() => {
    const migratedKey = 'dukhan_clean_all_mock_v10';
    if (!localStorage.getItem(migratedKey)) {
      ['usr-2', 'usr-3'].forEach((id) => deleteFromFirestore('users', id));
      ['cust-1', 'cust-2', 'cust-3', 'cust-4'].forEach((id) => deleteFromFirestore('customers', id));
      ['supp-1', 'supp-2', 'supp-3'].forEach((id) => deleteFromFirestore('suppliers', id));
      ['sale-1', 'sale-2'].forEach((id) => deleteFromFirestore('sales', id));
      ['purch-1'].forEach((id) => deleteFromFirestore('purchases', id));
      ['rep-1', 'rep-2'].forEach((id) => deleteFromFirestore('representatives', id));
      ['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6', 'prod-7', 'prod-8', 'prod-9', 'prod-10'].forEach((id) => deleteFromFirestore('products', id));

      setProducts([]);
      setCustomers([]);
      setSuppliers([]);
      setSales([]);
      setPurchases([]);
      setNotifications([]);
      setRepresentatives([]);
      setExpenses([]);

      syncToFirebase('products', []);
      syncToFirebase('customers', []);
      syncToFirebase('suppliers', []);
      syncToFirebase('sales', []);
      syncToFirebase('purchases', []);
      syncToFirebase('representatives', []);
      syncToFirebase('expenses', []);
      syncToFirebase('notifications', []);

      const cleanUsers = INITIAL_USERS;
      setUsers(cleanUsers);
      syncToFirebase('users', cleanUsers);
      syncToFirestore('users', cleanUsers);

      setInitialCapitalCashState(0);
      localStorage.setItem('dukhan_capital_cash', '0');

      localStorage.setItem(migratedKey, 'true');
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem('dukhan_employee_assignments', JSON.stringify(employeeAssignments));
  }, [employeeAssignments]);

  const updateEmployeeAssignment = (userId: string, assignedCustomerIds: string[], assignedProducts: EmployeeStockItem[]) => {
    setEmployeeAssignments((prev) => {
      const idx = prev.findIndex((a) => a.userId === userId);
      const updatedItem: EmployeeAssignment = {
        userId,
        assignedCustomerIds,
        assignedProducts,
        lastSaleDate: idx >= 0 ? prev[idx].lastSaleDate : new Date().toISOString(),
      };
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedItem;
        return next;
      }
      return [...prev, updatedItem];
    });
  };

  // Automated 3-Day Employee Inactivity Check
  React.useEffect(() => {
    if (employeeAssignments.length === 0) return;
    const now = new Date();

    employeeAssignments.forEach((assignment) => {
      if (assignment.assignedProducts.length > 0) {
        const empUser = users.find((u) => u.id === assignment.userId);
        if (!empUser) return;

        const lastDate = assignment.lastSaleDate ? new Date(assignment.lastSaleDate) : new Date(empUser.createdAt);
        const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays >= 3) {
          const notifId = `inactive-emp-${assignment.userId}`;
          setNotifications((prev) => {
            if (prev.some((n) => n.id === notifId)) return prev;
            return [
              {
                id: notifId,
                title: 'تنبيه ضروري: توقف موظف عن البيع (أكثر من 3 أيام)',
                message: `الموظف (${empUser.name}) لم يقم بأي عملية بيع منذ ${diffDays} أيام ومخزونه لم يقل.`,
                type: 'credit_warning',
                timestamp: new Date().toLocaleString('ar-EG'),
                read: false,
              },
              ...prev,
            ];
          });
        }
      }
    });
  }, [employeeAssignments.length, users.length]);

  // Automated 3-Day Inactive Customer Notification Check for Admin
  React.useEffect(() => {
    if (customers.length === 0 || sales.length === 0) return;
    const now = new Date();

    customers.forEach((cust) => {
      const custSales = sales.filter((s) => s.customerId === cust.id);
      if (custSales.length > 0) {
        const latestSaleDate = new Date(
          Math.max(...custSales.map((s) => new Date(s.date).getTime()))
        );
        const diffDays = Math.floor((now.getTime() - latestSaleDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays >= 3) {
          const notifId = `inactive-cust-${cust.id}`;
          setNotifications((prev) => {
            if (prev.some((n) => n.id === notifId)) return prev;
            return [
              {
                id: notifId,
                title: 'تنبيه عميل متوقف عن التعامل (أكثر من 3 أيام)',
                message: `العميل (${cust.name}) لم يقم بأي عملية شراء منذ ${diffDays} أيام (آخر معاملة: ${latestSaleDate.toISOString().split('T')[0]}).`,
                type: 'credit_warning',
                timestamp: new Date().toLocaleString('ar-EG'),
                read: false,
                customerId: cust.id,
              },
              ...prev,
            ];
          });
        }
      }
    });
  }, [customers.length, sales.length]);

  const setInitialCapitalCash = (amount: number) => {
    const validAmount = Math.max(0, amount);
    setInitialCapitalCashState(validAmount);
    localStorage.setItem('dukhan_capital_cash', String(validAmount));
  };

  // Dynamic Capital & Inventory Valuation Calculations
  const inventoryCostCapital = products.reduce((acc, p) => acc + (p.currentStockPacks * p.costPricePerPack), 0);
  const inventoryWholesaleCapital = products.reduce((acc, p) => acc + (p.currentStockPacks * p.wholesalePricePerPack), 0);
  const inventoryRetailCapital = products.reduce((acc, p) => acc + (p.currentStockPacks * p.retailPricePerPack), 0);
  const totalCustomerDebtsCalc = customers.reduce((acc, c) => acc + Math.max(0, c.balance), 0);
  const totalSupplierPayablesCalc = suppliers.reduce((acc, s) => acc + Math.max(0, s.balance), 0);
  const netTotalCapital = initialCapitalCash + inventoryCostCapital + totalCustomerDebtsCalc - totalSupplierPayablesCalc;

  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfigInput | null>(() => {
    const saved = localStorage.getItem('dukhan_firebase_config');
    return saved ? JSON.parse(saved) : DEFAULT_FIREBASE_CONFIG;
  });

  const [firebaseStatus, setFirebaseStatus] = useState<{ connected: boolean; message: string }>({
    connected: false,
    message: 'جاري الاتصال بـ Firebase...',
  });

  const currentUser = loggedInUser || users[0];

  const hasUserPermission = (perm: PermissionType): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    const perms = currentUser.permissions || [];
    return perms.includes('all') || perms.includes(perm);
  };

  // Sync to localStorage, Firebase Realtime Database & Cloud Firestore on EVERY state change
  useEffect(() => {
    localStorage.setItem('dukhan_products', JSON.stringify(products));
    syncToFirebase('products', products);
    syncToFirestore('products', products);
  }, [products]);

  useEffect(() => {
    localStorage.setItem('dukhan_customers', JSON.stringify(customers));
    syncToFirebase('customers', customers);
    syncToFirestore('customers', customers);
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('dukhan_suppliers', JSON.stringify(suppliers));
    syncToFirebase('suppliers', suppliers);
    syncToFirestore('suppliers', suppliers);
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('dukhan_sales', JSON.stringify(sales));
    syncToFirebase('sales', sales);
    syncToFirestore('sales', sales);
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('dukhan_purchases', JSON.stringify(purchases));
    syncToFirebase('purchases', purchases);
    syncToFirestore('purchases', purchases);
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('dukhan_representatives', JSON.stringify(representatives));
    syncToFirebase('representatives', representatives);
    syncToFirestore('representatives', representatives);
  }, [representatives]);

  useEffect(() => {
    localStorage.setItem('dukhan_expenses', JSON.stringify(expenses));
    syncToFirebase('expenses', expenses);
    syncToFirestore('expenses', expenses);
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('dukhan_notifications', JSON.stringify(notifications));
    syncToFirebase('notifications', notifications);
    syncToFirestore('notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('dukhan_users', JSON.stringify(users));
    syncToFirebase('users', users);
    syncToFirestore('users', users);
  }, [users]);

  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem('dukhan_logged_user', JSON.stringify(loggedInUser));
    } else {
      localStorage.removeItem('dukhan_logged_user');
    }
  }, [loggedInUser]);

  useEffect(() => {
    localStorage.setItem('dukhan_capital_cash', String(initialCapitalCash));
    syncToFirebase('capital_cash', initialCapitalCash);
  }, [initialCapitalCash]);

  useEffect(() => {
    const configToUse = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    const res = initializeFirebaseService(configToUse);
    setFirebaseStatus({ connected: res.success, message: res.message });

    if (res.success) {
      const isDiff = (a: any, b: any) => JSON.stringify(a) !== JSON.stringify(b);

      // Realtime live subscriptions for ALL entities across devices (Mobile + Desktop)
      const unsubProducts = subscribeToFirebase('products', (remote) => {
        if (Array.isArray(remote) && remote.length > 0) {
          setProducts((prev) => (isDiff(remote, prev) ? remote : prev));
        }
      });
      const unsubCustomers = subscribeToFirebase('customers', (remote) => {
        if (Array.isArray(remote)) {
          setCustomers((prev) => (isDiff(remote, prev) ? remote : prev));
        } else if (remote === null) {
          setCustomers((prev) => (prev.length > 0 ? [] : prev));
        }
      });
      const unsubSuppliers = subscribeToFirebase('suppliers', (remote) => {
        if (Array.isArray(remote)) {
          setSuppliers((prev) => (isDiff(remote, prev) ? remote : prev));
        } else if (remote === null) {
          setSuppliers((prev) => (prev.length > 0 ? [] : prev));
        }
      });
      const unsubSales = subscribeToFirebase('sales', (remote) => {
        if (Array.isArray(remote)) {
          setSales((prev) => (isDiff(remote, prev) ? remote : prev));
        } else if (remote === null) {
          setSales((prev) => (prev.length > 0 ? [] : prev));
        }
      });
      const unsubPurchases = subscribeToFirebase('purchases', (remote) => {
        if (Array.isArray(remote)) {
          setPurchases((prev) => (isDiff(remote, prev) ? remote : prev));
        } else if (remote === null) {
          setPurchases((prev) => (prev.length > 0 ? [] : prev));
        }
      });
      const unsubReps = subscribeToFirebase('representatives', (remote) => {
        if (Array.isArray(remote)) {
          setRepresentatives((prev) => (isDiff(remote, prev) ? remote : prev));
        } else if (remote === null) {
          setRepresentatives((prev) => (prev.length > 0 ? [] : prev));
        }
      });
      const unsubExpenses = subscribeToFirebase('expenses', (remote) => {
        if (Array.isArray(remote)) {
          setExpenses((prev) => (isDiff(remote, prev) ? remote : prev));
        } else if (remote === null) {
          setExpenses((prev) => (prev.length > 0 ? [] : prev));
        }
      });
      const unsubNotifications = subscribeToFirebase('notifications', (remote) => {
        if (Array.isArray(remote)) {
          setNotifications((prev) => (isDiff(remote, prev) ? remote : prev));
        } else if (remote === null) {
          setNotifications((prev) => (prev.length > 0 ? [] : prev));
        }
      });
      const unsubUsers = subscribeToFirebase('users', (remoteUsers) => {
        if (Array.isArray(remoteUsers) && remoteUsers.length > 0) {
          setUsers((prev) => (isDiff(remoteUsers, prev) ? remoteUsers : prev));
        }
      });
      const unsubCapital = subscribeToFirebase('capital_cash', (remoteCap) => {
        if (typeof remoteCap === 'number') {
          setInitialCapitalCashState((prev) => (prev !== remoteCap ? remoteCap : prev));
        }
      });

      return () => {
        unsubProducts();
        unsubCustomers();
        unsubSuppliers();
        unsubSales();
        unsubPurchases();
        unsubReps();
        unsubExpenses();
        unsubNotifications();
        unsubUsers();
        unsubCapital();
      };
    }
  }, [firebaseConfig]);

  // Auth logic
  const login = (username: string, pass: string): { success: boolean; message: string } => {
    const found = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!found) return { success: false, message: 'اسم المستخدم غير موجود بالنظام' };
    if (found.password && found.password !== pass.trim()) return { success: false, message: 'كلمة السر غير صحيحة' };
    setLoggedInUser(found);
    if (found.role !== 'admin') {
      setActiveTab('pos');
    } else {
      setActiveTab('dashboard');
    }
    return { success: true, message: `مرحباً بك، ${found.name}` };
  };

  const logout = () => { setLoggedInUser(null); };

  const createUserAccount = (userData: {
    name: string;
    username: string;
    password?: string;
    role: 'admin' | 'inventory_manager' | 'cashier' | 'custom';
    permissions: PermissionType[];
  }): { success: boolean; message: string } => {
    const existing = users.find((u) => u.username.toLowerCase() === userData.username.trim().toLowerCase());
    if (existing) return { success: false, message: 'اسم المستخدم مستخدم مسبقاً' };

    let color = 'from-blue-500 to-indigo-600';
    if (userData.role === 'admin' || userData.permissions.includes('all')) color = 'from-amber-500 to-yellow-600';
    if (userData.role === 'inventory_manager') color = 'from-emerald-500 to-teal-600';

    const newUser: SystemUser = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      username: userData.username.trim().toLowerCase(),
      password: userData.password || '123',
      role: userData.role,
      permissions: userData.permissions,
      avatarColor: color,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [...prev, newUser]);
    return { success: true, message: `تم إنشاء حساب (${userData.name}) بنجاح!` };
  };

  const updateUserAccount = (id: string, updatedData: Partial<SystemUser>): { success: boolean; message: string } => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updatedData };
          if (loggedInUser && loggedInUser.id === id) setLoggedInUser(updated);
          return updated;
        }
        return u;
      })
    );
    return { success: true, message: 'تم تحديث بيانات الحساب بنجاح!' };
  };

  const deleteUserAccount = (id: string) => {
    deleteFromFirestore('users', id);
    setUsers((prev) => {
      const nextUsers = prev.filter((u) => u.id !== id);
      syncToFirebase('users', nextUsers);
      return nextUsers;
    });
  };

  const checkLowStockAlerts = (productList: Product[]) => {
    const newNotifications: SystemNotification[] = [];
    productList.forEach((prod) => {
      if (prod.currentStockPacks <= prod.minStockAlertPacks) {
        const existing = notifications.find((n) => n.productId === prod.id && !n.read);
        if (!existing) {
          newNotifications.push({
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            title: 'تنبيه حد إعادة الطلب!',
            message: `وصل صنف (${prod.name}) إلى الكمية الحرجة (${prod.currentStockPacks} علبة). حد الطلب: ${prod.minStockAlertPacks} علبة.`,
            type: 'low_stock',
            timestamp: new Date().toLocaleString('ar-EG'),
            read: false,
            productId: prod.id,
          });
        }
      }
    });

    if (newNotifications.length > 0) {
      setNotifications((prev) => [...newNotifications, ...prev]);
    }
  };

  // Product Operations
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newProduct, ...products];
    setProducts(updated);
    checkLowStockAlerts(updated);

    const userLabel = currentUser ? currentUser.name : 'المستخدم';
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `إضافة صنف جديد بالمخزن`,
        message: `قام الموظف (${userLabel}) بإضافة صنف جديد بالمخزن: (${productData.name}) بـ ${productData.currentStockPacks} علبة.`,
        type: 'info',
        timestamp: new Date().toLocaleString('ar-EG'),
        read: false,
        productId: newProduct.id,
      },
      ...prev,
    ]);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    const updated = products.map((p) => (p.id === id ? { ...p, ...productData } : p));
    setProducts(updated);
    checkLowStockAlerts(updated);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const adjustStock = (productId: string, changePacks: number, _reason: string) => {
    const targetProduct = products.find((p) => p.id === productId);
    const prodName = targetProduct ? targetProduct.name : 'صنف بالمخزن';

    const updated = products.map((p) => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.currentStockPacks + changePacks);
        return { ...p, currentStockPacks: newStock };
      }
      return p;
    });
    setProducts(updated);
    checkLowStockAlerts(updated);

    const actionStr = changePacks >= 0 ? `زيادة بمقدار ${changePacks}` : `خصم بمقدار ${Math.abs(changePacks)}`;
    const userLabel = currentUser ? currentUser.name : 'المستخدم';
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `تعديل وتكتيك مخزون`,
        message: `قام الموظف (${userLabel}) بتعديل مخزون (${prodName}) (${actionStr} علبة). السبب: ${_reason || 'تسوية مخزنية'}.`,
        type: 'info',
        timestamp: new Date().toLocaleString('ar-EG'),
        read: false,
        productId,
      },
      ...prev,
    ]);
  };

  const bulkUpdatePrices = (updates: { productId: string; costPricePerPack?: number; wholesalePricePerPack?: number; retailPricePerPack?: number }[]) => {
    setProducts((prev) =>
      prev.map((p) => {
        const matchingUpdate = updates.find((u) => u.productId === p.id);
        if (matchingUpdate) {
          return {
            ...p,
            costPricePerPack: matchingUpdate.costPricePerPack !== undefined ? matchingUpdate.costPricePerPack : p.costPricePerPack,
            wholesalePricePerPack: matchingUpdate.wholesalePricePerPack !== undefined ? matchingUpdate.wholesalePricePerPack : p.wholesalePricePerPack,
            retailPricePerPack: matchingUpdate.retailPricePerPack !== undefined ? matchingUpdate.retailPricePerPack : p.retailPricePerPack,
          };
        }
        return p;
      })
    );
  };

  // Sales Operations
  const createSaleInvoice = ({
    customerId,
    customerName,
    representativeId,
    representativeName,
    items,
    discount,
    paymentMethod,
    paidAmount,
    notes,
  }: {
    customerId?: string;
    customerName: string;
    representativeId?: string;
    representativeName?: string;
    items: SaleItem[];
    discount: number;
    paymentMethod: 'cash' | 'credit' | 'partial';
    paidAmount: number;
    notes?: string;
  }): SaleInvoice => {
    let totalCost = 0;
    let totalAmount = 0;

    items.forEach((item) => {
      totalCost += item.unitCost * item.quantity;
      totalAmount += item.total;
    });

    const finalAmount = Math.max(0, totalAmount - discount);
    const netProfit = finalAmount - totalCost;
    const actualPaid = paymentMethod === 'cash' ? finalAmount : Math.min(paidAmount, finalAmount);
    const remainingAmount = Math.max(0, finalAmount - actualPaid);

    const invoiceNum = `INV-2026-${String(sales.length + 1001)}`;
    const newInvoice: SaleInvoice = {
      id: `sale-${Date.now()}`,
      invoiceNumber: invoiceNum,
      date: new Date().toLocaleString('ar-EG'),
      customerId,
      customerName,
      representativeId,
      representativeName,
      items,
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
    };

    const updatedProducts = products.map((p) => {
      const soldItem = items.find((it) => it.productId === p.id);
      if (soldItem) {
        const newStock = Math.max(0, p.currentStockPacks - soldItem.packsQuantity);
        return { ...p, currentStockPacks: newStock };
      }
      return p;
    });
    setProducts(updatedProducts);
    checkLowStockAlerts(updatedProducts);

    if (customerId && remainingAmount > 0) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, balance: c.balance + remainingAmount } : c))
      );
    }

    if (representativeId) {
      setRepresentatives((prev) =>
        prev.map((rep) => {
          if (rep.id === representativeId) {
            const updatedAssigned = rep.assignedStock.map((stk) => {
              const sold = items.find((it) => it.productId === stk.productId);
              if (sold) {
                return { ...stk, quantityPacks: Math.max(0, stk.quantityPacks - sold.packsQuantity) };
              }
              return stk;
            });

            return {
              ...rep,
              cashOnHand: rep.cashOnHand + actualPaid,
              totalSales: rep.totalSales + finalAmount,
              assignedStock: updatedAssigned,
            };
          }
          return rep;
        })
      );
    }

    if (paidAmount > 0) {
      setInitialCapitalCashState((prev) => prev + paidAmount);
    }

    setSales((prev) => [newInvoice, ...prev]);
    setPrintingInvoice(newInvoice);

    // Update Employee Last Sale Date & Assigned Stock if created by employee
    if (currentUser) {
      setEmployeeAssignments((prev) =>
        prev.map((a) => {
          if (a.userId === currentUser.id) {
            const updatedProds = a.assignedProducts.map((ap) => {
              const sold = items.find((it) => it.productId === ap.productId);
              if (sold) {
                return {
                  ...ap,
                  assignedStockPacks: Math.max(0, ap.assignedStockPacks - sold.packsQuantity),
                };
              }
              return ap;
            });
            return { ...a, assignedProducts: updatedProds, lastSaleDate: new Date().toISOString() };
          }
          return a;
        })
      );
    }

    // Push real-time transaction notification for Admin
    const userLabel = currentUser ? currentUser.name : 'المستخدم';
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `فاتورة مبيعات جديدة (${newInvoice.invoiceNumber})`,
        message: `قام الموظف (${userLabel}) بإنشاء فاتورة مبيعات رقم (${newInvoice.invoiceNumber}) بقيمة ${finalAmount.toLocaleString('ar-EG')} ج.م للعميل (${customerName}).`,
        type: 'info',
        timestamp: new Date().toLocaleString('ar-EG'),
        read: false,
        saleId: newInvoice.id,
      },
      ...prev,
    ]);

    return newInvoice;
  };

  const confirmSaleInvoice = (draft: SaleInvoice): SaleInvoice => {
    const savedInvoice = createSaleInvoice({
      customerId: draft.customerId,
      customerName: draft.customerName,
      representativeId: draft.representativeId,
      representativeName: draft.representativeName,
      items: draft.items,
      discount: draft.discount,
      paymentMethod: draft.paymentMethod,
      paidAmount: draft.paidAmount,
      notes: draft.notes,
    });
    setPrintingInvoice(savedInvoice);
    return savedInvoice;
  };

  const cancelDraftInvoice = () => {
    setPrintingInvoice(null);
  };

  const deleteSaleInvoice = (id: string) => {
    deleteFromFirestore('sales', id);
    setSales((prev) => prev.filter((s) => s.id !== id));
  };

  // Purchase Operations
  const createPurchaseInvoice = ({
    supplierId,
    supplierName,
    items,
    paidAmount,
    notes,
  }: {
    supplierId: string;
    supplierName: string;
    items: PurchaseItem[];
    paidAmount: number;
    notes?: string;
  }): PurchaseInvoice => {
    let totalAmount = 0;
    items.forEach((item) => {
      totalAmount += item.total;
    });

    const remainingAmount = Math.max(0, totalAmount - paidAmount);
    const purchaseNum = `PUR-2026-${String(purchases.length + 1001)}`;

    const newPurchase: PurchaseInvoice = {
      id: `purch-${Date.now()}`,
      invoiceNumber: purchaseNum,
      date: new Date().toLocaleString('ar-EG'),
      supplierId,
      supplierName,
      items,
      totalAmount,
      paidAmount,
      remainingAmount,
      notes,
    };

    const updatedProducts = products.map((p) => {
      const purItem = items.find((it) => it.productId === p.id);
      if (purItem) {
        return { ...p, currentStockPacks: p.currentStockPacks + purItem.packsQuantity };
      }
      return p;
    });
    setProducts(updatedProducts);

    if (supplierId && remainingAmount > 0) {
      setSuppliers((prev) =>
        prev.map((s) => (s.id === supplierId ? { ...s, balance: s.balance + remainingAmount } : s))
      );
    }

    const userLabel = currentUser ? currentUser.name : 'المستخدم';
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `فاتورة توريد وبضاعة جديدة (${newPurchase.invoiceNumber})`,
        message: `قام الموظف (${userLabel}) بتسجيل فاتورة مشتريات وتوريد رقم (${newPurchase.invoiceNumber}) بقيمة ${totalAmount.toLocaleString('ar-EG')} ج.م من المورد (${supplierName}).`,
        type: 'info',
        timestamp: new Date().toLocaleString('ar-EG'),
        read: false,
      },
      ...prev,
    ]);

    setPurchases((prev) => [newPurchase, ...prev]);
    return newPurchase;
  };

  const deletePurchaseInvoice = (id: string) => {
    setPurchases((prev) => prev.filter((p) => p.id !== id));
  };

  // Customer Operations
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'balance'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      balance: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCustomer, ...prev]);
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...customerData } : c)));
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const recordCustomerPayment = (customerId: string, amount: number, notes?: string, invoiceId?: string) => {
    const nowStr = new Date().toISOString().split('T')[0];
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newBalance = Math.max(0, c.balance - amount);
          return { ...c, balance: newBalance, lastPaymentDate: nowStr };
        }
        return c;
      })
    );

    if (amount > 0) {
      setInitialCapitalCashState((prev) => prev + amount);
    }

    if (invoiceId) {
      setSales((prev) =>
        prev.map((s) => {
          if (s.id === invoiceId) {
            const newPaid = Math.min(s.finalAmount, s.paidAmount + amount);
            const newRem = Math.max(0, s.finalAmount - newPaid);
            return { ...s, paidAmount: newPaid, remainingAmount: newRem };
          }
          return s;
        })
      );
    }

    const userLabel = currentUser ? currentUser.name : 'المستخدم';
    const custObj = customers.find((c) => c.id === customerId);
    const custName = custObj ? custObj.name : 'العميل';
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'تحصيل دفعة مالية من عميل',
        message: `قام الموظف (${userLabel}) بتحصيل مبلغ ${amount.toLocaleString('ar-EG')} ج.م من العميل (${custName}). ${notes || ''}`,
        type: 'info',
        timestamp: new Date().toLocaleString('ar-EG'),
        read: false,
        customerId,
      },
      ...prev,
    ]);
  };

  // Supplier Operations
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'balance'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `supp-${Date.now()}`,
      balance: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
  };

  const updateSupplier = (id: string, supplierData: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...supplierData } : s)));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const recordSupplierPayment = (supplierId: string, amount: number, notes?: string) => {
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          const newBalance = Math.max(0, s.balance - amount);
          return { ...s, balance: newBalance };
        }
        return s;
      })
    );

    const userLabel = currentUser ? currentUser.name : 'المستخدم';
    const suppObj = suppliers.find((s) => s.id === supplierId);
    const suppName = suppObj ? suppObj.name : 'المورد';
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'سداد دفعة مالية لمورد',
        message: `قام الموظف (${userLabel}) بسداد مبلغ ${amount.toLocaleString('ar-EG')} ج.م للمورد (${suppName}). ${notes || ''}`,
        type: 'info',
        timestamp: new Date().toLocaleString('ar-EG'),
        read: false,
      },
      ...prev,
    ]);
  };

  // Representative Operations
  const addRepresentative = (repData: Omit<Representative, 'id' | 'createdAt' | 'cashOnHand' | 'totalSales' | 'assignedStock' | 'visitedCustomers'>) => {
    const newRep: Representative = {
      ...repData,
      id: `rep-${Date.now()}`,
      cashOnHand: 0,
      totalSales: 0,
      assignedStock: [],
      visitedCustomers: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setRepresentatives((prev) => [newRep, ...prev]);
  };

  const updateRepresentative = (id: string, repData: Partial<Representative>) => {
    setRepresentatives((prev) => prev.map((r) => (r.id === id ? { ...r, ...repData } : r)));
  };

  const deleteRepresentative = (id: string) => {
    setRepresentatives((prev) => prev.filter((r) => r.id !== id));
  };

  const transferStockToRep = (repId: string, productId: string, quantityPacks: number): { success: boolean; message: string } => {
    const product = products.find((p) => p.id === productId);
    if (!product) return { success: false, message: 'الصنف غير موجود' };
    if (product.currentStockPacks < quantityPacks) {
      return { success: false, message: `الكمية المتوفرة بالمخزن الرئيسي (${product.currentStockPacks} علبة) غير كافية` };
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, currentStockPacks: p.currentStockPacks - quantityPacks } : p))
    );

    setRepresentatives((prev) =>
      prev.map((r) => {
        if (r.id === repId) {
          const existingIdx = r.assignedStock.findIndex((item) => item.productId === productId);
          let newAssigned = [...r.assignedStock];
          if (existingIdx >= 0) {
            newAssigned[existingIdx].quantityPacks += quantityPacks;
          } else {
            newAssigned.push({ productId, productName: product.name, quantityPacks });
          }
          return { ...r, assignedStock: newAssigned };
        }
        return r;
      })
    );

    const userLabel = currentUser ? currentUser.name : 'المستخدم';
    const repObj = representatives.find((r) => r.id === repId);
    const repName = repObj ? repObj.name : 'المندوب';
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `تحويل بضاعة لسيارة مندوب`,
        message: `قام الموظف (${userLabel}) بتحويل ${quantityPacks} علبة من (${product.name}) لسيارة المندوب (${repName}).`,
        type: 'info',
        timestamp: new Date().toLocaleString('ar-EG'),
        read: false,
      },
      ...prev,
    ]);

    return { success: true, message: `تم تحويل ${quantityPacks} علبة من (${product.name}) إلى عهدة المندوب بنجاح!` };
  };

  const recordRepCollection = (repId: string, amountCollected: number, notes?: string) => {
    setRepresentatives((prev) =>
      prev.map((r) => {
        if (r.id === repId) {
          const newCash = Math.max(0, r.cashOnHand - amountCollected);
          return { ...r, cashOnHand: newCash };
        }
        return r;
      })
    );

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'توريد نقدية من مندوب',
        message: `تم تسليم مبلغ ${amountCollected.toLocaleString('ar-EG')} ج.م من المندوب إلى الخزينة الرئيسية. ${notes || ''}`,
        type: 'info',
        timestamp: new Date().toLocaleString('ar-EG'),
        read: false,
      },
      ...prev,
    ]);
  };

  const recordRepVisit = (repId: string, customerId: string, customerName: string, amountCollected: number, notes?: string) => {
    const visitRec = {
      id: `v-${Date.now()}`,
      customerId,
      customerName,
      date: new Date().toLocaleString('ar-EG'),
      amountCollected,
      notes,
    };

    setRepresentatives((prev) =>
      prev.map((r) => {
        if (r.id === repId) {
          return {
            ...r,
            cashOnHand: r.cashOnHand + amountCollected,
            visitedCustomers: [visitRec, ...r.visitedCustomers],
          };
        }
        return r;
      })
    );

    if (amountCollected > 0) {
      recordCustomerPayment(customerId, amountCollected, `تحصيل المندوب ${repId}: ${notes || ''}`);
    }
  };

  const resetRepCash = (repId?: string) => {
    setRepresentatives((prev) =>
      prev.map((r) => (!repId || r.id === repId ? { ...r, cashOnHand: 0 } : r))
    );
  };

  // Expenses Operations
  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdByName'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdByName: currentUser.name,
    };
    setExpenses((prev) => [newExpense, ...prev]);

    const userLabel = currentUser ? currentUser.name : 'المستخدم';
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'تسجيل مصروف جديد',
        message: `قام الموظف (${userLabel}) بتسجيل مصروف (${expenseData.title}) بقيمة ${expenseData.amount.toLocaleString('ar-EG')} ج.م.`,
        type: 'info',
        timestamp: new Date().toLocaleString('ar-EG'),
        read: false,
      },
      ...prev,
    ]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Helper WhatsApp Share Link
  const getWhatsAppShareUrl = (phone: string, textMessage: string): string => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '2' + cleanPhone;
    }
    const encodedText = encodeURIComponent(textMessage);
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  };

  // Roles Switcher
  const setCurrentUser = (u: SystemUser) => {
    setLoggedInUser(u);
    if (u.role !== 'admin') {
      setActiveTab('pos');
    } else {
      setActiveTab('dashboard');
    }
  };
  const switchRole = (role: 'admin' | 'inventory_manager' | 'cashier') => {
    const found = users.find((u) => u.role === role);
    if (found) {
      setLoggedInUser(found);
      if (found.role !== 'admin') {
        setActiveTab('pos');
      } else {
        setActiveTab('dashboard');
      }
    }
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearNotifications = () => { setNotifications([]); };

  // User Management
  const deleteUser = (id: string) => {
    deleteUserAccount(id);
  };

  const toggleDisableUser = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isDisabled: !u.isDisabled } : u))
    );
  };

  const updateUserPassword = (id: string, newPass: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, password: newPass } : u))
    );
  };

  // Backup System
  const saveFirebaseConfig = (config: FirebaseConfigInput) => {
    setFirebaseConfig(config);
    localStorage.setItem('dukhan_firebase_config', JSON.stringify(config));
    const res = initializeFirebaseService(config);
    setFirebaseStatus({ connected: res.success, message: res.message });
  };

  const exportBackupJSON = () => {
    const data = {
      products,
      customers,
      suppliers,
      sales,
      purchases,
      representatives,
      expenses,
      users,
      notifications,
      firebaseConfig,
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importBackupJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.products) setProducts(parsed.products);
      if (parsed.customers) setCustomers(parsed.customers);
      if (parsed.suppliers) setSuppliers(parsed.suppliers);
      if (parsed.sales) setSales(parsed.sales);
      if (parsed.purchases) setPurchases(parsed.purchases);
      if (parsed.representatives) setRepresentatives(parsed.representatives);
      if (parsed.expenses) setExpenses(parsed.expenses);
      if (parsed.users) setUsers(parsed.users);
      if (parsed.notifications) setNotifications(parsed.notifications);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const resetToDefaultData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setSales(INITIAL_SALES);
    setPurchases(INITIAL_PURCHASES);
    setRepresentatives(INITIAL_REPRESENTATIVES);
    setExpenses(INITIAL_EXPENSES);
    setUsers(INITIAL_USERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setInitialCapitalCashState(0);
    setLoggedInUser(null);
    localStorage.clear();
  };

  return (
    <ERPContext.Provider
      value={{
        products,
        customers,
        suppliers,
        sales,
        purchases,
        representatives,
        expenses,
        notifications,
        users,
        currentUser,
        loggedInUser,
        login,
        logout,
        hasUserPermission,
        createUserAccount,
        updateUserAccount,
        deleteUserAccount,
        activeTab,
        setActiveTab,
        firebaseConfig,
        firebaseStatus,
        saveFirebaseConfig,
        exportBackupJSON,
        importBackupJSON,
        resetToDefaultData,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        bulkUpdatePrices,
        createSaleInvoice,
        confirmSaleInvoice,
        cancelDraftInvoice,
        deleteSaleInvoice,
        createPurchaseInvoice,
        deletePurchaseInvoice,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        recordCustomerPayment,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        recordSupplierPayment,
        addRepresentative,
        updateRepresentative,
        deleteRepresentative,
        transferStockToRep,
        recordRepCollection,
        recordRepVisit,
        resetRepCash,
        addExpense,
        deleteExpense,
        getWhatsAppShareUrl,
        setCurrentUser,
        switchRole,
        deleteUser,
        toggleDisableUser,
        updateUserPassword,
        deleteNotification,
        markNotificationAsRead,
        clearNotifications,
        printingInvoice,
        setPrintingInvoice,
        initialCapitalCash,
        setInitialCapitalCash,
        inventoryCostCapital,
        inventoryWholesaleCapital,
        inventoryRetailCapital,
        netTotalCapital,
        employeeAssignments,
        updateEmployeeAssignment,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const ctx = useContext(ERPContext);
  if (!ctx) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return ctx;
};
