import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../config/api';
import { FaPrint, FaDownload, FaArrowLeft } from 'react-icons/fa';
import uneeyaLogo from '../assets/icons/uneeya.png'; // Pastikan path logo benar

const Invoice = () => {
  const { order_id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await api.get(`/api/orders/${order_id}`);
        setOrder(response.data);
      } catch (error) {
        console.error('Gagal memuat invoice', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [order_id]);

  const handlePrint = () => {
    window.print();
  };

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="min-h-screen pt-24 text-center">Memuat Invoice...</div>;
  if (!order) return <div className="min-h-screen pt-24 text-center">Invoice tidak ditemukan</div>;

  // Parsing Snapshot Address
  const address = JSON.parse(order.address_snapshot || '{}');

  return (
    <div className="min-h-screen bg-cream pt-6 pb-12 px-4">
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Link to="/history" className="flex items-center gap-2 text-gray-600 hover:text-black font-medium">
          <FaArrowLeft /> Kembali ke Riwayat
        </Link>
        <button onClick={handlePrint} className="bg-[#8ecae6] text-sm text-gray-800 px-4 py-1 rounded-lg flex items-center gap-2 hover:bg-green-500 hover:text-black cursor-pointer transition-all duration-200 active:scale-95">
          <FaPrint /> Cetak / Simpan PDF
        </button>
      </div>

      {/* Kertas Invoice */}
      <div className="max-w-4xl mx-auto bg-white p-4 sm:p-8 md:p-12 rounded-xl shadow-lg border border-gray-200 print:shadow-none print:border-none print:w-full" id="print-area">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-gray-100 py-6 md:py-8 mb-6 md:mb-8 gap-6 md:gap-0">
          <div className="w-full md:w-auto">
            <div className="flex items-center gap-3 mb-2">
              <img src={uneeyaLogo} alt="Logo" className="w-8 h-8 md:w-10 md:h-10" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-wide">UNEEYA HANDICRAFT</h1>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Jl. Haji Dimun Raya, Sukamaju, Kec. Cilodong, Kota depok, Jawa Barat, 16415</p>
              <p>Kota Depok, Indonesia</p>
              <p>support@uneeya.com</p>
            </div>
          </div>

          <div className="w-full md:w-auto md:text-right">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-200 uppercase mb-2">INVOICE</h2>
            <div className="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end gap-2 md:gap-0">
              <div>
                <p className="font-bold text-gray-700">#INV-{order.order_id}</p>
                <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
              </div>
              <div
                className={`mt-0 md:mt-2 inline-block px-3 py-1 rounded text-xs font-bold uppercase
                ${order.status === 'completed' ? 'bg-green-100 text-green-700' : order.status === 'processing' ? 'bg-blue-100 text-blue-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}
              >
                {order.status.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* Info Pelanggan & Pengiriman */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
          <div>
            <h3 className="text-gray-500 text-sm font-bold uppercase mb-2 border-b md:border-none pb-1 md:pb-0">Ditagihkan Kepada:</h3>
            <p className="text-lg font-bold text-gray-800">{address.receiver_name}</p>
            <p className="text-gray-600 text-sm">{address.phone}</p>
            <p className="text-gray-600 text-sm mt-1">
              {address.address}, {address.city_name}, {address.province_name} {address.postal_code}
            </p>
          </div>
          <div className="md:text-right">
            <h3 className="text-gray-500 text-sm font-bold uppercase mb-2 border-b md:border-none pb-1 md:pb-0">Detail Pengiriman:</h3>
            {order.Shipment ? (
              <>
                <p className="font-bold text-gray-800 text-lg">
                  {order.Shipment.courier} - {order.Shipment.service}
                </p>
                <div className="mt-2 md:mt-1 flex flex-col md:items-end">
                  <span className="text-gray-600 text-sm mb-1">Nomor Resi: </span>
                  {order.Shipment.tracking_number ? (
                    <span className="font-mono font-bold text-black bg-yellow-100 px-3 py-1 rounded w-fit">{order.Shipment.tracking_number}</span>
                  ) : (
                    <span className="text-red-500 text-xs italic bg-red-50 px-2 py-1 rounded w-fit">(Menunggu Pengiriman)</span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-2">ETD: {order.Shipment.etd}</p>
              </>
            ) : (
              <p>-</p>
            )}
          </div>
        </div>

        {/* Tabel Item */}
        <div className="w-full overflow-x-auto mb-8 border border-gray-100 rounded-lg md:border-none">
          <table className="w-full min-w-125 md:min-w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="py-3 px-4 font-bold text-gray-600 text-sm rounded-tl-lg">Produk</th>
                <th className="py-3 px-4 font-bold text-gray-600 text-sm text-right">Harga</th>
                <th className="py-3 px-4 font-bold text-gray-600 text-sm text-center">Qty</th>
                <th className="py-3 px-4 font-bold text-gray-600 text-sm text-right rounded-tr-lg">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.OrderItems.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 last:border-none hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-bold text-gray-800 text-sm md:text-base">{item.product_name}</p>
                    <p className="text-xs text-gray-500">Varian: {item.color_name}</p>
                  </td>
                  <td className="py-4 px-4 text-right text-gray-700 text-sm md:text-base whitespace-nowrap">{formatRupiah(item.price)}</td>
                  <td className="py-4 px-4 text-center text-gray-700 text-sm md:text-base">{item.qty}</td>
                  <td className="py-4 px-4 text-right font-bold text-gray-800 text-sm md:text-base whitespace-nowrap">{formatRupiah(item.price * item.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Calculation */}
        <div className="flex justify-end">
          <div className="w-full md:w-72 space-y-3 bg-gray-50 p-4 rounded-lg md:bg-transparent md:p-0">
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Subtotal:</span>
              <span className="font-medium">{formatRupiah(order.total_price)}</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Ongkos Kirim:</span>
              <span className="font-medium">{formatRupiah(order.shipping_cost)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 border-t-2 border-gray-100 pt-3 mt-2">
              <span>Grand Total:</span>
              <span>{formatRupiah(order.grand_total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 md:mt-12 pt-8 border-t border-gray-100 text-center text-gray-500 text-sm print:mt-4">
          <p>Terima kasih telah berbelanja di Uneeya Handicraft!</p>
          <p className="text-xs mt-1">Harap simpan invoice ini sebagai bukti pembayaran yang sah.</p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
