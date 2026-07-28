import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../utils/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role?: User['role']) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('erp_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('erp_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string, role?: User['role']) => {
    const res = await api.post('/auth/login', { email, password, role });
    const authenticatedUser: User = {
      _id: res.data._id,
      name: res.data.name,
      email: res.data.email,
      role: res.data.role,
    };
    localStorage.setItem('erp_token', res.data.token);
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const logout = () => {
    localStorage.removeItem('erp_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
