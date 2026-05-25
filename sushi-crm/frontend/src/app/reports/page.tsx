'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
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

interface MonthlyReport {
  month: string;
  orders_count: number;
  total_sales: number;
  total_expenses: number;
  profit: number;
  top_products: { name: string; total_qty: number; total_sum: number }[];
}

export default function ReportsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'daily' | 'monthly'>('daily');
  const [daily, setDaily] = useState<DailyReport | null>(null);
  const [monthly, setMonthly] = useState<MonthlyReport | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) { router.push('/login'); return; }
    fetchDaily();
  }, []);

  const fetchDaily = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/daily?date=${date}`);
      setDaily(res.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthly = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/monthly?month=${month}`);
      setMonthly(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'daily') fetchDaily();
    else fetchMonthly();
  }, [tab, date, month]);

  const formatPrice = (n: number) => new Intl.NumberFormat('uz-UZ').format(n);

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
          { label: 'Xarajatlar', href: '/expenses' },
          { label: 'Hisobotlar', href: '/reports', active: true },
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
        <h2 className="text-xl font-semibold mb-6">Hisobotlar</h2>

        {/* Tab */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('daily')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'daily' ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-gray-400 hover:text-white'
            }`}
          >
            Kunlik
          </button>
          <button
            onClick={() => setTab('monthly')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'monthly' ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-gray-400 hover:text-white'
            }`}
          >
            Oylik
          </button>
        </div>

        {/* Kunlik */}
        {tab === 'daily' && (
          <div>
            <div className="mb-5">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-zinc-800 text-white rounded-lg px-4 py-2 text-sm border border-zinc-700 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {loading ? (
              <div className="text-orange-500 text-sm">Yuklanmoqda...</div>
            ) : daily && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Umumiy savdo', value: formatPrice(daily.total_sales) + ' so\'m', color: 'text-orange-400' },
                    { label: 'Buyurtmalar', value: daily.orders_count, color: 'text-blue-400' },
                    { label: 'Xarajatlar', value: formatPrice(daily.total_expenses) + ' so\'m', color: 'text-red-400' },
                    { label: 'Sof foyda', value: formatPrice(daily.profit) + ' so\'m', color: 'text-green-400' },
                  ].map((s) => (
                    <div key={s.label} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                      <p className="text-gray-400 text-xs mb-2">{s.label}</p>
                      <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
                  <h3 className="text-sm font-medium text-gray-400 mb-4">To'lov turlari</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Naqd', value: daily.cash },
                      { label: 'Karta', value: daily.card },
                      { label: 'Click', value: daily.click },
                      { label: 'Payme', value: daily.payme },
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <p className="text-gray-500 text-xs mb-1">{item.label}</p>
                        <p className="text-white font-medium text-sm">{formatPrice(item.value)} so'm</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Oylik */}
        {tab === 'monthly' && (
          <div>
            <div className="mb-5">
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="bg-zinc-800 text-white rounded-lg px-4 py-2 text-sm border border-zinc-700 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {loading ? (
              <div className="text-orange-500 text-sm">Yuklanmoqda...</div>
            ) : monthly && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Umumiy savdo', value: formatPrice(monthly.total_sales) + ' so\'m', color: 'text-orange-400' },
                    { label: 'Buyurtmalar', value: monthly.orders_count, color: 'text-blue-400' },
                    { label: 'Xarajatlar', value: formatPrice(monthly.total_expenses) + ' so\'m', color: 'text-red-400' },
                    { label: 'Sof foyda', value: formatPrice(monthly.profit) + ' so\'m', color: 'text-green-400' },
                  ].map((s) => (
                    <div key={s.label} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                      <p className="text-gray-400 text-xs mb-2">{s.label}</p>
                      <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Top mahsulotlar */}
                {monthly.top_products.length > 0 && (
                  <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-800">
                      <h3 className="text-sm font-medium text-gray-400">Eng ko'p sotilgan mahsulotlar</h3>
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-zinc-800">
                          <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Mahsulot</th>
                          <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Soni</th>
                          <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Summa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthly.top_products.map((p, i) => (
                          <tr key={i} className="border-b border-zinc-800/50">
                            <td className="px-4 py-3 text-sm">{p.name}</td>
                            <td className="px-4 py-3 text-sm text-blue-400">{p.total_qty} ta</td>
                            <td className="px-4 py-3 text-sm text-orange-400">{formatPrice(p.total_sum)} so'm</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}