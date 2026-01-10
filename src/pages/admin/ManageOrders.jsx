import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { FaEye, FaTruck, FaBoxOpen, FaTimes, FaMoneyBillWave, FaSearch } from 'react-icons/fa';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // State Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isResiModalOpen, setIsResiModalOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = filterStatus !== 'all' ? `?status=${filterStatus}` : '';
      const response = await api.get(`/api/orders/admin/all${query}`);
      setOrders(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  // --- HANDLER STATUS ---
  const handleProcessOrder = async (orderId) => {
    if (!window.confirm('Proses pesanan ini (Siap Dikemas)?')) return;
    try {
      await api.put(`/api/orders/admin/${orderId}/status`, { status: 'processing' });
      toast.success('Status diubah menjadi Sedang Dikemas');
      fetchOrders();
    } catch (error) {
      toast.error('Gagal memproses pesanan');
    }
  };

  const handleOpenResiModal = (order) => {
    setProcessingId(order.order_id);
    setTrackingNumber('');
    setIsResiModalOpen(true);
  };

  const handleSubmitResi = async (e) => {
    e.preventDefault();
    if (!trackingNumber) return toast.error('Masukkan nomor resi');

    try {
      await api.put(`/api/orders/admin/${processingId}/status`, {
        status: 'shipped',
        tracking_number: trackingNumber,
      });
      toast.success('Resi berhasil diinput & Pesanan Dikirim');
      setIsResiModalOpen(false);
      fetchOrders();
    } catch (error) {
      toast.error('Gagal mengupdate resi');
    }
  };

  // Logika Pencarian
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const orderId = String(order.order_id).toLowerCase();
    const username = order.User?.username?.toLowerCase() || '';

    return orderId.includes(term) || username.includes(term);
  });

  // --- HELPER UI ---
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-bold">Belum Bayar</span>;
      case 'paid':
        return <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold">Dibayar (Verifikasi)</span>;
      case 'processing':
        return <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-xs font-bold">Sedang Disiapkan</span>;
      case 'shipped':
        return <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-bold">Dikirim</span>;
      case 'completed':
        return <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold">Selesai</span>;
      case 'cancelled':
        return <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold">Dibatalkan</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{status}</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Kelola Pesanan</h2>

        {/* Pencarian */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Cari Order ID atau Nama..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* --- TABS FILTER --- */}
      <div className="flex overflow-x-auto gap-2 mb-6 border-b pb-2">
        {[
          { label: 'Semua', val: 'all' },
          { label: 'Sedang Disiapkan', val: 'processing' },
          { label: 'Dalam Pengiriman', val: 'shipped' },
          { label: 'Selesai', val: 'completed' },
        ].map((tab) => (
          <button
            key={tab.val}
            onClick={() => setFilterStatus(tab.val)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg cursor-pointer active:scale-90 transition-all duration-200 whitespace-nowrap ${
              filterStatus === tab.val ? 'bg-white text-yellow-600 border-b-2 border-yellow-500' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    Memuat pesanan...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">
                    {orders.length === 0 ? 'Tidak ada pesanan ditemukan.' : 'Pencarian tidak ditemukan.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-700">#{order.order_id}</td>
                    <td className="px-6 py-3">
                      <p className="text-sm font-bold text-gray-800">{order.User?.username}</p>
                      <p className="text-xs text-gray-500">{order.User?.email}</p>
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-700">Rp {parseInt(order.grand_total).toLocaleString()}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-6 py-3">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-3 flex justify-center gap-2">
                      <button onClick={() => setSelectedOrder(order)} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 cursor-pointer active:scale-95" title="Lihat Detail">
                        <FaEye />
                      </button>

                      {order.status === 'paid' && (
                        <button
                          onClick={() => handleProcessOrder(order.order_id)}
                          className="p-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 flex items-center gap-1 text-xs font-bold cursor-pointer active:scale-95"
                          title="Proses / Kemas"
                        >
                          <FaBoxOpen /> Kemas
                        </button>
                      )}

                      {order.status === 'processing' && (
                        <button onClick={() => handleOpenResiModal(order)} className="p-2 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 flex items-center gap-1 text-xs font-bold cursor-pointer active:scale-95" title="Input Resi">
                          <FaTruck /> Kirim
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DETAIL ORDER --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="px-6 py-3 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Detail Pesanan #{selectedOrder.order_id}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(selectedOrder.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer active:scale-95">
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Grid Informasi: Penerima, Pengiriman, Alamat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kolom Kiri: Data User & Status */}
                <div className="space-y-4">
                  {/* Blok 1: Status Order & Resi */}
                  <div className="bg-gray-50 p-4 rounded border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Status Pesanan</p>
                    <div className="mb-2">{getStatusBadge(selectedOrder.status)}</div>

                    {selectedOrder.Shipment?.tracking_number ? (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 font-bold uppercase">No. Resi</p>
                        <p className="font-mono text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded inline-block border border-yellow-200 mt-1">{selectedOrder.Shipment?.tracking_number}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic mt-1">Resi belum diinput</p>
                    )}
                  </div>

                  {/* Blok 2: Pengiriman (Kurir, ETD, Status Shipment) */}
                  <div className="bg-blue-50 p-4 rounded border border-blue-100">
                    <p className="text-xs text-blue-500 uppercase font-bold mb-1">Pengiriman</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <FaTruck className="text-blue-600" />
                        <span className="font-bold text-gray-800 uppercase">{selectedOrder.Shipment?.courier || '-'}</span>
                        <span className="text-sm text-gray-600">({selectedOrder.Shipment?.service || '-'})</span>
                      </div>
                      {/* Estimasi (ETD) */}
                      {selectedOrder.Shipment?.etd && (
                        <p className="text-xs text-gray-600 ml-6">
                          Estimasi: <span className="font-medium">{selectedOrder.Shipment.etd}</span>
                        </p>
                      )}
                      {/* Status Shipment */}
                      <p className="text-xs text-blue-700 ml-6 font-semibold">Status: {selectedOrder.Shipment?.status ? selectedOrder.Shipment.status.toUpperCase() : '-'}</p>
                    </div>
                  </div>

                  {/* Blok 3: Pembayaran */}
                  <div className="bg-green-50 p-4 rounded border border-green-100">
                    <p className="text-xs text-green-600 uppercase font-bold mb-2 flex items-center gap-1">
                      <FaMoneyBillWave /> Pembayaran
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-gray-800 capitalize">{selectedOrder.Payment?.payment_method?.replace('_', ' ') || '-'}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedOrder.Payment?.status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                        {selectedOrder.Payment?.status || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Alamat Tujuan */}
                <div className="bg-gray-50 p-4 rounded border border-gray-100 h-fit">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-2 flex items-center gap-1">
                    <span className="text-lg">📍</span> Alamat Pengiriman
                  </p>
                  {(() => {
                    try {
                      const address = typeof selectedOrder.address_snapshot === 'string' ? JSON.parse(selectedOrder.address_snapshot) : selectedOrder.address_snapshot;

                      return (
                        <div className="text-sm text-gray-700 space-y-1">
                          <p className="font-semibold text-gray-900">
                            <span className="mr-2 px-4 py-0.5 font-sm font-bold bg-yellow-300 rounded-lg">{address.receiver_name}</span>
                            {address.label}
                          </p>
                          <p className="text-gray-600">{address.phone}</p>
                          <p className="mt-2 leading-snug">{address.address}</p>
                          <p className="mt-2">
                            {address.city_name}, {address.province_name} {address.postal_code}
                          </p>
                        </div>
                      );
                    } catch (e) {
                      return <p className="text-red-500 text-xs">Gagal memuat alamat</p>;
                    }
                  })()}
                </div>
              </div>

              {/* Daftar Produk */}
              <div>
                <h4 className="font-bold text-gray-700 mb-3 border-b pb-2 flex justify-between items-center">
                  <span>Produk Dipesan</span>
                  <span className="text-xs font-normal text-gray-500">{selectedOrder.OrderItems?.length} Item</span>
                </h4>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {selectedOrder.OrderItems?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        {/* Gambar Produk */}
                        <div className="w-14 h-14 bg-gray-200 rounded-md overflow-hidden shrink-0 border">
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Img</div>
                        </div>

                        <div>
                          <p className="text-sm font-bold text-gray-800 line-clamp-2">{item.Product?.name}</p>
                          {item.color_name && <p className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded inline-block mt-1 border border-indigo-100">Varian: {item.color_name}</p>}
                          <p className="text-xs text-gray-500 mt-1">
                            {item.qty} x Rp {parseInt(item.price).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">Rp {(item.qty * item.price).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rincian Pembayaran */}
              <div className="bg-gray-50 p-4 rounded">
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <span>Subtotal Produk</span>
                  <span>Rp {parseInt(selectedOrder.total_price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2 border-b border-gray-200 pb-2">
                  <span>Ongkos Kirim</span>
                  <span>Rp {parseInt(selectedOrder.shipping_cost || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-1">
                  <span>Total Pembayaran</span>
                  <span className="text-yellow-600">Rp {parseInt(selectedOrder.grand_total).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t bg-gray-50 text-right">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm cursor-pointer active:scale-95"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL INPUT RESI --- */}
      {isResiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Input Nomor Resi</h3>
            <p className="text-sm text-gray-600 mb-4">
              Masukkan nomor resi pengiriman untuk Pesanan <b>#{processingId}</b>. Status akan berubah menjadi "Dikirim".
            </p>
            <form onSubmit={handleSubmitResi}>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Contoh: JP1234567890"
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:ring-2 focus:ring-yellow-400 outline-none font-mono uppercase"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsResiModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-bold shadow">
                  Simpan & Kirim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageOrders;
