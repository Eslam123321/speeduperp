import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  Receipt,
  Search,
  Fuel,
  Home,
  Users,
  Wrench,
  Coffee,
  HelpCircle,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Expense } from '../../types';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export const ExpensesManager: React.FC = () => {
  const { expenses, addExpense, deleteExpense, currentUser } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    amount: 100,
    category: 'fuel' as Expense['category'],
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.amount <= 0) return;

    addExpense(formData);
    setShowAddModal(false);
    setFormData({
      title: '',
      amount: 100,
      category: 'fuel',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleConfirmDeleteExpense = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
    }
  };

  const categoryIcons: Record<Expense['category'], any> = {
    fuel: Fuel,
    rent: Home,
    salaries: Users,
    maintenance: Wrench,
    hospitality: Coffee,
    other: HelpCircle,
  };

  const categoryLabels: Record<Expense['category'], string> = {
    fuel: 'وقود وسولار سيارات',
    rent: 'إيجار المخازن والمحلات',
    salaries: 'مرتبات وإكراميات',
    maintenance: 'صيانة وإصلاحات',
    hospitality: 'ضيافة وبوفيه',
    other: 'مصاريف نثرية وأخرى',
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-amber-400" />
            <span>إدارة المصاريف اليومية والتشغيلية</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            تسجيل مصاريف الشحن، السولار، الإيجار، والإكراميات لخصمها من مجمل الأرباح لحساب الصافي الحقيقي.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-left px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
            <span className="text-xs text-red-300 block">إجمالي المصاريف المسجلة:</span>
            <strong className="text-base text-red-400 font-extrabold">{totalExpenses.toLocaleString('ar-EG')} ج.م</strong>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>تسجيل مصروف جديد</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بمسمى المصروف أو التفاصيل..."
            className="w-full pr-9 pl-4 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {[
            { id: 'all', label: 'كافة المصاريف' },
            { id: 'fuel', label: 'وقود وسولار' },
            { id: 'rent', label: 'إيجارات' },
            { id: 'salaries', label: 'مرتبات/إكراميات' },
            { id: 'maintenance', label: 'صيانة' },
            { id: 'other', label: 'أخرى' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 text-[11px] font-bold">
              <tr>
                <th className="p-3">بيان المصروف</th>
                <th className="p-3">الفئة</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">المبلغ (ج.م)</th>
                <th className="p-3">الملاحظات</th>
                <th className="p-3">المسجل</th>
                {currentUser.role === 'admin' && <th className="p-3 text-center">إجراء</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    لا توجد مصاريف مدخلة بهذه التصفية.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const Icon = categoryIcons[exp.category] || HelpCircle;
                  return (
                    <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span>{exp.title}</span>
                      </td>

                      <td className="p-3 text-slate-400 font-semibold">
                        {categoryLabels[exp.category]}
                      </td>

                      <td className="p-3 text-slate-400 font-mono">{exp.date}</td>

                      <td className="p-3 font-extrabold text-red-400 text-sm">
                        {exp.amount.toLocaleString('ar-EG')} ج.م
                      </td>

                      <td className="p-3 text-slate-400 text-[11px]">
                        {exp.notes || '-'}
                      </td>

                      <td className="p-3 text-slate-300 font-medium">{exp.createdByName}</td>

                      {currentUser.role === 'admin' && (
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setExpenseToDelete(exp)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-red-400 border border-slate-700 transition-colors"
                            title="حذف المصروف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Expense */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-400" />
              <span>تسجيل مصروف تشغيلي جديد</span>
            </h2>

            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">عنوان / بيان المصروف *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: بنزين وسولار للسيارات"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">المبلغ (ج.م) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-red-400 font-extrabold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">الفئة</label>
                  <select
                    value={formData.category}
                    onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="fuel">وقود وسولار سيارات</option>
                    <option value="rent">إيجارات مخازن</option>
                    <option value="salaries">مرتبات وحوافز</option>
                    <option value="maintenance">صيانة سيارات ومخزن</option>
                    <option value="hospitality">ضيافة وإكراميات</option>
                    <option value="other">مصاريف أخرى</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">تاريخ الصرف</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">ملاحظات والتفاصيل</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أي تفاصيل إضافية..."
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-600"
                >
                  حفظ المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Expense Deletion */}
      <ConfirmDeleteModal
        isOpen={Boolean(expenseToDelete)}
        title="تأكيد حذف المصروف"
        message={`هل أنت تأكد من رغبتك في حذف المصروف (${expenseToDelete?.title} بقيمة ${expenseToDelete?.amount} ج.م)؟`}
        confirmText="نعم، حذف المصروف الآن"
        onConfirm={handleConfirmDeleteExpense}
        onCancel={() => setExpenseToDelete(null)}
      />
    </div>
  );
};
