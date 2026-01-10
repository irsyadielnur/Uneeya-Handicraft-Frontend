import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const LatestProducts = () => {
  const dispatch = useDispatch();
  const { items: products, isLoading } = useSelector((state) => state.products);
  const latestProducts = products.slice(0, 10);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  if (isLoading) {
    return <div className="text-center py-10">Loading produk terbaru...</div>;
  }

  return (
    <div className="container mx-auto px-4 md:px-12 md:py-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-lg md:text-3xl font-bold text-gray-800">Produk Terbaru</h2>
          <p className="text-gray-600 text-xs md:text-base mt-1">Koleksi terbaru kami...</p>
        </div>
        <Link to="/products" className="text-gray-600 font-semibold text-[10px] md:text-sm hover:underline active:scale-95">
          Lihat Semua
        </Link>
      </div>

      {/* Grid Produk */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth md:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-6 md:overflow-visible md:pb-0">
        {latestProducts.map((product) => (
          <div key={product.product_id} className="min-w-40 sm:min-w-50 md:min-w-0 snap-start">
            <ProductCard key={product.product_id} product={product} label="Baru" labelColor="bg-green-500" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestProducts;
