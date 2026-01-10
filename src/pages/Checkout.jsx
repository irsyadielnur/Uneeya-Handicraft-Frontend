import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCart } from '../redux/slices/cartSlice';
import api from '../config/api';
import toast from 'react-hot-toast';
import { FaMapMarkerAlt, FaTruck, FaMoneyBillWave, FaPlus, FaTimes } from 'react-icons/fa';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems } = useSelector((state) => state.cart || { items: [] });

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [availableServices, setAvailableServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const [loadingShipping, setLoadingShipping] = useState(false);
  const [loadingPay, setLoadingPay] = useState(false);

  // State untuk Alamat Baru
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [newAddress, setNewAddress] = useState({
    receiver_name: '',
    phone: '',
    province_id: '',
    province_name: '',
    city_id: '',
    city_name: '',
    postal_code: '',
    address: '',
    label: 'Rumah',
  });

  // RajaOngkir Starter
  const SUPPORTED_COURIERS = ['jne']; // ['jne', 'pos', 'tiki'];

  useEffect(() => {
    dispatch(fetchCart());
    fetchAddresses();
  }, [dispatch]);

  // Fetch Alamat User
  const fetchAddresses = async (autoSelectId = null) => {
    try {
      const response = await api.get('/api/addresses');
      setAddresses(response.data);
      if (response.data.length > 0) {
        if (autoSelectId) {
          const newAddr = response.data.find((a) => a.address_id === autoSelectId);
          if (newAddr) {
            setSelectedAddress(newAddr);
          } else {
            setSelectedAddress(response.data[0]);
          }
        } else if (!selectedAddress) {
          setSelectedAddress(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Gagal memuat alamat', error);
    }
  };

  // Daftar Provinci RajaOngkir
  const handleOpenAddAddress = async () => {
    setShowAddressForm(true);
    if (provinces.length === 0) {
      try {
        const res = await api.get('/api/shipping/provinces');
        setProvinces(res.data);
      } catch (err) {
        toast.error('Gagal memuat data provinsi');
      }
    }
  };

  // Daftar Kota RajaOngkir
  const handleProvinceChange = async (e) => {
    const provId = e.target.value;
    const provName = e.target.options[e.target.selectedIndex].text;

    setNewAddress((prev) => ({ ...prev, province_id: provId, province_name: provName, city_id: '', city_name: '' }));

    try {
      const res = await api.get(`/api/shipping/cities/${provId}`);
      setCities(res.data);
    } catch (err) {
      toast.error('Gagal memuat data kota');
    }
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    const cityName = e.target.options[e.target.selectedIndex].text;
    setNewAddress((prev) => ({ ...prev, city_id: cityId, city_name: cityName }));
  };

  const handleInputAddress = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (!newAddress.province_id || !newAddress.city_id || !newAddress.address) {
        return toast.error('Mohon lengkapi data alamat');
      }
      toast.loading('Menyimpan alamat...', { id: 'save-addr' });
      const payload = {
        ...newAddress,
        is_default: true,
      };
      const res = await api.post('/api/addresses', payload);
      toast.success('Alamat berhasil disimpan dan digunakan', { id: 'save-addr' });
      setShowAddressForm(false);
      setNewAddress({
        receiver_name: '',
        phone: '',
        province_id: '',
        province_name: '',
        city_id: '',
        city_name: '',
        postal_code: '',
        address: '',
        label: '',
      });
      const newAddressId = res.data.address_id || res.data.data?.address_id;
      fetchAddresses(newAddressId);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Gagal menyimpan alamat';
      toast.error(msg, { id: 'save-addr' });
    }
  };

  // Cek Semua Kurir
  const checkAllCouriers = async () => {
    if (!selectedAddress) return;

    setLoadingShipping(true);
    setAvailableServices([]);
    setSelectedService(null);

    const promises = SUPPORTED_COURIERS.map(async (courierCode) => {
      try {
        const payload = {
          address_id: selectedAddress.address_id,
          courier: courierCode,
        };
        const response = await api.post('/api/shipping/check-cost', payload);
        return response.data.services.map((service) => ({
          ...service,
          courier: courierCode.toUpperCase(),
        }));
      } catch (error) {
        console.error(`Gagal cek ongkir ${courierCode}:`, error.response?.status);
        return [];
      }
    });

    try {
      const results = await Promise.all(promises);
      const allServices = results.flat();
      if (allServices.length === 0) {
        toast.error('Tidak ada layanan pengiriman yang tersedia ke alamat ini.');
      } else {
        setAvailableServices(allServices);
        // toast.success(`Ditemukan ${allServices.length} opsi pengiriman!`);
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat memuat ongkir.');
    } finally {
      setLoadingShipping(false);
    }
  };

  useEffect(() => {
    if (selectedAddress) {
      checkAllCouriers();
    }
  }, [selectedAddress]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return toast.error('Pilih alamat pengiriman');
    if (!selectedService) return toast.error('Pilih layanan ongkir');

    setLoadingPay(true);
    try {
      const orderPayload = {
        address_id: selectedAddress.address_id,
        courier: selectedService.courier.toLowerCase(),
        service: selectedService.service,
      };

      const orderRes = await api.post('/api/orders/checkout', orderPayload);
      const { order_id } = orderRes.data;

      const snapRes = await api.post(`/api/payments/snap/${order_id}`);
      const { snap_token } = snapRes.data;

      if (window.snap) {
        window.snap.pay(snap_token, {
          onSuccess: async function (result) {
            console.log('Payment Success:', result);
            toast.success('Pembayaran Berhasil!');
            try {
              toast.loading('Memverifikasi pembayaran...', { id: 'verify' });
              await api.post(`/api/payments/verify/${order_id}`);
              toast.success('Pembayaran Terkonfirmasi!', { id: 'verify' });
              navigate(`/invoice/${order_id}`);
            } catch (err) {
              console.error('Gagal verifikasi otomatis', err);
              navigate(`/history`);
            }
          },
          onPending: function (result) {
            // console.log('Payment Pending:', result);
            toast('Menunggu pembayaran...', { icon: '⏳' });
            navigate('/history');
          },
          onError: function (result) {
            // console.error('Payment Error:', result);
            toast.error('Pembayaran Gagal');
          },
          onClose: function () {
            toast('Anda menutup popup pembayaran', { icon: '⚠️' });
            navigate('/history');
          },
        });
      } else {
        toast.error('Gagal memuat sistem pembayaran. Coba refresh halaman.');
      }
    } catch (error) {
      console.error('Checkout Error:', error);
      const msg = error.response?.data?.message || 'Gagal memproses pesanan';
      toast.error(msg);
    } finally {
      setLoadingPay(false);
    }
  };

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const subTotal = cartItems.reduce((acc, item) => acc + Number(item.price) * item.qty, 0);
  const shippingCost = selectedService ? selectedService.cost : 0;
  const grandTotal = subTotal + shippingCost;

  if (cartItems.length === 0) return <div className="flex h-96 w-full items-center justify-center text-center">Keranjang kosong</div>;

  return (
    <div className="min-h-screen bg-cream pt-6 pb-12 px-4 md:px-12">
      <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8 border-b-2 border-gray-500 inline-block w-full pb-1 md:pb-4">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-4">
        <div className="space-y-4">
          {/* daftar alamat */}
          <div className="bg-cream-2 p-3 md:p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-2 md:mb-4">
              <h2 className="flex items-center gap-2 text-sm md:text-lg font-bold text-gray-800">
                <FaMapMarkerAlt className="text-red-500" /> Alamat Pengiriman
              </h2>
              <button onClick={handleOpenAddAddress} className="text-xs sm:text-sm btn-color text-gray-800 px-3 py-1 rounded-lg transition-all flex hover:font-semibold duration-100 items-center gap-2 cursor-pointer active:scale-95">
                <FaPlus className="text-[10px] md:text-xs" /> Alamat Baru
              </button>
            </div>

            {addresses.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada alamat tersimpan. Silakan tambah alamat baru.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto px-0 pt-2 md:p-2 custom-scrollbar">
                {addresses.map((addr) => (
                  <div
                    key={addr.address_id}
                    onClick={() => setSelectedAddress(addr)}
                    className={`cursor-pointer p-2 md:p-4 rounded-xl border-2 transition-all duration-200 relative ${
                      selectedAddress?.address_id === addr.address_id ? 'border-yellow-400 bg-yellow-50 shadow-md transform' : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                    }`}
                  >
                    {/* Radio Button Visual */}
                    <div className={`absolute top-2 right-2 md:top-4 md:right-4 w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedAddress?.address_id === addr.address_id ? 'border-yellow-500' : 'border-gray-400'}`}>
                      {selectedAddress?.address_id === addr.address_id && <div className="w-2 h-2 bg-yellow-500 rounded-full" />}
                    </div>

                    <p className="text-sm md:text-base font-bold text-gray-900 pr-6">
                      {addr.receiver_name} <span className="text-xs font-normal ml-2 px-2 py-0.5 bg-gray-200 rounded text-gray-600">{addr.label || 'Rumah'}</span>
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">{addr.phone}</p>
                    <p className="text-xs md:text-sm text-gray-800 mt-2 font-medium">{addr.address}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                      {addr.city_name}, {addr.province_name} {addr.postal_code}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* form alamat baru */}
          {showAddressForm && (
            <div className="fixed inset-0 h-full z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-cream rounded-2xl shadow-2xl w-[95%] md:w-full md:max-w-2xl max-h-[80vh] md:max-h-[90vh] overflow-y-auto mt-15 flex flex-col">
                <div className="px-5 py-2 border-b flex justify-between items-center sticky top-0 bg-cream z-10">
                  <h3 className="font-bold text-base md:text-lg text-gray-800">Tambah Alamat Baru</h3>
                  <button onClick={() => setShowAddressForm(false)} className="text-gray-500 hover:text-red-500 transition cursor-pointer active:scale-95">
                    <FaTimes className="text-md md:text-lg" />
                  </button>
                </div>

                <form onSubmit={handleSaveAddress} className="p-4 md:p-6 space-y-2 md:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-semibold mb-1">Nama Penerima</label>
                      <input
                        type="text"
                        name="receiver_name"
                        required
                        value={newAddress.receiver_name}
                        onChange={handleInputAddress}
                        className="w-full border rounded-lg text-sm md:text-base p-2 focus:ring-2 focus:ring-yellow-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-semibold mb-1">No. Handphone</label>
                      <input type="text" name="phone" required value={newAddress.phone} onChange={handleInputAddress} className="w-full border rounded-lg text-sm md:text-base p-2 focus:ring-2 focus:ring-yellow-400 outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-semibold mb-1">Provinsi</label>
                      <select name="province_id" required value={newAddress.province_id} onChange={handleProvinceChange} className="w-full border rounded-lg text-sm md:text-base p-2 focus:ring-2 focus:ring-yellow-400 outline-none">
                        <option value="">Pilih Provinsi</option>
                        {provinces.map((prov) => (
                          <option key={prov.id} value={prov.id}>
                            {prov.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-semibold mb-1">Kota/Kabupaten</label>
                      <select
                        name="city_id"
                        required
                        disabled={!newAddress.province_id}
                        value={newAddress.city_id}
                        onChange={handleCityChange}
                        className="w-full border rounded-lg text-sm md:text-base p-2 focus:ring-2 focus:ring-yellow-400 outline-none disabled:bg-gray-100"
                      >
                        <option value="">Pilih Kota</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs md:text-sm font-semibold mb-1">Alamat Lengkap (Jalan, No. Rumah, RT/RW)</label>
                      <textarea
                        name="address"
                        rows="3"
                        required
                        value={newAddress.address}
                        onChange={handleInputAddress}
                        className="w-full border rounded-lg text-sm md:text-base p-2 focus:ring-2 focus:ring-yellow-400 outline-none"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-semibold mb-1">Kode Pos</label>
                      <input
                        type="text"
                        name="postal_code"
                        required
                        value={newAddress.postal_code}
                        onChange={handleInputAddress}
                        className="w-full border rounded-lg text-sm md:text-base p-2 focus:ring-2 focus:ring-yellow-400 outline-none"
                      />
                      <label className="block text-xs md:text-sm font-semibold mb-1 mt-2">Label (Opsional)</label>
                      <input
                        type="text"
                        name="label"
                        placeholder="Rumah/Kantor"
                        value={newAddress.label}
                        onChange={handleInputAddress}
                        className="w-full border rounded-lg text-sm md:text-base p-2 focus:ring-2 focus:ring-yellow-400 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t mt-2">
                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer active:scale-95">
                      Batal
                    </button>
                    <button type="submit" className="px-6 py-2 text-sm rounded-lg bg-yellow-400 text-black font-bold shadow-md hover:bg-yellow-500 transition cursor-pointer active:scale-95">
                      Simpan & Gunakan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* pilihan pengiriman */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-all">
            <h2 className="flex items-center gap-2 text-lg font-bold mb-4 text-gray-800">
              <FaTruck className="text-blue-600" /> Opsi Pengiriman
            </h2>

            {loadingShipping ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="animate-spin h-8 w-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-500 text-xs md:text-sm font-medium">Mencari ongkir terbaik...</p>
              </div>
            ) : availableServices.length > 0 ? (
              <div className="space-y-3">
                {availableServices.map((srv, idx) => (
                  <div
                    key={`${srv.courier}-${srv.service}-${idx}`}
                    onClick={() => setSelectedService(srv)}
                    className={`flex justify-between items-center p-4 rounded-lg border cursor-pointer hover:bg-blue-50 transition-all active:scale-[0.99] duration-200 ${
                      selectedService?.service === srv.service && selectedService?.courier === srv.courier ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-sm' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-white text-xs shadow-sm
                        ${srv.courier === 'JNE' ? 'bg-blue-600' : srv.courier === 'POS' ? 'bg-orange-500' : 'bg-indigo-600'}
                      `}
                      >
                        {srv.courier}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm md:text-base">
                          {srv.service} <span className="text-gray-400 font-normal text-xs ml-1">({srv.description})</span>
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          Estimasi tiba: <span className="font-semibold text-gray-700">{srv.etd} hari</span>
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-800 text-sm md:text-lg">{formatRupiah(srv.cost)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500 italic text-xs md:text-sm">Pilih alamat pengiriman terlebih dahulu untuk melihat ongkir.</p>
              </div>
            )}
          </div>
        </div>

        {/* ringkasan pesanan */}
        <div className="lg:col-span-1">
          <div className="bg-cream border border-black rounded-xl p-4 md:p-6 shadow-md sticky top-28">
            <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4 border-b border-black/10 pb-2 md:pb-4">Ringkasan Pesanan</h2>
            <div className="max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {cartItems.length === 0 ? (
                <p>Belum ada produk...</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.cart_id} className="text-sm mb-3 border-b border-dashed border-gray-300 pb-2">
                    <p className="text-gray-900 font-medium">{item.product_name}</p>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>
                        {item.qty} x {formatRupiah(item.price)}
                      </span>
                      <span className="font-semibold text-gray-700">{formatRupiah(item.qty * item.price)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="space-y-3 text-sm border-t-2 border-black/10 pt-4 mt-2">
              <div className="text-xs flex justify-between text-gray-600">
                <span>Subtotal Produk</span>
                <span className="font-medium text-gray-900">{formatRupiah(subTotal)}</span>
              </div>
              <div className="text-xs flex justify-between text-gray-600">
                <span>Ongkos Kirim {selectedService && <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">{selectedService.courier}</span>}</span>
                <span className="font-medium text-gray-900">{formatRupiah(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-sm md:text-lg font-bold pt-3 border-t border-black/10 mt-2">
                <span>Total Bayar</span>
                <span className="text-blue-700">{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loadingPay || !selectedService}
              className={`w-full mt-6 py-3 rounded-xl font-bold border border-black shadow-lg flex hover:-translate-y-1 justify-center items-center gap-2 transition-all duration-200 cursor-pointer active:translate-y-0
                ${loadingPay || !selectedService ? 'bg-gray-300 cursor-not-allowed border-gray-400 text-gray-500' : 'bg-[#ffc343] hover:bg-[#ffb300] text-black'}
              `}
            >
              {loadingPay ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                  Memproses...
                </>
              ) : (
                <>
                  Bayar Sekarang <FaMoneyBillWave />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
