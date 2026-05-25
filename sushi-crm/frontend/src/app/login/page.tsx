'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { setAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  if (!username || !password) {
    setError('Username va parol kiriting');
    return;
  }
  setLoading(true);
  setError('');
  try {
    const res = await api.post('/auth/login', { username, password });
    setAuth(res.data.token, res.data.user);
    window.location.href = '/dashboard';  // router.push o'rniga
  } catch (err: any) {
    setError(err.response?.data?.error || 'Xatolik yuz berdi');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍣</div>
          <h1 className="text-white text-2xl font-bold">Sushi CRM</h1>
          <p className="text-gray-400 text-sm mt-1">Tizimga kiring</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-1.5 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="admin"
              className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 text-sm border border-zinc-700 focus:border-orange-500 focus:outline-none transition"
            />
          </div>

          <div className="mb-6">
            <label className="text-gray-400 text-sm mb-1.5 block">Parol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 text-sm border border-zinc-700 focus:border-orange-500 focus:outline-none transition"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-medium py-3 rounded-lg transition text-sm"
          >
            {loading ? 'Kirish...' : 'Kirish'}
          </button>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-6">
          Sushi Go © 2026
        </p>
      </div>
    </div>
  );
}