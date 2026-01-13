import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layouts/AdminLayout';
import { getImageUrl } from '../../utils/imageHelper';
import api from '../../config/api';
import { FaStar, FaArrowLeft } from 'react-icons/fa';

const AdminProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Product Info
        const productRes = await api.get(`/api/products/${id}`);
        setProduct(productRes.data);

        // Fetch Product Reviews
        const reviewRes = await api.get(`/api/reviews/product/${id}`);
        setReviews(reviewRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getAvatarUrl = (path) => {
    if (!path) return 'https://via.assets.so/img.jpg?w=100&h=100&bg=e5e7eb&f=png';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BASE_URL}/${cleanPath}`;
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="p-6">Memuat detail...</div>
      </AdminLayout>
    );
  if (!product)
    return (
      <AdminLayout>
        <div className="p-6">Produk tidak ditemukan</div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="mb-6">
        <button onClick={() => navigate('/admin/products')} className="flex items-center text-gray-500 hover:text-gray-800 mb-4 cursor-pointer active:scale-95">
          <FaArrowLeft className="mr-2" /> Kembali ke Daftar Produk
        </button>
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">{product.name}</h2>
          <Link to={`/admin/products/edit/${product.product_id}`} className="shrink-0 bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600">
            Edit Produk
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* --- Bagian Kiri: Informasi Produk --- */}
        <div className="lg:col-span-2 bg-cream p-6 rounded-lg shadow">
          <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
            {product.ProductImages?.map((img, idx) => (
              <img key={idx} src={getImageUrl(img.image_url)} alt="Produk" className="w-32 h-32 object-cover rounded border" />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-gray-500">Harga Jual</p>
              <p className="text-lg font-bold text-green-600">Rp {product.price.toLocaleString()}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500">Kategori</p>
              <p className="font-medium bg-gray-100 inline-block px-2 rounded">{product.category}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500">Karakter Unik</p>
              <p>{product.unique_character}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500">Dimensi</p>
              <p>
                {product.size_length} x {product.size_width} x {product.size_height} cm
              </p>
            </div>
          </div>
          <div className="mt-6">
            <p className="font-semibold text-gray-500 mb-2">Deskripsi</p>
            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded whitespace-pre-wrap">{product.description}</p>
          </div>
        </div>

        {/* --- Bagian Kanan: Statistik Stok --- */}
        <div className="bg-cream p-6 rounded-lg shadow h-fit">
          <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Variasi & Stok</h3>
          <ul className="space-y-3">
            {product.ProductColors?.map((color, idx) => (
              <li key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="font-medium text-gray-700">{color.color_name}</span>
                <span className={`px-2 py-1 text-xs font-bold rounded ${color.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>Stok: {color.stock}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* --- BAGIAN REVIEW / ULASAN --- */}
      <div className="bg-cream rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              Ulasan Pelanggan
              <span className="text-sm bg-white border border-blue-200 text-blue-600 px-2 py-0.5 rounded-full">{reviews.length}</span>
            </h3>
            <p className="text-sm text-gray-500 mt-1">Daftar ulasan yang masuk untuk produk ini</p>
          </div>
          {/* Menghitung Rata-rata Rating */}
          <div className="text-right">
            <div className="flex items-center gap-1 text-yellow-500 text-xl font-bold">
              <FaStar />
              <span>{reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : '0.0'}</span>
              <span className="text-gray-400 text-sm font-normal">/ 5.0</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {reviews.length === 0 ? (
            <div className="bg-cream p-8 text-center text-gray-400 italic">Belum ada ulasan untuk produk ini.</div>
          ) : (
            reviews.map((review) => (
              <div key={review.review_id} className="bg-cream p-6 flex gap-4 hover:bg-gray-100 transition-colors">
                {/* Avatar User */}
                <div className="shrink-0">
                  <img src={getAvatarUrl(review.User?.profile_pic)} alt="User" className="w-12 h-12 rounded-full object-cover border" />
                </div>
                {/* Konten Review */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-800">{review.User?.username}</h4>
                    <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex text-yellow-400 text-sm mb-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < review.rating ? 'fill-current' : 'text-gray-300'} />
                    ))}
                  </div>
                  <p className="text-gray-600 italic">"{review.comment}"</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProductDetail;
