import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { FaPhone, FaEnvelope, FaHistory, FaTimes, FaSearch } from 'react-icons/fa';

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/users/admin/customers');
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat data pelanggan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle Search
  useEffect(() => {
    if (!search) {
      setFilteredCustomers(customers);
    } else {
      const lower = search.toLowerCase();
      const filtered = customers.filter((c) => c.username.toLowerCase().includes(lower) || c.email.toLowerCase().includes(lower) || (c.phone_number && c.phone_number.includes(lower)));
      setFilteredCustomers(filtered);
    }
  }, [search, customers]);

  const getAvatarUrl = (path) => {
    if (!path) return 'https://via.assets.so/img.jpg?w=100&h=100&bg=e5e7eb&f=png';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BASE_URL}/${cleanPath}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="text-green-600 font-bold text-xs bg-green-100 px-2 py-0.5 rounded">Selesai</span>;
      case 'paid':
        return <span className="text-blue-600 font-bold text-xs bg-blue-100 px-2 py-0.5 rounded">Dibayar</span>;
      case 'cancelled':
        return <span className="text-red-600 font-bold text-xs bg-red-100 px-2 py-0.5 rounded">Batal</span>;
      default:
        return <span className="text-gray-600 text-xs bg-gray-100 px-2 py-0.5 rounded">{status}</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Data Pelanggan</h2>

        {/* Search Bar */}
        <div className="relative w-full md:w-64 mt-4 md:mt-0">
          <input type="text" placeholder="Cari nama / email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none" />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4 text-center">Total Order</th>
                <th className="px-6 py-4">Total Belanja (VIP)</th>
                <th className="px-6 py-4">Bergabung</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">
                    Tidak ada pelanggan ditemukan.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <img src={getAvatarUrl(cust.profile_pic)} alt={cust.username} className="w-10 h-10 rounded-full object-cover border" />
                        <span className="font-bold text-gray-800">{cust.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-sm">
                        <p className="flex items-center gap-2 text-gray-600">
                          <FaEnvelope className="text-xs" /> {cust.email}
                        </p>
                        {cust.phone_number && (
                          <p className="flex items-center gap-2 text-gray-500 mt-0.5">
                            <FaPhone className="text-xs" /> {cust.phone_number}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-bold">{cust.total_orders}</span>
                    </td>
                    <td className="px-6 py-3 font-semibold text-green-600">Rp {cust.total_spent.toLocaleString()}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{new Date(cust.joined_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</td>
                    <td className="px-6 py-3 text-center">
                      <button onClick={() => setSelectedCustomer(cust)} className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded hover:bg-blue-100 transition" title="Lihat Detail">
                        <FaHistory />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DETAIL USER --- */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Detail Pelanggan</h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Header Profil */}
              <div className="flex items-center gap-4 mb-8">
                <img src={getAvatarUrl(selectedCustomer.profile_pic)} alt="" className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 shadow" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedCustomer.username}</h2>
                  <p className="text-gray-500">{selectedCustomer.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">Customer</span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">Total Belanja: Rp {selectedCustomer.total_spent.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Riwayat Order Table */}
              <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">Riwayat Pesanan ({selectedCustomer.orders.length})</h4>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedCustomer.orders.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-4 text-center text-gray-400 italic">
                          Belum ada pesanan
                        </td>
                      </tr>
                    ) : (
                      selectedCustomer.orders.map((order) => (
                        <tr key={order.order_id}>
                          <td className="px-4 py-3 font-medium">#{order.order_id}</td>
                          <td className="px-4 py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                          <td className="px-4 py-3 font-semibold">Rp {parseInt(order.grand_total).toLocaleString()}</td>
                          <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 text-right">
              <button onClick={() => setSelectedCustomer(null)} className="px-6 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-100">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageCustomers;
