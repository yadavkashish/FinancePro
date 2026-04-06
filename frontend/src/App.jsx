import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import AdminPanel from './pages/AdminPanel';
import { Signup, Login, Unauthorized } from './pages/AuthPages';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
axios.defaults.withCredentials = true; 

const AuthContext = createContext({ user: null, login: () => {}, logout: () => {}, isLoading: true });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => axios.get(`${API_URL}/users/me`).then(res => res.data),
    retry: false, 
  });

  useEffect(() => {
    if (data?.data?.user) setUser(data.data.user);
    setIsLoading(queryLoading);
  }, [data, queryLoading]);

  return (
    <AuthContext.Provider value={{ user, login: setUser, logout: () => setUser(null), isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <div className="p-10 text-center animate-pulse">Verifying Access...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-50">
      <div className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-9 h-9 bg-blue-600 rounded-lg inline-flex items-center justify-center mr-2">F</div>FinancePro
      </div>
      {user && (
        <div className="flex items-center gap-6">
          <nav className="flex gap-4">
            <button onClick={() => navigate('/')} className="text-sm font-medium hover:text-blue-400">Dashboard</button>
            {user.role !== 'viewer' && <button onClick={() => navigate('/transactions')} className="text-sm font-medium hover:text-blue-400">Records</button>}
            {user.role === 'admin' && <button onClick={() => navigate('/admin')} className="text-sm font-medium hover:text-blue-400">Users</button>}
          </nav>
          <button onClick={async () => { await axios.get(`${API_URL}/users/logout`); logout(); navigate('/login'); }} className="text-sm bg-blue-600 px-4 py-2 rounded-lg">Logout</button>
        </div>
      )}
    </header>
  );
};

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute allowedRoles={['admin', 'analyst']}><Transactions /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanel /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}