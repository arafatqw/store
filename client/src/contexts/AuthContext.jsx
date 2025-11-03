import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up axios interceptor for token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/me');
      setUser(res.data);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const res = await axios.post('/api/login', { username, password });
      const { user: userData, token } = res.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'فشل تسجيل الدخول';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Laravel validation errors
        const errors = error.response.data.errors;
        if (errors.username) {
          errorMessage = errors.username[0];
        } else if (errors.password) {
          errorMessage = errors.password[0];
        } else {
          errorMessage = Object.values(errors).flat().join(', ');
        }
      } else if (error.response?.status === 422) {
        errorMessage = 'بيانات الدخول غير صحيحة';
      } else if (error.response?.status === 401) {
        errorMessage = 'بيانات الدخول غير صحيحة';
      } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        errorMessage = 'لا يمكن الاتصال بالسيرفر. تأكد من أن السيرفر يعمل.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    return user.roles?.some(role => 
      role.permissions?.some(perm => perm.name === permission)
    ) || false;
  };

  const hasRole = (roleName) => {
    if (!user) return false;
    return user.roles?.some(role => role.name === roleName) || false;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    hasRole,
    fetchUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

