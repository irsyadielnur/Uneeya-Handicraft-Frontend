import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import AdminLayout from '../../components/layouts/AdminLayout';
import { getImageUrl } from '../../utils/imageHelper';
import { FaMoneyBillWave, FaShoppingBag, FaUsers, FaBoxOpen, FaChartLine, FaClock, FaExclamationCircle, FaTimesCircle } from 'react-icons/fa';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/reports/dashboard-stats');
        setStats(data);
      } catch (error) {
        console.error('Gagal memuat statistik dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return (
      <AdminLayout>
        <div className="flex h-screen items-center justify-center">Memuat Dashboard...</div>
      </AdminLayout>
    );

  // Format Data untuk Grafik
  const chartData =
    stats?.chartData?.map((item) => ({
      name: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      revenue: parseInt(item.daily_revenue),
    })) || [];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Selamat datang kembali, Berikut ringkasan toko hari ini.</p>
      </div>

      {/* --- GRID STATISTIK UTAMA --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Card 1: Total Pendapatan */}
        <div className="bg-cream p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Pendapatan</p>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">Rp {stats?.totalRevenue.toLocaleString()}</h3>
            <p className="text-xs text-green-500 mt-2 font-medium flex items-center gap-1">
              <FaChartLine /> Lifetime Sales
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <FaMoneyBillWave size={24} />
          </div>
        </div>

        {/* Card 2: Total Profit (Opsional, jika data modal diisi) */}
        <div className="bg-cream p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Profit</p>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">Rp {stats?.totalProfit.toLocaleString()}</h3>
            <p className="text-xs text-blue-500 mt-2 font-medium">Estimasi Keuntungan Bersih</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <FaChartLine size={24} />
          </div>
        </div>

        {/* Card 3: Total Transaksi */}
        <div className="bg-cream p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Pesanan</p>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{stats?.totalTransactions}</h3>
            <p className="text-xs text-gray-500 mt-2">Transaksi Berhasil (Completed)</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
            <FaShoppingBag size={24} />
          </div>
        </div>

        {/* Card 4: Pelanggan & Produk (Digabung/Split) */}
        <div className="bg-cream p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-center mb-4 border-b pb-2 border-dashed">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Pelanggan</p>
              <p className="text-lg font-bold text-gray-800">{stats?.totalCustomers}</p>
            </div>
            <FaUsers className="text-gray-300" />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Produk Aktif</p>
              <p className="text-lg font-bold text-gray-800">{stats?.totalProducts}</p>
            </div>
            <FaBoxOpen className="text-gray-300" />
          </div>
        </div>
      </div>

      {/* --- GRID TENGAH: GRAFIK & SIDEBAR KANAN --- */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_30%] gap-6">
        {/* Kolom Kiri: Grafik Penjualan */}
        <div>
          <div className="lg:col-span-2 bg-cream p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Tren Pendapatan (7 Hari Terakhir)</h3>
            <div className="h-80 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3} /> {/* Warna Kuning Uneeya */}
                      <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(val) => `Rp ${val / 1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(value) => [`Rp ${value.toLocaleString()}`, 'Pendapatan']} />
                  <Area type="monotone" dataKey="revenue" stroke="#EAB308" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Stock Product & Pesanan Terbaru */}
        <div className="space-y-6">
          {/* Pesanan Terbaru */}
          <div className="bg-cream p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Pesanan Masuk</h3>
              <Link to="/admin/orders" className="text-xs text-blue-600 font-bold hover:underline">
                Lihat Semua
              </Link>
            </div>

            <div className="space-y-4">
              {stats?.recentOrders?.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FaClock className="mx-auto mb-2 opacity-50" size={24} />
                  <p className="text-sm">Tidak ada pesanan baru.</p>
                </div>
              ) : (
                stats?.recentOrders?.map((order) => (
                  <div key={order.order_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                          order.status === 'paid' ? 'bg-blue-500' : order.status === 'processing' ? 'bg-indigo-500' : 'bg-yellow-500'
                        }`}
                      >
                        #{order.order_id}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 truncate w-32">{order.User?.username}</p>
                        <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">Rp {(parseInt(order.grand_total) / 1000).toFixed(0)}k</p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          order.status === 'paid' ? 'bg-blue-100 text-blue-700' : order.status === 'processing' ? 'bg-indigo-100 text-indigo-700' : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Tombol Cepat ke Manage Orders */}
            <Link to="/admin/orders" className="block w-full mt-6 bg-gray-800 text-white text-center py-2 rounded-lg text-sm font-bold hover:bg-gray-900 transition shadow">
              Kelola Pesanan
            </Link>
          </div>

          {/* Stock Produk */}
          <div className="bg-cream p-6 rounded-xl shadow-sm border border-red-200 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                <FaExclamationCircle size={20} />
              </div>
              <h3 className="font-bold text-gray-800">Stok Habis!</h3>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {stats?.outOfStockProducts?.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Semua stok aman.</p>
              ) : (
                stats?.outOfStockProducts?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                    <img
                      src={getImageUrl(item.Product.ProductImages?.[0]?.image_url)}
                      className="w-10 h-10 rounded-md object-cover bg-gray-200 border border-gray-200"
                      alt={item.Product?.name}
                      onError={(e) => {
                        e.target.src = 'https://via.assets.so/img.jpg?w=100&h=100&bg=fce7f3&f=png';
                      }}
                    />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-gray-800 truncate">{item.Product?.name}</p>
                      <p className="text-xs text-gray-500">Varian: {item.color_name}</p>
                    </div>
                    <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded">0</span>
                  </div>
                ))
              )}
            </div>

            {stats?.outOfStockProducts?.length > 0 && (
              <Link to="/admin/products" className="block mt-4 text-center text-xs font-bold text-red-600 hover:text-red-700 hover:underline">
                Kelola Stok &rarr;
              </Link>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
