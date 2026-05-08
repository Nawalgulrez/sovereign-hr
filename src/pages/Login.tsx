import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Banknote } from 'lucide-react';
import api from '../services/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/login', { username, password });
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#c4a661] blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#c4a661] blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-[#18181b] rounded-3xl shadow-2xl p-10 border border-zinc-800 backdrop-blur-sm bg-opacity-80">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-[#111114] border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-inner transform -rotate-3 text-[#c4a661]">
              <Banknote className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-serif italic text-white mb-2">Internal Access</h1>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold">Personnel Remuneration System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            {error && (
              <div className="bg-rose-500/10 text-rose-500 p-4 rounded-xl text-xs font-bold uppercase tracking-widest border border-rose-500/20 text-center animate-shake">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-3 tracking-widest ml-1">Administrator Identity</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#c4a661] transition-colors w-5 h-5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#111114] border border-zinc-800 rounded-xl pl-12 pr-4 py-4 text-zinc-300 placeholder-zinc-700 outline-none focus:border-[#c4a661]/50 focus:ring-4 focus:ring-[#c4a661]/5 transition-all font-medium"
                    placeholder="Username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-3 tracking-widest ml-1">Secure Passkey</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#c4a661] transition-colors w-5 h-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#111114] border border-zinc-800 rounded-xl pl-12 pr-4 py-4 text-zinc-300 placeholder-zinc-700 outline-none focus:border-[#c4a661]/50 focus:ring-4 focus:ring-[#c4a661]/5 transition-all font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c4a661] text-black font-bold py-4 rounded-xl hover:bg-[#a88d4d] transition-all transform hover:-translate-y-1 shadow-xl shadow-[#c4a661]/10 uppercase tracking-widest text-xs disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Grant Access</span>
              )}
            </button>
            
            <div className="flex flex-col items-center gap-3 mt-8">
              <div className="w-12 h-[1px] bg-zinc-800"></div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Default credentials: admin / admin</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
