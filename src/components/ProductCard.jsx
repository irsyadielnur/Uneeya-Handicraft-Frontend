import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite } from '../redux/slices/favoriteSlice';
import { FaStar, FaHeart, FaRegHeart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import bagBtn from '../assets/icons/bag.png';

const ProductCard = ({ product, label, labelColor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const { items: favorites } = useSelector((state) => state.favorites);
  const isFavorite = favorites.some((fav) => fav.product_id === product.product_id);

  const totalStock = product.ProductColors?.reduce((sum, item) => sum + item.stock, 0) || 0;
  const isOutOfStock = totalStock <= 0;

  const getImageUrl = (item) => {
    if (item.ProductImages && item.ProductImages.length > 0) {
      return `${BASE_URL}${item.ProductImages[0].image_url}`;
    }
    return 'https://via.assets.so/img.jpg?w=300&h=300&bg=fce7f3&f=png';
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock) {
      toast.error('Maaf, produk ini stoknya habis.', { icon: '🚫' });
      return;
    }
    toast('Silakan pilih varian di halaman detail', { icon: 'ℹ️' });
    navigate(`/product/${product.product_id}`);
  };

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleFavorite(product));
  };

  const ratingValue = parseFloat(product.rating_avg) || 0;
  const reviewCount = parseInt(product.rating_count) || 0;

  return (
    <div className="bg-cream-2 rounded-xl md:rounded-2xl border border-gray-600 shadow-sm hover:shadow-lg hover:-translate-y-3 transition-all duration-200 group flex flex-col pb-2 relative h-full">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl md:rounded-t-2xl bg-gray-100 border-b border-gray-400 active:scale-95 transition-transform">
        <Link to={`/product/${product.product_id}`}>
          <img
            src={getImageUrl(product)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://via.assets.so/img.jpg?w=300&h=300&bg=fce7f3&f=png';
            }}
          />
        </Link>

        {isOutOfStock ? (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span className="text-white font-bold text-xs md:text-lg tracking-widest uppercase border-2 border-white px-2 md:px-4 py-1 rotate-[-15deg]">HABIS</span>
          </div>
        ) : (
          label && <div className={`absolute top-2 left-2 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-md shadow-sm z-10 ${labelColor || 'bg-green-500'}`}>{label}</div>
        )}
      </div>

      <button
        onClick={handleFavorite}
        className="absolute top-2 right-2 p-1.5 bg-white backdrop-blur-sm rounded-full shadow-sm transition-all z-15 cursor-pointer transform active:scale-90"
        title={isFavorite ? 'Hapus dari Favorite' : 'Tambah ke Favorite'}
      >
        {isFavorite ? <FaHeart className="text-red-500 text-sm md:text-lg drop-shadow-sm transition-all" /> : <FaRegHeart className="text-gray-500 text-lg hover:text-red-500" />}
      </button>

      {/* Info Product */}
      <div className="px-2 pt-2 flex flex-col grow">
        <p className="text-[10px] md:text-xs text-gray-500 mb-1 truncate">{product.category || 'Kerajinan'}</p>

        <Link to={`/product/${product.product_id}`}>
          <h3 className="font-semibold text-gray-800 text-xs md:text-sm line-clamp-2 hover:text-gray-950 transition mb-1 leading-snug">{product.name}</h3>
        </Link>

        {/* Grid Layout */}
        <div className="grid grid-cols-[1fr_auto] grid-rows-2 mt-auto">
          {/* Rating */}
          <div className="flex items-center gap-1 md:gap-2 mb-1">
            <FaStar className={`text-lg ${ratingValue > 0 ? 'text-yellow-400' : 'text-gray-300'}`} />
            <div className="flex items-center gap-1 text-[10px] md:text-xs text-gray-600">
              <span className="font-medium">{ratingValue > 0 ? ratingValue.toFixed(1) : 'New'}</span>
              <span className="text-gray-400 inline">({reviewCount})</span>
            </div>
          </div>

          {/* Price */}
          <div className="self-center">
            <p className="text-gray-700 font-semibold text-[10px] md:text-xs whitespace-nowrap">{formatRupiah(product.price)}</p>
          </div>

          {/* Bag Button */}
          <div className="flex items-center justify-center row-start-1 row-end-3 col-start-2 col-end-3">
            <button onClick={handleAddToCart} className="btn-icon-2" title="Lihat Detail">
              <img src={bagBtn} alt="bag" className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
