import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  UserCircle,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Employee } from '../types';
import api from '../services/api';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const res = await api.get('/employees');
    setEmployees(res.data);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    }
  };

  const filteredEmployees = employees.filter(e => 
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_id.toLowerCase().includes(search.toLowerCase()) ||
    e.designation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif italic text-white">Workforce Registry</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1 font-bold">Personnel Data Management</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/employees/add')}
            className="flex items-center gap-2 bg-[#c4a661] text-black px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#a88d4d] transition-all shadow-lg shadow-[#c4a661]/10 transform hover:-translate-y-0.5"
          >
            <Plus size={18} />
            <span>Enlist Personnel</span>
          </button>
        </div>
      </div>

      <div className="bg-[#18181b] p-6 rounded-2xl border border-zinc-800 shadow-sm flex flex-col sm:flex-row gap-6 items-center justify-between">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#c4a661] transition-colors" size={18} />
          <input
            type="text"
            placeholder="Query by identity, ID, or post..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111114] border border-zinc-800 rounded-lg pl-12 pr-6 py-2.5 text-sm focus:outline-none focus:border-[#c4a661] text-zinc-300 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#111114] border border-zinc-800 rounded-lg text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-200 hover:border-zinc-600 transition-all">
            <Filter size={16} className="text-[#c4a661]" />
            Parameters
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#111114] border border-zinc-800 rounded-lg text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-200 hover:border-zinc-600 transition-all">
            <Download size={16} className="text-[#c4a661]" />
            Export Ledger
          </button>
        </div>
      </div>

      <div className="bg-[#18181b] rounded-2xl border border-zinc-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800 italic text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                <th className="px-8 py-4">Employee Identity</th>
                <th className="px-8 py-4">Professional Brief</th>
                <th className="px-8 py-4">Organizational Unit</th>
                <th className="px-8 py-4 text-center">Status</th>
                <th className="px-8 py-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-12 text-center text-zinc-500 animate-pulse font-serif italic text-lg">Retrieving personnel records...</td></tr>
              ) : filteredEmployees.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-12 text-center text-zinc-500 font-serif italic">No personnel records found within the current parameters.</td></tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-zinc-900/40 transition-all group border-zinc-800/50">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#111114] flex items-center justify-center overflow-hidden border border-zinc-800 group-hover:border-[#c4a661]/50 transition-colors">
                          {emp.profile_image ? (
                            <img src={emp.profile_image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                          ) : (
                            <div className="text-[#c4a661] font-serif text-xl">{emp.full_name.charAt(0)}</div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-200 group-hover:text-[#c4a661] transition-colors">{emp.full_name}</p>
                          <p className="text-[10px] text-zinc-500 font-mono tracking-wider mt-0.5 uppercase bg-zinc-900/50 px-1.5 py-0.5 rounded inline-block">{emp.employee_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-zinc-300">{emp.designation}</p>
                        <p className="text-[11px] text-zinc-500 italic">{emp.email}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#c4a661] bg-[#c4a661]/10 px-3 py-1.5 rounded-full border border-[#c4a661]/20">
                        {emp.department_name}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded text-[10px] uppercase font-bold tracking-widest ${
                        emp.status === 'Active' 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => navigate(`/employees/edit/${emp.id}`)}
                          className="p-2.5 text-zinc-500 hover:text-[#c4a661] hover:bg-[#c4a661]/5 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(emp.id)}
                          className="p-2.5 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
