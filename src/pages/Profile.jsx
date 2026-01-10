import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, loginSuccess } from '../redux/slices/authSlice';
import { fetchProvinces, fetchCities, clearCities } from '../redux/slices/rajaOngkirSlice';

import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FaUser, FaMapMarkerAlt, FaLock, FaTrash, FaCamera, FaPlus, FaEdit } from 'react-icons/fa';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { provinces, cities, loading: isLoadingRegion } = useSelector((state) => state.rajaOngkir);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const res = await api.get('/api/auth/profile');
        const token = localStorage.getItem('token');
        dispatch(loginSuccess({ user: res.data.user, token }));
      } catch (error) {
        console.error('Gagal mengambil profil terbaru', error);
      }
    };

    if (user) {
      fetchLatestProfile();
    }
  }, []);

  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
  });

  const getAvatarUrl = (path) => {
    // console.log('Path dari DB:', path);
    // console.log('Base URL:', BASE_URL);

    if (!path) return 'https://via.assets.so/img.jpg?w=100&h=100&bg=e5e7eb&f=png';
    if (path.startsWith('http')) return path;

    const safePath = path.replace(/\\/g, '/');
    const cleanPath = safePath.startsWith('/') ? safePath.substring(1) : safePath;
    return `${BASE_URL}/${cleanPath}`;
  };

  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  const [addresses, setAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialAddressState = {
    label: '',
    receiver_name: '',
    phone: '',
    address: '',
    province_id: '',
    province_name: '',
    city_id: '',
    city_name: '',
    postal_code: '',
    is_default: false,
  };

  const [addressForm, setAddressForm] = useState(initialAddressState);
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      setAvatarPreview(getAvatarUrl(user.profile_pic));
    }
  }, [user, BASE_URL]);

  useEffect(() => {
    if (activeTab === 'address') {
      fetchAddresses();
      if (provinces.length === 0) {
        dispatch(fetchProvinces());
      }
    }
  }, [activeTab, dispatch, provinces.length]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/api/addresses');
      setAddresses(res.data);
    } catch (error) {
      console.error('Gagal load alamat', error);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', profileData.username);
    formData.append('phone', profileData.phone);

    if (avatarFile) {
      formData.append('profile_pic', avatarFile);
    }

    try {
      const res = await api.put('/api/auth/profile', formData);
      const updatedUser = res.data.data || res.data.user || res.data;

      const token = localStorage.getItem('token');
      dispatch(loginSuccess({ user: updatedUser, token }));

      toast.success('Profil berhasil diperbarui!');
      setAvatarFile(null);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Gagal update profil');
      if (user) setAvatarPreview(getAvatarUrl(user.profile_pic));
    }
  };

  const handleProvinceChange = (e) => {
    const provId = e.target.value;
    const index = e.target.selectedIndex;
    const provName = e.target.childNodes[index].text;

    setAddressForm((prev) => ({
      ...prev,
      province_id: provId,
      province_name: provName,
      city_id: '',
      city_name: '',
      postal_code: '',
    }));

    dispatch(clearCities());
    if (provId) dispatch(fetchCities(provId));
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    const index = e.target.selectedIndex;
    const cityName = e.target.childNodes[index].text;

    setAddressForm((prev) => ({
      ...prev,
      city_id: cityId,
      city_name: cityName,
    }));
  };

  // Modal Handlers
  const openAddModal = () => {
    setAddressForm(initialAddressState);
    setIsEditMode(false);
    setEditingId(null);
    dispatch(clearCities());
    setIsAddressModalOpen(true);
  };

  const openEditModal = (addr) => {
    setAddressForm({
      label: addr.label || 'Rumah',
      receiver_name: addr.receiver_name,
      phone: addr.phone,
      address: addr.address,
      province_id: addr.province_id,
      province_name: addr.province_name,
      city_id: addr.city_id,
      city_name: addr.city_name,
      postal_code: addr.postal_code,
      is_default: addr.is_default,
    });

    setIsEditMode(true);
    setEditingId(addr.address_id);

    if (addr.province_id) {
      dispatch(fetchCities(addr.province_id));
    }

    setIsAddressModalOpen(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/api/addresses/${editingId}`, addressForm);
        toast.success('Alamat berhasil diperbarui');
      } else {
        await api.post('/api/addresses', addressForm);
        toast.success('Alamat baru ditambahkan');
      }

      setIsAddressModalOpen(false);
      fetchAddresses(); // Refresh list alamat
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyimpan alamat. Pastikan semua data terisi.');
    }
  };

  const handleDeleteAddress = async (id) => {
    Swal.fire({
      title: 'Yakin hapus alamat ini?',
      text: 'Alamat akan dihapus permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/api/addresses/${id}`);
          fetchAddresses();
          toast.success('Alamat dihapus');
        } catch (error) {
          toast.error('Gagal hapus alamat');
        }
      }
    });
  };

  const handleSetDefault = async (id) => {
    try {
      await api.put(`/api/addresses/${id}`, { is_default: true });
      fetchAddresses();
      toast.success('Alamat utama berhasil diubah');
    } catch (error) {
      toast.error('Gagal set alamat utama');
    }
  };

  // --- HANDLERS KEAMANAN ---
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      return toast.error('Konfirmasi password tidak cocok');
    }
    try {
      await api.put('/api/auth/change-password', passData);
      toast.success('Password berhasil diubah');
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal ubah password');
    }
  };

  const handleDeleteAccount = () => {
    Swal.fire({
      title: 'Yakin hapus akun?',
      text: 'Akun anda akan dihapus permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete('/api/auth/delete-account');
          dispatch(logout());
          navigate('/');
          Swal.fire('Terhapus!', 'Akun Anda telah dihapus.', 'success');
        } catch (error) {
          toast.error('Gagal menghapus akun');
        }
      }
    });
  };

  return (
    <div className="min-h-screen pt-8 pb-12 px-4 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* SIDEBAR */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-cream-2 p-6 rounded-xl border border-gray-200 text-center shadow-sm">
            <div className="relative w-32 h-32 mx-auto mb-4 group">
              <img
                src={avatarPreview || getAvatarUrl(user?.profile_pic)}
                alt="Profile"
                className="w-full h-full object-cover rounded-full border-2 border-yellow-400"
                onError={(e) => {
                  e.target.src = 'https://via.assets.so/img.jpg?w=100&h=100&bg=e5e7eb&f=png';
                }}
              />
              <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 bg-gray-800 text-white p-2 rounded-full cursor-pointer hover:bg-black transitio active:scale-95">
                <FaCamera size={12} />
              </label>
              <input type="file" id="avatar-upload" className="hidden" onChange={handleAvatarChange} accept="image/*" />
            </div>
            <h2 className="font-bold text-lg text-gray-800">{user?.username}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>

          <div className="bg-cream rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-6 py-4 flex items-center gap-3 transition cursor-pointer ${activeTab === 'profile' ? 'bg-yellow-50 text-yellow-600 font-bold border-l-4 border-yellow-400' : 'hover:bg-gray-50 text-gray-600'}`}
            >
              <FaUser /> Profil Saya
            </button>
            <button
              onClick={() => setActiveTab('address')}
              className={`w-full text-left px-6 py-4 flex items-center gap-3 transition cursor-pointer ${activeTab === 'address' ? 'bg-yellow-50 text-yellow-600 font-bold border-l-4 border-yellow-400' : 'hover:bg-gray-50 text-gray-600'}`}
            >
              <FaMapMarkerAlt /> Daftar Alamat
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-6 py-4 flex items-center gap-3 transition cursor-pointer ${activeTab === 'security' ? 'bg-yellow-50 text-yellow-600 font-bold border-l-4 border-yellow-400' : 'hover:bg-gray-50 text-gray-600'}`}
            >
              <FaLock /> Keamanan Akun
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="md:col-span-3">
          {/* TAB PROFIL */}
          {activeTab === 'profile' && (
            <div className="bg-cream-2 p-8 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Edit Profil</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                  <input type="text" value={profileData.username} onChange={(e) => setProfileData({ ...profileData, username: e.target.value })} className={inputStyle} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input type="email" value={profileData.email} disabled className={`${inputStyle} bg-gray-100 text-gray-500 cursor-not-allowed`} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Telepon</label>
                  <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className={inputStyle} />
                </div>
                <div className="pt-2">
                  <button type="submit" className="bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg hover:bg-yellow-500 shadow-md transition-all cursor-pointer active:scale-90">
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB ALAMAT */}
          {activeTab === 'address' && (
            <div className="bg-cream-2 p-8 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">Daftar Alamat</h2>
                <button onClick={openAddModal} className="flex items-center gap-2 bg-btn text-gray-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition duration-100 cursor-pointer active:scale-90">
                  <FaPlus /> Tambah Alamat
                </button>
              </div>

              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Belum ada alamat tersimpan.</p>
                ) : (
                  addresses.map((addr) => (
                    <div key={addr.address_id} className={`bg-cream p-4 rounded-xl border-2 flex flex-col md:flex-row justify-between items-start gap-4 ${addr.is_default ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900 bg-gray-200 px-2 py-0.5 rounded text-xs">{addr.label || 'Alamat'}</span>
                          {addr.is_default && <span className="bg-yellow-400 text-[10px] px-2 py-0.5 rounded font-bold">UTAMA</span>}
                        </div>
                        <p className="font-bold text-gray-700 mt-2">
                          {addr.receiver_name} <span className="text-gray-400 font-normal">|</span> {addr.phone}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{addr.address}</p>
                        <p className="text-sm text-gray-600">
                          {addr.city_name}, {addr.province_name} {addr.postal_code}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => openEditModal(addr)} className="text-blue-600 hover:text-blue-800 p-2 bg-blue-50 rounded-lg cursor-pointer active:scale-95" title="Edit">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDeleteAddress(addr.address_id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg cursor-pointer active:scale-95" title="Hapus">
                          <FaTrash />
                        </button>
                        {!addr.is_default && (
                          <button onClick={() => handleSetDefault(addr.address_id)} className="text-xs text-gray-500 hover:text-black underline self-center ml-2 cursor-pointer active:scale-95">
                            Set Utama
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB KEAMANAN */}
          {activeTab === 'security' && (
            <div className="bg-cream-2 p-8 rounded-xl border border-gray-200 shadow-sm space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Ganti Password</h2>
                <form onSubmit={handleChangePassword} className="max-w-lg space-y-4">
                  {/* Password Lama */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Password Saat Ini</label>
                    <input type="password" placeholder="Masukkan password lama" className={inputStyle} value={passData.currentPassword} onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })} required />
                  </div>

                  {/* Password Baru */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Password Baru</label>
                    <input type="password" placeholder="Buat password baru" className={inputStyle} value={passData.newPassword} onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })} required />
                  </div>

                  {/* Konfirmasi Password dengan Pengecekan Langsung */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Konfirmasi Password</label>
                    <input
                      type="password"
                      placeholder="Ulangi password baru"
                      className={`${inputStyle} ${
                        passData.confirmPassword && passData.newPassword !== passData.confirmPassword
                          ? 'border-red-500 focus:border-red-500 bg-red-50'
                          : passData.confirmPassword && passData.newPassword === passData.confirmPassword
                          ? 'border-green-500 focus:border-green-500 bg-green-50'
                          : ''
                      }`}
                      value={passData.confirmPassword}
                      onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                      required
                    />

                    {/* Pesan Error/Success di bawah input */}
                    {passData.confirmPassword && passData.newPassword !== passData.confirmPassword && <p className="text-red-500 text-xs mt-1 font-semibold">* Password tidak cocok!</p>}
                    {passData.confirmPassword && passData.newPassword === passData.confirmPassword && <p className="text-green-600 text-xs mt-1 font-semibold">✓ Password cocok.</p>}
                  </div>

                  <button
                    type="submit"
                    // Disable tombol jika password tidak cocok atau kosong
                    disabled={!passData.newPassword || !passData.confirmPassword || passData.newPassword !== passData.confirmPassword}
                    className={`font-bold px-6 py-2 rounded-lg transition-all ${
                      !passData.newPassword || !passData.confirmPassword || passData.newPassword !== passData.confirmPassword
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-btn text-gray-800 shadow-lg cursor-pointer transition-all duration-100 active:scale-95'
                    }`}
                  >
                    Update Password
                  </button>
                </form>
              </div>

              {/* Zona Bahaya (Tetap sama) */}
              <div className="pt-8 border-t border-red-100">
                <h3 className="text-red-600 font-bold mb-2">Zona Bahaya</h3>
                <p className="text-sm text-gray-500 mb-4">Menghapus akun akan menghilangkan semua data riwayat pesanan dan favorit Anda secara permanen.</p>
                <button onClick={handleDeleteAccount} className="border border-red-500 text-red-500 font-bold px-6 py-2 rounded-lg hover:bg-red-100 cursor-pointer transition-all duration-100 active:scale-95">
                  Hapus Akun Saya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL FORM ALAMAT (ADD/EDIT) */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 pt-14">
          <div className="bg-cream-2 p-6 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{isEditMode ? 'Edit Alamat' : 'Tambah Alamat Baru'}</h3>
            <form onSubmit={handleAddressSubmit} className="space-y-3">
              <input type="text" placeholder="Label Alamat (Contoh: Rumah, Kantor)" className={inputStyle} required value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} />

              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Nama Penerima" className={inputStyle} required value={addressForm.receiver_name} onChange={(e) => setAddressForm({ ...addressForm, receiver_name: e.target.value })} />
                <input type="tel" placeholder="No. Telepon" className={inputStyle} required value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} />
              </div>

              {/* DROPDOWN PROVINSI */}
              <select className="bg-cream w-full px-4 py-2 border rounded-lg" value={addressForm.province_id} onChange={handleProvinceChange} required>
                <option value="">-- Pilih Provinsi --</option>
                {Array.isArray(provinces) &&
                  provinces.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.name}
                    </option>
                  ))}
              </select>

              {/* DROPDOWN KOTA */}
              <select className="bg-cream w-full px-4 py-2 border rounded-lg" value={addressForm.city_id} onChange={handleCityChange} required disabled={!addressForm.province_id || isLoadingRegion}>
                <option value="">{isLoadingRegion ? 'Memuat...' : '-- Pilih Kota/Kabupaten --'}</option>
                {Array.isArray(cities) &&
                  cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
              </select>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <textarea placeholder="Alamat Lengkap (Jalan, RT/RW, No. Rumah)" className={`${inputStyle} h-20 pt-2`} required value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} />
                </div>
                <div>
                  <input type="text" placeholder="Kode Pos" className={inputStyle} required value={addressForm.postal_code} onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })} />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                <button type="button" onClick={() => setIsAddressModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer active:scale-95">
                  Batal
                </button>
                <button type="submit" className="px-6 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 shadow-sm cursor-pointer active:scale-95">
                  {isEditMode ? 'Simpan Perubahan' : 'Tambah Alamat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyle = 'bg-cream w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-yellow-400 text-sm transition-colors';

export default Profile;
