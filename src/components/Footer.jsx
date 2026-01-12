import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp, FaTiktok, FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import api from '../config/api';
import uneeyaLogo from '../assets/icons/uneeya.png';

const Footer = () => {
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

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const getLogoUrl = () => {
    if (shop?.logo_url) {
      return `${BASE_URL}${shop.logo_url}`;
    }
    return uneeyaLogo;
  };

  const waLink = shop?.whatsapp_number ? `https://wa.me/${shop.whatsapp_number}` : '#';
  const igLink = shop?.instagram_username ? `https://instagram.com/${shop.instagram_username}` : '#';
  const tiktokLink = shop?.tiktok_username ? `https://tiktok.com/@${shop.tiktok_username}` : '#';

  return (
    <footer className="bg-blue-100 border-t border-black/10 pt-10 md:pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Kolom 1: Brand Info */}
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <img src={getLogoUrl()} alt="Shop Logo" className="w-8 h-8" />
              <h2 className="text-xl font-bold text-gray-900">{shop?.shop_name}</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">Menghadirkan kehangatan kerajinan tangan berkualitas tinggi. Setiap produk dibuat dengan cinta dan ketelitian untuk Anda yang istimewa.</p>
            <div className="flex gap-4 pt-2 justify-center md:justify-start">
              {shop?.instagram_username && (
                <a href={igLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full border border-gray-200 hover:bg-yellow-400 hover:text-black hover:border-black transition-all">
                  <FaInstagram />
                </a>
              )}
              {shop?.whatsapp_number && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full border border-gray-200 hover:bg-green-500 hover:text-white hover:border-green-600 transition-all">
                  <FaWhatsapp />
                </a>
              )}
              {shop?.tiktok_username && (
                <a href={tiktokLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-all">
                  <FaTiktok />
                </a>
              )}
            </div>
          </div>

          {/* Kolom 2: Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Navigasi</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/" className="hover:text-yellow-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-yellow-600 transition-colors">
                  Katalog Produk
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-yellow-600 transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/check-shipping" className="hover:text-yellow-600 transition-colors">
                  Cek Ongkir
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Customer Service */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Bantuan</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/profile" className="hover:text-yellow-600 transition-colors">
                  Akun Saya
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-yellow-600 transition-colors">
                  Riwayat Pesanan
                </Link>
              </li>
              <li>
                <Link to="/favorite" className="hover:text-yellow-600 transition-colors">
                  Favorit Saya
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-600 transition-colors">
                  FAQ / Tanya Jawab
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Contact */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Hubungi Kami</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className=" text-yellow-600 mt-1text-yellow-600 mt-1 shrink-0" />
                <span className="text-left">{shop?.full_address ? `${shop.full_address}, ${shop.city_name || ''}, ${shop.province_name || ''}` : 'Alamat belum diatur'}</span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-yellow-600 shrink-0" />
                <span>{shop?.whatsapp_number ? `+${shop.whatsapp_number}` : '-'}</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-yellow-600 shrink-0" />
                <span>{shop?.email_address ? `@${shop.email_address}` : '-'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-black/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {shop?.shop_name}. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-500 font-medium">
            <a href="#" className="hover:text-black">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-black">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
