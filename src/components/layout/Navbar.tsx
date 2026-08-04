import React, { useState } from 'react';
import {
  Bell,
  Cigarette,
  User,
  Menu,
  Shield,
  Search,
  LogOut,
  Key,
  X,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { SystemUser } from '../../types';

interface NavbarProps {
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const {
    currentUser,
    users,
    setCurrentUser,
    notifications,
    deleteNotification,
    setActiveTab,
    logout,
  } = useERP();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [targetUserForSwitch, setTargetUserForSwitch] = useState<SystemUser | null>(null);
  const [switchPassword, setSwitchPassword] = useState('');
  const [switchError, setSwitchError] = useState('');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدير عام';
      case 'inventory_manager':
        return 'مسؤول مخزن';
      case 'cashier':
        return 'كاشير / بائع';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'inventory_manager':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'cashier':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const handleRequestSwitchUser = (u: SystemUser) => {
    if (u.id === currentUser.id) return;
    setTargetUserForSwitch(u);
    setSwitchPassword('');
    setSwitchError('');
  };

  const handleConfirmSwitchUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserForSwitch) return;

    if (targetUserForSwitch.isDisabled) {
      setSwitchError('عفواً، تم إيقاف هذا الحساب من قبل المدير العام.');
      return;
    }

    const expectedPass = targetUserForSwitch.password || '123';
    if (switchPassword !== expectedPass) {
      setSwitchError('كلمة السر غير صحيحة، يرجى المحاولة مرة أخرى.');
      return;
    }

    setCurrentUser(targetUserForSwitch);
    setTargetUserForSwitch(null);
    setSwitchPassword('');
    setSwitchError('');
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 shadow-lg">
      <div className="flex items-center justify-between gap-4 max-w-[1920px] mx-auto">
        {/* Right: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="فتح القائمة"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => currentUser.role === 'admin' && setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Cigarette className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white">
                  الدخان <span className="text-amber-500">ERP</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold">
                  v2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                نظام إدارة ومبيعات ومخزون السجائر والدخان
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search Input */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث عن صنف، عميل، أو رقم فاتورة..."
              onClick={() => setActiveTab('pos')}
              className="w-full pr-10 pl-4 py-2 text-xs bg-slate-800/90 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all cursor-pointer"
              readOnly
            />
          </div>
        </div>

        {/* Left: Notifications & User Profile Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Notifications Dropdown (Admin Only) */}
          {currentUser.role === 'admin' && (
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition-all cursor-pointer"
                title="التنبيهات والإشعارات المباشرة"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-slate-900 animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Top Floating Notification Menu */}
              {showNotifDropdown && (
                <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 animate-scaleUp">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span>مركز التنبيهات المباشرة ({unreadCount})</span>
                    </h3>
                    <button
                      onClick={() => setShowNotifDropdown(false)}
                      className="p-1 rounded text-slate-400 hover:text-white text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        لا توجد تنبيهات جديدة حالياً.
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-2 text-xs"
                        >
                          <div className="flex items-start gap-2">
                            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                              {n.type === 'low_stock' ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                              ) : (
                                <Info className="w-3.5 h-3.5 text-blue-400" />
                              )}
                            </div>
                            <div>
                              <strong className="text-white block font-bold">{n.title}</strong>
                              <p className="text-[11px] text-slate-300 line-clamp-2">{n.message}</p>
                              <span className="text-[10px] text-slate-500 mt-1 block">{n.timestamp}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteNotification(n.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all shrink-0 cursor-pointer"
                            title="حذف الإشعار"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-slate-800 mt-2 text-center">
                    <button
                      onClick={() => {
                        setShowNotifDropdown(false);
                        setActiveTab('notifications');
                      }}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs transition-colors"
                    >
                      عرض جميع الإشعارات المباشرة
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active User Switcher */}
          <div className="relative group">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 hover:border-amber-500/40 cursor-pointer transition-all">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentUser.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow`}>
                <User className="w-4 h-4" />
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">{currentUser.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span className={`text-[10px] px-1.5 py-0.2 rounded border font-bold ${getRoleBadgeColor(currentUser.role)}`}>
                    {getRoleLabel(currentUser.role)}
                  </span>
                </div>
              </div>
            </div>

            {/* Dropdown Menu */}
            <div className="absolute left-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 hidden group-hover:block z-50 animate-fadeIn">
              <p className="text-[11px] font-bold text-slate-400 px-2 py-1 border-b border-slate-800 mb-1">
                حساب المستخدم الحالي:
              </p>
              {currentUser.role === 'admin' ? (
                users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleRequestSwitchUser(u)}
                    className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      u.id === currentUser.id
                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${u.avatarColor} flex items-center justify-center text-white text-[10px] font-bold`}>
                        {u.name[0]}
                      </div>
                      <span className={u.isDisabled ? 'line-through text-red-400' : ''}>{u.name}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getRoleBadgeColor(u.role)}`}>
                      {u.isDisabled ? 'موقف' : getRoleLabel(u.role)}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-2 py-1.5 text-xs font-semibold text-slate-200">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${currentUser.avatarColor} flex items-center justify-center text-white text-xs font-bold`}>
                      {currentUser.name[0]}
                    </div>
                    <div>
                      <span className="font-bold block text-white">{currentUser.name}</span>
                      <span className="text-[10px] text-slate-400">@{currentUser.username}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 mt-2">
                <button
                  onClick={logout}
                  className="w-full py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 sm:hidden"
            title="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Password Confirmation Modal for Account Switch */}
      {targetUserForSwitch && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>التبديل إلى حساب: {targetUserForSwitch.name}</span>
              </h3>
              <button
                onClick={() => setTargetUserForSwitch(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              أدخل كلمة السر الخاصة بحساب <strong className="text-amber-400">{targetUserForSwitch.name}</strong> للانتقال إليه:
            </p>

            {switchError && (
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold text-center">
                {switchError}
              </div>
            )}

            <form onSubmit={handleConfirmSwitchUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">كلمة السر *</label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={switchPassword}
                  onChange={(e) => setSwitchPassword(e.target.value)}
                  placeholder="أدخل كلمة السر..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetUserForSwitch(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-md shadow-amber-500/20"
                >
                  تأكيد الانتقال للحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
