import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  MoreHorizontal,
  UserCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { DashboardStats } from '../types';
import api from '../services/api';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-[#18181b] p-6 rounded-2xl border border-zinc-800 shadow-sm transition-all hover:border-zinc-700">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${color} shadow-lg`}>
        <Icon size={20} className="text-black" />
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-[10px] font-mono tracking-tighter text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
          <TrendingUp size={10} />
          {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">{title}</h3>
      <p className="text-3xl font-serif italic text-[#e4e4e7]">{value}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return (
    <div className="animate-pulse space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-zinc-900 rounded-2xl border border-zinc-800"></div>)}
      </div>
      <div className="h-[400px] bg-zinc-900 rounded-2xl border border-zinc-800"></div>
    </div>
  );

  const COLORS = ['#c4a661', '#a88d4d', '#8a7238', '#52525b', '#3f3f46'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Workforce" 
          value={stats.totalEmployees} 
          icon={Users} 
          color="bg-[#c4a661]"
          trend="+4 this month"
        />
        <StatCard 
          title="Organizational Units" 
          value={stats.totalDepartments} 
          icon={Building2} 
          color="bg-zinc-500" 
        />
        <StatCard 
          title="Monthly Expenditure" 
          value={`$${(stats.monthlyExpense / 1000).toFixed(1)}k`} 
          icon={TrendingUp} 
          color="bg-[#c4a661]"
          trend="-2.4%"
        />
        <StatCard 
          title="Attendance Velocity" 
          value="98.2%" 
          icon={Clock} 
          color="bg-zinc-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#18181b] p-6 rounded-2xl border border-zinc-800 flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-serif text-xl italic text-white">Department Headcount</h3>
            <button className="text-[10px] uppercase tracking-widest text-[#c4a661] font-bold border-b border-[#c4a661]/50 hover:border-[#c4a661] transition-all">Download Audit</button>
          </div>
          <div className="h-[300px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.deptStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#71717a', fontWeight: 600 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#71717a', fontWeight: 600 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(196, 166, 97, 0.05)' }}
                  contentStyle={{ backgroundColor: '#111114', borderRadius: '12px', border: '1px solid #27272a', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ color: '#c4a661', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#c4a661" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#18181b] p-6 rounded-2xl border border-zinc-800 flex flex-col">
          <h3 className="font-serif text-xl italic text-white mb-8">Personnel Allocation</h3>
          <div className="h-[200px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.deptStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="count"
                  stroke="none"
                >
                  {stats.deptStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-4">
            {stats.deptStats.map((item, idx) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                  <span>{item.name}</span>
                  <span>{Math.round((item.count / stats.totalEmployees) * 100)}%</span>
                </div>
                <div className="w-full h-1 bg-zinc-800/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#c4a661] transition-all duration-1000" 
                    style={{ width: `${(item.count / stats.totalEmployees) * 100}%`, backgroundColor: COLORS[idx % COLORS.length] }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#18181b] rounded-2xl border border-zinc-800 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
          <h3 className="font-serif text-lg italic text-white">Recent Payout Ledger</h3>
          <button className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors font-bold">View Full Registry</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800 italic text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                <th className="px-8 py-4">Employee Identity</th>
                <th className="px-8 py-4 text-center">Reference ID</th>
                <th className="px-8 py-4">Organizational Unit</th>
                <th className="px-8 py-4">Designation</th>
                <th className="px-8 py-4 text-right">Commission Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {stats.recentEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-zinc-900/40 transition-all group cursor-pointer border-zinc-800/50">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-[#111114] border border-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {emp.profile_image ? (
                          <img src={emp.profile_image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                        ) : (
                          <div className="text-[#c4a661] font-serif text-lg">{emp.full_name.charAt(0)}</div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-zinc-300 group-hover:text-[#c4a661] transition-colors">{emp.full_name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900/50 px-2.5 py-1 rounded border border-zinc-800/50">{emp.employee_id}</span>
                  </td>
                  <td className="px-8 py-5 text-sm text-zinc-400 capitalize">{emp.department_name}</td>
                  <td className="px-8 py-5 text-sm text-zinc-400">{emp.designation}</td>
                  <td className="px-8 py-5 text-sm text-zinc-500 text-right font-mono italic">
                    {new Date(emp.joining_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
