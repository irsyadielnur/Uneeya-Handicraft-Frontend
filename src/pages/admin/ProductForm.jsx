import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { FaUpload, FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';

const ProductForm = () => {
  const { id } = useParams(); // Jika ada ID, berarti mode Edit
  const navigate = useNavigate();
  const isEditMode = !!id;
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    unique_character: '',
    price: '',
    capital: '',
    profit: '',
    weight: '',
    size_length: '',
    size_width: '',
    size_height: '',
    materials: [],
    colors: [],
  });

  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/api/products/${id}`);
          setFormData({
            name: data.name,
            category: data.category,
            description: data.description,
            unique_character: data.unique_character,
            price: data.price,
            capital: data.capital,
            profit: data.profit,
            weight: data.weight,
            size_length: data.size_length,
            size_width: data.size_width,
            size_height: data.size_height,
            materials: data.ProductMaterials?.map((m) => m.material_name) || [],
            colors: data.ProductColors?.map((c) => ({ name: c.color_name, stock: c.stock })) || [],
          });
          setExistingImages(
            data.ProductImages?.map((img) => ({
              id: img.product_image_id,
              url: img.image_url,
            })) || []
          );
        } catch (error) {
          toast.error('Gagal memuat data produk');
          navigate('/admin/products');
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let newData = { ...prev, [name]: value };
      if (name === 'price' || name === 'capital') {
        const price = parseFloat(name === 'price' ? value : prev.price) || 0;
        const capital = parseFloat(name === 'capital' ? value : prev.capital) || 0;
        newData.profit = price - capital;
      }
      return newData;
    });
  };

  const handleMaterialChange = (index, value) => {
    const newMaterials = [...formData.materials];
    newMaterials[index] = value;
    setFormData({ ...formData, materials: newMaterials });
  };

  const addMaterial = () => setFormData({ ...formData, materials: [...formData.materials, ''] });
  const removeMaterial = (index) => {
    const newMaterials = formData.materials.filter((_, i) => i !== index);
    setFormData({ ...formData, materials: newMaterials });
  };

  const handleColorChange = (index, field, value) => {
    const newColors = [...formData.colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setFormData({ ...formData, colors: newColors });
  };

  const addColor = () => setFormData({ ...formData, colors: [...formData.colors, { name: '', stock: 0 }] });
  const removeColor = (index) => {
    const newColors = formData.colors.filter((_, i) => i !== index);
    setFormData({ ...formData, colors: newColors });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    const imageToDelete = existingImages[index];
    setImagesToDelete((prev) => [...prev, imageToDelete.id]);
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (['size_length', 'size_width', 'size_height', 'materials', 'colors'].includes(key)) return;
        data.append(key, formData[key]);
      });

      const sizeObj = {
        length: formData.size_length,
        width: formData.size_width,
        height: formData.size_height,
      };
      data.append('size', JSON.stringify(sizeObj));
      data.append('materials', JSON.stringify(formData.materials));
      data.append('colors', JSON.stringify(formData.colors));

      images.forEach((file) => {
        data.append('images', file);
      });

      if (isEditMode && imagesToDelete.length > 0) {
        data.append('images_to_delete', JSON.stringify(imagesToDelete));
      }
      if (isEditMode) {
        await api.put(`/api/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Produk berhasil diperbarui');
      } else {
        await api.post('/api/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Produk berhasil ditambahkan');
      }
      navigate('/admin/products');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/admin/products')} className="flex items-center gap-3 mr-4 text-gray-500 hover:text-gray-800 cursor-pointer active:scale-95">
          <FaArrowLeft size={20} />
          <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-cream p-6 rounded-lg shadow space-y-6">
        {/* --- FORM UTAMA (Sama seperti sebelumnya) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Informasi Utama</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="bg-white w-full border rounded px-3 py-2" placeholder="Nama Produk" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select name="category" required value={formData.category} onChange={handleChange} className="bg-white w-full border rounded px-3 py-2">
                <option value="">Pilih Kategori</option>
                <option value="Boneka">Boneka</option>
                <option value="Gantungan Kunci">Gantungan Kunci</option>
                <option value="Cardigan">Cardigan</option>
                <option value="Tas & Dompet">Tas & Dompet</option>
                <option value="Penutup Kepala">Penutup Kepala</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Karakter Unik</label>
              <input type="text" name="unique_character" value={formData.unique_character} onChange={handleChange} className="bg-white w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea name="description" rows="4" required value={formData.description} onChange={handleChange} className="bg-white w-full border rounded px-3 py-2"></textarea>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Harga & Dimensi</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual (Rp)</label>
                <input type="number" name="price" required value={formData.price} onChange={handleChange} className="bg-white w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Berat (gram)</label>
                <input type="number" name="weight" required value={formData.weight} onChange={handleChange} className="bg-white w-full border rounded px-3 py-2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modal (Rp)</label>
                <input type="number" name="capital" required value={formData.capital} onChange={handleChange} className="bg-white w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profit</label>
                <input type="number" name="profit" readOnly value={formData.profit} className="w-full border rounded px-3 py-2 bg-gray-100" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dimensi (P x L x T) cm</label>
              <div className="flex gap-2">
                <input type="number" name="size_length" placeholder="P" value={formData.size_length} onChange={handleChange} className="bg-white w-full border rounded px-2 py-2" />
                <input type="number" name="size_width" placeholder="L" value={formData.size_width} onChange={handleChange} className="bg-white w-full border rounded px-2 py-2" />
                <input type="number" name="size_height" placeholder="T" value={formData.size_height} onChange={handleChange} className="bg-white w-full border rounded px-2 py-2" />
              </div>
            </div>
          </div>
        </div>

        {/* --- MATERIAL & WARNA --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium text-gray-700">Material</label>
              <button type="button" onClick={addMaterial} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                + Tambah
              </button>
            </div>
            {formData.materials.map((mat, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input type="text" value={mat} onChange={(e) => handleMaterialChange(index, e.target.value)} className="bg-white flex-1 border rounded px-3 py-1 text-sm" />
                <button type="button" onClick={() => removeMaterial(index)} className="text-red-500 cursor-pointer active:scale-95">
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium text-gray-700">Varian Warna & Stok</label>
              <button type="button" onClick={addColor} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                + Tambah
              </button>
            </div>
            {formData.colors.map((col, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input type="text" value={col.name} onChange={(e) => handleColorChange(index, 'name', e.target.value)} placeholder="Warna" className="bg-white flex-1 border rounded px-3 py-1 text-sm" />
                <input type="number" value={col.stock} onChange={(e) => handleColorChange(index, 'stock', e.target.value)} placeholder="Stok" className="bg-white w-24 border rounded px-3 py-1 text-sm" />
                <button type="button" onClick={() => removeColor(index)} className="text-red-500 cursor-pointer active:scale-95">
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* --- GAMBAR PRODUK --- */}
        <div className="pt-4 border-t">
          <label className="font-medium text-gray-700 mb-2 block">Foto Produk</label>

          {/* 1. Tampilan Gambar Lama (Existing) */}
          {isEditMode && existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Foto Saat Ini:</p>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {existingImages.map((img, idx) => (
                  <div key={idx} className="relative shrink-0 group mt-2">
                    <img src={`${BASE_URL}${img.url}`} alt="Existing" className="w-24 h-24 object-cover rounded border" />
                    {/* Tombol Hapus Gambar Lama */}
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5 shadow hover:bg-red-600 transform scale-0 group-hover:scale-100 transition-transform duration-200 cursor-pointer active:scale-95"
                      title="Hapus foto ini"
                    >
                      <FaTrash size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Area Upload Gambar Baru */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative">
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <FaUpload className="text-gray-400 text-3xl mb-2" />
            <p className="text-sm text-gray-500">Klik atau seret foto baru ke sini</p>
          </div>

          {/* 3. Preview Gambar Baru */}
          {previewImages.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Foto Baru (Akan diupload):</p>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {previewImages.map((src, idx) => (
                  <div key={idx} className="relative shrink-0">
                    <img src={src} alt="Preview" className="w-24 h-24 object-cover rounded border" />
                    <button type="button" onClick={() => removeNewImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs shadow hover:bg-red-600">
                      <FaTrash size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- Tombol Submit --- */}
        <div className="pt-6 border-t flex justify-end">
          <button type="button" onClick={() => navigate('/admin/products')} className="mr-4 px-6 py-2 rounded text-gray-600 hover:bg-gray-100 cursor-pointer active:scale-95">
            Batal
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded shadow disabled:opacity-50 cursor-pointer active:scale-95">
            {loading ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Produk'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default ProductForm;
