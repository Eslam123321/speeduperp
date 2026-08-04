import React from 'react';
import { LayoutDashboard, ShoppingCart, Boxes, Users, Building2, TrendingUp, Settings, Truck, Receipt } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { PermissionType } from '../../types';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, products, hasUserPermission, currentUser } = useERP();

  const lowStockCount = products.filter((p) => p.currentStockPacks <= p.minStockAlertPacks).length;

  const allNavItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard, perm: 'all' as PermissionType, alwaysShow: true },
    { id: 'pos', label: 'POS بيع', icon: ShoppingCart, badge: 'سريع', badgeColor: 'bg-emerald-500 text-slate-950', perm: 'pos_sales' as PermissionType },
    { id: 'inventory', label: 'المخزون', icon: Boxes, badge: lowStockCount > 0 ? `${lowStockCount}` : undefined, badgeColor: 'bg-red-500 text-white', perm: 'inventory_manage' as PermissionType },
    { id: 'customers', label: 'العملاء', icon: Users, perm: 'customers_debts' as PermissionType },
    { id: 'reports', label: 'التقارير', icon: TrendingUp, perm: 'reports_profits' as PermissionType },
    { id: 'settings', label: 'الإعدادات', icon: Settings, perm: 'system_settings' as PermissionType },
  ];

  const allowedNavItems = allNavItems.filter((item) => {
    if (currentUser && currentUser.role !== 'admin') {
      return item.id === 'pos';
    }
    return item.alwaysShow || hasUserPermission(item.perm);
  });

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-2xl">
      {allowedNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`relative flex-shrink-0 min-w-[64px] flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${isActive
                ? 'text-amber-400 font-black bg-amber-500/15 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <div className="relative">
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400 font-bold' : 'text-slate-400'}`} />
              {item.badge && (
                <span
                  className={`absolute -top-1.5 -right-2 text-[8px] font-black px-1 py-0.2 rounded-full border border-slate-900 ${item.badgeColor || 'bg-amber-500 text-slate-950'
                    }`}
                >
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap text-center">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
