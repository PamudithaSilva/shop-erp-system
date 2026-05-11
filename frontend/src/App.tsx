import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout     from './components/layout/Layout';
import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import Customers  from './pages/Customers';
import Categories from './pages/Categories';
import Suppliers  from './pages/Suppliers';

function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
    </div>
  );
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Guard><Layout /></Guard>}>
          <Route index        element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"  element={<Dashboard />} />
          <Route path="customers"  element={<Customers />} />
          <Route path="categories" element={<Categories />} />
          <Route path="suppliers"  element={<Suppliers />} />
          {/* Products + Sales — coming next */}
        </Route>
      </Routes>
    </AuthProvider>
  );
}