import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Users,
  TrendingUp,
  Bell,
  Settings,
  X,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { PermissionType } from '../../types';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, notifications, products, hasUserPermission, currentUser } = useERP();

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const lowStockCount = products.filter((p) => p.currentStockPacks <= p.minStockAlertPacks).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم والتحليلات',
      icon: LayoutDashboard,
      perm: 'all' as PermissionType,
      alwaysShow: true,
    },
    {
      id: 'pos',
      label: 'نقطة البيع (POS)',
      icon: ShoppingCart,
      badge: 'سريع',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      perm: 'pos_sales' as PermissionType,
    },
    {
      id: 'inventory',
      label: 'المخزون وأسعار اليوم',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} ناقص` : undefined,
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse',
      perm: 'inventory_manage' as PermissionType,
    },
    {
      id: 'customers',
      label: 'حسابات العملاء والديون',
      icon: Users,
      perm: 'customers_debts' as PermissionType,
    },
    {
      id: 'reports',
      label: 'تقرير إداني وتتبع الأرباح',
      icon: TrendingUp,
      perm: 'reports_profits' as PermissionType,
    },
    {
      id: 'notifications',
      label: 'مركز التنبيهات والإشعارات',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount}` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      perm: 'all' as PermissionType,
      alwaysShow: true,
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      icon: Settings,
      perm: 'system_settings' as PermissionType,
    },
  ];

  const filteredItems = navItems.filter((item) => {
    if (currentUser && currentUser.role !== 'admin') {
      return item.id === 'pos';
    }
    return item.alwaysShow || hasUserPermission(item.perm);
  });

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full space-y-4 pb-20 lg:pb-0 overflow-y-auto no-scrollbar">
      <div className="space-y-4">
        {/* Mobile Header */}
        <div className="flex items-center justify-between lg:hidden pb-3 border-b border-slate-800">
          <span className="font-extrabold text-base text-white">قائمة التنقل</span>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Low Stock Warning Alert Pill */}
        {lowStockCount > 0 && hasUserPermission('inventory_manage') && (
          <div
            onClick={() => handleNavClick('inventory')}
            className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 cursor-pointer hover:bg-red-500/20 transition-all"
          >
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 animate-bounce" />
            <div>
              <p className="font-bold">تنبيه نقص المخزون!</p>
              <p className="text-[11px] text-red-400 mt-0.5">يوجد {lowStockCount} أصناف أقل من حد الطلب.</p>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs lg:text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box (Admin Only) */}
      {currentUser.role === 'admin' && (
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 mt-auto">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>حالة المخزن الآن</span>
            <FileSpreadsheet className="w-4 h-4 text-amber-500" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="block text-slate-400 text-[10px]">الأصناف</span>
              <span className="font-extrabold text-amber-400 text-sm">{products.length}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="block text-slate-400 text-[10px]">القراصين بالمخزن</span>
              <span className="font-extrabold text-emerald-400 text-sm font-mono">
                {products.reduce((acc, p) => acc + Math.floor(p.currentStockPacks / (p.packsPerCarton || 10)), 0).toLocaleString('ar-EG')} قروصة
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 bg-slate-900 border border-slate-800/90 rounded-2xl p-4 my-6 mr-4 self-start shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      <aside
        className={`fixed inset-y-0 right-0 z-[70] w-72 bg-slate-900 border-l border-slate-800 p-4 flex flex-col justify-between transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
