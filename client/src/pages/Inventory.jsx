import { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Filter } from 'lucide-react';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');

  useEffect(() => {
    fetchWarehouses();
    fetchInventory();
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [selectedWarehouse]);

  const fetchWarehouses = async () => {
    try {
      const res = await axios.get('/api/warehouses');
      setWarehouses(res.data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const fetchInventory = async () => {
    try {
      const url = selectedWarehouse 
        ? `/api/inventory?warehouseId=${selectedWarehouse}`
        : '/api/inventory';
      const res = await axios.get(url);
      setInventory(res.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      alert('حدث خطأ في جلب المخزون');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">المخزون</h2>
        <div className="flex items-center gap-3">
          <Filter size={20} className="text-gray-600" />
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="input-field w-64"
          >
            <option value="">جميع المخازن</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map((item) => (
          <div key={`${item.productId}_${item.warehouseId}`} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Package className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{item.product?.name || 'غير معروف'}</h3>
                  <p className="text-sm text-gray-600">{item.product?.code || ''}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">المخزن:</span>
                <span className="font-medium">{item.warehouse?.name || 'غير معروف'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">الكمية المتوفرة:</span>
                <span className="font-bold text-xl text-blue-600">{item.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">الوحدة:</span>
                <span className="text-gray-800">{item.product?.unit || 'قطعة'}</span>
              </div>
              {item.product?.price && (
                <div className="flex justify-between">
                  <span className="text-gray-600">القيمة الإجمالية:</span>
                  <span className="font-medium text-green-600">
                    {(item.quantity * item.product.price).toFixed(2)} د.أ
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {inventory.length === 0 && (
        <div className="card text-center py-8 text-gray-500">
          لا توجد عناصر في المخزون
        </div>
      )}
    </div>
  );
}
