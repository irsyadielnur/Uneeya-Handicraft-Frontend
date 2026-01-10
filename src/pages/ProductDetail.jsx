import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { addItemToCart } from '../redux/slices/cartSlice';
import SimilarProductsByID from '../components/SimilarProductsByID';
import toast from 'react-hot-toast';
import api from '../config/api';

import { FaStar, FaShoppingCart, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  //   Ambil data review produk
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productRes = await api.get(`/api/products/${id}`);
        const productData = productRes.data;
        setProduct(productData);

        if (productData.ProductImages && productData.ProductImages.length > 0) {
          setActiveImage(productData.ProductImages[0].image_url);
        } else {
          setActiveImage('');
        }

        const reviewRes = await api.get(`/api/reviews/product/${id}`);
        setReviews(reviewRes.data);
        setSelectedColor(null);
        setQuantity(1);
      } catch (error) {
        console.error('Gagal memuat data:', error);
        toast.error('Gagal memuat detail produk.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleQuantityChange = (type) => {
    if (type === 'dec' && quantity > 1) setQuantity(quantity - 1);
    if (type === 'inc') {
      if (product.ProductColors && product.ProductColors.length > 0) {
        if (!selectedColor) {
          toast.error('Silakan pilih varian terlebih dahulu!');
          return;
        }

        if (quantity < selectedColor.stock) {
          setQuantity(quantity + 1);
        } else {
          toast.error(`Stok untuk varian ${selectedColor.color_name} hanya tersisa ${selectedColor.stock}!`);
        }
      } else {
        setQuantity(quantity + 1);
      }
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Silakan login untuk belanja');
      return navigate('/login');
    }

    if (!selectedColor?.color_name) {
      toast.error('Silakan pilih varian terlebih dahulu!');
      return;
    }

    try {
      await dispatch(
        addItemToCart({
          product_id: product.product_id,
          color_name: selectedColor?.color_name || null,
          qty: quantity,
        })
      ).unwrap();

      toast.success('Berhasil masuk keranjang!');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Gagal menambahkan produk');
    }
  };

  const getFullImageUrl = (path) => {
    return path ? `${BASE_URL}${path}` : 'https://via.assets.so/img.jpg?w=300&h=300&bg=e5e7eb&f=png';
  };

  const getAvatarUrl = (path) => {
    if (!path) return 'https://via.assets.so/img.jpg?w=100&h=100&bg=e5e7eb&f=png';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BASE_URL}/${cleanPath}`;
  };

  const [reviewPage, setReviewPage] = useState(1);
  const reviewsPerPage = 5;

  // Hitung Index
  const indexOfLastReview = reviewPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalReviewPages = Math.ceil(reviews.length / reviewsPerPage);

  // Handler Ganti Halaman
  const paginateReviews = (pageNumber) => setReviewPage(pageNumber);

  // --- Scroll Logic ---
  const reviewsHeaderRef = useRef(null);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (reviewsHeaderRef.current) {
      reviewsHeaderRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [reviewPage]);

  if (loading) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex justify-center items-center">Produk tidak ditemukan.</div>;

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : 0;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  return (
    <div className="bg-cream min-h-screen pt-6 pb-10">
      <div className="container mx-auto max-w-full px-4 md:px-12">
        <Link to="/products" className="inline-flex items-center text-gray-500 hover:text-primary mb-6 transition">
          <FaArrowLeft className="mr-2" /> Kembali ke Katalog
        </Link>

        {/* Bagian produk */}
        <div className="bg-cream-2 rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="grid grid-cols-1 md:grid-cols-[500px_1fr] gap-0 md:gap-4">
            {/* Product Image */}
            <div className="p-3 bg-cream-2 flex flex-col items-center justify-center">
              <div className="w-full aspect-square bg-cream-2 rounded-xl overflow-hidden shadow-sm mb-4 border border-gray-200">
                <img src={getFullImageUrl(activeImage)} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>

              {/* Thumbnails */}
              {product.ProductImages && product.ProductImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto w-full py-1 justify-center">
                  {product.ProductImages.map((img, idx) => (
                    <button
                      key={img.product_image_id || idx}
                      onClick={() => setActiveImage(img.image_url)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border shrink-0 cursor-pointer transition-all ${activeImage === img.image_url ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-600'}`}
                    >
                      <img src={getFullImageUrl(img.image_url)} className="w-full h-full object-cover" alt="thumb" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informasi Produk */}
            <div className="px-3 py-6 flex flex-col">
              <span className=" text-primary font-semibold text-xs md:text-sm uppercase tracking-wider mb-2">{product.category || 'Handicraft'}</span>
              <h1 className="text-lg md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

              {/* Rating Singkat */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  <FaStar />
                </div>
                <span className="font-medium text-gray-700">{avgRating > 0 ? avgRating : 'New'}</span>
                <span className="text-gray-400 text-sm">( {reviews.length} Ulasan )</span>
              </div>

              <div className="text-lg md:text-2xl font-bold text-primary mb-3">{formatRupiah(product.price)}</div>

              <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-8">{product.description}</p>
              <div className="mb-3">
                <p className="text-xs md:text-sm font-medium text-gray-500">
                  Dimensi:{' '}
                  <span className="text-sm">
                    {product.size_length} x {product.size_width} x {product.size_height} cm
                  </span>
                </p>
              </div>

              {/* Pilihan warna / varian */}
              {product.ProductColors && product.ProductColors.length > 0 && (
                <div className="mb-5">
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-2">
                    Pilih Varian: <span className="text-primary font-medium">{selectedColor ? `${selectedColor.color_name} - Tersedia ${selectedColor.stock} Produk` : ''}</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {product.ProductColors.map((color) => (
                      <button
                        key={color.product_color_id}
                        onClick={() => setSelectedColor(color)}
                        disabled={color.stock <= 0}
                        className={`px-4 py-2 cursor-pointer rounded-full border text-xs md:text-sm font-medium transition-all active:scale-90 ${
                          selectedColor?.product_color_id === color.product_color_id ? 'bg-primary text-black border-primary shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                        } ${color.stock <= 0 ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                      >
                        {color.color_name}
                      </button>
                    ))}
                  </div>
                  {!selectedColor && <p className="text-red-500 text-[10px] md:text-xs mt-2">* Wajib dipilih</p>}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-auto flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                {/* Quantity */}
                <div className="bg-cream flex items-center border border-gray-300 rounded-full w-max h-8 md:h-10">
                  <button onClick={() => handleQuantityChange('dec')} className="cursor-pointer w-8 h-8 md:h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-l-full active:scale-90">
                    <FaMinus size={12} />
                  </button>
                  <span className="w-10 text-center font-bold text-gray-800">{quantity}</span>
                  <button onClick={() => handleQuantityChange('inc')} className="cursor-pointer w-8 h-8 md:h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-r-full active:scale-90">
                    <FaPlus size={12} />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="text-sm md:text-base w-full h-9 md:h-10 bg-gray-200 text-gray-800 font-bold rounded-full shadow-sm shadow-primary/30 hover:bg-[#ffc343] transition-all flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer"
                >
                  <FaShoppingCart />
                  Tambah ke Keranjang
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] gap-6">
          {/* Rekomendasi Produk */}
          <SimilarProductsByID currentProductId={id} />

          {/* --- (Ulasan Produk) --- */}
          <div ref={reviewsHeaderRef} className="bg-cream-2 rounded-2xl shadow-sm border border-gray-100 p-3 md:p-5 mb-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              Ulasan Pembeli <span className="text-gray-400 text-lg md:text-xl font-normal">({reviews.length})</span>
            </h3>

            {reviews.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-xl">
                <p className="text-gray-500">Belum ada ulasan untuk produk ini.</p>
                <p className="text-sm text-gray-400 mt-1">Jadilah yang pertama memberikan ulasan!</p>
              </div>
            ) : (
              <>
                {/* List Review*/}
                <div className="space-y-6">
                  {currentReviews.map((review) => (
                    <div key={review.review_id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0 ">
                      <div className="flex items-start gap-4">
                        {/* Foto Profil */}
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-gray-200 shrink-0 border border-primary/20">
                          <img src={getAvatarUrl(review.User?.profile_pic) || `https://ui-avatars.com/api/?name=${review.User?.username || 'User'}`} alt="user" className="w-full h-full object-cover" />
                        </div>

                        {/* Konten Review */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-gray-800 text-sm md:text-base">{review.User?.username || 'Pengguna'}</h4>
                              <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            {/* Bintang */}
                            <div className="flex text-yellow-400 text-xs md:text-sm gap-1">
                              {[...Array(5)].map((_, i) => (
                                <FaStar key={i} className={i < review.rating ? 'fill-current' : 'text-gray-200'} />
                              ))}
                            </div>
                          </div>

                          <p className="text-gray-600 mt-2 text-sm md:text-base leading-relaxed">"{review.comment}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* KONTROL PAGINATION */}
                {totalReviewPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    {/* Tombol Previous */}
                    <button
                      onClick={() => paginateReviews(reviewPage - 1)}
                      disabled={reviewPage === 1}
                      className="cursor-pointer px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 text-sm text-gray-600 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>

                    {/* Angka Halaman */}
                    {[...Array(totalReviewPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginateReviews(i + 1)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors cursor-pointer ${reviewPage === i + 1 ? 'bg-gray-300 text-gray-900' : 'text-gray-700 hover:bg-gray-200'}`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    {/* Tombol Next */}
                    <button
                      onClick={() => paginateReviews(reviewPage + 1)}
                      disabled={reviewPage === totalReviewPages}
                      className="cursor-pointer px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 text-sm text-gray-600 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
