import React, { useState } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Dashboard } from './components/dashboard/Dashboard';
import { POS } from './components/sales/POS';
import { InventoryManager } from './components/inventory/InventoryManager';
import { CustomerAccounts } from './components/customers/CustomerAccounts';
import { SupplierAccounts } from './components/suppliers/SupplierAccounts';
import { RepresentativesManager } from './components/representatives/RepresentativesManager';
import { ExpensesManager } from './components/expenses/ExpensesManager';
import { ReportsView } from './components/reports/ReportsView';
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { SettingsView } from './components/settings/SettingsView';
import { InvoicePrintModal } from './components/sales/InvoicePrintModal';
import { LoginPage } from './components/auth/LoginPage';

const MainLayout: React.FC = () => {
  const { activeTab, printingInvoice, setPrintingInvoice, loggedInUser, isInitialSyncing } = useERP();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user is not logged in, show Login Screen
  if (!loggedInUser) {
    return <LoginPage />;
  }

  // Smooth loading splash screen during initial cloud data sync on mobile / desktop
  if (isInitialSyncing) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center space-y-4 z-50 text-white dir-rtl">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-base font-extrabold text-amber-400">حسام ERP • جاري تحديث البيانات السحابية 🔄</h2>
        <p className="text-xs text-slate-400">يتم جلب أحدث البيانات المباشرة لضمان الدقة على الموبايل...</p>
      </div>
    );
  }

  const renderActiveTab = () => {
    // Non-admin employees are strictly allowed to see ONLY their POS view
    if (loggedInUser.role !== 'admin') {
      return <POS />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'pos':
        return <POS />;
      case 'inventory':
        return <InventoryManager />;
      case 'customers':
        return <CustomerAccounts />;
      case 'reports':
        return <ReportsView />;
      case 'notifications':
        return <NotificationCenter />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      {/* Top Header Navbar */}
      <Navbar onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

      {/* Full Width Page Content Layout - Full View without Slider */}
      <div className="flex-1 w-full max-w-[1920px] mx-auto flex items-start px-2 lg:px-6">
        {/* Desktop Sidebar */}
        <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />

        {/* Content View Container */}
        <main className="flex-1 py-4 lg:py-6 px-1 lg:px-4 w-full min-w-0 pb-24 lg:pb-8">
          {renderActiveTab()}
        </main>
      </div>

      {/* Smartphone Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Invoice Printable Receipt Overlay Modal */}
      {printingInvoice && (
        <InvoicePrintModal
          invoice={printingInvoice}
          onClose={() => setPrintingInvoice(null)}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <ERPProvider>
      <MainLayout />
    </ERPProvider>
  );
}

export default App;
