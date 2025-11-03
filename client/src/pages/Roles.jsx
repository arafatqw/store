import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Roles() {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    permissions: []
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await axios.get('/api/roles');
      setRoles(res.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      alert('حدث خطأ في جلب الأدوار');
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await axios.get('/api/permissions');
      setPermissions(res.data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await axios.put(`/api/roles/${editingRole.id}`, formData);
      } else {
        await axios.post('/api/roles', formData);
      }
      setShowModal(false);
      setEditingRole(null);
      resetForm();
      fetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      alert('حدث خطأ في حفظ الدور');
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      display_name: role.display_name,
      description: role.description || '',
      permissions: role.permissions?.map(p => p.id) || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدور؟')) return;
    try {
      await axios.delete(`/api/roles/${id}`);
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('حدث خطأ في حذف الدور');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      permissions: []
    });
  };

  const openModal = () => {
    setEditingRole(null);
    resetForm();
    setShowModal(true);
  };

  // Group permissions by group
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const group = perm.group || 'عام';
    if (!acc[group]) acc[group] = [];
    acc[group].push(perm);
    return acc;
  }, {});

  if (!hasPermission('roles.view')) {
    return (
      <div className="card text-center py-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">ليس لديك صلاحية للوصول</h2>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">الأدوار والصلاحيات</h2>
        {hasPermission('roles.create') && (
          <button onClick={openModal} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            إضافة دور جديد
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Shield className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{role.display_name}</h3>
                  <p className="text-sm text-gray-500">{role.name}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {hasPermission('roles.edit') && (
                  <button
                    onClick={() => handleEdit(role)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={18} />
                  </button>
                )}
                {hasPermission('roles.delete') && (
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
            {role.description && (
              <p className="text-sm text-gray-600 mb-3">{role.description}</p>
            )}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">الصلاحيات:</p>
              <div className="flex flex-wrap gap-2">
                {role.permissions?.map((perm) => (
                  <span
                    key={perm.id}
                    className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                  >
                    {perm.display_name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingRole ? 'تعديل دور' : 'إضافة دور جديد'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">اسم الدور (بالإنكليزي) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="مثل: admin"
                    disabled={!!editingRole}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">اسم العرض *</label>
                  <input
                    type="text"
                    required
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="input-field"
                    placeholder="مثل: مدير عام"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الصلاحيات</label>
                <div className="border border-gray-200 rounded p-4 max-h-64 overflow-y-auto space-y-4">
                  {Object.entries(groupedPermissions).map(([group, perms]) => (
                    <div key={group}>
                      <h4 className="font-semibold text-gray-700 mb-2">{group}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {perms.map((perm) => (
                          <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(perm.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    permissions: [...formData.permissions, perm.id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    permissions: formData.permissions.filter(id => id !== perm.id)
                                  });
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{perm.display_name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">حفظ</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRole(null);
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

