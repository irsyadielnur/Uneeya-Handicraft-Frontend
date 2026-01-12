import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProvinces, fetchCities, clearCities } from '../../redux/slices/rajaOngkirSlice';
import { getImageUrl } from '../utils/imageHelper';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { FaSave, FaStore, FaInstagram, FaTiktok, FaWhatsapp, FaMapMarkerAlt, FaImage } from 'react-icons/fa';
import { IoIosMail } from 'react-icons/io';

const ManageShop = () => {
  const dispatch = useDispatch();
  const { provinces, cities, loading: regionLoading } = useSelector((state) => state.rajaOngkir);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState({
    shop_name: '',
    whatsapp_number: '',
    instagram_username: '',
    tiktok_username: '',
    province_id: '',
    province_name: '',
    city_id: '',
    city_name: '',
    full_address: '',
    email_address: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const initData = async () => {
      try {
        const provPromise = dispatch(fetchProvinces()).unwrap();
        const shopPromise = api.get('/api/shop');

        const [fetchedProvinces, shopRes] = await Promise.all([provPromise, shopPromise]);
        const data = shopRes.data;

        setFormData({
          shop_name: data.shop_name || '',
          whatsapp_number: data.whatsapp_number || '',
          instagram_username: data.instagram_username || '',
          tiktok_username: data.tiktok_username || '',
          province_id: data.province_id || '',
          province_name: data.province_name || '',
          city_id: data.city_id || '',
          city_name: data.city_name || '',
          full_address: data.full_address || '',
          email_address: data.email_address || '',
        });

        if (data.logo_url) {
          setLogoPreview(data.logo_url.startsWith('http') ? data.logo_url : `${BASE_URL}${data.logo_url}`);
        }

        if (data.province_id) {
          dispatch(fetchCities(data.province_id));
        }
      } catch (error) {
        console.error('Error init:', error);
        toast.error('Gagal memuat data toko');
      } finally {
        setInitialLoading(false);
      }
    };

    initData();
  }, [dispatch, BASE_URL]);

  const handleProvinceChange = (e) => {
    const selectedId = e.target.value;

    // Cari nama provinsi dari list Redux
    const selectedProv = provinces.find((p) => String(p.province_id) === String(selectedId));
    const provName = selectedProv ? selectedProv.province : '';

    setFormData((prev) => ({
      ...prev,
      province_id: selectedId,
      province_name: provName,
      city_id: '',
      city_name: '',
    }));
    dispatch(clearCities());
    if (selectedId) {
      dispatch(fetchCities(selectedId));
    }
  };

  // --- 3. Handle Ganti Kota ---
  const handleCityChange = (e) => {
    const selectedId = e.target.value;

    // Cari nama kota dari list Redux
    const selectedCity = cities.find((c) => String(c.city_id) === String(selectedId));
    const cityName = selectedCity ? `${selectedCity.type} ${selectedCity.city_name}` : '';

    setFormData((prev) => ({
      ...prev,
      city_id: selectedId,
      city_name: cityName,
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error('File maksimal 2MB');
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.province_id || !formData.city_id) return toast.error('Lokasi toko wajib diisi!');

    setLoading(true);
    const postData = new FormData();
    Object.keys(formData).forEach((key) => {
      postData.append(key, formData[key] || '');
    });
    if (logoFile) postData.append('logo', logoFile);

    try {
      await api.put('/api/shop', postData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Pengaturan Toko Berhasil Disimpan!');
      setTimeout(() => window.location.reload(), 1000); // Refresh agar logo di navbar update
    } catch (error) {
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading)
    return (
      <AdminLayout>
        <div className="p-10 text-center">Memuat Pengaturan...</div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="flex items-center mb-6 gap-3">
        <FaStore className="text-2xl text-gray-700" />
        <h2 className="text-2xl font-bold text-gray-800">Pengaturan Toko</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KOLOM KIRI */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-700 border-b pb-2 mb-4">Identitas Toko</h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Nama Toko</label>
              <input type="text" name="shop_name" value={formData.shop_name} onChange={handleChange} className="w-full border rounded p-2" required />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Logo Toko</label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <img src={logoPreview || getImageUrl(formData.logo_url)} alt="Logo" className="w-20 h-20 object-contain border rounded bg-gray-50" />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 flex items-center justify-center text-gray-400 rounded border">
                    <FaImage />
                  </div>
                )}
                <input
                  type="file"
                  onChange={handleLogoChange}
                  accept="image/*"
                  className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-700 border-b pb-2 mb-4">Kontak & Media Sosial</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1 flex items-center gap-2">
                  <FaWhatsapp className="text-green-500" /> WhatsApp
                </label>
                <input type="text" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} className="w-full border rounded p-2" placeholder="628..." />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 flex items-center gap-2">
                  <FaInstagram className="text-pink-600" /> Instagram
                </label>
                <div className="flex">
                  <span className="bg-gray-100 border border-r-0 p-2 rounded-l text-gray-500 text-sm">@</span>
                  <input type="text" name="instagram_username" value={formData.instagram_username} onChange={handleChange} className="w-full border rounded-r p-2" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 flex items-center gap-2">
                  <FaTiktok className="text-black" /> TikTok
                </label>
                <div className="flex">
                  <span className="bg-gray-100 border border-r-0 p-2 rounded-l text-gray-500 text-sm">@</span>
                  <input type="text" name="tiktok_username" value={formData.tiktok_username} onChange={handleChange} className="w-full border rounded-r p-2" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 flex items-center gap-2">
                  <IoIosMail className="text-black" /> Email Address
                </label>
                <div className="flex">
                  <span className="bg-gray-100 border border-r-0 p-2 rounded-l text-gray-500 text-sm">@</span>
                  <input type="text" name="email_address" value={formData.email_address} onChange={handleChange} className="w-full border rounded-r p-2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-yellow-400">
            <h3 className="font-bold text-gray-700 border-b pb-2 mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-red-500" /> Lokasi Toko (Origin)
            </h3>

            {/* PROVINSI */}
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1">Provinsi</label>
              <select name="province_id" value={formData.province_id} onChange={handleProvinceChange} className="w-full border rounded p-2 bg-white">
                <option value="">-- Pilih Provinsi --</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* KOTA */}
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1">Kota / Kabupaten</label>
              <select name="city_id" value={formData.city_id} onChange={handleCityChange} className="w-full border rounded p-2 bg-white" disabled={!formData.province_id || regionLoading}>
                <option value="">{regionLoading ? 'Memuat Kota...' : '-- Pilih Kota --'}</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1">Alamat Lengkap</label>
              <textarea name="full_address" value={formData.full_address} onChange={handleChange} rows="4" className="w-full border rounded p-2"></textarea>
            </div>
            <p className="text-xs text-gray-500 italic mt-2 bg-yellow-50 p-2 rounded">*Lokasi ini digunakan untuk menghitung ongkir otomatis.</p>
          </div>

          <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg flex justify-center items-center gap-2">
            <FaSave /> {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default ManageShop;
