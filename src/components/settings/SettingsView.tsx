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
  Mail,
  Send,
  Check,
  SendHorizontal,
  ListFilter,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { FirebaseConfigInput, SystemUser, PermissionType, EmailSettings } from '../../types';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

const ALL_PERMISSIONS_OPTIONS: { id: PermissionType; label: string; desc: string }[] = [
  { id: 'all', label: 'كافة الصلاحيات المطلقة (مدير عام)', desc: 'وصول شامل لكافة الشاشات والأرباح والمستخدمين والتحليلات' },
  { id: 'pos_sales', label: 'نقطة البيع (POS)', desc: 'إصدار الفواتير الفورية كاش وآجل وطباعتها' },
  { id: 'inventory_manage', label: 'المخزون وأسعار اليوم', desc: 'إضافة أصناف وتعديل كميات المخزون والجرد' },
  { id: 'customers_debts', label: 'حسابات العملاء والديون', desc: 'متابعة مديونيات محلات التجزئة والتجار وتحصيل المبالغ' },
  { id: 'reports_profits', label: 'تقرير إداني وتتبع الأرباح', desc: 'الاطلاع على أرباح الفواتير الصافية ورأسمال النشاط والتقارير' },
  { id: 'system_settings', label: 'الإعدادات وإدارة المستخدمين', desc: 'إنشاء وتعديل حسابات المستخدمين والموظفين وتخصيص الصلاحيات' },
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
    emailSettings,
    emailLogs,
    updateEmailSettings,
    sendInvoiceEmailNotification,
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

  // Email Configuration State
  const [emailFormState, setEmailFormState] = useState<EmailSettings>(emailSettings);
  const [emailSaveMsg, setEmailSaveMsg] = useState<string>('');
  const [testingEmail, setTestingEmail] = useState<boolean>(false);
  const [testEmailMsg, setTestEmailMsg] = useState<{ success?: boolean; text?: string }>({});

  const [formUserData, setFormUserData] = useState<{
    name: string;
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'inventory_manager' | 'cashier' | 'custom';
    selectedPermissions: PermissionType[];
  }>({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'cashier',
    selectedPermissions: ['pos_sales', 'customers_debts'],
  });

  const [userMsg, setUserMsg] = useState<{ success?: boolean; text?: string }>({});

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig(configForm);
  };

  const handleSaveEmailForm = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmailSettings(emailFormState);
    setEmailSaveMsg('تم حفظ إعدادات البريد الإلكتروني بنجاح!');
    setTimeout(() => setEmailSaveMsg(''), 4000);
  };

  const handleTestEmailDispatch = async () => {
    setTestingEmail(true);
    setTestEmailMsg({});
    const dummySale: any = {
      id: `test-${Date.now()}`,
      invoiceNumber: 'INV-TEST-001',
      date: new Date().toLocaleString('ar-EG'),
      customerName: 'عميل تجريبي لتجربة الإيميل',
      createdByName: currentUser ? currentUser.name : 'المدير العام',
      items: [
        {
          productId: 'p1',
          productName: 'صنف تجريبي لاختبار الإرسال',
          unitLabel: 'علبة',
          quantity: 2,
          unitPrice: 50,
          total: 100,
        },
      ],
      totalCost: 80,
      totalAmount: 100,
      discount: 0,
      finalAmount: 100,
      netProfit: 20,
      paymentMethod: 'cash',
      paidAmount: 100,
      remainingAmount: 0,
      notes: 'تجربة إرسال البريد الإلكتروني من إعدادات Speedup ERP',
    };

    const targetEmails = emailFormState.adminEmail ? [emailFormState.adminEmail] : [];
    const res = await sendInvoiceEmailNotification(dummySale, 'sale', targetEmails);
    setTestingEmail(false);
    setTestEmailMsg({ success: res.success, text: res.message });
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
      email: '',
      password: '',
      role: 'cashier',
      selectedPermissions: ['pos_sales', 'customers_debts'],
    });
    setUserMsg({});
    setShowAddUserModal(true);
  };

  const handleOpenEditModal = (u: SystemUser) => {
    setEditingUser(u);
    const validIds = ALL_PERMISSIONS_OPTIONS.map((opt) => opt.id);
    const cleanPerms = (u.permissions || ['all']).filter((p) => validIds.includes(p));
    setFormUserData({
      name: u.name,
      username: u.username,
      email: u.email || '',
      password: u.password || '123',
      role: u.role,
      selectedPermissions: cleanPerms.length > 0 ? cleanPerms : ['pos_sales'],
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
        email: formUserData.email.trim(),
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
        email: formUserData.email.trim(),
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
        return <span key={perm} className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">المخزون وأسعار اليوم</span>;
      case 'customers_debts':
        return <span key={perm} className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">العملاء والديون</span>;
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
            <p className="text-xs text-slate-400 mt-0.5">يمكن للمدير إنشاء مستخدم جديد، التعديل على الحسابات الحالية، وتعديل البريد ككلمة السر والصلاحيات</p>
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
          <table className="w-full min-w-[750px] text-right text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">اسم المستخدم بالكامل</th>
                <th className="p-3">اسم الدخول (Username)</th>
                <th className="p-3">البريد الإلكتروني (Email)</th>
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
                    {u.email ? (
                      <span className="text-cyan-400 font-semibold">{u.email}</span>
                    ) : (
                      <span className="text-slate-500 italic">غير محدد</span>
                    )}
                  </td>
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

      {/* Email Notification Settings Section */}
      <div className="glass-panel p-6 space-y-5 border-cyan-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-cyan-400" />
              <span>إعدادات البريد الإلكتروني والإشعارات التلقائية للفواتير</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              تسميع وإرسال نسخة تلقائية من الفواتير (مبيعات ومشتريات) عند الضغط على إتمام لبريد الأدمن والموظفين.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTestEmailDispatch}
              disabled={testingEmail}
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition-all disabled:opacity-50"
            >
              <SendHorizontal className="w-4 h-4" />
              <span>{testingEmail ? 'جاري الإرسال...' : 'اختبار إيميل تجريبي'}</span>
            </button>
          </div>
        </div>

        {emailSaveMsg && (
          <div className="p-3 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {emailSaveMsg}
          </div>
        )}

        {testEmailMsg.text && (
          <div className={`p-3 rounded-xl text-xs font-bold ${testEmailMsg.success ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
            {testEmailMsg.text}
          </div>
        )}

        <form onSubmit={handleSaveEmailForm} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="block text-white font-bold">تفعيل الإرسال التلقائي للفواتير</strong>
                <span className="text-[11px] text-slate-400">إرسال البريد تلقائياً بمجرد إتمام الفاتورة</span>
              </div>
              <input
                type="checkbox"
                checked={emailFormState.enabled}
                onChange={(e) => setEmailFormState({ ...emailFormState, enabled: e.target.checked })}
                className="w-5 h-5 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="block text-white font-bold">إرسال نسخة بريدية للموظف منشئ الفاتورة</strong>
                <span className="text-[11px] text-slate-400">إرسال الإشعار لبريد الكاشير/الموظف المسؤول</span>
              </div>
              <input
                type="checkbox"
                checked={emailFormState.notifyEmployeeOnCreation}
                onChange={(e) => setEmailFormState({ ...emailFormState, notifyEmployeeOnCreation: e.target.checked })}
                className="w-5 h-5 accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">البريد الإلكتروني للـ الأدمن الرئيسي *</label>
              <input
                type="email"
                required
                value={emailFormState.adminEmail}
                onChange={(e) => setEmailFormState({ ...emailFormState, adminEmail: e.target.value })}
                placeholder="admin@speeduperp.com"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">إيميلات مراقبين وموظفين إضافيين (مفصولة بفواصل)</label>
              <input
                type="text"
                value={(emailFormState.additionalEmails || []).join(', ')}
                onChange={(e) =>
                  setEmailFormState({
                    ...emailFormState,
                    additionalEmails: e.target.value.split(',').map((s) => s.trim()),
                  })
                }
                placeholder="mngr@company.com, audit@company.com"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Service Provider selection */}
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            <label className="block font-bold text-cyan-400">مزود خدمة البريد الإلكتروني (Email Provider)</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                  emailFormState.serviceProvider === 'emailjs'
                    ? 'bg-cyan-500/10 border-cyan-500 text-white font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="serviceProvider"
                  value="emailjs"
                  checked={emailFormState.serviceProvider === 'emailjs'}
                  onChange={() => setEmailFormState({ ...emailFormState, serviceProvider: 'emailjs' })}
                  className="hidden"
                />
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>EmailJS API (مباشر مجاني)</span>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                  emailFormState.serviceProvider === 'webhook'
                    ? 'bg-cyan-500/10 border-cyan-500 text-white font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="serviceProvider"
                  value="webhook"
                  checked={emailFormState.serviceProvider === 'webhook'}
                  onChange={() => setEmailFormState({ ...emailFormState, serviceProvider: 'webhook' })}
                  className="hidden"
                />
                <Cloud className="w-4 h-4 text-cyan-400" />
                <span>Custom Webhook Endpoint</span>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                  emailFormState.serviceProvider === 'mailto'
                    ? 'bg-cyan-500/10 border-cyan-500 text-white font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="serviceProvider"
                  value="mailto"
                  checked={emailFormState.serviceProvider === 'mailto'}
                  onChange={() => setEmailFormState({ ...emailFormState, serviceProvider: 'mailto' })}
                  className="hidden"
                />
                <Send className="w-4 h-4 text-cyan-400" />
                <span>سجل محلي وإشعار النظام</span>
              </label>
            </div>

            {emailFormState.serviceProvider === 'emailjs' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Service ID</label>
                  <input
                    type="text"
                    value={emailFormState.emailjsServiceId || ''}
                    onChange={(e) => setEmailFormState({ ...emailFormState, emailjsServiceId: e.target.value })}
                    placeholder="service_xxx"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Template ID</label>
                  <input
                    type="text"
                    value={emailFormState.emailjsTemplateId || ''}
                    onChange={(e) => setEmailFormState({ ...emailFormState, emailjsTemplateId: e.target.value })}
                    placeholder="template_xxx"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Public Key / User ID</label>
                  <input
                    type="text"
                    value={emailFormState.emailjsPublicKey || ''}
                    onChange={(e) => setEmailFormState({ ...emailFormState, emailjsPublicKey: e.target.value })}
                    placeholder="pk_xxx"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>
            )}

            {emailFormState.serviceProvider === 'webhook' && (
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Webhook URL</label>
                <input
                  type="url"
                  value={emailFormState.webhookUrl || ''}
                  onChange={(e) => setEmailFormState({ ...emailFormState, webhookUrl: e.target.value })}
                  placeholder="https://api.yourdomain.com/send-email"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>حفظ إعدادات البريد الإلكتروني</span>
            </button>
          </div>
        </form>

        {/* Email Logs History Table */}
        {emailLogs.length > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-cyan-400" />
              <span>سجل الفواتير المرسلة بالبريد الإلكتروني مؤخراً ({emailLogs.length})</span>
            </h4>
            <div className="overflow-x-auto max-h-52 overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/80 text-slate-400 sticky top-0">
                  <tr>
                    <th className="p-2">رقم الفاتورة</th>
                    <th className="p-2">المستلم (Email)</th>
                    <th className="p-2">نوع المستلم</th>
                    <th className="p-2">وقت الإرسال</th>
                    <th className="p-2 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {emailLogs.slice(0, 10).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="p-2 font-mono font-bold text-amber-400">{log.invoiceNumber}</td>
                      <td className="p-2 font-mono text-cyan-300">{log.recipientEmail}</td>
                      <td className="p-2 text-slate-300">
                        {log.recipientType === 'admin' ? 'مدير (Admin)' : log.recipientType === 'employee' ? 'موظف (Employee)' : 'مراقب'}
                      </td>
                      <td className="p-2 text-slate-400">{log.sentAt}</td>
                      <td className="p-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {log.status === 'success' ? 'تم الإرسال ✓' : 'فشل الإرسال ✕'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">البريد الإلكتروني (Email)</label>
                  <input
                    type="email"
                    value={formUserData.email}
                    onChange={(e) => setFormUserData({ ...formUserData, email: e.target.value })}
                    placeholder="employee@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                  />
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
