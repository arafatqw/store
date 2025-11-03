import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Warehouses() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    manager: '',
    managerLocation: ''
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await axios.get('/api/warehouses');
      setWarehouses(res.data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      alert('حدث خطأ في جلب المخازن');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWarehouse) {
        await axios.put(`/api/warehouses/${editingWarehouse.id}`, formData);
      } else {
        await axios.post('/api/warehouses', formData);
      }
      setShowModal(false);
      setEditingWarehouse(null);
      resetForm();
      fetchWarehouses();
    } catch (error) {
      console.error('Error saving warehouse:', error);
      alert('حدث خطأ في حفظ المخزن');
    }
  };

  const handleEdit = (warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      location: warehouse.location,
      description: warehouse.description || '',
      manager: warehouse.manager || '',
      managerLocation: warehouse.managerLocation || ''
    });
    setShowModal(true);
  };

  const handleViewDetails = (warehouseId) => {
    navigate(`/warehouses/${warehouseId}`);
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المخزن؟')) return;
    try {
      await axios.delete(`/api/warehouses/${id}`);
      fetchWarehouses();
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      alert('حدث خطأ في حذف المخزن');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      description: '',
      manager: '',
      managerLocation: ''
    });
  };

  const openModal = () => {
    setEditingWarehouse(null);
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">المخازن</h2>
        {hasPermission('warehouses.create') && (
          <button onClick={openModal} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            إضافة مخزن جديد
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => (
          <div key={warehouse.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{warehouse.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{warehouse.location}</p>
                {warehouse.manager && (
                  <>
                    <p className="text-sm text-blue-600 mt-1">
                      <span className="font-medium">مدير المخزن:</span> {warehouse.manager}
                    </p>
                    {warehouse.managerLocation && (
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">مكان المدير:</span> {warehouse.managerLocation}
                      </p>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {hasPermission('warehouses.view') && (
                  <button
                    onClick={() => handleViewDetails(warehouse.id)}
                    className="text-green-600 hover:text-green-800"
                    title="عرض التفاصيل"
                  >
                    <Eye size={18} />
                  </button>
                )}
                {hasPermission('warehouses.edit') && (
                  <button
                    onClick={() => handleEdit(warehouse)}
                    className="text-blue-600 hover:text-blue-800"
                    title="تعديل"
                  >
                    <Edit size={18} />
                  </button>
                )}
                {hasPermission('warehouses.delete') && (
                  <button
                    onClick={() => handleDelete(warehouse.id)}
                    className="text-red-600 hover:text-red-800"
                    title="حذف"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
            {warehouse.description && (
              <p className="text-sm text-gray-500">{warehouse.description}</p>
            )}
          </div>
        ))}
      </div>

      {warehouses.length === 0 && (
        <div className="card text-center py-8 text-gray-500">لا توجد مخازن</div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingWarehouse ? 'تعديل مخزن' : 'إضافة مخزن جديد'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم المخزن *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الموقع *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">اسم مدير المخزن</label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  className="input-field"
                  placeholder="اسم مدير المخزن"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">مكان/موقع المدير</label>
                <input
                  type="text"
                  value={formData.managerLocation}
                  onChange={(e) => setFormData({ ...formData, managerLocation: e.target.value })}
                  className="input-field"
                  placeholder="أين يوجد المدير (مثل: المكتب الرئيسي، فرع معين)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="3"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">حفظ</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingWarehouse(null);
                    resetForm();
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
