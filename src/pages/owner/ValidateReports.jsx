import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { FaCheck, FaTimes, FaEye, FaFileInvoiceDollar } from 'react-icons/fa';

const ValidateReports = () => {
  const [pendingReports, setPendingReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchPendingReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/reports');
      // Filter hanya yang statusnya 'pending'
      const pending = data.filter((r) => r.status === 'pending');
      setPendingReports(pending);
    } catch (error) {
      toast.error('Gagal memuat daftar laporan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingReports();
  }, []);

  const handleValidation = async (id, status) => {
    const action = status === 'approved' ? 'Menerima' : 'Menolak';
    if (!window.confirm(`Yakin ingin ${action} laporan ini?`)) return;

    try {
      await api.put(`/api/reports/${id}/validate`, { status });
      toast.success(`Laporan berhasil ${status === 'approved' ? 'divalidasi' : 'ditolak'}`);
      fetchPendingReports(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error('Gagal memproses validasi');
    }
  };

  const getProofUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path}`;
  };

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
          <FaFileInvoiceDollar size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Validasi Laporan Masuk</h2>
          <p className="text-sm text-gray-500">Daftar laporan penjualan yang menunggu persetujuan Anda.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Info Laporan</th>
                <th className="px-6 py-4">Total Setoran</th>
                <th className="px-6 py-4">Bukti Transfer</th>
                <th className="px-6 py-4">Catatan</th>
                <th className="px-6 py-4 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : pendingReports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <FaCheck className="text-4xl text-green-200 mb-2" />
                      <p>Semua beres! Tidak ada laporan pending.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pendingReports.map((rep) => (
                  <tr key={rep.report_id} className="hover:bg-yellow-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{rep.report_number}</span>
                        <span className="text-xs text-gray-500">
                          Periode: {rep.start_date} s/d {rep.end_date}
                        </span>
                        <span className="text-xs text-blue-500 mt-1">Oleh: {rep.User?.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-lg font-bold text-green-600">Rp {parseInt(rep.total_sales).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{rep.total_transactions} Transaksi</p>
                    </td>
                    <td className="px-6 py-4">
                      {rep.proof_image ? (
                        <a href={getProofUrl(rep.proof_image)} target="_blank" rel="noreferrer" className="block w-16 h-16 border rounded overflow-hidden hover:opacity-80 transition" title="Klik untuk memperbesar">
                          <img src={getProofUrl(rep.proof_image)} alt="Bukti" className="w-full h-full object-cover" />
                        </a>
                      ) : (
                        <span className="text-xs text-red-400 italic">Tidak ada bukti</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 italic line-clamp-2 max-w-xs" title={rep.notes}>
                        "{rep.notes || '-'}"
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleValidation(rep.report_id, 'approved')} className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-600 hover:text-white transition shadow-sm" title="Terima / Validasi">
                          <FaCheck />
                        </button>
                        <button onClick={() => handleValidation(rep.report_id, 'rejected')} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition shadow-sm" title="Tolak Laporan">
                          <FaTimes />
                        </button>
                        <div className="w-px h-6 bg-gray-300 mx-1"></div>
                        <Link to={`/admin/reports/${rep.report_id}`} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition" title="Lihat Detail Lengkap">
                          <FaEye />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ValidateReports;
