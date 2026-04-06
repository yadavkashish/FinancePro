import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Search, Plus, Save, RotateCcw, ArrowUpRight, ArrowDownRight, 
  Edit3, Trash2, ChevronLeft, ChevronRight, Filter, Loader2, Database
} from 'lucide-react';
import { useAuth, Header, API_URL } from '../App';

const Transactions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue } = useForm();
  
  // State: Balanced for performance
  const [filters, setFilters] = useState({ 
    startDate: '', endDate: '', search: '', type: '', page: 1, limit: 10 
  });
  const [editingId, setEditingId] = useState(null);

  // ✅ PREVENTS "ONE CHARACTER AT A TIME" BUG:
  // placeholderData ensures the table stays visible while fetching new results
  const { data: response, isFetching, isInitialLoading } = useQuery({ 
    queryKey: ['transactions', filters], 
    queryFn: () => axios.get(`${API_URL}/transactions`, { params: filters }).then(res => res.data),
    placeholderData: (prev) => prev,
  });

  const transactions = response?.data?.transactions || [];
  const totalPages = response?.pages || 1;

  const saveMutation = useMutation({
    mutationFn: (txData) => {
      const d = { ...txData, amount: parseFloat(txData.amount) };
      return editingId ? axios.put(`${API_URL}/transactions/${editingId}`, d) : axios.post(`${API_URL}/transactions`, d);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      setEditingId(null);
      reset();
    }
  });

  const handleEdit = (tx) => {
    setEditingId(tx._id);
    ['type', 'category', 'amount', 'notes'].forEach(f => setValue(f, tx[f]));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isInitialLoading) return <div className="h-screen bg-slate-50 flex items-center justify-center font-black text-slate-300 animate-pulse uppercase tracking-widest">Waking up Database...</div>;

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <Header />
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ledger Operations</h1>
          {isFetching && <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase"><Loader2 size={14} className="animate-spin"/> Syncing</div>}
        </div>

        {/* 1. ADMIN COMMAND BAR (Form) */}
        {user.role === 'admin' && (
          <div className={`bg-white p-4 rounded-2xl border-2 transition-all shadow-sm ${editingId ? 'border-blue-500 shadow-blue-50' : 'border-slate-100'}`}>
            <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="flex flex-wrap items-center gap-4">
              <select {...register('type')} className="bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer">
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <input {...register('category', { required: true })} placeholder="Category Name" className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none" />
              <input type="number" step="0.01" {...register('amount', { required: true })} placeholder="Amount" className="w-24 bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none" />
              <input {...register('notes')} placeholder="Reference / Notes" className="flex-[1.5] bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none" />
              
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2">
                  {editingId ? <Save size={14}/> : <Plus size={14}/>} {editingId ? 'Update' : 'Commit'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); reset(); }} className="bg-slate-100 text-slate-400 p-2 rounded-xl hover:bg-slate-200"><RotateCcw size={16}/></button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* 2. FILTER STRIP */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-6">
          {/* Classification Dropdown ✅ */}
          <div className="flex items-center gap-2">
             <Filter size={14} className="text-slate-400"/>
             <select 
               value={filters.type} 
               onChange={e => setFilters({...filters, type: e.target.value, page: 1})}
               className="text-xs font-black uppercase text-slate-600 border-none bg-transparent outline-none cursor-pointer"
             >
               <option value="">All Types</option>
               <option value="income">Incomes</option>
               <option value="expense">Expenses</option>
             </select>
          </div>

          <div className="h-4 w-px bg-slate-200 mx-2 hidden md:block"></div>

          {/* Search Bar */}
          <div className="flex-1 min-w-[200px] relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16}/>
            <input 
              type="text" 
              placeholder="Filter by keyword..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value, page: 1})}
            />
          </div>

          {/* Date Pickers */}
          <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <input type="date" value={filters.startDate} className="bg-transparent text-[10px] font-bold outline-none" onChange={e => setFilters({...filters, startDate: e.target.value, page: 1})} />
            <span className="text-slate-300">/</span>
            <input type="date" value={filters.endDate} className="bg-transparent text-[10px] font-bold outline-none" onChange={e => setFilters({...filters, endDate: e.target.value, page: 1})} />
          </div>

          <button onClick={() => setFilters({startDate:'', endDate:'', search:'', type:'', page:1, limit:10})} className="text-[10px] font-black text-slate-400 uppercase hover:text-blue-600 transition-colors">Reset</button>
        </div>

        {/* 3. MODERN DATA GRID */}
        <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Source & Description</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Date</th>
                {user.role === 'admin' && <th className="px-6 py-4 text-right pr-8">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map(tx => (
                <tr key={tx._id} className="group hover:bg-slate-50/80 transition-all">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                      {tx.type === 'income' ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>} {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-slate-900 leading-none">{tx.category}</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-1 truncate max-w-[250px]">{tx.notes || '—'}</div>
                  </td>
                  <td className={`px-6 py-4 font-black text-base ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    ${tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-[11px] font-bold text-slate-400 tracking-tighter">
                    {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  {user.role === 'admin' && (
                    <td className="px-6 py-4 text-right pr-8">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleEdit(tx)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"><Edit3 size={16}/></button>
                        <button onClick={() => axios.delete(`${API_URL}/transactions/${tx._id}`).then(() => queryClient.invalidateQueries(['transactions']))} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="py-24 text-center">
              <Database className="mx-auto text-slate-200 mb-4" size={40}/>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No matching movements found</p>
            </div>
          )}
        </div>

        {/* 4. PAGINATION */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Page {filters.page} / {totalPages}</p>
           </div>
           <div className="flex gap-2">
             <button disabled={filters.page <= 1} onClick={() => setFilters({...filters, page: filters.page - 1})} className="p-2 border rounded-xl hover:bg-slate-50 disabled:opacity-20 transition-all"><ChevronLeft size={18}/></button>
             <button disabled={filters.page >= totalPages} onClick={() => setFilters({...filters, page: filters.page + 1})} className="p-2 border rounded-xl hover:bg-slate-50 disabled:opacity-20 transition-all"><ChevronRight size={18}/></button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;