import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../config/api';
import toast from 'react-hot-toast';

const EditReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await api.get(`/api/reports/${id}`);
        if (data.status === 'approved') {
          toast.error('Laporan sudah divalidasi, tidak bisa diedit.');
          navigate('/admin/reports');
          return;
        }
        setReport(data);
        setNotes(data.notes || '');
      } catch (error) {
        toast.error('Gagal memuat laporan');
        navigate('/admin/reports');
      }
    };
    fetchReport();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('notes', notes);
    if (file) formData.append('proof_image', file);

    try {
      await api.put(`/api/reports/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Laporan berhasil diperbarui');
      navigate('/admin/reports');
    } catch (error) {
      toast.error('Gagal update laporan');
    } finally {
      setLoading(false);
    }
  };

  if (!report) return <AdminLayout>Loading...</AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Laporan Penjualan</h2>

        {/* Read Only Info */}
        <div className="bg-gray-50 p-4 rounded mb-6 border">
          <p className="text-sm text-gray-500">
            Nomor Laporan: <span className="font-bold text-gray-700">{report.report_number}</span>
          </p>
          <p className="text-sm text-gray-500">
            Periode:{' '}
            <span className="font-bold text-gray-700">
              {report.start_date} s/d {report.end_date}
            </span>
          </p>
          <p className="text-sm text-gray-500">
            Total Omzet: <span className="font-bold text-green-600">Rp {parseInt(report.total_sales).toLocaleString()}</span>
          </p>
          <p className="text-xs text-red-500 mt-2 italic">*Informasi periode dan angka tidak dapat diubah. Jika salah, silakan hapus dan buat laporan baru.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Bukti Upload */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Update Bukti Setor / Lampiran</label>

            {/* Tampilkan Bukti Lama jika ada */}
            {report.proof_image && !file && (
              <div className="mb-2 flex items-center gap-4 bg-blue-50 p-2 rounded border border-blue-100">
                <img src={`${BASE_URL}${report.proof_image}`} alt="Bukti Lama" className="w-16 h-16 object-contain bg-white rounded border" />
                <span className="text-xs text-blue-600">File saat ini tersimpan. Upload baru untuk mengganti.</span>
              </div>
            )}

            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept="image/*,application/pdf"
            />
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Catatan Tambahan</label>
            <textarea className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" rows="4" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Contoh: Uang diserahkan tanggal..."></textarea>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/admin/reports')} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
              Batal
            </button>
            <button type="submit" disabled={loading} className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded font-bold shadow">
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default EditReport;
