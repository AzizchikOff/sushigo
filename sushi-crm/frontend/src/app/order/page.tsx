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
}

interface CartItem extends Product {
  quantity: number;
}

const CATEGORIES = ['Hammasi', 'Rollar', 'Zapekanka', 'Setlar', 'Ichimliklar'];
const PAYMENT_TYPES = [
  { value: 'cash', label: 'Naqd' },
  { value: 'click', label: 'Click' },
];

export default function OrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState('Hammasi');
  const [search, setSearch] = useState('');
  const [paymentType, setPaymentType] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<CartItem[]>([]);
  const [lastTotal, setLastTotal] = useState(0);
  const [lastPayment, setLastPayment] = useState('');

  useEffect(() => {
    const user = getUser();
    if (!user) { router.push('/login'); return; }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await api.get('/products');
    setProducts(res.data);
  };

  const filtered = products.filter(p => {
    const matchCat = category === 'Hammasi' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
         .filter(i => i.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  const formatPrice = (n: number) => new Intl.NumberFormat('uz-UZ').format(n);

  const handleOrder = async () => {
    if (!cart.length) return;
    setLoading(true);
    try {
      await api.post('/orders', {
        items: cart.map(i => ({ product_id: i.id, quantity: i.quantity })),
        payment_type: paymentType,
      });
      setLastOrder([...cart]);
      setLastTotal(total);
      setLastPayment(PAYMENT_TYPES.find(p => p.value === paymentType)?.label || '');
      setCart([]);
      setSuccess(true);
      setShowReceipt(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      alert('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍣</span>
          <span className="font-bold text-lg">Sushi CRM</span>
        </div>
        <div className="flex items-center gap-3">
          {totalItems > 0 && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {totalItems} ta
            </span>
          )}
          <span className="text-gray-400 text-sm">{getUser()?.name}</span>
        </div>
      </div>

      {/* Nav */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 flex gap-1">
        {[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Buyurtma', href: '/order', active: true },
          { label: 'Mahsulotlar', href: '/products' },
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

      <div className="flex h-[calc(100vh-113px)]">
        {/* Chap — mahsulotlar */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Qidiruv */}
          <div className="p-4 border-b border-zinc-800">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder=" Mahsulot qidirish..."
              className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm border border-zinc-700 focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Kategoriyalar */}
          <div className="flex gap-2 px-4 py-3 border-b border-zinc-800 overflow-x-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  category === cat
                    ? 'bg-orange-500 text-white'
                    : 'bg-zinc-800 text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Mahsulotlar grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {filtered.length === 0 ? (
              <div className="text-center text-gray-500 text-sm mt-12">
                Mahsulot topilmadi
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filtered.map(product => {
                  const inCart = cart.find(i => i.id === product.id);
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className={`bg-zinc-900 border rounded-xl p-4 text-left transition hover:border-orange-500/50 active:scale-95 ${
                        inCart ? 'border-orange-500' : 'border-zinc-800'
                      }`}
                    >
                      <div className="text-3xl mb-2">🍱</div>
                      <p className="text-sm font-medium text-white leading-tight mb-1">{product.name}</p>
                      <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                      <p className="text-orange-400 text-sm font-bold">{formatPrice(product.price)} so'm</p>
                      {inCart && (
                        <div className="mt-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 inline-block font-medium">
                          {inCart.quantity} ta savatda
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* O'ng — savat */}
        <div className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-semibold">Buyurtma</h3>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-400 hover:text-red-300 text-xs transition"
              >
                Tozalash
              </button>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center mt-12">
                <div className="text-4xl mb-3">🛒</div>
                <p className="text-gray-500 text-sm">Savat bo'sh</p>
                <p className="text-gray-600 text-xs mt-1">Mahsulot tanlang</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center gap-3 bg-zinc-800/50 rounded-lg p-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-orange-400 text-xs">{formatPrice(item.price * item.quantity)} so'm</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-6 h-6 bg-zinc-700 rounded-md text-white hover:bg-zinc-600 transition text-sm flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="text-sm w-5 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-6 h-6 bg-zinc-700 rounded-md text-white hover:bg-zinc-600 transition text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* To'lov */}
          <div className="p-4 border-t border-zinc-800 space-y-3">
            <p className="text-gray-400 text-xs font-medium">To'lov turi:</p>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_TYPES.map(pt => (
                <button
                  key={pt.value}
                  onClick={() => setPaymentType(pt.value)}
                  className={`py-2 rounded-lg text-xs font-medium transition ${
                    paymentType === pt.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-zinc-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center py-2 border-t border-zinc-800">
              <span className="text-gray-400 text-sm">Jami:</span>
              <span className="text-white font-bold text-xl">{formatPrice(total)} so'm</span>
            </div>

            <button
              onClick={handleOrder}
              disabled={!cart.length || loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold py-3.5 rounded-xl transition text-sm"
            >
              {loading ? '⏳ Yuborilmoqda...' : cart.length ? `✅ Buyurtma berish — ${formatPrice(total)} so'm` : 'Mahsulot tanlang'}
            </button>
          </div>
        </div>
      </div>

      {/* Chek modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm border border-zinc-800">
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">✅</div>
              <h3 className="text-lg font-semibold">Buyurtma qabul qilindi!</h3>
              <p className="text-gray-400 text-sm mt-1">{lastPayment}</p>
            </div>

            <div className="bg-zinc-800 rounded-xl p-4 mb-4 space-y-2">
              {lastOrder.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-300">{item.name} × {item.quantity}</span>
                  <span className="text-white">{formatPrice(item.price * item.quantity)} so'm</span>
                </div>
              ))}
              <div className="border-t border-zinc-700 pt-2 flex justify-between font-bold">
                <span>Jami</span>
                <span className="text-orange-400">{formatPrice(lastTotal)} so'm</span>
              </div>
            </div>

            <button
              onClick={() => setShowReceipt(false)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition"
            >
              Yangi buyurtma
            </button>
          </div>
        </div>
      )}
    </div>
  );
}