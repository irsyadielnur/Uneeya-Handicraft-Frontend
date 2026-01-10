import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../config/api';
import toast from 'react-hot-toast';

const CreateReport = () => {
  const navigate = useNavigate();
  const [dates, setDates] = useState({ start: '', end: '' });
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePreview = async () => {
    if (!dates.start || !dates.end) return toast.error('Pilih tanggal dulu');
    try {
      const { data } = await api.get(`/api/reports/preview?start_date=${dates.start}&end_date=${dates.end}`);
      setPreview(data);
    } catch (error) {
      toast.error('Gagal hitung preview');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!preview) return;

    const formData = new FormData();
    formData.append('start_date', preview.start_date);
    formData.append('end_date', preview.end_date);
    formData.append('total_sales', preview.total_sales);
    formData.append('total_transactions', preview.total_transactions);
    formData.append('total_customers', preview.total_customers);
    formData.append('products_summary', JSON.stringify(preview.products_summary));
    formData.append('notes', notes);
    if (file) formData.append('proof_image', file);

    setLoading(true);
    try {
      await api.post('/api/reports', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Laporan berhasil diajukan');
      navigate('/admin/reports');
    } catch (error) {
      toast.error('Gagal kirim laporan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Buat Laporan Penjualan</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kiri: Input Form */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded shadow">
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Periode Laporan</label>
              <div className="flex gap-2">
                <input type="date" className="border p-2 rounded w-full" onChange={(e) => setDates({ ...dates, start: e.target.value })} />
                <span className="self-center font-bold">-</span>
                <input type="date" className="border p-2 rounded w-full" onChange={(e) => setDates({ ...dates, end: e.target.value })} />
              </div>
              <button onClick={handlePreview} type="button" className="mt-4 w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 transition">
                Hitung / Preview Data
              </button>
            </div>
          </div>

          {preview && (
            <div className="bg-white p-6 rounded shadow">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2">Upload Bukti Setor (Opsional)</label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full text-sm block text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2">Catatan Tambahan</label>
                  <textarea
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Setoran cash diserahkan ke Owner tgl 5..."
                  ></textarea>
                </div>
                <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 shadow-lg transform transition hover:scale-[1.02]">
                  {loading ? 'Mengirim...' : 'Ajukan Laporan Sekarang'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Kanan: Preview Data */}
        <div className="bg-white p-6 rounded shadow h-fit">
          <h3 className="text-lg font-bold mb-4 border-b pb-2 flex justify-between">
            <span>Ringkasan Sistem</span>
            {preview && <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">Auto-Generated</span>}
          </h3>

          {preview ? (
            <div className="space-y-6">
              {/* Statistik Utama */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded text-center border border-green-100">
                  <p className="text-xs text-gray-500 uppercase font-bold">Total Omzet</p>
                  <p className="text-2xl font-bold text-green-700">Rp {preview.total_sales.toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded text-center border border-blue-100">
                  <p className="text-xs text-gray-500 uppercase font-bold">Total Customer</p>
                  <p className="text-2xl font-bold text-blue-700">{preview.total_customers}</p>
                  <p className="text-[10px] text-blue-400">Terdaftar Saat Ini</p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded flex justify-between border">
                <span className="text-sm text-gray-600">Jumlah Transaksi Selesai</span>
                <span className="font-bold">{preview.total_transactions} Order</span>
              </div>

              {/* Tabel Produk Terlaris */}
              <div>
                <h4 className="font-bold text-gray-700 text-sm mb-2">Rincian Penjualan per Produk</h4>
                <div className="overflow-y-auto max-h-60 border rounded">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 font-bold sticky top-0">
                      <tr>
                        <th className="px-3 py-2">Produk</th>
                        <th className="px-3 py-2 text-center">Qty</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {preview.products_summary.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="p-4 text-center text-gray-400 text-xs">
                            Tidak ada produk terjual
                          </td>
                        </tr>
                      ) : (
                        preview.products_summary.map((prod, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 text-xs truncate max-w-37.5" title={prod.name}>
                              {prod.name}
                            </td>
                            <td className="px-3 py-2 text-center font-semibold">{prod.qty}</td>
                            <td className="px-3 py-2 text-right text-gray-600">Rp {prod.total.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-400 text-sm">Silakan pilih tanggal periode laporan terlebih dahulu.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateReport;
