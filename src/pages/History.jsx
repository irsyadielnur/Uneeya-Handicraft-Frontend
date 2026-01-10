import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../config/api';
import toast from 'react-hot-toast';
import { FaBoxOpen, FaTruck, FaFileInvoice, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import ReviewModal from '../components/ReviewModal';
import Swal from 'sweetalert2';

const History = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedProductToReview, setSelectedProductToReview] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const tabs = [
    { id: 'all', label: 'Semua' },
    { id: 'pending', label: 'Belum Bayar' },
    { id: 'processing', label: 'Diproses' },
    { id: 'shipped', label: 'Dikirim' },
    { id: 'completed', label: 'Selesai' },
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/orders/history', {
        params: { status: activeTab === 'all' ? '' : activeTab },
      });
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Gagal memuat history', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  // Helper Address
  const getAddressString = (jsonString) => {
    try {
      const addr = JSON.parse(jsonString);
      return `${addr.address}, ${addr.city_name}, ${addr.province_name}, ${addr.postal_code}`;
    } catch (e) {
      return 'Alamat tidak tersedia';
    }
  };

  // Helper Get Image
  const getProductImage = (item) => {
    if (item.Product?.ProductImages?.length > 0) {
      return `${BASE_URL}${item.Product.ProductImages[0].image_url}`;
    }
    return 'https://via.assets.so/img.jpg?w=300&h=300&bg=fce7f3&f=png';
  };

  //   Handle Bayar Ulang
  const handlePay = async (orderId) => {
    try {
      toast.loading('Memuat pembayaran...', { id: 'pay' });
      const response = await api.post(`/api/payments/snap/${orderId}`);

      if (window.snap) {
        window.snap.pay(response.data.snap_token, {
          onSuccess: async () => {
            toast.success('Pembayaran Berhasil!', { id: 'pay' });
            await api.post(`/api/payments/verify/${orderId}`);
            fetchOrders();
          },
          onPending: () => toast('Menunggu pembayaran...', { id: 'pay' }),
          onError: () => toast.error('Pembayaran gagal', { id: 'pay' }),
          onClose: () => toast('Popup ditutup', { id: 'pay' }),
        });
      }
    } catch (error) {
      toast.error('Gagal memuat sistem pembayaran', { id: 'pay' });
    }
  };

  //   Handle Pesanan Selesai
  const handleComplete = async (orderId) => {
    Swal.fire({
      title: 'Produk Diterima?',
      text: 'Apakah Anda yakin ingin menyelesaikan pesanan ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#23eb00',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Batal',
      // reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.put(`/api/orders/${orderId}/complete`);
          toast.success('Pesanan selesai!');
          fetchOrders();
        } catch (error) {
          console.error(error);
          toast.error(error.response?.data?.message || 'Gagal mengupdate status');
        }
      }
    });
  };

  // Helper Buka Review Modal
  const openReview = (product, orderId) => {
    setSelectedProductToReview(product);
    setSelectedOrderId(orderId);
    setIsReviewOpen(true);
  };

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  return (
    <div className="min-h-screen pt-4 pb-20 px-4 md:pt-6 md:pb-12 md:px-12">
      <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-5 mt-5 md:mt-0">Riwayat Pesanan</h1>

      {/* TABS */}
      <div className="flex overflow-x-auto gap-2 md:gap-3 mb-4 md:mb-5 pb-2 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap cursor-pointer active:scale-90 transition-all duration-200 border ${
              activeTab === tab.id ? 'bg-yellow-400 text-black border' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Memuat pesanan...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 md:py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <FaBoxOpen className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm md:text-base">Belum ada pesanan di kategori ini.</p>
          <Link to="/products" className="text-blue-600 font-bold underline mt-2 block text-sm">
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.order_id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
              {/* Header Card */}
              <div className="bg-[#8ecae6] px-4 py-3 md:px-6 md:py-2 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-200">
                <div className="flex flex-row gap-2 justify-between md:justify-start md:gap-8 items-center">
                  <div>
                    <span className="text-[10px] md:text-xs font-semibold text-gray-800 block tracking-wider">No. Pesanan</span>
                    <span className="font-bold text-gray-900 text-xs md:text-sm">#{order.order_id}</span>
                  </div>
                  <div className="text-right md:text-left">
                    <span className="text-[10px] md:text-xs font-semibold text-gray-800 block">Tanggal</span>
                    <span className="font-medium text-gray-800 text-xs md:text-sm">{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex flex-row-reverse md:flex-row justify-between md:justify-end items-center gap-4 border-t border-white/30 pt-2 md:border-0 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] md:text-xs font-semibold text-gray-800 block mb-1">Resi Pengiriman</span>
                    {order.Shipment?.tracking_number ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] md:text-xs font-mono bg-yellow-100 px-2 py-0.5 rounded font-bold">{order.Shipment.tracking_number}</span>
                      </div>
                    ) : (
                      <span className="text-gray-900 text-xs italic">(Menunggu Pengiriman)</span>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase border 
                        ${order.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' : order.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-100'}`}
                  >
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Info Alamat (Baru) */}
              <div className="px-4 py-2 md:px-6 md:py-3 bg-[#fffae6] flex items-start gap-2 border-b border-gray-100">
                <FaMapMarkerAlt className="text-orange-500 mt-0.5 shrink-0" size={14} />
                <p className="text-xs text-gray-700 leading-snug line-clamp-1 md:line-clamp-none">
                  <span className="font-bold">Alamat Pengiriman: </span>
                  {getAddressString(order.address_snapshot)}
                </p>
              </div>

              {/* Product List */}
              <div className="p-4 md:p-6 divide-y divide-gray-100">
                {order.OrderItems?.map((item, idx) => (
                  <div key={idx} className="flex gap-3 md:gap-4 py-3 md:py-4 first:pt-0 last:pb-0">
                    {/* Image */}
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                      <img src={getProductImage(item)} alt={item.product_name} className="w-full h-full object-cover" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1">
                        <div className="pr-0 md:pr-4">
                          <span className="text-[10px] font-bold text-white bg-gray-400 px-2 py-0.5 rounded-sm mb-1 inline-block">{item.Product?.category || 'Handicraft'}</span>
                          <h4 className="font-bold text-gray-800 text-sm md:text-base line-clamp-2 leading-tight">{item.product_name}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Warna: {item.color_name} | Qty: {item.qty}
                          </p>
                        </div>
                        <div className="text-left md:text-right mt-1 md:mt-0">
                          <p className="font-bold text-gray-900 text-xs md:text-sm">{formatRupiah(item.price)}</p>
                        </div>
                      </div>

                      {/* Tombol Review per Produk */}
                      {order.status === 'completed' && (
                        <div className="mt-2 md:mt-3 flex justify-end">
                          <button
                            onClick={() => openReview(item, order.order_id)}
                            className="text-xs font-bold text-yellow-600 border border-yellow-300 px-3 py-1.5 rounded-full hover:bg-yellow-50 transition-all duration-100 inline-flex items-center gap-1 cursor-pointer active:scale-90"
                          >
                            <FaStar className="mb-0.5" /> Beri Ulasan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Total & Actions */}
              <div className="bg-gray-50 px-4 py-3 md:px-6 md:py-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                <div className="flex justify-between md:justify-start items-center gap-2">
                  <span className="text-sm text-gray-600">Total Pesanan:</span>
                  <span className="text-lg font-bold text-gray-900">{formatRupiah(order.grand_total)}</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full md:w-auto">
                  <Link to={`/invoice/${order.order_id}`} className="text-center px-4 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg text-sm hover:bg-white transition-all cursor-pointer duration-200 active:scale-90">
                    Invoice
                  </Link>

                  {order.status === 'pending' && (
                    <button onClick={() => handlePay(order.order_id)} className="px-6 py-2 bg-yellow-400 text-black font-bold rounded-lg text-sm hover:bg-yellow-500 shadow-sm">
                      Bayar Sekarang
                    </button>
                  )}

                  {order.status === 'shipped' && (
                    <button onClick={() => handleComplete(order.order_id)} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg text-sm hover:bg-green-700 shadow-sm flex items-center justify-center gap-2">
                      <FaTruck /> Pesanan Diterima
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Review */}
      {selectedProductToReview && <ReviewModal isOpen={isReviewOpen} closeModal={() => setIsReviewOpen(false)} product={selectedProductToReview} orderId={selectedOrderId} onSuccess={() => {}} />}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default History;
