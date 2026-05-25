'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
import api from '@/lib/axios';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  is_active: number;
}

const CATEGORIES = ['Rollar', 'Zapekanka', 'Setlar', 'Ichimliklar'];

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', price: '', category: 'Rollar' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) { router.push('/login'); return; }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm({ name: '', price: '', category: 'Rollar' });
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ name: p.name, price: String(p.price), category: p.category });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, {
          name: form.name,
          price: Number(form.price),
          category: form.category,
        });
      } else {
        await api.post('/products', {
          name: form.name,
          price: Number(form.price),
          category: form.category,
        });
      }
      setShowForm(false);
      fetchProducts();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
    await api.delete(`/products/${id}`);
    fetchProducts();
  };

  const formatPrice = (n: number) => new Intl.NumberFormat('uz-UZ').format(n);

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
          { label: 'Mahsulotlar', href: '/products', active: true },
          { label: 'Xarajatlar', href: '/expenses' },
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
          <h2 className="text-xl font-semibold">Mahsulotlar</h2>
          <button
            onClick={openAdd}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + Mahsulot qo'shish
          </button>
        </div>

        {/* Jadval */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Nomi</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Kategoriya</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Narxi</th>
                <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                  <td className="px-4 py-3 text-sm">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className="bg-zinc-800 text-gray-300 text-xs px-2 py-1 rounded-full">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-orange-400 text-sm font-medium">
                    {formatPrice(p.price)} so'm
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-blue-400 hover:text-blue-300 text-sm mr-3 transition"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-400 hover:text-red-300 text-sm transition"
                    >
                      O'chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-800">
            <h3 className="text-lg font-semibold mb-5">
              {editProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}
            </h3>

            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-1.5 block">Nomi</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 text-sm border border-zinc-700 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-1.5 block">Narxi (so'm)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 text-sm border border-zinc-700 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="mb-6">
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