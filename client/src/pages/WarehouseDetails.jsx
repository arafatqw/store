import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Package, Plus, Filter, User, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function WarehouseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [warehouse, setWarehouse] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [transactionForm, setTransactionForm] = useState({
    productId: '',
    quantity: '',
    type: 'in',
    notes: ''
  });

  useEffect(() => {
    fetchWarehouse();
    fetchProducts();
  }, [id]);

  useEffect(() => {
    fetchInventory();
  }, [id]);

  const fetchWarehouse = async () => {
    try {
      const res = await axios.get('/api/warehouses');
      const found = res.data.find(w => w.id === id);
      if (!found) {
        alert('المخزن غير موجود');
        navigate('/warehouses');
        return;
      }
      setWarehouse(found);
    } catch (error) {
      console.error('Error fetching warehouse:', error);
      alert('حدث خطأ في جلب بيانات المخزن');
    }
  };

  const fetchInventory = async () => {
    try {
      const url = `/api/inventory?warehouseId=${id}`;
      const res = await axios.get(url);
      setInventory(res.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      alert('حدث خطأ في جلب المخزون');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/transactions', {
        ...transactionForm,
        warehouseId: id,
        quantity: parseFloat(transactionForm.quantity)
      });
      setShowAddModal(false);
      setTransactionForm({
        productId: '',
        quantity: '',
        type: 'in',
        notes: ''
      });
      fetchInventory();
    } catch (error) {
      console.error('Error creating transaction:', error);
      const errorMsg = error.response?.data?.error || 'حدث خطأ في إنشاء الحركة';
      alert(errorMsg);
    }
  };

  if (!warehouse) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  const filteredProducts = products;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/warehouses')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowRight size={20} />
          <span>العودة للمخازن</span>
        </button>

        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{warehouse.name}</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={18} />
                  <span>الموقع: {warehouse.location}</span>
                </div>
                {warehouse.manager && (
                  <>
                    <div className="flex items-center gap-2 text-blue-600">
                      <User size={18} />
                      <span>مدير المخزن: {warehouse.manager}</span>
                    </div>
                    {warehouse.managerLocation && (
                      <div className="flex items-center gap-2 text-gray-500 text-sm mr-6">
                        <MapPin size={16} />
                        <span>مكان المدير: {warehouse.managerLocation}</span>
                      </div>
                    )}
                  </>
                )}
                {warehouse.description && (
                  <p className="text-gray-600 mt-3">{warehouse.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="card mb-6">
        <div className="flex justify-end">
          {hasPermission('transactions.create') && (
            <div>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                إضافة منتج للمخزن
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inventory List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map((item) => (
            <div key={`${item.productId}_${item.warehouseId}`} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Package className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.product?.name || 'غير معروف'}</h3>
                    <p className="text-sm text-gray-600">{item.product?.code || ''}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
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
          لا توجد منتجات في هذا المخزن
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">إضافة منتج للمخزن</h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">نوع الحركة *</label>
                <select
                  value={transactionForm.type}
                  onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value })}
                  className="input-field"
                >
                  <option value="in">دخول</option>
                  <option value="out">خروج</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">المنتج *</label>
                <select
                  required
                  value={transactionForm.productId}
                  onChange={(e) => setTransactionForm({ ...transactionForm, productId: e.target.value })}
                  className="input-field"
                >
                  <option value="">اختر منتج</option>
                  {filteredProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.code})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الكمية *</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={transactionForm.quantity}
                  onChange={(e) => setTransactionForm({ ...transactionForm, quantity: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ملاحظات</label>
                <textarea
                  value={transactionForm.notes}
                  onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })}
                  className="input-field"
                  rows="3"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">حفظ</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setTransactionForm({
                      productId: '',
                      quantity: '',
                      type: 'in',
                      notes: ''
                    });
                  }}
                  className="btn-secondary"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
