import React, { useState, useEffect } from 'react';
import cimotImg from '../assets/icons/uneeya.png';
import uneeyaLogo from '../assets/icons/uneeya.png';
import api from '../config/api';
import { FaMapMarkerAlt, FaInstagram, FaHeart, FaShoppingBag, FaPalette, FaComments } from 'react-icons/fa';

const About = () => {
  const [shop, setShop] = useState(null);

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const response = await api.get('/api/shop');
        setShop(response.data);
      } catch (error) {
        console.error('Gagal memuat info toko di footer:', error);
      }
    };
    fetchShopInfo();
  }, []);
  return (
    <div className="min-h-screen bg-cream text-gray-800 font-poppins pt-12 pb-12">
      <div className="container mx-auto px-4 md:px-12 mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 relative inline-block">
          Tentang Uneeya
          <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-yellow-400 rounded-full"></span>
        </h1>
        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">"Gift that represents you"</p>
      </div>

      {/* --- Content --- */}
      <div className="container mx-auto px-4 md:px-12 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_30%] gap-8 items-center bg-white p-8 rounded-3xl shadow-sm border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-bl-full -mr-4 -mt-4 opacity-50 z-0"></div>

          <div className="z-10 order-2 md:order-1">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
              <img src={uneeyaLogo} alt="logo" className="w-8 h-8" />
              Hai!, Kami Uneeya Handicraft
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4 text-justify">
              <strong>Uneeya Handicraft</strong> adalah toko UMKM yang berlokasi di
              <span className="font-semibold text-blue-600"> Cilodong, Depok, Indonesia</span>. Kami berdedikasi untuk menyediakan produk kerajinan tangan berkualitas tinggi yang dibuat dengan sepenuh hati (full handmade).
            </p>
            <p className="text-gray-600 leading-relaxed text-justify">
              Di Uneeya Handicraft, kami percaya bahwa setiap hadiah harus mewakili cerita dan perasaan Anda. Kami bangga bisa menjadi bagian dari momen-momen spesial Anda dengan produk kerajinan tangan asli Indonesia.
            </p>
          </div>

          <div className="z-10 order-1 md:order-2 flex justify-center">
            <div className="bg-cream-2 border-2 border-dashed border-gray-400 rounded-2xl p-8 rotate-8 hover:rotate-0 transition-all duration-300 group">
              <div className="text-center space-y-2">
                <FaHeart className="wave-emoji text-red-500 text-5xl mx-auto drop-shadow-sm transition-transform duration-200 group-hover:scale-150" />
                <h3 className="font-bold text-lg">Handmade with Love</h3>
                <p className="text-xs text-gray-500">Setiap jahitan adalah cerita.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SECTION: MEET CIMOT (Persona) */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="w-48 h-48 md:w-64 md:h-64 shrink-0 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg relative">
            <img src={cimotImg} alt="Cimot Assistant" className="w-40 md:w-56 object-contain hover:scale-110 transition-transform duration-200" />
            <div className="absolute bottom-0 bg-yellow-400 text-xs font-bold px-3 py-1 rounded-full border border-white shadow-sm">Asisten Virtual</div>
          </div>

          {/* Chat Bubble Style Text */}
          <div className="bg-white border-2 border-blue-200 p-6 rounded-3xl rounded-tl-none shadow-sm relative flex-1 group hover:shadow-md hover:-translate-y-2 transition-all duration-200">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Halo, Saya Cimot! <span className="wave-emoji group-hover:scale-140 transition-all duration-200">👋</span>
            </h3>
            <p className="text-gray-600 italic">
              "Selamat datang! Saya siap membantu Anda menemukan hadiah dan kerajinan full handmade loh. Apakah Anda mencari dompet unik, tas rajut, cardigan, boneka rajut, atau pesanan kerajinan tangan yang bisa dikustomisasi? Saya di sini
              untuk membantu!"
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">#Amigurumi</span>
              <span className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-xs font-semibold">#TasDompetRajut</span>
              <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">#CustomGift</span>
            </div>
          </div>
        </div>

        {/* 3. SECTION: SERVICES GRID */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-8">Layanan Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-cream-2 p-6 rounded-xl border border-gray-300 shadow-sm text-center hover:shadow-lg hover:-translate-y-3 transition-all duration-200">
              <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShoppingBag className="text-yellow-700 text-xl" />
              </div>
              <h3 className="font-bold text-lg mb-2">Ready Stock</h3>
              <p className="text-sm text-gray-600">Produk siap kirim untuk mempercantik rumah atau hadiah dadakan.</p>
            </div>

            {/* Card 2 */}
            <div className="bg-cream-2 p-6 rounded-xl border border-gray-300 shadow-sm text-center hover:shadow-lg hover:-translate-y-3 transition-all duration-200">
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPalette className="text-blue-700 text-xl" />
              </div>
              <h3 className="font-bold text-lg mb-2">Custom Order</h3>
              <p className="text-sm text-gray-600">Punya ide desain sendiri? Hubungi admin untuk mewujudkannya.</p>
            </div>

            {/* Card 3 */}
            <div className="bg-cream-2 p-6 rounded-xl border border-gray-300 shadow-sm text-center hover:shadow-lg hover:-translate-y-3 transition-all duration-200">
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaComments className="text-green-700 text-xl" />
              </div>
              <h3 className="font-bold text-lg mb-2">Konsultasi</h3>
              <p className="text-sm text-gray-600">Diskusi mengenai produk custom melalui chat website atau IG.</p>
            </div>
          </div>
        </div>

        {/* 4. SECTION: LOCATION & SOCIAL */}
        <div className="bg-gray-900 text-white rounded-3xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Temukan Kami</h2>
            <div className="space-y-3">
              <p className="flex items-start justify-center md:justify-start gap-3 text-gray-300">
                <FaMapMarkerAlt className="text-red-500 text-xl" />
                <span className="flex-1 text-left wrap-break-words">{shop?.full_address ? `${shop.full_address}, ${shop.city_name || ''}, ${shop.province_name || ''}` : 'Alamat belum diatur'}</span>
              </p>
              <p className="text-gray-400 text-sm max-w-md">Kami melayani pengiriman ke seluruh Indonesia.</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <p className="font-semibold text-lg">Ikuti Update Terbaru:</p>
            <a
              href="https://www.instagram.com/uneeyahandicraft"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-linear-to-tr from-yellow-500 to-pink-600 px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity"
            >
              <FaInstagram size={20} />
              @uneeyahandicraft
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
