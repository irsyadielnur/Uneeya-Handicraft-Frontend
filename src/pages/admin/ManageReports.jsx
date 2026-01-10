import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { FaPlus, FaEye, FaTrash, FaEdit, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

const ManageReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const isOwner = user?.role_id === 4;

  const fetchReports = async () => {
    try {
      const { data } = await api.get('/api/reports');
      setReports(data);
    } catch (error) {
      toast.error('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold">
            <FaCheckCircle /> Divalidasi
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded text-xs font-bold">
            <FaTimesCircle /> Ditolak
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-xs font-bold">
            <FaClock /> Menunggu
          </span>
        );
    }
  };

  const handleDelete = async (id, status) => {
    if (status === 'approved') return toast.error('Laporan yang sudah divalidasi tidak bisa dihapus!');

    if (!window.confirm('Yakin ingin menghapus laporan ini? Data tidak bisa dikembalikan.')) return;

    try {
      await api.delete(`/api/reports/${id}`);
      toast.success('Laporan berhasil dihapus');
      fetchReports(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus laporan');
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Laporan Penjualan</h2>
        {/* Tombol Buat Laporan hanya untuk Sales Admin (Role 3) atau Owner jika mau */}
        <Link to="/admin/reports/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow flex items-center gap-2">
          <FaPlus /> Buat Laporan Baru
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">No. Laporan</th>
              <th className="px-6 py-4">Periode</th>
              <th className="px-6 py-4">Total Omzet</th>
              <th className="px-6 py-4">Dibuat Oleh</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : (
              reports.map((rep) => (
                <tr key={rep.report_id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-800">{rep.report_number}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {rep.start_date} s/d {rep.end_date}
                  </td>
                  <td className="px-6 py-3 font-bold text-green-600">Rp {parseInt(rep.total_sales).toLocaleString()}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{rep.User?.username}</td>
                  <td className="px-6 py-3">{getStatusBadge(rep.status)}</td>
                  <td className="px-6 py-3">
                    <div className="flex justify-center gap-2">
                      {/* Tombol Detail */}
                      <Link to={`/admin/reports/${rep.report_id}`} className="text-blue-500 hover:bg-blue-50 p-2 rounded" title="Detail">
                        <FaEye />
                      </Link>

                      {/* Tombol Edit (Hanya jika belum approved) */}
                      {rep.status !== 'approved' && (
                        <Link to={`/admin/reports/edit/${rep.report_id}`} className="text-yellow-500 hover:bg-yellow-50 p-2 rounded" title="Edit Catatan/Bukti">
                          <FaEdit />
                        </Link>
                      )}

                      {/* Tombol Hapus (Hanya jika belum approved) */}
                      {rep.status !== 'approved' && (
                        <button onClick={() => handleDelete(rep.report_id, rep.status)} className="text-red-500 hover:bg-red-50 p-2 rounded" title="Hapus">
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default ManageReports;
