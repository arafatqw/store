import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, QrCode } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BarcodeScanner from '../components/BarcodeScanner';

export default function Products() {
  const { hasPermission } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    unit: 'قطعة',
    price: '',
    description: '',
    team_ids: [],
  });

  useEffect(() => {
    fetchProducts();
    fetchTeams();
  }, []);

  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesName = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCode = product.code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = product.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTeams = product.teams?.some(team => 
        team.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      return matchesName || matchesCode || matchesCategory || matchesTeams;
    });
    
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('حدث خطأ في جلب المنتجات');
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await axios.get('/api/teams');
      setTeams(res.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id}`, formData);
      } else {
        await axios.post('/api/products', formData);
      }
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('حدث خطأ في حفظ المنتج');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      code: product.code,
      category: product.category || '',
      unit: product.unit || 'قطعة',
      price: product.price || '',
      description: product.description || '',
      team_ids: product.teams?.map(team => team.id) || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      await axios.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('حدث خطأ في حذف المنتج');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      category: '',
      unit: 'قطعة',
      price: '',
      description: '',
      team_ids: [],
    });
  };

  const handleTeamToggle = (teamId) => {
    setFormData(prev => ({
      ...prev,
      team_ids: prev.team_ids.includes(teamId)
        ? prev.team_ids.filter(id => id !== teamId)
        : [...prev.team_ids, teamId]
    }));
  };

  const openModal = () => {
    setEditingProduct(null);
    resetForm();
    setShowModal(true);
  };

  const handleBarcodeScan = (code) => {
    if (!code || !code.trim()) {
      return;
    }

    const scannedCode = code.trim();
    
    // إدخال الكود في حقل رمز المنتج
    setFormData({ ...formData, code: scannedCode });
    
    // Add vibration for success
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    
    // إذا كان المودال غير مفتوح، افتحه
    if (!showModal) {
      setShowModal(true);
    }
    
    setShowScanner(false);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">المنتجات</h2>
        {hasPermission('products.create') && (
          <button onClick={openModal} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            إضافة منتج جديد
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pr-10"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-right py-3 px-4 font-semibold">الرمز</th>
              <th className="text-right py-3 px-4 font-semibold">اسم المنتج</th>
              <th className="text-right py-3 px-4 font-semibold">الفئة</th>
              <th className="text-right py-3 px-4 font-semibold">الوحدة</th>
              <th className="text-right py-3 px-4 font-semibold">السعر</th>
              <th className="text-right py-3 px-4 font-semibold">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">{product.code}</td>
                <td className="py-3 px-4 font-medium">{product.name}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-2">
                    {product.teams && product.teams.length > 0 ? (
                      product.teams.map((team) => (
                        <div
                          key={team.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                          style={{ 
                            backgroundColor: team.color ? `${team.color}20` : '#3b82f620',
                            color: team.color || '#3b82f6',
                            border: `1px solid ${team.color || '#3b82f6'}40`
                          }}
                          title={team.added_by ? `أضافه: ${team.added_by.name}` : ''}
                        >
                          <span>{team.name}</span>
                          {team.added_by && (
                            <span className="text-[10px] opacity-75">
                              ({team.added_by.name})
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">{product.category || '-'}</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">{product.unit}</td>
                <td className="py-3 px-4">{product.price ? `${product.price} د.أ` : '-'}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    {hasPermission('products.edit') && (
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-800"
                        title="تعديل"
                      >
                        <Edit size={18} />
                      </button>
                    )}
                    {hasPermission('products.delete') && (
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-800"
                        title="حذف"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">لا توجد منتجات</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم المنتج *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رمز المنتج *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="input-field flex-1"
                    placeholder="أدخل الرمز أو امسح الباركود"
                  />
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="btn-primary px-4 flex items-center justify-center gap-2 min-w-[80px]"
                    title="مسح الباركود/QR Code"
                  >
                    <QrCode size={20} />
                    <span className="hidden sm:inline">مسح</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">يمكنك إدخال الرمز يدوياً أو مسحه من الباركود/QR Code</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الفئات (الفِرق المسؤولة)</label>
                <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {teams.length === 0 ? (
                    <p className="text-sm text-gray-500">لا توجد فِرق متاحة</p>
                  ) : (
                    <div className="space-y-2">
                      {teams.map((team) => (
                        <label
                          key={team.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.team_ids.includes(team.id)}
                            onChange={() => handleTeamToggle(team.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: team.color || '#3b82f6' }}
                          />
                          <span className="text-sm">{team.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {formData.category && (
                  <p className="text-xs text-gray-500 mt-1">
                    الفئة القديمة: {formData.category} (سيتم الاحتفاظ بها للتوافق مع البيانات القديمة)
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">الوحدة</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="input-field"
                  >
                    <option>قطعة</option>
                    <option>كيلو</option>
                    <option>لتر</option>
                    <option>متر</option>
                    <option>صندوق</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">السعر</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                  />
                </div>
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
                <button type="submit" className="btn-primary flex-1">
                  {editingProduct ? 'تحديث' : 'حفظ'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
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

      {/* Barcode Scanner */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
          title="مسح رمز المنتج"
        />
      )}
    </div>
  );
}
