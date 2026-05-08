import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Banknote, 
  Download, 
  Calculator,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import { Employee, SalaryRecord } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function SalaryPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [showCalculate, setShowCalculate] = useState(false);
  const [calcData, setCalcData] = useState({
    employee_id: '',
    bonus: '0',
    overtime_hours: '0',
    overtime_rate: '20',
    tax_deduction: '0'
  });

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    const [empRes, salRes] = await Promise.all([
      api.get('/employees'),
      api.get(`/salaries?month=${selectedMonth}`)
    ]);
    setEmployees(empRes.data);
    setSalaries(salRes.data);
    setLoading(false);
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/salaries/calculate', {
        ...calcData,
        month: selectedMonth
      });
      setShowCalculate(false);
      fetchData();
      alert('Salary calculated and saved');
    } catch (err) {
      alert('Error calculating salary');
    }
  };

  const generateSlip = (salaryIdx: number) => {
    const salary = salaries[salaryIdx];
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(22);
    doc.text('PAYROLL SLIP', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Company Employee Management System', 105, 28, { align: 'center' });
    
    // Employee Info
    doc.setDrawColor(200);
    doc.line(10, 35, 200, 35);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('EMPLOYEE DETAILS', 10, 45);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Full Name: ${salary.full_name}`, 10, 52);
    doc.text(`Employee ID: ${salary.emp_code}`, 10, 58);
    doc.text(`Salary Period: ${salary.month}`, 10, 64);
    
    // Financials Table
    (doc as any).autoTable({
      startY: 75,
      head: [['Description', 'Amount ($)']],
      body: [
        ['Basic Salary', (salary.basic_salary || 0).toFixed(2)],
        ['Bonus', (salary.bonus || 0).toFixed(2)],
        ['Overtime Pay', ((salary.overtime_hours || 0) * (salary.overtime_rate || 0)).toFixed(2)],
        ['Tax Deduction', `-${(salary.tax_deduction || 0).toFixed(2)}`],
        ['Attendance Deduction', `-${(salary.attendance_deduction || 0).toFixed(2)}`],
        ['Net Salary', { content: (salary.net_salary || 0).toFixed(2), styles: { fontStyle: 'bold' } }]
      ],
      theme: 'striped',
      headStyles: { fillColor: [20, 20, 20] },
      columnStyles: { 1: { halign: 'right' } }
    });
    
    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(9);
    doc.text('This is a computer-generated document.', 105, finalY + 20, { align: 'center' });
    doc.text('Signed by Accountant: ____________________', 105, finalY + 40, { align: 'center' });
    
    doc.save(`SalarySlip_${salary.emp_code}_${salary.month}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif italic text-white">Payroll Disbursements</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1 font-bold">Financial Compensation Registry</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-[#18181b] border border-zinc-800 rounded-lg px-4 py-2 text-sm font-semibold text-zinc-300 focus:outline-none focus:border-[#c4a661] shadow-sm transition-all"
          />
          <button 
            onClick={() => setShowCalculate(true)}
            className="flex items-center gap-2 bg-[#c4a661] text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#a88d4d] transition-all shadow-lg shadow-[#c4a661]/10 transform hover:-translate-y-0.5"
          >
            <Calculator size={18} />
            <span>Process Payouts</span>
          </button>
        </div>
      </div>

      {showCalculate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.form 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onSubmit={handleCalculate}
            className="bg-[#111114] border border-[#27272a] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="bg-gradient-to-br from-[#c4a661] to-[#8a7238] p-8 text-black">
              <h3 className="text-xl font-serif italic font-bold">Calculate Net Salary</h3>
              <p className="text-black/60 text-[10px] uppercase tracking-widest font-bold mt-1">Processing period: {selectedMonth}</p>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Select Personnel</label>
                <select 
                  required
                  value={calcData.employee_id}
                  onChange={(e) => setCalcData(prev => ({ ...prev, employee_id: e.target.value }))}
                  className="w-full bg-[#18181b] border border-zinc-800 text-zinc-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c4a661] transition-all"
                >
                  <option value="">Select from registry...</option>
                  {employees.map(e => <option key={e.id} value={e.id} className="bg-[#18181b]">{e.full_name} ({e.employee_id})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Bonus ($)</label>
                  <input 
                    type="number"
                    value={calcData.bonus}
                    onChange={(e) => setCalcData(prev => ({ ...prev, bonus: e.target.value }))}
                    className="w-full bg-[#18181b] border border-zinc-800 text-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#c4a661] transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Tax Deduction ($)</label>
                  <input 
                    type="number"
                    value={calcData.tax_deduction}
                    onChange={(e) => setCalcData(prev => ({ ...prev, tax_deduction: e.target.value }))}
                    className="w-full bg-[#18181b] border border-zinc-800 text-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#c4a661] transition-all" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">OT Hours</label>
                  <input 
                    type="number"
                    value={calcData.overtime_hours}
                    onChange={(e) => setCalcData(prev => ({ ...prev, overtime_hours: e.target.value }))}
                    className="w-full bg-[#18181b] border border-zinc-800 text-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#c4a661] transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">OT Rate ($/hr)</label>
                  <input 
                    type="number"
                    value={calcData.overtime_rate}
                    onChange={(e) => setCalcData(prev => ({ ...prev, overtime_rate: e.target.value }))}
                    className="w-full bg-[#18181b] border border-zinc-800 text-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#c4a661] transition-all" 
                  />
                </div>
              </div>
            </div>
            <div className="bg-[#18181b] px-8 py-5 flex gap-4 border-t border-zinc-800">
              <button 
                type="button" 
                onClick={() => setShowCalculate(false)}
                className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 bg-[#c4a661] text-black px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest"
              >
                Finalize Payout
              </button>
            </div>
          </motion.form>
        </div>
      )}

      <div className="bg-transparent grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-[#18181b] rounded-2xl border border-zinc-800 shadow-sm lg:col-span-2 flex flex-col">
          <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/20">
            <h3 className="font-serif text-lg italic text-white">Disbursement Ledger</h3>
            <span className="text-[10px] font-bold px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-500 tracking-widest uppercase">{salaries.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-900/50 border-b border-zinc-800 italic text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                  <th className="px-8 py-4">Employee</th>
                  <th className="px-8 py-4">Basic Base</th>
                  <th className="px-8 py-4 text-center">Incentives</th>
                  <th className="px-8 py-4 text-center">Deductions</th>
                  <th className="px-8 py-4 text-right">Net Payout</th>
                  <th className="px-8 py-4 text-right">Ledger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30 font-medium">
                {loading ? (
                  <tr><td colSpan={6} className="px-8 py-12 text-center text-zinc-500 animate-pulse font-serif italic text-lg">Syncing payroll artifacts...</td></tr>
                ) : salaries.length === 0 ? (
                  <tr><td colSpan={6} className="px-8 py-12 text-center text-zinc-500 font-serif italic">No payout records detected for this cycle.</td></tr>
                ) : (
                  salaries.map((sal, idx) => (
                    <tr key={sal.id} className="hover:bg-zinc-900/40 transition-all group border-zinc-800/50">
                      <td className="px-8 py-5">
                        <div>
                          <p className="text-sm font-bold text-zinc-200 group-hover:text-[#c4a661] transition-colors">{sal.full_name}</p>
                          <p className="text-[10px] text-zinc-500 font-mono tracking-tighter uppercase">{sal.emp_code}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-zinc-400 font-mono">${sal.basic_salary?.toLocaleString()}</td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded inline-flex border border-emerald-500/10">
                          <TrendingUp size={10} />
                          ${(sal.bonus + (sal.overtime_hours * sal.overtime_rate)).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/5 px-2 py-1 rounded inline-flex border border-rose-500/10">
                          <TrendingDown size={10} />
                          ${(sal.tax_deduction + sal.attendance_deduction).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right whitespace-nowrap">
                        <span className="text-sm font-serif italic font-bold text-[#c4a661]">${sal.net_salary.toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => generateSlip(idx)}
                          className="p-2.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                          title="Download Payslip"
                        >
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-[#18181b] to-[#111114] p-8 rounded-2xl border border-zinc-800 shadow-xl shadow-[#c4a661]/5 flex flex-col">
            <h3 className="font-serif text-xl italic mb-8 flex items-center gap-3 text-white">
              <Banknote size={22} className="text-[#c4a661]" />
              Cycle Synopsis
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Total Net Payout</span>
                <span className="text-3xl font-serif italic text-[#c4a661] tracking-tighter">
                  ${salaries.reduce((acc, s) => acc + s.net_salary, 0).toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-zinc-800" />
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                  <p className="text-[9px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Aggregated Tax</p>
                  <p className="text-lg font-mono font-bold text-zinc-300">${salaries.reduce((acc, s) => acc + s.tax_deduction, 0).toLocaleString()}</p>
                </div>
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                  <p className="text-[9px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Aggregated Bonus</p>
                  <p className="text-lg font-mono font-bold text-zinc-300">${salaries.reduce((acc, s) => acc + s.bonus, 0).toLocaleString()}</p>
                </div>
              </div>
              <button 
                className="w-full bg-[#111114] text-zinc-300 hover:text-white py-4 rounded-xl text-xs uppercase tracking-widest font-bold mt-4 border border-zinc-800 hover:border-[#c4a661] transition-all flex items-center justify-center gap-3"
              >
                <FileText size={16} className="text-[#c4a661]" />
                Export Ledger PDF
              </button>
            </div>
          </div>

          <div className="bg-[#18181b] p-8 rounded-2xl border border-zinc-800">
            <h3 className="font-serif text-sm italic text-zinc-400 mb-6 uppercase tracking-widest">Regulatory Directives</h3>
            <ul className="space-y-4">
              {[
                { title: 'Attendance Variance', desc: 'Deductions calculated on a standard 30-day corporate cycle.' },
                { title: 'Overtime Provision', desc: 'Compensated hourly based on verified administrative logs.' },
                { title: 'Fiscal Withholding', desc: 'Taxation parameters applied at time of regional finalization.' },
                { title: 'Immutable Ledger', desc: 'Historical payouts are stored on a write-only server state.' }
              ].map((policy, i) => (
                <li key={i} className="flex gap-4 group">
                  <div className="w-1.5 h-1.5 bg-[#c4a661] rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#c4a661]/80 group-hover:text-[#c4a661] transition-colors">{policy.title}</p>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{policy.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
