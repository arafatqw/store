import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Warehouse, ClipboardList, ArrowLeftRight, Users, Shield, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children }) {
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();

  const menuItems = [
    { path: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
    { path: '/products', label: 'المنتجات', icon: Package, permission: 'products.view' },
    { path: '/warehouses', label: 'المخازن', icon: Warehouse, permission: 'warehouses.view' },
    { path: '/inventory', label: 'المخزون', icon: ClipboardList, permission: 'inventory.view' },
    { path: '/transactions', label: 'الحركات', icon: ArrowLeftRight, permission: 'transactions.view' },
    { path: '/users', label: 'المستخدمون', icon: User, permission: 'users.view' },
    { path: '/roles', label: 'الأدوار والصلاحيات', icon: Shield, permission: 'roles.view' }
  ].filter(item => !item.permission || hasPermission(item.permission));

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 md:px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-lg md:text-2xl font-bold text-blue-600 truncate">نظام جرد المخازن</h1>
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              {user && (
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs md:text-sm font-medium text-gray-800 truncate max-w-[120px] md:max-w-none">{user.name}</div>
                    <div className="text-xs text-gray-500 hidden md:block">
                      {user.roles?.map(r => r.display_name).join('، ')}
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm md:text-base"
                    title="تسجيل الخروج"
                  >
                    <LogOut size={16} className="md:w-[18px] md:h-[18px]" />
                    <span className="hidden md:inline">خروج</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white shadow-sm sticky top-0 z-10 md:relative md:z-auto md:h-auto">
          <nav className="p-2 md:p-4 flex md:flex-col gap-1 md:space-y-2 overflow-x-auto md:overflow-x-visible scrollbar-hide">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 md:py-3 rounded-lg transition-colors duration-200 whitespace-nowrap flex-shrink-0 min-h-[44px] touch-manipulation ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 active:bg-gray-100'
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="font-medium text-sm md:text-base">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
