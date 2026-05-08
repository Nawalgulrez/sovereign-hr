import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, UserCog } from 'lucide-react';
import api from '../services/api';
import { Department } from '../types';

export default function AddEmployeePage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    father_name: '',
    cnic: '',
    email: '',
    phone: '',
    gender: 'Male',
    address: '',
    department_id: '',
    designation: '',
    joining_date: new Date().toISOString().split('T')[0],
    basic_salary: '',
    status: 'Active',
    profile_image: null as File | null
  });

  useEffect(() => {
    api.get('/departments').then(res => {
      setDepartments(res.data);
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, department_id: res.data[0].id.toString() }));
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, profile_image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) data.append(key, value as any);
    });

    try {
      await api.post('/employees', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/employees');
    } catch (err) {
      alert('Error creating employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-6">
        <button onClick={() => navigate(-1)} className="p-3 bg-[#18181b] hover:bg-[#27272a] text-zinc-400 hover:text-[#c4a661] rounded-xl transition-all border border-zinc-800 shadow-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-serif italic text-white">Personnel Enlistment</h1>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-1 font-bold">New Registry Entry</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-8">
            <div className="bg-[#18181b] p-8 rounded-2xl border border-zinc-800 shadow-xl flex flex-col items-center group">
              <div className="w-36 h-36 rounded-2xl bg-[#0a0a0b] border-2 border-dashed border-zinc-800 flex items-center justify-center overflow-hidden mb-6 relative group-hover:border-[#c4a661]/50 transition-all">
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                ) : (
                  <UserCog size={48} className="text-zinc-700 group-hover:text-[#c4a661]/30 transition-all" />
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all backdrop-blur-[2px]">
                  <Upload className="text-[#c4a661]" size={28} />
                  <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                </label>
              </div>
              <p className="text-[10px] text-zinc-500 text-center uppercase tracking-widest font-bold">Employee Portrait</p>
            </div>
            
            <div className="bg-[#18181b] p-8 rounded-2xl border border-zinc-800 shadow-xl space-y-6">
              <h3 className="font-serif italic text-white text-sm">Employment Basis</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Employee Identity Code*</label>
                  <input 
                    name="employee_id" 
                    value={formData.employee_id} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-[#111114] border border-zinc-800 rounded-lg px-4 py-3 text-sm font-mono text-[#c4a661] focus:outline-none focus:border-[#c4a661] transition-all" 
                    placeholder="EMP-XXX"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Commencement Date*</label>
                  <input 
                    type="date" 
                    name="joining_date" 
                    value={formData.joining_date} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-[#111114] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-[#c4a661] transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Operational Status</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange} 
                    className="w-full bg-[#111114] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-[#c4a661] transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            <div className="bg-[#18181b] p-8 md:p-10 rounded-2xl border border-zinc-800 shadow-xl space-y-10">
              <div className="space-y-8">
                <h3 className="font-serif italic text-xl text-white">Personnel Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Full Legal Name*</label>
                    <input name="full_name" value={formData.full_name} onChange={handleChange} required className="w-full bg-[#111114] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-[#c4a661] transition-all" placeholder="Alexander Hamilton" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Patronymic Registry</label>
                    <input name="father_name" value={formData.father_name} onChange={handleChange} className="w-full bg-[#111114] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-[#c4a661] transition-all" placeholder="James Hamilton" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Identification Serial</label>
                    <input name="cnic" value={formData.cnic} onChange={handleChange} className="w-full bg-[#111114] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-[#c4a661] transition-all" placeholder="National Identifier" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Gender Orientation</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-[#111114] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-[#c4a661] transition-all">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Digital Correspondence*</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-[#111114] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-[#c4a661] transition-all" placeholder="hamilton@sovereign.hr" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Telephonic Frequency*</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} required className="w-full bg-[#111114] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-[#c4a661] transition-all" placeholder="+XX XXX XXXXXXX" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Residential Domicile</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} className="w-full bg-[#111114] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 h-24 focus:outline-none focus:border-[#c4a661] transition-all" placeholder="Corporate Residence, District 1"></textarea>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-zinc-800/50 space-y-8">
                <h3 className="font-serif italic text-xl text-white">Fiscal & Structural Assignment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Organizational Unit*</label>
                    <select name="department_id" value={formData.department_id} onChange={handleChange} required className="w-full bg-[#111114] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-[#c4a661] transition-all">
                      {departments.map(d => <option key={d.id} value={d.id} className="bg-[#111114]">{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Professional Title*</label>
                    <input name="designation" value={formData.designation} onChange={handleChange} required className="w-full bg-[#111114] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-[#c4a661] transition-all" placeholder="Executive Director" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Base Compensation ($)*</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c4a661] font-serif">$</span>
                      <input type="number" name="basic_salary" value={formData.basic_salary} onChange={handleChange} required className="w-full bg-[#111114] border border-zinc-800 rounded-lg pl-8 pr-4 py-4 text-lg font-serif italic text-[#c4a661] focus:outline-none focus:border-[#c4a661] transition-all" placeholder="0.00" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-6 pb-10">
              <button type="button" onClick={() => navigate(-1)} className="px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-200 transition-colors">Abort Enlistment</button>
              <button 
                type="submit" 
                disabled={loading} 
                className="flex items-center gap-3 bg-[#c4a661] text-black px-10 py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#a88d4d] transition-all shadow-xl shadow-[#c4a661]/10 transform hover:-translate-y-1 disabled:opacity-50"
              >
                <Save size={18} />
                <span>{loading ? 'Processing...' : 'Ratify entry'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
