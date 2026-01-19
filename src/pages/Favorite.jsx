import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFavorites } from '../redux/slices/favoriteSlice';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { FaHeartBroken } from 'react-icons/fa';

import MyRecommendations from '../components/MyRecommendations';

const Favorite = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.favorites);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  if (status === 'loading') {
    return <div className="min-h-screen pt-24 text-center">Memuat favorite...</div>;
  }

  return (
    <div className="pt-6 pb-12 px-4 md:px-12 mt-5 md:mt-0">
      <div className="mb-4 md:mb-8 border-b-2 border-gray-500 pb-1 md:pb-4">
        <Link to="/products" className="text-gray-600 hover:text-black font-semibold flex items-center gap-2">
          ← Lanjut Belanja
        </Link>

        <h1 className="text-xl text-center md:text-3xl font-bold text-gray-900">Produk Favorite</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <FaHeartBroken className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500 text-lg">Belum ada produk yang disukai.</p>
          <Link to="/products" className="text-blue-600 font-bold underline mt-2 block">
            Cari Produk Dulu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      )}

      {/* Rekomendasi Produk */}
      <div className="mb-6">
        <MyRecommendations />
      </div>
    </div>
  );
};

export default Favorite;
