'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
import api from '@/lib/axios';

interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  created_at: string;
}

const CATEGORIES = ['Mahsulot xaridi', 'Ijara', 'Oylik', 'Boshqa'];

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: '', category: 'Mahsulot xaridi', description: '' });
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const user = getUser();
    if (!user) { router.push('/login'); return; }
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data);
      setTotal(res.data.reduce((sum: number, e: Expense) => sum + e.amount, 0));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.amount) return;
    setSaving(true);
    try {
      await api.post('/expenses', {
        amount: Number(form.amount),
        category: form.category,
        description: form.description,
      });
      setShowForm(false);
      setForm({ amount: '', category: 'Mahsulot xaridi', description: '' });
      fetchExpenses();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
    await api.delete(`/expenses/${id}`);
    fetchExpenses();
  };

  const formatPrice = (n: number) => new Intl.NumberFormat('uz-UZ').format(n);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-orange-500">Yuklanmoqda...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍣</span>
          <span className="font-bold text-lg">Sushi CRM</span>
        </div>
      </div>

      {/* Nav */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 flex gap-1">
        {[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Buyurtma', href: '/order' },
          { label: 'Mahsulotlar', href: '/products' },
          { label: 'Xarajatlar', href: '/expenses', active: true },
          { label: 'Hisobotlar', href: '/reports' },
        ].map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
              item.active
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Xarajatlar</h2>
            <p className="text-gray-400 text-sm mt-1">
              Jami: <span className="text-red-400 font-medium">{formatPrice(total)} so'm</span>
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + Xarajat qo'shish
          </button>
        </div>

        {/* Jadval */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Kategoriya</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Izoh</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Summa</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Sana</th>
                <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Amal</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500 text-sm">
                    Xarajatlar yo'q
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                    <td className="px-4 py-3">
                      <span className="bg-zinc-800 text-gray-300 text-xs px-2 py-1 rounded-full">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{e.description || '—'}</td>
                    <td className="px-4 py-3 text-red-400 text-sm font-medium">
                      {formatPrice(e.amount)} so'm
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(e.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="text-red-400 hover:text-red-300 text-sm transition"
                      >
                        O'chirish
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-800">
            <h3 className="text-lg font-semibold mb-5">Yangi xarajat</h3>

            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-1.5 block">Kategoriya</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 text-sm border border-zinc-700 focus:border-orange-500 focus:outline-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-1.5 block">Summa (so'm)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 text-sm border border-zinc-700 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="text-gray-400 text-sm mb-1.5 block">Izoh (ixtiyoriy)</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Masalan: Losos xaridi"
                className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 text-sm border border-zinc-700 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg text-sm transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white py-3 rounded-lg text-sm font-medium transition"
              >
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}