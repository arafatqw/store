import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Users() {
  const { user: currentUser, hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    roles: []
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('حدث خطأ في جلب المستخدمين');
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get('/api/roles');
      setRoles(res.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData };
      if (editingUser && !data.password) {
        delete data.password;
        delete data.password_confirmation;
      } else if (!data.password) {
        return alert('كلمة المرور مطلوبة');
      }

      if (editingUser) {
        await axios.put(`/api/users/${editingUser.id}`, data);
      } else {
        await axios.post('/api/users', data);
      }
      setShowModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMsg = error.response?.data?.message || 'حدث خطأ في حفظ المستخدم';
      alert(errorMsg);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      password: '',
      password_confirmation: '',
      roles: user.roles?.map(r => r.id) || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      await axios.delete(`/api/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('حدث خطأ في حذف المستخدم');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      password_confirmation: '',
      roles: []
    });
  };

  const openModal = () => {
    setEditingUser(null);
    resetForm();
    setShowModal(true);
  };

  if (!hasPermission('users.view')) {
    return (
      <div className="card text-center py-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">ليس لديك صلاحية للوصول</h2>
        <p className="text-gray-600">تحتاج صلاحية: عرض المستخدمين</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">المستخدمون</h2>
        {hasPermission('users.create') && (
          <button onClick={openModal} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            إضافة مستخدم جديد
          </button>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-right py-3 px-4 font-semibold">اسم المستخدم</th>
              <th className="text-right py-3 px-4 font-semibold">الاسم</th>
              <th className="text-right py-3 px-4 font-semibold">البريد</th>
              <th className="text-right py-3 px-4 font-semibold">الأدوار</th>
              <th className="text-right py-3 px-4 font-semibold">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{user.username}</td>
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-2">
                    {user.roles?.map((role) => (
                      <span
                        key={role.id}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                      >
                        {role.display_name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    {hasPermission('users.edit') && (
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-800"
                        title="تعديل"
                      >
                        <Edit size={18} />
                      </button>
                    )}
                    {hasPermission('users.delete') && user.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDelete(user.id)}
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
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">لا يوجد مستخدمون</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">اسم المستخدم *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">البريد الإلكتروني *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  كلمة المرور {!editingUser && '*'}
                  {editingUser && <span className="text-gray-500 text-xs">(اتركه فارغاً للإبقاء على كلمة المرور الحالية)</span>}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium mb-1">تأكيد كلمة المرور *</label>
                  <input
                    type="password"
                    required
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                    className="input-field"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">الأدوار</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(role.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              roles: [...formData.roles, role.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              roles: formData.roles.filter(id => id !== role.id)
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{role.display_name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">حفظ</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
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

