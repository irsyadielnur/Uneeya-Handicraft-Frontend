import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getImageUrl } from '../utils/imageHelper';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { FaPrint, FaCheck, FaTimes, FaBoxOpen, FaUsers, FaArrowLeft, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useSelector((state) => state.auth);
  const isOwner = user?.role_id === 4;

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await api.get(`/api/reports/${id}`);
        setReport(data);
      } catch (error) {
        toast.error('Laporan tidak ditemukan');
        navigate('/admin/reports');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  const handleValidation = async (status) => {
    const confirmMsg = status === 'approved' ? 'Terima dan Validasi laporan ini? Pastikan dana sudah masuk.' : 'Tolak laporan ini? Sales Admin harus merevisi/membuat ulang.';
    if (!window.confirm(confirmMsg)) return;
    try {
      await api.put(`/api/reports/${id}/validate`, { status });
      toast.success(status === 'approved' ? 'Laporan Divalidasi' : 'Laporan Ditolak');

      // Refresh data tanpa reload page
      const { data } = await api.get(`/api/reports/${id}`);
      setReport(data);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memproses validasi');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!report)
    return (
      <AdminLayout>
        <div className="p-6">Memuat data...</div>
      </AdminLayout>
    );

  const getProductSummary = () => {
    if (!report.products_summary) return [];
    if (Array.isArray(report.products_summary)) return report.products_summary;
    try {
      // Jika string, parse dulu
      return JSON.parse(report.products_summary);
    } catch (e) {
      return [];
    }
  };

  const products = getProductSummary();

  return (
    <AdminLayout>
      <div className="print:hidden flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <button onClick={() => navigate('/admin/reports')} className="flex items-center text-gray-600 hover:text-gray-900 font-medium">
          <FaArrowLeft className="mr-2" /> Kembali ke Daftar
        </button>
        <div className="flex gap-3">
          {/* Tombol Print */}
          <button onClick={handlePrint} className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-900 transition flex items-center gap-2">
            <FaPrint /> <span className="hidden sm:inline">Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Area yang akan di-print */}
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-5xl mx-auto print:shadow-none print:w-full print:p-0" id="print-area">
        {/* Header Cetak */}
        <div className="text-center border-b-2 border-gray-100 pb-6 mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 uppercase tracking-wider">Laporan Penjualan</h1>
          <p className="text-gray-500 font-medium text-lg mt-1">Uneeya Handicraft</p>
          <div className="flex justify-center items-center gap-4 mt-4 text-sm text-gray-500">
            <span className="bg-gray-100 px-3 py-1 rounded-full border">No: {report.report_number}</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full border flex items-center gap-2">
              <FaCalendarAlt className="text-gray-400" /> {new Date(report.created_at).toLocaleDateString('id-ID')}
            </span>
          </div>
        </div>

        {/* Info Periode & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Periode Laporan</p>
            <p className="text-xl font-bold text-gray-800">
              {new Date(report.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              <span className="mx-2 text-gray-400">-</span>
              {new Date(report.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Status Validasi</p>
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold uppercase ${
                report.status === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' : report.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
              }`}
            >
              {report.status === 'approved' && <FaCheck />}
              {report.status === 'rejected' && <FaTimes />}
              {report.status === 'pending' && '⏳'}
              {report.status === 'pending' ? 'Menunggu Validasi' : report.status === 'approved' ? 'Diterima Owner' : 'Ditolak'}
            </div>
          </div>
        </div>

        {/* Cards Statistik Keuangan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Omzet */}
          <div className="bg-linear-to-br from-green-50 to-white p-6 rounded-xl border border-green-100 shadow-sm print:border-2 print:shadow-none">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-green-800 uppercase font-bold">Total Omzet</p>
              <FaMoneyBillWave className="text-green-300 text-xl" />
            </div>
            <p className="text-3xl font-extrabold text-green-700">Rp {parseInt(report.total_sales || 0).toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">*Pendapatan bersih (Grand Total)</p>
          </div>

          {/* Transaksi */}
          <div className="bg-linear-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 shadow-sm print:border-2 print:shadow-none">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-blue-800 uppercase font-bold">Transaksi Selesai</p>
              <FaBoxOpen className="text-blue-300 text-xl" />
            </div>
            <p className="text-3xl font-extrabold text-blue-700">{report.total_transactions || 0}</p>
            <p className="text-xs text-blue-600 mt-1">Pesanan status 'Completed'</p>
          </div>

          {/* Pelanggan */}
          <div className="bg-linear-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100 shadow-sm print:border-2 print:shadow-none">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-purple-800 uppercase font-bold">Total Pelanggan</p>
              <FaUsers className="text-purple-300 text-xl" />
            </div>
            <p className="text-3xl font-extrabold text-purple-700">{report.total_customers || 0}</p>
            <p className="text-xs text-purple-600 mt-1">Total user terdaftar saat ini</p>
          </div>
        </div>

        {/* Tabel Produk Terlaris */}
        <div className="mb-10 break-inside-avoid">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full inline-block"></span>
            Rincian Penjualan Produk (Best Seller)
          </h3>
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-3 border-b">No</th>
                  <th className="px-6 py-3 border-b">Nama Produk</th>
                  <th className="px-6 py-3 text-center border-b">Terjual (Qty)</th>
                  <th className="px-6 py-3 text-right border-b">Total Pendapatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-400 italic">
                      Data produk tidak tersedia untuk periode ini.
                    </td>
                  </tr>
                ) : (
                  products.map((prod, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-gray-500 font-mono w-16">{index + 1}</td>
                      <td className="px-6 py-3 font-medium text-gray-800">{prod.name}</td>
                      <td className="px-6 py-3 text-center font-bold text-blue-600">{prod.qty}</td>
                      <td className="px-6 py-3 text-right font-medium text-gray-700">Rp {parseInt(prod.total).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bukti & Catatan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 print:break-inside-avoid">
          {/* Catatan */}
          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
            <h4 className="font-bold text-yellow-800 mb-3 text-sm uppercase flex items-center gap-2">📝 Catatan Sales Admin</h4>
            <p className="text-gray-700 italic leading-relaxed">"{report.notes || 'Tidak ada catatan tambahan.'}"</p>
          </div>

          {/* Bukti Transfer */}
          <div className="border rounded-xl p-4 bg-gray-50 flex flex-col items-center justify-center min-h-50">
            <h4 className="font-bold text-gray-600 mb-3 text-sm uppercase self-start w-full border-b pb-2">📎 Bukti Setoran / Transfer</h4>
            {report.proof_image ? (
              <div className="w-full text-center group relative">
                <img
                  src={getImageUrl(report.proof_image)}
                  alt="Bukti Transfer"
                  className="h-48 mx-auto object-contain rounded shadow-sm bg-white cursor-pointer hover:opacity-90 transition"
                  onClick={() => window.open(report.proof_image.startsWith('http') ? report.proof_image : `${BASE_URL}${report.proof_image}`, '_blank')}
                />
                <p className="text-xs text-blue-500 mt-2 print:hidden">Klik gambar untuk memperbesar</p>
              </div>
            ) : (
              <div className="text-gray-400 text-center py-6">
                <p className="text-4xl mb-2">📄</p>
                <p className="text-sm italic">Tidak ada file lampiran.</p>
              </div>
            )}
          </div>
        </div>

        {/* Area Tanda Tangan (Khusus Print) */}
        <div className="hidden print:flex justify-between mt-24 pt-12 px-16">
          <div className="text-center">
            <p className="mb-24 text-gray-600">Dibuat Oleh,</p>
            <p className="font-bold border-b border-black inline-block min-w-50 pb-1 uppercase">{report.User?.username || 'Admin'}</p>
            <p className="text-xs mt-1 text-gray-500">Sales Admin</p>
          </div>
          <div className="text-center">
            <p className="mb-24 text-gray-600">Disetujui Oleh,</p>
            <p className="font-bold border-b border-black inline-block min-w-50 pb-1 uppercase">Owner Uneeya</p>
            <p className="text-xs mt-1 text-gray-500">Pemilik / Super Admin</p>
          </div>
        </div>

        {/* --- FOOTER ACTION (Hanya Tampil di Layar & Untuk Owner) --- */}
        {isOwner && report.status === 'pending' && (
          <div className="print:hidden border-t-2 border-gray-100 pt-8 mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h4 className="font-bold text-blue-900">Validasi Laporan Diperlukan</h4>
                <p className="text-sm text-blue-700">Sebagai Owner, silakan periksa data di atas. Jika sesuai, klik Validasi.</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleValidation('rejected')}
                  className="flex-1 md:flex-none bg-white text-red-600 border border-red-200 px-6 py-3 rounded-lg font-bold hover:bg-red-50 hover:border-red-300 transition flex items-center justify-center gap-2"
                >
                  <FaTimes /> Tolak
                </button>
                <button
                  onClick={() => handleValidation('approved')}
                  className="flex-1 md:flex-none bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg transform hover:-translate-y-0.5 transition flex items-center justify-center gap-2"
                >
                  <FaCheck /> Validasi & Terima
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReportDetail;
