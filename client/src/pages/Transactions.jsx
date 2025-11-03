import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, ArrowDownCircle, ArrowUpCircle, Camera, QrCode } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BarcodeScanner from '../components/BarcodeScanner';

export default function Transactions() {
  const { hasPermission } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerType, setScannerType] = useState(null); // 'product' or 'serial'
  const [formData, setFormData] = useState({
    productId: '',
    warehouseId: '',
    type: 'in',
    quantity: '1',
    serialNumber: '',
    notes: ''
  });
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchTransactions();
    fetchProducts();
    fetchWarehouses();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('/api/transactions');
      setTransactions(res.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      alert('حدث خطأ في جلب الحركات');
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

  const fetchWarehouses = async () => {
    try {
      const res = await axios.get('/api/warehouses');
      setWarehouses(res.data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const handleBarcodeScan = async (code) => {
    if (!code || !code.trim()) {
      return;
    }

    const scannedCode = code.trim();

    if (scannerType === 'product') {
      // البحث عن المنتج بالكود
      try {
        const res = await axios.get(`/api/products/search/by-code?code=${scannedCode}`);
        const product = res.data;
        setSelectedProduct(product);
        setFormData({ ...formData, productId: product.id });
        
        // Add vibration for success
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
        
        // إذا كان المسح من خارج المودال، افتح المودال
        if (!showModal) {
          setShowModal(true);
        }
        
        // إغلاق المسح
        setShowScanner(false);
        setScannerType(null);
      } catch (error) {
        alert(`المنتج غير موجود. تأكد من صحة كود الباركود.\nالكود الممسوح: ${scannedCode}`);
        // Keep scanner open for retry - don't close it
        return;
      }
    } else if (scannerType === 'serial') {
      // استخدام الكود كسيريال نمبر
      setFormData({ ...formData, serialNumber: scannedCode });
      // Add vibration for success
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      setShowScanner(false);
      setScannerType(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/transactions', {
        product_id: formData.productId,
        warehouse_id: formData.warehouseId,
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        serial_number: formData.serialNumber || null,
        notes: formData.notes || null
      });
      setShowModal(false);
      resetForm();
      fetchTransactions();
      alert('تمت إضافة الحركة بنجاح');
    } catch (error) {
      console.error('Error creating transaction:', error);
      const errorMsg = error.response?.data?.error || 'حدث خطأ في إنشاء الحركة';
      alert(errorMsg);
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      warehouseId: '',
      type: 'in',
      quantity: '1',
      serialNumber: '',
      notes: ''
    });
    setSelectedProduct(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleQuickScan = () => {
    setScannerType('product');
    setShowScanner(true);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">الحركات</h2>
        {hasPermission('transactions.create') && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button 
              onClick={handleQuickScan}
              className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto bg-green-600 hover:bg-green-700"
              title="مسح سريع - امسح الباركود لإنشاء حركة بسرعة"
            >
              <QrCode size={20} />
              مسح سريع
            </button>
            <button 
              onClick={() => {
                setShowModal(true);
                resetForm();
              }} 
              className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Plus size={20} />
              إضافة حركة جديدة
            </button>
          </div>
        )}
      </div>

      <div className="card overflow-x-auto">
        <div className="min-w-full">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-2 md:px-4 font-semibold text-sm md:text-base">النوع</th>
                <th className="text-right py-3 px-2 md:px-4 font-semibold text-sm md:text-base">المنتج</th>
                <th className="text-right py-3 px-2 md:px-4 font-semibold text-sm md:text-base">المخزن</th>
                <th className="text-right py-3 px-2 md:px-4 font-semibold text-sm md:text-base">الكمية</th>
                <th className="text-right py-3 px-2 md:px-4 font-semibold text-sm md:text-base hidden md:table-cell">السيريال</th>
                <th className="text-right py-3 px-2 md:px-4 font-semibold text-sm md:text-base hidden md:table-cell">التاريخ</th>
                <th className="text-right py-3 px-2 md:px-4 font-semibold text-sm md:text-base hidden lg:table-cell">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 md:px-4">
                    {transaction.type === 'in' ? (
                      <span className="inline-flex items-center gap-1 text-green-600 font-medium text-sm">
                        <ArrowDownCircle size={16} />
                        دخول
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 font-medium text-sm">
                        <ArrowUpCircle size={16} />
                        خروج
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 md:px-4">
                    <div className="text-sm">
                      <div className="font-medium">{transaction.product?.name || 'غير معروف'}</div>
                      <div className="text-gray-500 text-xs">{transaction.product?.code || ''}</div>
                    </div>
                  </td>
                  <td className="py-3 px-2 md:px-4 text-sm">{transaction.warehouse?.name || 'غير معروف'}</td>
                  <td className="py-3 px-2 md:px-4 font-medium text-sm">{transaction.quantity}</td>
                  <td className="py-3 px-2 md:px-4 text-sm text-gray-600 hidden md:table-cell">
                    {transaction.serial_number ? (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{transaction.serial_number}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2 md:px-4 text-xs md:text-sm text-gray-600 hidden md:table-cell">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="py-3 px-2 md:px-4 text-sm text-gray-500 hidden lg:table-cell">{transaction.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {transactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">لا توجد حركات</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto overscroll-contain">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md my-auto max-h-[95vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold mb-4">إضافة حركة جديدة</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">نوع الحركة *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                >
                  <option value="in">دخول</option>
                  <option value="out">خروج</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">المنتج *</label>
                <div className="flex gap-2">
                  <select
                    required
                    value={formData.productId}
                    onChange={(e) => {
                      const product = products.find(p => p.id === e.target.value);
                      setSelectedProduct(product);
                      setFormData({ ...formData, productId: e.target.value });
                    }}
                    className="input-field flex-1"
                  >
                    <option value="">اختر منتج أو امسح الباركود</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.code})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setScannerType('product');
                      setShowScanner(true);
                    }}
                    className="btn-primary px-4 flex items-center justify-center gap-2 min-w-[80px]"
                    title="مسح باركود/QR Code للمنتج"
                  >
                    <QrCode size={20} />
                    <span className="hidden sm:inline">مسح</span>
                  </button>
                </div>
                {selectedProduct && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                    <div className="font-semibold text-green-800 mb-1">✓ تم اختيار المنتج</div>
                    <div className="font-medium text-gray-800">{selectedProduct.name}</div>
                    <div className="text-gray-600 text-xs mt-1">الكود: {selectedProduct.code}</div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">المخزن *</label>
                <select
                  required
                  value={formData.warehouseId}
                  onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                  className="input-field"
                >
                  <option value="">اختر مخزن</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
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
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="input-field"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">السيريال نمبر / الباركود</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="input-field flex-1"
                    placeholder="4444 أو امسح الباركود"
                    inputMode="numeric"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setScannerType('serial');
                      setShowScanner(true);
                    }}
                    className="btn-primary px-4 flex items-center justify-center gap-2"
                    title="مسح السيريال نمبر"
                  >
                    <Camera size={20} />
                    <span className="hidden sm:inline">مسح</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">يمكنك إدخاله يدوياً أو مسحه من الباركود/QR Code</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">ملاحظات</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  rows="3"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">حفظ</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
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
          onClose={() => {
            setShowScanner(false);
            setScannerType(null);
          }}
          title={scannerType === 'product' ? 'مسح باركود المنتج' : 'مسح السيريال نمبر'}
        />
      )}
    </div>
  );
}
