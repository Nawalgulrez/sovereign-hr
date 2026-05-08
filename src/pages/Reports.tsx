import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Users, 
  Building2, 
  CalendarCheck, 
  Banknote,
  PieChart as PieIcon,
  BarChart as BarIcon
} from 'lucide-react';
import api from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);

  const downloadReport = async (type: string) => {
    setLoading(true);
    try {
      const doc = new jsPDF() as any;
      const today = new Date().toLocaleDateString();

      doc.setFontSize(20);
      doc.text(`${type.toUpperCase()} REPORT`, 105, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Generated on: ${today}`, 105, 22, { align: 'center' });
      doc.line(10, 25, 200, 25);

      if (type === 'Employee') {
        const res = await api.get('/employees');
        const data = res.data.map((e: any) => [
          e.employee_id, e.full_name, e.department_name, e.designation, e.joining_date, `$${e.basic_salary}`
        ]);
        (doc as any).autoTable({
          startY: 35,
          head: [['ID', 'Name', 'Department', 'Designation', 'Joined', 'Salary']],
          body: data,
          theme: 'grid',
          headStyles: { fillColor: [196, 166, 97], textColor: [0, 0, 0], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 245, 245] }
        });
      } else if (type === 'Attendance') {
        const date = new Date().toISOString().split('T')[0];
        const res = await api.get(`/attendance?date=${date}`);
        const data = res.data.map((a: any) => [
          a.emp_code, a.full_name, a.date, a.status
        ]);
        (doc as any).autoTable({
          startY: 35,
          head: [['Emp ID', 'Name', 'Date', 'Status']],
          body: data,
          theme: 'striped',
          headStyles: { fillColor: [196, 166, 97], textColor: [0, 0, 0], fontStyle: 'bold' }
        });
      } else if (type === 'Salary') {
        const month = new Date().toISOString().slice(0, 7);
        const res = await api.get(`/salaries?month=${month}`);
        const data = res.data.map((s: any) => [
          s.emp_code, s.full_name, s.month, `$${s.net_salary}`
        ]);
        (doc as any).autoTable({
          startY: 35,
          head: [['Emp ID', 'Name', 'Month', 'Net Payout']],
          body: data,
          theme: 'grid',
          headStyles: { fillColor: [196, 166, 97], textColor: [0, 0, 0], fontStyle: 'bold' }
        });
      }

      doc.save(`${type}_Report_${today.replace(/\//g, '-')}.pdf`);
    } catch (err) {
      alert('Error generating report');
    } finally {
      setLoading(false);
    }
  };

  const ReportAction = ({ title, icon: Icon, description, type }: any) => (
    <div className="bg-[#111114] p-8 rounded-2xl border border-zinc-800 shadow-sm flex flex-col items-center text-center group hover:border-[#c4a661]/50 transition-all duration-300">
      <div className="w-16 h-16 bg-[#18181b] border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#c4a661] group-hover:text-black transition-all duration-300 text-[#c4a661] shadow-inner">
        <Icon size={28} />
      </div>
      <h3 className="font-serif italic text-xl text-zinc-200 mb-2 group-hover:text-[#c4a661] transition-colors">{title}</h3>
      <p className="text-xs text-zinc-500 mb-8 flex-1 leading-relaxed">{description}</p>
      <button 
        disabled={loading}
        onClick={() => downloadReport(type)}
        className="w-full flex items-center justify-center gap-2 border border-zinc-800 py-3 rounded-xl text-[10px] uppercase font-bold tracking-widest text-[#c4a661] hover:bg-[#c4a661] hover:text-black transition-all duration-300"
      >
        <Download size={14} />
        Compile Document
      </button>
    </div>
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-serif italic text-white">Archives & Intelligence</h1>
        <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1 font-bold">Document Export Protocol</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <ReportAction 
          title="Workforce Ledger" 
          icon={Users} 
          description="Comprehensive registry encompassing current and historical personnel documentation." 
          type="Employee"
        />
        <ReportAction 
          title="Presence Audit" 
          icon={CalendarCheck} 
          description="Chronological status analysis with verified presence metrics." 
          type="Attendance"
        />
        <ReportAction 
          title="Fiscal Statement" 
          icon={Banknote} 
          description="Detailed analytical summary of organizational expenditures and disbursements." 
          type="Salary"
        />
        <ReportAction 
          title="Structural Audit" 
          icon={Building2} 
          description="Analytical overview of departmental headcounts and organizational hierarchy." 
          type="Department"
        />
      </div>

      <div className="bg-[#18181b] p-10 rounded-3xl text-white overflow-hidden relative border border-zinc-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#c4a661]/5 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-serif italic mb-3">Enterprise Reporting Protocol</h2>
          <p className="text-zinc-500 text-sm max-w-xl leading-relaxed">
            High-fidelity document generation utilizing authenticated snapshots. 
            Our protocols ensure that every archive is compiled with absolute precision 
            and formatted for professional board-level scrutiny.
          </p>
          <div className="mt-10 flex gap-6">
            <div className="flex -space-x-3 overflow-hidden">
              {[1,2,3,4].map(i => (
                <div key={i} className="inline-block h-10 w-10 rounded-full ring-4 ring-[#18181b] bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-[#c4a661]">
                  HR
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-600 self-center uppercase font-bold tracking-widest">Active across 4 structural units</p>
          </div>
        </div>
        <FileText size={200} className="absolute -bottom-16 -right-16 text-[#c4a661] opacity-[0.03] rotate-12" />
      </div>
    </div>
  );
}
