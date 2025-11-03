import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Warehouses from './pages/Warehouses';
import WarehouseDetails from './pages/WarehouseDetails';
import Inventory from './pages/Inventory';
import Transactions from './pages/Transactions';
import Users from './pages/Users';
import Roles from './pages/Roles';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<ProtectedRoute permission="products.view"><Products /></ProtectedRoute>} />
                <Route path="/warehouses" element={<ProtectedRoute permission="warehouses.view"><Warehouses /></ProtectedRoute>} />
                <Route path="/warehouses/:id" element={<ProtectedRoute permission="warehouses.view"><WarehouseDetails /></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute permission="inventory.view"><Inventory /></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute permission="transactions.view"><Transactions /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute permission="users.view"><Users /></ProtectedRoute>} />
                <Route path="/roles" element={<ProtectedRoute permission="roles.view"><Roles /></ProtectedRoute>} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
