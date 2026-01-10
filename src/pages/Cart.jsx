import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, updateCartItemQty, removeCartItem } from '../redux/slices/cartSlice';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

import MyRecommendations from '../components/MyRecommendations';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems, status } = useSelector((state) => state.cart || { items: [] });
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const subTotal = cartItems.reduce((acc, item) => acc + Number(item.price) * item.qty, 0);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const handleQty = (cart_id, currentQty, type) => {
    if (type === 'dec' && currentQty > 1) {
      dispatch(updateCartItemQty({ cart_id, qty: currentQty - 1 }))
        .unwrap()
        .catch((err) => toast.error(err.message || 'Gagal update stok'));
    }
    if (type === 'inc') {
      dispatch(updateCartItemQty({ cart_id, qty: currentQty + 1 }))
        .unwrap()
        .catch((err) => toast.error(err.message || 'Stok tidak cukup'));
    }
  };

  const handleRemove = (cart_id) => {
    Swal.fire({
      title: 'Hapus Produk?',
      text: 'Apakah Anda yakin ingin menghapus produk ini dari keranjang?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      // reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(removeCartItem(cart_id))
          .unwrap()
          .then(() => {
            toast.success('Produk berhasil dihapus', { duration: 2000 });
          })
          .catch((err) => {
            toast.error(err.message || 'Gagal menghapus produk');
          });
      }
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast('Keranjangmu kosong, yuk belanja dulu!', { icon: '🛒' });
      navigate('/products');
    } else {
      navigate('/checkout');
    }
  };

  const getImageUrl = (item) => {
    if (item.Product?.ProductImages && item.Product.ProductImages.length > 0) {
      return `${BASE_URL}${item.Product.ProductImages[0].image_url}`;
    }
    return 'https://via.assets.so/img.jpg?w=300&h=300&bg=fce7f3&f=png';
  };

  if (status === 'loading' && cartItems.length === 0) {
    return <div className="min-h-screen pt-24 text-center">Memuat keranjang...</div>;
  }

  return (
    <div className="min-h-screen bg-cream pt-6 pb-10 px-4 md:px-12 mt-5 md:mt-0">
      <h1 className="text-xl text-center md:text-left md:text-3xl font-bold text-gray-900 mb-4 md:mb-8 w-full border-b-2 border-gray-500 inline-block pb-1 md:pb-4">Keranjang Belanja Mu</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* --- KOLOM KIRI: LIST PRODUK --- */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-20 bg-cream rounded-xl border border-blue-200">
              <p className="text-gray-500 text-lg">Wah, keranjangmu masih kosong nih.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.cart_id} className="flex flex-row items-center bg-cream-2 py-2 px-2 md:px-4 rounded-xl border border-gray-800 shadow-sm gap-3 sm:gap-4 hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
                {/* Image */}
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-300 rounded-md overflow-hidden shrink-0 border border-gray-500 active:scale-95">
                  <Link to={`/product/${item.product_id}`}>
                    <img src={getImageUrl(item)} alt={item.product_name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </Link>
                </div>

                <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between min-w-0">
                  {/* Info */}
                  <div className="flex-1 text-left mb-2 sm:mb-0">
                    <Link to={`/product/${item.product_id}`}>
                      <h3 className="font-bold text-sm sm:text-lg text-gray-800 pb-1">{item.product_name}</h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Warna: {item.color_name}</p>
                    <p className="text-sm sm:text-base text-gray-600 font-semibold">{formatRupiah(item.price)}</p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6">
                    {/* Quantity */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQty(item.cart_id, item.qty, 'dec')}
                        disabled={item.qty <= 1}
                        className="w-7 h-7 sm:w-auto sm:h-auto flex items-center justify-center p-1 bg-white  border border-gray-300 rounded text-gray-600 hover:text-black disabled:opacity-30 cursor-pointer active:scale-90"
                      >
                        <FaMinus className="text-[10px] sm:text-[16px]" />
                      </button>

                      <span className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-yellow-400 font-bold rounded text-xs sm:text-base border border-black">{item.qty}</span>

                      <button
                        onClick={() => handleQty(item.cart_id, item.qty, 'inc')}
                        className="w-7 h-7 sm:w-auto sm:h-auto flex items-center justify-center p-1 bg-white border border-gray-300 rounded text-gray-600 hover:text-black cursor-pointer active:scale-90"
                      >
                        <FaPlus className="text-[10px] sm:text-[16px]" />
                      </button>
                    </div>

                    {/* Delete */}
                    <button onClick={() => handleRemove(item.cart_id)} className="text-gray-500 hover:text-red-600 transition cursor-pointer active:scale-90 p-1 sm:p-0" aria-label="Hapus produk">
                      <FaTrash className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- KOLOM KANAN --- */}
        <div className="lg:col-span-1">
          <div className="bg-cream-2 border border-black rounded-xl p-3 md:p-5 shadow-sm sticky top-30">
            <h2 className="text-lg md:text-xl font-bold text-center mb-2 md:mb-4 tracking-wider">Ringkasan Pesanan</h2>
            <div>
              {cartItems.length === 0 ? (
                <p>Belum ada produk...</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.cart_id} className="text-xs mb-3 border-t">
                    <p className="text-gray-900 py-2">{item.product_name}</p>
                    <p className="justify-self-end">
                      {item.qty} x {formatRupiah(item.price)}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 space-y-2 text-sm font-bold">
              <div className="flex justify-between text-sm md:text-lg pt-2 border-t border-black/20">
                <span>Total Harga :</span>
                <span>{formatRupiah(subTotal)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="inline-flex justify-center text-sm md:text-lg w-full btn-color text-black font-bold py-2 rounded-full mt-3 border border-[#fffcec] cursor-pointer hover:border-black shadow-md transition-transform active:scale-90"
            >
              Pesan Sekarang
            </button>
          </div>
        </div>
      </div>

      <MyRecommendations />
    </div>
  );
};

export default Cart;
