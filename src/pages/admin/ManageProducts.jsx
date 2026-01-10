import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FaSearch, FaExclamationCircle, FaUserTag, FaEye, FaBoxOpen, FaEyeSlash } from 'react-icons/fa';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products/admin/list');
      setProducts(response.data);
    } catch (error) {
      toast.error('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ubah status active atau non active
  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/api/products/${id}`, { is_active: !currentStatus });
      toast.success(currentStatus ? 'Produk disembunyikan' : 'Produk ditampilkan');
      fetchProducts();
    } catch (error) {
      toast.error('Gagal update status');
    }
  };

  // ubah custom ke regular
  const makeRegular = async (product) => {
    Swal.fire({
      title: 'Ingin jadikan produk reguler?',
      text: 'Produk akan jadi regular permanen!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#00c950',
      confirmButtonText: 'Ya',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.put(`/api/products/${product.product_id}`, {
            is_custom: false,
            is_active: true,
          });
          toast.success('Berhasil diubah menjadi Produk Regular');
          fetchProducts();
        } catch (error) {
          toast.error('Gagal mengubah tipe produk');
        }
      }
    });
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Yakin hapus produk ini?',
      text: 'Produk anda akan dihapus permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#2186b5',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/api/products/${id}`);
          toast.success('Produk berhasil dihapus');
          fetchProducts();
        } catch (error) {
          toast.error('Gagal menghapus produk');
        }
      }
    });
  };

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Kelola Produk</h2>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Cari nama produk..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <Link to="/admin/products/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded shadow flex items-center cursor-pointer active:scale-95">
            <span className="mr-2 font-bold text-lg leading-none">+</span> Tambah Produk
          </Link>
        </div>
      </div>

      <div className="bg-cream rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-100 text-gray-700 uppercase text-sm font-semibold">
                <th className="px-4 py-2 border-b">Info Produk</th>
                <th className="px-4 py-2 border-b text-center">Tipe</th>
                <th className="px-4 py-2 border-b text-center">Status</th>
                <th className="px-4 py-2 border-b text-center">Harga & Stok</th>
                <th className="px-4 py-2 border-b text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500 italic">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400 flex-col">
                    <p>Belum ada produk</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const totalStock = product.ProductColors?.reduce((sum, color) => sum + color.stock, 0) || 0;
                  const isOutOfStock = totalStock === 0;

                  return (
                    <tr key={product.product_id} className={`hover:bg-gray-50 transition-colors ${isOutOfStock ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-2 flex items-center gap-3 max-w-lg">
                        <img
                          src={product.ProductImages?.[0]?.image_url ? `${BASE_URL}${product.ProductImages[0].image_url}` : 'https://via.assets.so/img.jpg?w=100&h=100&bg=fce7f3&f=png'}
                          alt={product.name}
                          className={`w-12 h-12 object-cover rounded border border-gray-200 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
                        />
                        <div className="flex flex-col">
                          <p className={`font-md font-semibold text-gray-800 line-clamp-1 ${isOutOfStock ? 'text-gray-500' : 'text-gray-800'}`}>{product.name}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-700">{product.category}</p>
                            {/* Label HABIS */}
                            {isOutOfStock && <span className="w-fit text-[10px] text-red-600 font-bold border border-red-200 bg-white px-1.5 py-0.5 rounded shadow-sm">HABIS</span>}
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-2 text-center">
                        {product.is_custom ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200">
                            <FaUserTag /> Custom
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                            <FaBoxOpen /> Regular
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => toggleStatus(product.product_id, product.is_active)}
                          className={`flex items-center justify-center w-8 h-8 rounded-full mx-auto transition cursor-pointer active:scale-95 ${
                            product.is_active ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-100 text-red-500 hover:bg-red-200'
                          }`}
                          title={product.is_active ? 'Klik untuk sembunyikan' : 'Klik untuk tampilkan'}
                        >
                          {product.is_active ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
                        </button>
                      </td>

                      <td className="px-3 py-2 align-middle">
                        <div className="flex justify-between items-center gap-3">
                          <p className="font-sm text-gray-800">Rp {product.price.toLocaleString()}</p>
                          <div className="flex items-center gap-2">
                            {isOutOfStock && <FaExclamationCircle className="text-red-500 animate-pulse" title="Stok Habis, Perlu Restock!" />}
                            <p className={`text-sm text-gray-500 ${isOutOfStock ? 'text-red-600 font-bold' : 'text-gray-700'}`}>{totalStock}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-2 align-middle">
                        <div className="flex justify-center items-center gap-3">
                          {product.is_custom && (
                            <button onClick={() => makeRegular(product)} className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded shadow-sm cursor-pointer" title="Ubah jadi Produk Regular">
                              Jadikan Regular
                            </button>
                          )}
                          <Link to={`/admin/products/${product.product_id}`} className="text-teal-600 cursor-pointer active:scale-95 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 p-2 rounded" title="Lihat Detail & Review">
                            👁️
                          </Link>
                          <Link to={`/admin/products/edit/${product.product_id}`} className="text-yellow-600 cursor-pointer active:scale-95 hover:text-yellow-800 bg-yellow-50 hover:bg-yellow-100 p-2 rounded" title="Edit">
                            ✏️
                          </Link>
                          <button onClick={() => handleDelete(product.product_id)} className="text-red-600 cursor-pointer active:scale-95 hover:text-red-800 bg-red-50 hover:bg-red-100 p-2 rounded" title="Hapus">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageProducts;
