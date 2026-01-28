import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice';
import { FaFilter, FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import ProductCard from '../components/ProductCard';
import MyRecommendations from '../components/MyRecommendations';

const Catalog = () => {
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { items: products, isLoading } = useSelector((state) => state.products);

  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    if (keyword) {
      dispatch(fetchProducts({ search: keyword }));
    } else {
      dispatch(fetchProducts());
    }
  }, [keyword, dispatch]);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Sorting
    if (sortOption === 'price-low') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOption === 'price-high') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortOption === 'rating') {
      result.sort((a, b) => (parseFloat(b.rating_avg) || 0) - (parseFloat(a.rating_count) || 0));
    }

    return result;
  }, [products, selectedCategory, sortOption]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortOption]);

  const sortedCategories = useMemo(() => {
    const uniqueCats = ['All', ...new Set(products.map((p) => p.category || 'Uncategorized'))];

    return uniqueCats.sort((a, b) => {
      if (a === 'All') return -1;
      if (b === 'All') return 1;
      if (a === 'Lainnya') return 1;
      if (b === 'Lainnya') return -1;
      return a.localeCompare(b);
    });
  }, [products]);

  const sortLabels = {
    default: 'Paling Baru',
    'price-low': 'Harga: Rendah ke Tinggi',
    'price-high': 'Harga: Tinggi ke Rendah',
    rating: 'Rating Tertinggi',
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-cream min-h-screen px-4 md:px-8 lg:px-12 py-8">
      <div className="container mx-auto">
        {/* Header Halaman */}
        <div className="mb-4 md:mb-8 text-center md:text-left mt-5 md:mt-0">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800">Katalog Produk</h1>
          <p className="text-sm md:text-base text-gray-500 mt-2">Temukan kerajinan tangan terbaik pilihan kami.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* --- SIDEBAR CATEGORY --- */}
          <aside className="w-full md:w-60 shrink-0">
            <div className="bg-cream-2 p-6 rounded-xl shadow-sm border border-gray-400 sticky top-28">
              <div className="flex items-center gap-2 mb-4 border-b pb-2">
                <FaFilter className="text-primary" />
                <h3 className="font-bold text-gray-800">Kategori</h3>
              </div>
              <ul className="flex flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 space-y-0">
                {sortedCategories.map((cat, index) => (
                  <li key={index} className="shrink-0">
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 cursor-pointer rounded-lg text-sm transition-colors whitespace-nowrap ${selectedCategory === cat ? 'bg-primary text-black font-medium' : 'text-gray-600 hover:bg-blue-200'}`}
                      style={selectedCategory === cat ? { backgroundColor: '#ffc343' } : {}}
                    >
                      {cat}
                      <span className="ml-2 float-right text-xs opacity-70">{cat === 'All' ? products.length : products.filter((p) => p.category === cat).length}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* --- MAIN CONTENT --- */}
          <main className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-cream-2 py-2 md:py-3 px-5 rounded-xl shadow-sm border border-gray-400 mb-6">
              <p className="text-gray-500 text-xs md:text-sm mb-2 sm:mb-0">
                Menampilkan{' '}
                <span className="font-bold text-gray-800">
                  {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredProducts.length)}
                </span>{' '}
                dari {filteredProducts.length} produk
              </p>

              <div className="flex items-center gap-2 relative">
                <label className="text-xs md:text-sm text-gray-600">Urutkan:</label>
                <div className="relative flex-1 sm:flex-none">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-between gap-2 border border-gray-300 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 cursor-pointer focus:ring-primary/50 bg-white min-w-45"
                  >
                    <span className="text-gray-700 text-xs md:text-sm">{sortLabels[sortOption]}</span>
                    <FaChevronDown className={`text-xs text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Menu Dropdown Custom */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-full min-w-50 bg-white border border-gray-100 rounded-lg shadow-lg z-50 overflow-hidden">
                      <ul className="py-1">
                        {Object.entries(sortLabels).map(([value, label]) => (
                          <li
                            key={value}
                            onClick={() => {
                              setSortOption(value);
                              setIsDropdownOpen(false);
                            }}
                            className={`px-4 py-2 text-xs md:text-sm cursor-pointer transition-colors ${sortOption === value ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 hover:bg-[#ffc343] hover:text-gray-800'}`}
                          >
                            {label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="text-center py-20">Loading produk...</div>
            ) : currentProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl">
                <p className="text-gray-500">Tidak ada produk ditemukan di kategori ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {currentProducts.map((product) => (
                  <ProductCard key={product.product_id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center items-center gap-2 flex-wrap">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 border rounded-md cursor-pointer hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                  <FaChevronLeft className="text-gray-600" />
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`px-3 py-1 md:px-4 md:py-2 cursor-pointer rounded-md font-medium text-xs md:text-sm transition-colors ${
                      currentPage === i + 1 ? 'btn-color text-gray-800' : 'border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                    style={currentPage === i + 1 ? { backgroundColor: '#ffc343' } : {}}
                  >
                    {i + 1}
                  </button>
                ))}

                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 border cursor-pointer rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
                  <FaChevronRight className="text-gray-600" />
                </button>
              </div>
            )}
          </main>
        </div>

        {/* Rekomendasi Produk */}
        <div className="mb-6">
          <MyRecommendations />
        </div>
      </div>
    </div>
  );
};

export default Catalog;
