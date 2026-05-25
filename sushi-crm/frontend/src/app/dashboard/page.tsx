'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, logout } from '@/lib/auth';
import api from '@/lib/axios';

interface DailyReport {
  date: string;
  orders_count: number;
  total_sales: number;
  cash: number;
  card: number;
  click: number;
  payme: number;
  total_expenses: number;
  profit: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const user = getUser();
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await api.get('/reports/daily');
      setReport(res.data);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('uz-UZ').format(n) + ' so\'m';

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-orange-500 text-lg">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍣</span>
          <span className="font-bold text-lg">Sushi CRM</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.name}</span>
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Chiqish
          </button>
        </div>
      </div>

      {/* Nav */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 flex gap-1">
        {[
          { label: 'Dashboard', href: '/dashboard', active: true },
          { label: 'Buyurtma', href: '/order', active: false },
          { label: 'Mahsulotlar', href: '/products', active: false },
          { label: 'Xarajatlar', href: '/expenses', active: false },
          { label: 'Hisobotlar', href: '/reports', active: false },
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

      {/* Content */}
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Bugungi hisobot</h2>
          <span className="text-gray-400 text-sm">{report?.date}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Umumiy savdo', value: formatPrice(report?.total_sales || 0), color: 'text-orange-400' },
            { label: 'Buyurtmalar', value: report?.orders_count || 0, color: 'text-blue-400' },
            { label: 'Xarajatlar', value: formatPrice(report?.total_expenses || 0), color: 'text-red-400' },
            { label: 'Sof foyda', value: formatPrice(report?.profit || 0), color: 'text-green-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
              <p className="text-gray-400 text-xs mb-2">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* To'lov turlari */}
        <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
          <h3 className="text-sm font-medium text-gray-400 mb-4">To'lov turlari</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Naqd', value: report?.cash || 0 },
              { label: 'Karta', value: report?.card || 0 },
              { label: 'Click', value: report?.click || 0 },
              { label: 'Payme', value: report?.payme || 0 },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-gray-500 text-xs mb-1">{item.label}</p>
                <p className="text-white font-medium text-sm">{formatPrice(item.value)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}