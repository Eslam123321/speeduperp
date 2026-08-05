import React, { useState } from 'react';
import {
  Settings,
  Cloud,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Key,
  UserPlus,
  Trash2,
  User,
  Shield,
  Lock,
  Edit2,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { FirebaseConfigInput, SystemUser, PermissionType } from '../../types';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

const ALL_PERMISSIONS_OPTIONS: { id: PermissionType; label: string; desc: string }[] = [
  { id: 'all', label: 'كافة الصلاحيات المطلقة (مدير عام)', desc: 'وصول شامل لكافة الشاشات والأرباح والمستخدمين والتحليلات' },
  { id: 'pos_sales', label: 'نقطة البيع والمبيعات (POS)', desc: 'إصدار الفواتير الفورية كاش وآجل وطباعتها' },
  { id: 'inventory_manage', label: 'إدارة المخزون والبضاعة', desc: 'إضافة أصناف وتعديل كميات المخزون والجرد وأسعار اليوم' },
  { id: 'customers_debts', label: 'حسابات العملاء والديون', desc: 'متابعة مديونيات محلات التجزئة والتجار وتحصيل المبالغ' },
  { id: 'purchases_suppliers', label: 'حسابات الموردين وشركات الدخان', desc: 'سداد شركات السجائر وتسجيل فواتير الشراء والتوريد' },
  { id: 'representatives', label: 'إدارة المندوبين وسيارات التوزيع', desc: 'متابعة ستوك السيارات، عهد المندوبين، وتسجيل الزيارات' },
  { id: 'expenses', label: 'المصاريف والتشغيل اليومي', desc: 'تسجيل مصاريف السولار والنويل والصيانة والتشغيل' },
  { id: 'reports_profits', label: 'التقارير المالية وصافي الأرباح', desc: 'الاطلاع على أرباح الفواتير الصافية ورأسمال النشاط وتقرير إداني' },
  { id: 'system_settings', label: 'إعدادات النظام وإدارة المستخدمين', desc: 'إنشاء وتعديل حسابات المستخدمين والموظفين وتخصيص الصلاحيات' },
];

export const SettingsView: React.FC = () => {
  const {
    firebaseConfig,
    firebaseStatus,
    saveFirebaseConfig,
    exportBackupJSON,
    importBackupJSON,
    resetToDefaultData,
    currentUser,
    users,
    createUserAccount,
    updateUserAccount,
    deleteUserAccount,
  } = useERP();

  const [configForm, setConfigForm] = useState<FirebaseConfigInput>(
    firebaseConfig || {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
    }
  );

  const [importStatus, setImportStatus] = useState<string>('');

  // User Deletion & Edit Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [formUserData, setFormUserData] = useState<{
    name: string;
    username: string;
    password: string;
    role: 'admin' | 'inventory_manager' | 'cashier' | 'custom';
    selectedPermissions: PermissionType[];
  }>({
    name: '',
    username: '',
    password: '',
    role: 'cashier',
    selectedPermissions: ['pos_sales', 'customers_debts'],
  });

  const [userMsg, setUserMsg] = useState<{ success?: boolean; text?: string }>({});

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig(configForm);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dukhan_erp_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importBackupJSON(content);
        if (ok) {
          setImportStatus('تمت استعادة البيانات بنجاح!');
        } else {
          setImportStatus('عفواً، ملف النسخة الاحتياطية غير صالح.');
        }
      }
    };
    reader.readAsText(file);
  };

  const togglePermission = (perm: PermissionType) => {
    let updated: PermissionType[] = [...formUserData.selectedPermissions];
    if (perm === 'all') {
      if (updated.includes('all')) {
        updated = ['pos_sales'];
      } else {
        updated = [
          'all',
          'pos_sales',
          'inventory_manage',
          'customers_debts',
          'purchases_suppliers',
          'representatives',
          'expenses',
          'reports_profits',
          'system_settings',
        ];
      }
    } else {
      if (updated.includes(perm)) {
        updated = updated.filter((p) => p !== perm && p !== 'all');
      } else {
        updated.push(perm);
      }
    }
    setFormUserData({ ...formUserData, selectedPermissions: updated });
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormUserData({
      name: '',
      username: '',
      password: '',
      role: 'cashier',
      selectedPermissions: ['pos_sales', 'customers_debts'],
    });
    setUserMsg({});
    setShowAddUserModal(true);
  };

  const handleOpenEditModal = (u: SystemUser) => {
    setEditingUser(u);
    setFormUserData({
      name: u.name,
      username: u.username,
      password: u.password || '123',
      role: u.role,
      selectedPermissions: u.permissions || ['all'],
    });
    setUserMsg({});
    setShowAddUserModal(true);
  };

  const handleSaveUserForm = (e: React.FormEvent) => {
    e.preventDefault();
    setUserMsg({});
    if (!formUserData.name.trim() || !formUserData.username.trim() || !formUserData.password.trim()) {
      setUserMsg({ success: false, text: 'يرجى إكمال كافة حقول اسم المستخدم وكلمة السر' });
      return;
    }

    if (formUserData.selectedPermissions.length === 0) {
      setUserMsg({ success: false, text: 'يرجى اختيار صلاحية واحدة على الأقل للمستخدم' });
      return;
    }

    const isAll = formUserData.selectedPermissions.includes('all');
    const assignedRole = isAll ? 'admin' : formUserData.role;

    if (editingUser) {
      const res = updateUserAccount(editingUser.id, {
        name: formUserData.name,
        username: formUserData.username.trim().toLowerCase(),
        password: formUserData.password.trim(),
        role: assignedRole,
        permissions: formUserData.selectedPermissions,
      });
      setUserMsg({ success: res.success, text: res.message });
      if (res.success) setShowAddUserModal(false);
    } else {
      const res = createUserAccount({
        name: formUserData.name,
        username: formUserData.username.trim().toLowerCase(),
        password: formUserData.password.trim(),
        role: assignedRole,
        permissions: formUserData.selectedPermissions,
      });
      setUserMsg({ success: res.success, text: res.message });
      if (res.success) setShowAddUserModal(false);
    }
  };

  const handleExecuteDeleteUser = () => {
    if (userToDelete) {
      deleteUserAccount(userToDelete.id);
      setUserToDelete(null);
    }
  };

  const handleExecuteResetData = () => {
    resetToDefaultData();
    setShowResetConfirm(false);
  };

  const renderPermissionBadge = (perm: PermissionType) => {
    switch (perm) {
      case 'all':
        return <span key={perm} className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black">كافة الصلاحيات</span>;
      case 'pos_sales':
        return <span key={perm} className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">POS ومبيعات</span>;
      case 'inventory_manage':
        return <span key={perm} className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">المخزون والمنتجات</span>;
      case 'customers_debts':
        return <span key={perm} className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">العملاء والديون</span>;
      case 'purchases_suppliers':
        return <span key={perm} className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">المشتريات والموردين</span>;
      case 'representatives':
        return <span key={perm} className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold">المندوبين والسيارات</span>;
      case 'expenses':
        return <span key={perm} className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-bold">المصاريف والتشغيل</span>;
      case 'reports_profits':
        return <span key={perm} className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-[10px] font-bold">الأرباح والتقارير</span>;
      case 'system_settings':
        return <span key={perm} className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">إعدادات النظام</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-amber-400" />
            <span>إعدادات النظام وإدارة الحسابات والصلاحيات</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            إدارة حسابات وتصريحات الدخول لـ (المدير العام حسام حسني)، التعديل على المستخدمين، والنسخ الاحتياطي.
          </p>
        </div>
      </div>

      {/* User Management Section */}
      <div className="glass-panel p-6 space-y-4 border-amber-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>إدارة حسابات مستخدمي النظام والصلاحيات المتعددة</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">يمكن للمدير إنشاء مستخدم جديد، التعديل على الحسابات الحالية، وتعديل الباسوورد والصلاحيات</p>
          </div>

          {currentUser.role === 'admin' && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>إنشاء حساب مستخدم جديد</span>
            </button>
          )}
        </div>

        {userMsg.text && (
          <div className={`p-3 rounded-xl text-xs font-bold ${userMsg.success ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
            {userMsg.text}
          </div>
        )}

        {/* Existing Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-right text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">اسم المستخدم بالكامل</th>
                <th className="p-3">اسم الدخول (Username)</th>
                <th className="p-3">كلمة السر (Password)</th>
                <th className="p-3">الصلاحيات الممنوحة</th>
                <th className="p-3 text-center">إجراءات والتعديل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${u.avatarColor} flex items-center justify-center text-white font-bold text-xs`}>
                        {u.name[0]}
                      </div>
                      <span className="font-extrabold text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-amber-400 font-bold">{u.username}</td>
                  <td className="p-3 font-mono text-slate-300">
                    {currentUser.role === 'admin' ? u.password || '123' : '••••••••'}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {(u.permissions || ['all']).map((perm) => renderPermissionBadge(perm))}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-500/20 text-slate-300 hover:text-blue-400 border border-slate-700 transition-colors"
                          title="تعديل الحساب والصلاحيات"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      {currentUser.role === 'admin' && u.username !== 'hossam' && (
                        <button
                          onClick={() => setUserToDelete(u)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
                          title="حذف الحساب"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>



      {/* Add / Edit User Account Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-6 overflow-y-auto max-h-[90vh] animate-scaleUp">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <UserPlus className="w-5 h-5 text-amber-400" />
              <span>{editingUser ? `تعديل حساب: ${editingUser.name}` : 'إنشاء حساب جديد وتعيين الصلاحيات'}</span>
            </h3>

            <form onSubmit={handleSaveUserForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">اسم المستخدم بالكامل *</label>
                  <input
                    type="text"
                    required
                    value={formUserData.name}
                    onChange={(e) => setFormUserData({ ...formUserData, name: e.target.value })}
                    placeholder="مثال: حسام حسني"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">اسم الدخول (Username) *</label>
                  <input
                    type="text"
                    required
                    value={formUserData.username}
                    onChange={(e) => setFormUserData({ ...formUserData, username: e.target.value })}
                    placeholder="مثال: hossam"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">كلمة السر (Password) *</label>
                <input
                  type="password"
                  required
                  value={formUserData.password}
                  onChange={(e) => setFormUserData({ ...formUserData, password: e.target.value })}
                  placeholder="أدخل كلمة السر للحساب"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                />
              </div>

              {/* Granular Permissions Checkboxes Matrix */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-amber-400">تخصيص الصلاحيات الممنوحة للحساب *</label>
                  <button
                    type="button"
                    onClick={() => togglePermission('all')}
                    className="text-[11px] text-amber-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{formUserData.selectedPermissions.includes('all') ? 'إلغاء تحديد الكل' : 'منح كافة الصلاحيات (مدير)'}</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {ALL_PERMISSIONS_OPTIONS.map((opt) => {
                    const isChecked = formUserData.selectedPermissions.includes(opt.id);
                    return (
                      <div
                        key={opt.id}
                        onClick={() => togglePermission(opt.id)}
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-amber-500/10 border-amber-500/50 text-white'
                            : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="pt-0.5">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <strong className="block font-bold text-xs text-slate-200">{opt.label}</strong>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">{opt.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-lg shadow-amber-500/20"
                >
                  {editingUser ? 'حفظ التعديلات' : 'إنشاء الحساب الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm User Account Deletion Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(userToDelete)}
        title="تأكيد حذف حساب المستخدم"
        message={`هل أنت تأكد من رغبتك في حذف حساب المستخدم (${userToDelete?.name}) نهائياً من النظام؟ سيفقد الموظف قدرة الدخول.`}
        confirmText="نعم، حذف الحساب الآن"
        onConfirm={handleExecuteDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />

      {/* Confirm System Reset Modal */}
      <ConfirmDeleteModal
        isOpen={showResetConfirm}
        title="تأكيد إعادة ضبط النظام للمصنع"
        message="تحذير: هل أنت تأكد من رغبتك في مسح كافة الفواتير، التعديلات الحالية، وإعادة البيانات الابتدائية للنظام؟"
        confirmText="نعم، مسح وإعادة الضبط"
        onConfirm={handleExecuteResetData}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
