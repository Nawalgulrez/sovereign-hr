import React, { useState, useEffect } from 'react';
import { Calendar, Save, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../services/api';
import { Employee, AttendanceRecord } from '../types';

export default function AttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<{ [empId: number]: 'Present' | 'Absent' | 'Leave' }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    const [empRes, attRes] = await Promise.all([
      api.get('/employees'),
      api.get(`/attendance?date=${selectedDate}`)
    ]);

    setEmployees(empRes.data);
    
    // Map existing records or default to Present
    const initialRecords: { [empId: number]: any } = {};
    empRes.data.forEach((e: Employee) => {
      const existing = attRes.data.find((a: any) => a.employee_id === e.id);
      initialRecords[e.id] = existing ? existing.status : 'Present';
    });
    setRecords(initialRecords);
    setLoading(false);
  };

  const handleStatusChange = (empId: number, status: 'Present' | 'Absent' | 'Leave') => {
    setRecords(prev => ({ ...prev, [empId]: status }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const recordsToSave = Object.entries(records).map(([empId, status]) => ({
        employee_id: parseInt(empId),
        status
      }));
      await api.post('/attendance', { date: selectedDate, records: recordsToSave });
      alert('Attendance saved successfully');
    } catch (err) {
      alert('Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif italic text-white">Presence Monitoring</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1 font-bold">Daily Attendance Registry</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#18181b] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm font-semibold text-zinc-300 focus:outline-none focus:border-[#c4a661] shadow-sm transition-all"
            />
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#c4a661] text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#a88d4d] transition-all shadow-lg shadow-[#c4a661]/10 transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Save size={18} />
            <span>{saving ? 'Processing...' : 'Finalize Ledger'}</span>
          </button>
        </div>
      </div>

      <div className="bg-[#18181b] rounded-2xl border border-zinc-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800 italic text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                <th className="px-8 py-4">Personnel Identity</th>
                <th className="px-8 py-4">Organizational Unit</th>
                <th className="px-8 py-4 text-center">Protocol Selection</th>
                <th className="px-8 py-4 text-right">Status State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {loading ? (
                <tr><td colSpan={4} className="px-8 py-12 text-center text-zinc-500 animate-pulse font-serif italic text-lg">Retrieving personnel status...</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-12 text-center text-zinc-500 font-serif italic">No personnel records found for evaluation.</td></tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-zinc-900/40 transition-all group border-zinc-800/50">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded bg-[#111114] border border-zinc-800 flex items-center justify-center font-bold text-xs text-[#c4a661] font-serif shadow-inner">
                          {emp.employee_id.slice(-2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-200 group-hover:text-[#c4a661] transition-colors">{emp.full_name}</p>
                          <p className="text-[10px] text-zinc-500 font-mono tracking-tighter uppercase">{emp.employee_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border border-zinc-800/50 px-2 py-1 rounded bg-zinc-900/30">{emp.department_name}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => handleStatusChange(emp.id, 'Present')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-all ${
                            records[emp.id] === 'Present' 
                              ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shadow-lg shadow-emerald-500/5' 
                              : 'bg-zinc-900/40 text-zinc-600 border border-zinc-800/50 hover:text-zinc-400'
                          }`}
                        >
                          <CheckCircle size={14} />
                          Present
                        </button>
                        <button 
                          onClick={() => handleStatusChange(emp.id, 'Absent')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-all ${
                            records[emp.id] === 'Absent' 
                              ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30 shadow-lg shadow-rose-500/5' 
                              : 'bg-zinc-900/40 text-zinc-600 border border-zinc-800/50 hover:text-zinc-400'
                          }`}
                        >
                          <XCircle size={14} />
                          Absent
                        </button>
                        <button 
                          onClick={() => handleStatusChange(emp.id, 'Leave')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-all ${
                            records[emp.id] === 'Leave' 
                              ? 'bg-[#c4a661]/20 text-[#c4a661] border border-[#c4a661]/30 shadow-lg shadow-[#c4a661]/5' 
                              : 'bg-zinc-900/40 text-zinc-600 border border-zinc-800/50 hover:text-zinc-400'
                          }`}
                        >
                          <Clock size={14} />
                          Leave
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded inline-block ${
                        records[emp.id] === 'Present' ? 'text-emerald-500 bg-emerald-500/5' : 
                        records[emp.id] === 'Absent' ? 'text-rose-500 bg-rose-500/5' : 'text-[#c4a661] bg-[#c4a661]/5'
                      }`}>
                        {records[emp.id]}
                      </span>
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
