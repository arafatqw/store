import { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Warehouse, ClipboardList, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    warehouses: 0,
    totalItems: 0,
    transactions: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, warehousesRes, inventoryRes, transactionsRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/warehouses'),
        axios.get('/api/inventory'),
        axios.get('/api/transactions')
      ]);

      const totalItems = inventoryRes.data.reduce((sum, item) => sum + item.quantity, 0);

      setStats({
        products: productsRes.data.length,
        warehouses: warehousesRes.data.length,
        totalItems,
        transactions: transactionsRes.data.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    { label: 'إجمالي المنتجات', value: stats.products, icon: Package, color: 'bg-blue-500' },
    { label: 'المخازن', value: stats.warehouses, icon: Warehouse, color: 'bg-green-500' },
    { label: 'إجمالي القطع', value: stats.totalItems, icon: ClipboardList, color: 'bg-purple-500' },
    { label: 'إجمالي الحركات', value: stats.transactions, icon: TrendingUp, color: 'bg-orange-500' }
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">لوحة التحكم</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold mb-4">مرحباً بك في نظام جرد المخازن</h3>
        <p className="text-gray-600 mb-4">
          يمكنك إدارة المنتجات والمخازن ومتابعة المخزون والحركات من القائمة الجانبية.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">إدارة المنتجات</h4>
            <p className="text-sm text-blue-700">أضف وعدّل المنتجات مع تفاصيلها الكاملة</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">إدارة المخازن</h4>
            <p className="text-sm text-green-700">أنشئ وأدار المخازن المختلفة</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">متابعة المخزون</h4>
            <p className="text-sm text-purple-700">راجع الكميات المتوفرة في كل مخزن</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-semibold text-orange-900 mb-2">سجل الحركات</h4>
            <p className="text-sm text-orange-700">تابع حركات الدخول والخروج</p>
          </div>
        </div>
      </div>
    </div>
  );
}
