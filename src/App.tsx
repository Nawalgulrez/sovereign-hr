import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  LayoutDashboard, 
  Building2, 
  CalendarCheck, 
  Banknote, 
  FileText, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  Plus,
  UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DashboardPage from './pages/Dashboard';
import EmployeesPage from './pages/Employees';
import DepartmentsPage from './pages/Departments';
import AttendancePage from './pages/Attendance';
import SalaryPage from './pages/Salaries';
import ReportsPage from './pages/Reports';
import AddEmployeePage from './pages/AddEmployee';
import EditEmployeePage from './pages/EditEmployee';
import LoginPage from './pages/Login';
import api from './services/api';

const Sidebar = ({ isOpen, setOpen }: { isOpen: boolean, setOpen: (o: boolean) => void }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Employees', icon: Users, path: '/employees' },
    { name: 'Departments', icon: Building2, path: '/departments' },
    { name: 'Attendance', icon: CalendarCheck, path: '/attendance' },
    { name: 'Payroll', icon: Banknote, path: '/salaries' },
    { name: 'Reports', icon: FileText, path: '/reports' },
  ];

  const handleLogout = async () => {
    await api.post('/logout');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/70 z-40 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setOpen(false)}
      />
      
      <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-[#111114] text-[#e4e4e7] border-r border-[#27272a] z-50 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#c4a661] to-[#8a7238] rounded-md flex items-center justify-center shadow-lg shadow-[#c4a661]/10">
              <Banknote className="text-black w-5 h-5" />
            </div>
            <span className="font-serif italic text-xl tracking-wide">Sovereign HR</span>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="mt-4 px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-[#c4a661]/10 border-r-2 border-[#c4a661] text-[#c4a661]' 
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-[#18181b]'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-[#c4a661]' : 'text-zinc-500 group-hover:text-zinc-200'} />
                <span className="font-medium text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="bg-[#18181b] p-4 rounded-xl border border-[#27272a] mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[#c4a661]">
                <UserCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-medium">Admin Console</p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Administrator</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-zinc-500 hover:text-white transition-colors text-sm"
          >
            <LogOut size={16} />
            <span className="font-medium">Sign Out System</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const Header = ({ setOpen }: { setOpen: (o: boolean) => void }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Executive Overview';
    if (path.startsWith('/employees')) return 'Workforce Registry';
    if (path.startsWith('/departments')) return 'Organizational Units';
    if (path.startsWith('/attendance')) return 'Presence Monitoring';
    if (path.startsWith('/salaries')) return 'Payroll Disbursements';
    if (path.startsWith('/reports')) return 'Strategic Analytics';
    return 'Management Console';
  };

  return (
    <header className="h-20 border-b border-[#27272a] bg-[#0a0a0b]/80 backdrop-blur-md sticky top-0 z-30 px-6 md:px-10 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={() => setOpen(true)} className="lg:hidden p-2 text-zinc-400 hover:bg-zinc-800 rounded-lg">
          <Menu size={22} />
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-serif italic text-white">{getPageTitle()}</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <input 
            type="text" 
            placeholder="Search registry..." 
            className="bg-[#18181b] border border-zinc-800 rounded-full px-4 py-1.5 text-xs w-48 lg:w-64 focus:outline-none focus:border-[#c4a661] text-zinc-300 transition-all"
          />
        </div>
        <button className="p-2 text-zinc-400 hover:text-white transition-colors relative">
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#c4a661] rounded-full border border-[#0a0a0b]"></span>
        </button>
      </div>
    </header>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = localStorage.getItem('user');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e4e4e7] flex font-sans">
      <Sidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Header setOpen={setSidebarOpen} />
        <main className="p-6 md:p-10 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/employees" element={<Layout><EmployeesPage /></Layout>} />
        <Route path="/employees/add" element={<Layout><AddEmployeePage /></Layout>} />
        <Route path="/employees/edit/:id" element={<Layout><EditEmployeePage /></Layout>} />
        <Route path="/departments" element={<Layout><DepartmentsPage /></Layout>} />
        <Route path="/attendance" element={<Layout><AttendancePage /></Layout>} />
        <Route path="/salaries" element={<Layout><SalaryPage /></Layout>} />
        <Route path="/reports" element={<Layout><ReportsPage /></Layout>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
