import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import ProductCard from './ProductCard';
import api from '../config/api';
import recommend from '../assets/icons/recommendation.png';

const MyRecommendations = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  //   console.log('Status Login:', isAuthenticated);
  //   console.log('Data User Lengkap:', user);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const response = await api.get('/api/recommendations/products');
        if (response.data && Array.isArray(response.data.recommendations)) {
          setRecommendations(response.data.recommendations);
        } else if (Array.isArray(response.data)) {
          setRecommendations(response.data);
        }
      } catch (error) {
        console.error('Gagal memuat rekomendasi personal:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [isAuthenticated]);

  if (!isAuthenticated || (recommendations.length === 0 && !loading)) {
    return null;
  }

  return (
    <div className="py-5 bg-linear-to-r from-blue-300 to-[#fffefa] rounded-2xl my-4 md:my-8 border border-blue-300 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center gap-3">
          <div className="p-2">
            <img src={recommend} alt="" className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <div>
            <h2 className="text-lg md:text-2xl font-semibold md:font-bold text-gray-800">Dipilih Khusus Untukmu, {user?.username || 'Kak'}!</h2>
            <p className="text-gray-500 text-xs md:text-sm">Berdasarkan produk yang kamu sukai, masukkan ke keranjang, dan pesan sebelumnya.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">Sedang meracik rekomendasi...</div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth md:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4 md:overflow-visible md:pb-0">
            {recommendations.slice(0, 5).map((item, index) => {
              const productData = item.product ? item.product : item;
              if (!productData || !productData.product_id) return null;
              return (
                <div key={productData.product_id} className="min-w-40 sm:min-w-50 md:min-w-0 snap-start">
                  <ProductCard key={productData.product_id || index} product={productData} label="Untukmu" labelColor="bg-blue-500" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRecommendations;
