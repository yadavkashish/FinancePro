import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, 
  ArrowUpRight, ArrowDownRight, Wallet, Activity 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { useAuth, Header, API_URL } from '../App';

const Dashboard = () => {
  const { user } = useAuth();
  
  const { data: dashboardData, isLoading, isError } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/dashboard/summary`);
      return res.data.data;
    },
    placeholderData: { 
      summary: { income: 0, expense: 0, netBalance: 0 }, 
      trends: [], 
      expensesByCategory: [], 
      recentActivity: [] 
    }
  });

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">Syncing Financial Core...</p>
    </div>
  );

  if (isError) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl border border-red-100 text-center shadow-xl">
        <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900">Connection Interrupted</h2>
        <p className="text-slate-500 mt-2">Check your backend terminal for errors.</p>
      </div>
    </div>
  );

  const { summary, trends, expensesByCategory, recentActivity } = dashboardData;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Finance Engine</h1>
            <p className="text-slate-500 font-medium mt-1">
              Welcome back, <span className="text-blue-600 font-bold">{user.name}</span>. Here's your real-time status.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-5 py-2.5 rounded-2xl shadow-sm self-start">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={18}/></div>
            <span className="text-sm font-black text-slate-700">{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* 1. TOP METRICS - Refined Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            icon={<TrendingUp size={24}/>} 
            label="Gross Revenue" 
            value={summary.income} 
            color="emerald" 
            trend="+12.5%" 
          />
          <MetricCard 
            icon={<TrendingDown size={24}/>} 
            label="Total Outflow" 
            value={summary.expense} 
            color="rose" 
            trend="-3.2%" 
          />
          <MetricCard 
            icon={<Wallet size={24}/>} 
            label="Net Liquidity" 
            value={summary.income - summary.expense} 
            color="indigo" 
            isPrimary={true}
          />
        </div>

        {/* 2. TRENDS CHART - Professional Area Chart */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Cash Flow Analysis</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Historical Performance</p>
            </div>
            <div className="flex gap-2">
               <span className="flex items-center gap-1.5 text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100">INCOME</span>
               <span className="flex items-center gap-1.5 text-[10px] font-black bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full border border-rose-100">EXPENSE</span>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="_id" 
                  tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                />
                <YAxis 
                  tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}} 
                  itemStyle={{fontWeight: 800, fontSize: '12px'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#f43f5e" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 3. RECENT ACTIVITY - Timeline Style */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Live Activity Feed</h3>
              <button className="text-[10px] font-black text-blue-600 hover:text-blue-700">VIEW ALL</button>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[400px]">
              {recentActivity.length === 0 ? (
                <div className="p-16 text-center text-slate-400 font-bold italic text-sm">No recorded movements.</div>
              ) : (
                recentActivity.map((tx, i) => (
                  <div key={i} className="flex justify-between items-center px-8 py-5 hover:bg-slate-50/80 transition-all border-l-4 border-transparent hover:border-blue-500">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {tx.type === 'income' ? <ArrowUpRight size={20}/> : <ArrowDownRight size={20}/>}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{tx.category}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-black text-lg tracking-tight ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 4. EXPENSES BY CATEGORY - Modern Progress Bars */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 hover:shadow-md transition-shadow">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-8">Resource Allocation</h3>
            <div className="space-y-7">
              {expensesByCategory.length === 0 ? (
                <div className="text-center text-slate-400 font-bold py-16 italic text-sm">Waiting for category data...</div>
              ) : (
                expensesByCategory.map((cat, i) => {
                  const pct = Math.min((cat.total / (summary.expense || 1)) * 100, 100);
                  return (
                    <div key={i} className="group">
                      <div className="flex justify-between items-end mb-2.5">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-wider group-hover:text-slate-900 transition-colors">{cat._id}</span>
                        <span className="text-sm font-black text-slate-900">${cat.total.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-1000 shadow-sm shadow-indigo-200" 
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const MetricCard = ({ icon, label, value, color, isPrimary, trend }) => {
  const colorMap = {
    emerald: 'from-emerald-50 to-emerald-100/50 text-emerald-600 border-emerald-100',
    rose: 'from-rose-50 to-rose-100/50 text-rose-600 border-rose-100',
    indigo: 'from-indigo-600 to-blue-700 text-white border-indigo-200 shadow-indigo-100'
  };

  return (
    <div className={`
      relative p-6 rounded-[32px] border-2 transition-all duration-300 hover:scale-[1.02]
      ${isPrimary ? 'bg-gradient-to-br ' + colorMap[color] + ' shadow-2xl' : 'bg-white border-slate-100 shadow-sm'}
    `}>
      <div className="flex justify-between items-start">
        <div className={`p-4 rounded-2xl ${isPrimary ? 'bg-white/20 backdrop-blur-md' : 'bg-' + color + '-50 ' + colorMap[color].split(' ')[2]}`}>
          {icon}
        </div>
        {trend && !isPrimary && (
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-6">
        <p className={`text-[10px] font-black uppercase tracking-widest ${isPrimary ? 'text-indigo-100' : 'text-slate-400'}`}>{label}</p>
        <h3 className={`text-3xl font-black mt-1 ${isPrimary ? 'text-white' : 'text-slate-900'}`}>
          ${(value || 0).toLocaleString()}
        </h3>
      </div>
    </div>
  );
};

export default Dashboard;