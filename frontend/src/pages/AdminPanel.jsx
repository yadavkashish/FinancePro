// src/pages/AdminPanel.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UserCog, AlertTriangle, X } from 'lucide-react'; // Added icons for warnings
import { useAuth, Header, API_URL } from '../App';

const AdminPanel = () => {
  const queryClient = useQueryClient();
  const [systemError, setSystemError] = useState(null); // State to hold the warning message

  const { data: res, isLoading, error: fetchError } = useQuery({ 
    queryKey: ['users'], 
    queryFn: () => axios.get(`${API_URL}/users`).then(r => r.data) 
  });
  
  const upMut = useMutation({
    mutationFn: ({id, d}) => axios.put(`${API_URL}/users/${id}`, d),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setSystemError(null); // Clear errors on success
    },
    onError: (err) => {
      // Capture the "Security Restriction" message from the backend
      const msg = err.response?.data?.message || "Failed to update user";
      setSystemError(msg);
    }
  });

  const delMut = useMutation({
    mutationFn: (id) => axios.delete(`${API_URL}/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setSystemError(null);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Failed to delete user";
      setSystemError(msg);
    }
  });

  if (isLoading) return <div className="p-20 text-center font-bold text-slate-400">Loading Directory...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCog className="text-blue-600" size={32}/>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Access Control</h1>
          </div>
        </div>

        {/* ⚠️ THE WARNING BOX (Only shows when a restriction is hit) */}
        {systemError && (
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3 text-red-700 font-bold text-sm">
              <AlertTriangle size={20} />
              {systemError}
            </div>
            <button onClick={() => setSystemError(null)} className="text-red-400 hover:text-red-600 transition-colors">
              <X size={20} />
            </button>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="p-4">User Information</th>
                <th className="p-4">Permissions</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {res?.data?.users?.map(u => (
                <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-black text-slate-900">{u.name}</div>
                    <div className="text-[10px] font-bold text-slate-400">{u.email}</div>
                  </td>
                  <td className="p-4">
                    <select 
                      value={u.role} 
                      onChange={e => upMut.mutate({id: u._id, d: {role: e.target.value}})} 
                      className="border rounded-xl p-2 text-xs font-black bg-white focus:ring-2 focus:ring-blue-500 uppercase tracking-tighter"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="analyst">Analyst</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <select 
                      value={u.status} 
                      onChange={e => upMut.mutate({id: u._id, d: {status: e.target.value}})} 
                      className={`border rounded-xl p-2 text-xs font-black ${u.status === 'active' ? 'text-green-600' : 'text-red-600'} bg-white focus:ring-2 focus:ring-blue-500 uppercase tracking-tighter`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => delMut.mutate(u._id)} 
                      className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all"
                    >
                      Revoke Access
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;