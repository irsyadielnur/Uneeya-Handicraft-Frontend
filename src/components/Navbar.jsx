import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { fetchCart } from '../redux/slices/cartSlice';
import { fetchFavorites } from '../redux/slices/favoriteSlice';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { FaRegHeart, FaBars, FaTimes } from 'react-icons/fa';

import '../styles/Navbar.css';
import uneeyaLogo from '../assets/icons/uneeya.png';
import searchBtn from '../assets/icons/search.png';
import enterBtn from '../assets/icons/enter.png';
import bagBtn from '../assets/icons/bag.png';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart || { items: [] });
  const { items: favoriteItems } = useSelector((state) => state.favorites || { items: [] });
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // handle pencarian
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchFavorites());
    }
  }, [dispatch, isAuthenticated]);

  const cartCount = cartItems.reduce((acc, item) => acc + (item.qty || 0), 0);
  const favoriteCount = favoriteItems.length;

  const getAvatarUrl = (path) => {
    if (!path) return `https://avatar.iran.liara.run/public`;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BASE_URL}/${cleanPath}`;
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Anda berhasil logout');
    // navigate('/');
    window.location.href = '/';
  };

  return (
    <div className="fixed top-0 left-0 z-900 w-full bg-cream shadow-sm">
      <header className="flex h-11 w-full items-center justify-center gap-3 px-4 md:gap-6 md:px-12">
        <img src={uneeyaLogo} alt="Logo Uneeeya Handicraft" className="w-6 md:w-8" />
        <Link to="/" className="text-lg md:text-2xl font-semibold text-gray-900 truncate">
          <h1>Uneeya Handicraft</h1>
        </Link>
        <img src={uneeyaLogo} alt="Logo Uneeeya Handicraft" className="w-6 md:w-8" />
      </header>
      {/* Menu Navigasi */}

      <nav className="relative border-b border-black px-4 md:px-12 py-0">
        <div className="flex justify-between gap-4 md:grid h-10 w-full md:grid-cols-[1fr_auto_1fr] items-center">
          <button className="md:hidden text-gray-800 p-1" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={16} />}
          </button>

          <form onSubmit={handleSearch} className="hidden md:flex search-box flex-1 max-w-xs lg:max-w-md">
            <input type="search" name="search" placeholder="Cari produk...." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full" />
            <button type="submit" className="btn-icon">
              <img src={searchBtn} alt="Search Button" width={20} height={20} />
            </button>
          </form>

          <div className="hidden md:flex items-center gap-4 lg:gap-16">
            <Link to="/" className="active:scale-95">
              <h2 className="text-base text-gray-800 transition-all hover:font-semibold px-4 rounded-sm flex items-center hover:bg-[#ffc343] duration-100">Home</h2>
            </Link>
            <Link to="/products" className="active:scale-95">
              <h2 className="text-base text-gray-800 transition-all hover:font-semibold px-4 rounded-sm flex items-center hover:bg-[#ffc343] duration-100">Catalog</h2>
            </Link>
            <Link to="/about" className="active:scale-95">
              <h2 className="text-base text-gray-800 transition-all hover:font-semibold px-4 rounded-sm flex items-center hover:bg-[#ffc343] duration-100">About</h2>
            </Link>
          </div>

          <div className="flex justify-end items-center gap-3 md:gap-6 flex-1 md:flex-none">
            {isAuthenticated ? (
              <>
                <Link to="/favorite" className="relative btn-icon">
                  <FaRegHeart className="text-gray-800 w-4 h-4 md:w-6.25 md:h-6.25" />
                  {favoriteCount > 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3 md:h-4 md:w-4 items-center justify-center rounded-full bg-red-300 text-[8px] md:text-[10px] text-black font-semibold">{favoriteCount}</span>}
                </Link>

                <Link to="/cart" className="relative btn-icon">
                  <img src={bagBtn} alt="shopping bag" className="w-4 h-4 md:w-6.25 md:h-6.25" />
                  {cartCount > 0 && <span className="h-3 w-3 md:h-4 md:w-4 absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-yellow-500 text-[8px] md:text-[10px] text-black font-semibold">{cartCount}</span>}
                </Link>

                <Menu as="div" className="relative inline-block">
                  <MenuButton className="btn-icon">
                    <img src={getAvatarUrl(user?.profile_pic)} alt="profile" className="w-6 h-6 md:w-7 md:h-7 rounded-full object-cover border border-gray-200" />
                  </MenuButton>

                  <MenuItems
                    transition
                    className="absolute right-0 z-20 mt-2 w-56 origin-top-right divide-y divide-gray-300 rounded-md bg-cream-2 shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                  >
                    <div className="py-1">
                      {[2, 3, 4].includes(user?.role_id) && (
                        <MenuItem>
                          <Link to="/admin/dashboard" className="block px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 data-focus:bg-red-100 data-focus:outline-hidden active:scale-95">
                            Dashboard Admin
                          </Link>
                        </MenuItem>
                      )}
                      <MenuItem>
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden active:scale-95">
                          Profile
                        </Link>
                      </MenuItem>
                      {user?.role_id === 1 && (
                        <>
                          <MenuItem>
                            <Link to="/history" className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden active:scale-95">
                              Order
                            </Link>
                          </MenuItem>
                          <MenuItem>
                            <Link to="/favorite" className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden active:scale-95">
                              Favorite
                            </Link>
                          </MenuItem>
                          <MenuItem>
                            <Link to="/cart" className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden active:scale-95">
                              Cart
                            </Link>
                          </MenuItem>
                        </>
                      )}
                    </div>
                    <div className="py-1">
                      <MenuItem>
                        <Link onClick={handleLogout} className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden active:scale-95">
                          Logout
                        </Link>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Menu>
              </>
            ) : (
              // Tampilan pengunjung
              <Menu as="div" className="relative inline-block">
                <MenuButton className="btn-icon">
                  <img src={enterBtn} alt="Registrasi / Login Button" width={25} heigth={25} />
                </MenuButton>

                <MenuItems
                  transition
                  className="absolute right-0 z-20 mt-2 w-56 origin-top-right divide-y divide-gray-300 rounded-md bg-yellow-50 shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                >
                  <div className="py-1">
                    <MenuItem>
                      <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden active:scale-95">
                        Login
                      </Link>
                    </MenuItem>
                    <MenuItem>
                      <Link to="/register" className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden active:scale-95">
                        Register
                      </Link>
                    </MenuItem>
                  </div>
                </MenuItems>
              </Menu>
            )}
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-gray-200 mt-2">
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input type="search" placeholder="Cari produk..." className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <button type="submit" className="bg-yellow-400 p-2 rounded">
                <img src={searchBtn} width={18} />
              </button>
            </form>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm py-1 px-2 hover:bg-gray-100 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/products" className="text-sm py-1 px-2 hover:bg-gray-100 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                Catalog
              </Link>
              <Link to="/about" className="text-sm py-1 px-2 hover:bg-gray-100 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                About
              </Link>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
