import React, { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Edit2 } from 'lucide-react';
import api from '../services/api';
import { Department } from '../types';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDept, setNewDept] = useState({ name: '', description: '' });
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const res = await api.get('/departments');
    setDepartments(res.data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/departments', newDept);
      setNewDept({ name: '', description: '' });
      setShowAdd(false);
      fetchDepartments();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error adding department');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this department? Make sure no employees are assigned to it first.')) {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif italic text-white">Organizational Units</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1 font-bold">Structural Configuration</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-[#c4a661] text-black px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#a88d4d] transition-all shadow-lg shadow-[#c4a661]/10 transform hover:-translate-y-0.5"
        >
          <Plus size={18} />
          <span>Establish Unit</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-[#18181b] p-8 rounded-2xl border border-zinc-800 shadow-xl space-y-6 max-w-xl animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Departmental Identity</label>
              <input 
                value={newDept.name} 
                onChange={(e) => setNewDept(prev => ({ ...prev, name: e.target.value }))} 
                required 
                className="w-full bg-[#111114] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-[#c4a661] transition-all" 
                placeholder="e.g. Treasury, Operations, Strategic Engineering..."
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Operational Directive</label>
              <textarea 
                value={newDept.description} 
                onChange={(e) => setNewDept(prev => ({ ...prev, description: e.target.value }))} 
                className="w-full bg-[#111114] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 h-24 focus:outline-none focus:border-[#c4a661] transition-all" 
                placeholder="Brief mission statement of the unit's role within the organization..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 italic font-serif">
            <button type="button" onClick={() => setShowAdd(false)} className="px-5 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-200 transition-colors">Abort</button>
            <button type="submit" className="bg-[#c4a661] text-black px-6 py-2 rounded-lg font-bold text-sm shadow-lg shadow-[#c4a661]/10">Ratify Unit</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-48 bg-zinc-900 border border-zinc-800 animate-pulse rounded-2xl"></div>)
        ) : departments.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-[#18181b] rounded-2xl border border-dashed border-zinc-800 text-zinc-500 font-serif italic text-lg">
            No structural units defined in the current registry.
          </div>
        ) : (
          departments.map((dept) => (
            <div key={dept.id} className="bg-[#18181b] p-8 rounded-2xl border border-zinc-800 shadow-sm flex flex-col group hover:border-[#c4a661]/50 transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-[#111114] border border-zinc-800 rounded-2xl text-[#c4a661] group-hover:bg-[#c4a661] group-hover:text-black transition-all duration-300 shadow-sm">
                  <Building2 size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDelete(dept.id)} className="p-2.5 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 rounded-lg transition-all"><Trash2 size={18} /></button>
                </div>
              </div>
              <h3 className="font-serif italic text-xl text-zinc-200 mb-2 group-hover:text-[#c4a661] transition-colors">{dept.name}</h3>
              <p className="text-sm text-zinc-500 flex-1 leading-relaxed">{dept.description || 'No operational directive defined.'}</p>
              <div className="mt-8 pt-6 border-t border-zinc-800/50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic group-hover:text-zinc-500 transition-colors">Unit Core #{dept.id}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#c4a661] bg-[#c4a661]/5 hover:bg-[#c4a661] hover:text-black px-3 py-1.5 rounded-full border border-[#c4a661]/20 cursor-pointer transition-all">Audit Personnel</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
