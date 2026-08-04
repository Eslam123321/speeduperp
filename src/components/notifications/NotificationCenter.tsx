import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Trash2, Info, Check, Printer } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export const NotificationCenter: React.FC = () => {
  const { notifications, markNotificationAsRead, deleteNotification, clearNotifications, setActiveTab } = useERP();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleExecuteClear = () => {
    clearNotifications();
    setShowClearConfirm(false);
  };

  const handlePrintAllNotifications = () => {
    window.print();
  };

  return (
    <div id="printable-notifications-area" className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-amber-400" />
            <span>مركز الإشعارات والتنبيهات المباشرة</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            إشعارات فورية بنقص أصناف السجائر، توقف العملاء عن التعامل لـ 3 أيام، وتجاوز حدود الائتمان.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handlePrintAllNotifications}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة جميع الإشعارات</span>
            </button>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-red-400 hover:bg-red-500/20 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>مسح جميع الإشعارات</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="glass-panel p-12 text-center text-slate-400">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h3 className="font-bold text-slate-200">لا توجد إشعارات حالياً</h3>
            <p className="text-xs text-slate-500">المخزون وحسابات الديون في حالة ممتازة!</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationAsRead(notif.id);
                if (notif.productId) setActiveTab('inventory');
                else if (notif.customerId) setActiveTab('customers');
                else if (notif.saleId) setActiveTab('reports');
              }}
              className={`glass-panel p-4 flex items-start justify-between gap-4 cursor-pointer transition-all ${
                !notif.read ? 'border-amber-500/40 bg-amber-500/5' : 'opacity-80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    notif.type === 'low_stock'
                      ? 'bg-red-500/20 text-red-400'
                      : notif.type === 'credit_warning'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {notif.type === 'low_stock' ? (
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-white">{notif.title}</h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{notif.message}</p>
                  <span className="text-[10px] text-slate-500 mt-2 block">{notif.timestamp}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 no-print shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    const printWin = window.open('', '', 'width=600,height=400');
                    if (printWin) {
                      printWin.document.write(`
                        <div dir="rtl" style="font-family: sans-serif; padding: 20px; text-align: right;">
                          <h2>إشعار تنبيه - مؤسسة الدخان ERP</h2>
                          <hr/>
                          <p><strong>العنوان:</strong> ${notif.title}</p>
                          <p><strong>التفاصيل:</strong> ${notif.message}</p>
                          <p><strong>التاريخ:</strong> ${notif.timestamp}</p>
                        </div>
                      `);
                      printWin.document.close();
                      printWin.print();
                    } else {
                      window.print();
                    }
                  }}
                  className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all shadow cursor-pointer flex items-center justify-center"
                  title="طباعة هذا الإشعار بمفرده"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  onClick={() => deleteNotification(notif.id)}
                  className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all shadow cursor-pointer flex items-center justify-center"
                  title="حذف هذا الإشعار بمفرده"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Clear Notifications Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showClearConfirm}
        title="تأكيد مسح كافة الإشعارات"
        message="هل أنت تأكد من رغبتك في مسح وتنظيف كافة الإشعارات والتنبيهات الحالية؟"
        confirmText="نعم، مسح جميع الإشعارات"
        onConfirm={handleExecuteClear}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};
