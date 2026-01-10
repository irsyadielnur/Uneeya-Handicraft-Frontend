import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

import toast from 'react-hot-toast';
import uneeyaIcon from '../../assets/icons/uneeya.png';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { FaUsers, FaChartLine, FaStore, FaComments } from 'react-icons/fa';
import { io } from 'socket.io-client'; // Import Socket
import notifSound from '../../assets/sounds/mixkit-positive-notification-951.wav';

const AdminLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isOwner = user?.role_id === 4;

  const canAccessProducts = [2, 4].includes(user?.role_id);
  const canAccessCustomers = [2, 4].includes(user?.role_id);
  const canAccessChat = [2, 4].includes(user?.role_id);
  const canAccessOrders = [3, 4].includes(user?.role_id);
  const canAccessReports = [3, 4].includes(user?.role_id);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Admin berhasil logout');
    window.location.href = '/login';
  };

  const getAvatarUrl = (path) => {
    if (!path) return 'https://via.assets.so/img.jpg?w=100&h=100&bg=e5e7eb&f=png';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BASE_URL}/${cleanPath}`;
  };

  useEffect(() => {
    const socket = io(BASE_URL);
    socket.on('update_room_list', () => {
      const audio = new Audio(notifSound);
      audio.play().catch((e) => console.log('Audio play failed', e));
      if (location.pathname !== '/admin/chat') {
        toast('Ada pesan baru dari pelanggan!', {
          icon: '🔔',
          duration: 4000,
          position: 'top-right',
          style: {
            border: '1px solid #3B82F6',
            background: '#fffefa',
            color: '#2b2b2b',
            fontWeight: 500,
          },
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* --- SIDEBAR --- */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-13'} bg-gray-900 text-white transition-all duration-300 ease-in-out flex flex-col shadow-xl z-20`}>
        <div className="h-15 flex items-center justify-center border-b border-gray-800">
          {isSidebarOpen ? <h1 className="text-xl font-bold text-yellow-400 tracking-wider transition-all duration-300 ease-in-out">Uneeya Admin</h1> : <img src={uneeyaIcon} alt="" className="w-8 h-8" />}
        </div>

        <nav className="flex-1 py-2 space-y-2 overflow-y-auto">
          {/* Dashboard */}
          <Link
            to="/admin/dashboard"
            className={`flex items-center px-4 py-3 transition-colors ${isActive('/admin/dashboard') ? 'bg-gray-800 text-yellow-400 border-r-4 border-yellow-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              ></path>
            </svg>
            <span className={`ml-3 font-medium whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Dashboard</span>
          </Link>

          {/* Produk */}
          {canAccessProducts && (
            <Link
              to="/admin/products"
              className={`flex items-center px-4 py-3 transition-colors ${location.pathname.startsWith('/admin/products') ? 'bg-gray-800 text-yellow-400 border-r-4 border-yellow-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
              <span className={`ml-3 font-medium whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Kelola Produk</span>
            </Link>
          )}

          {/* Pesanan */}
          {canAccessOrders && (
            <Link
              to="/admin/orders"
              className={`flex items-center px-4 py-3 transition-colors ${location.pathname.startsWith('/admin/orders') ? 'bg-gray-800 text-yellow-400 border-r-4 border-yellow-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                ></path>
              </svg>
              <span className={`ml-3 font-medium whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Kelola Pesanan</span>
            </Link>
          )}

          {/* Customer */}
          {canAccessCustomers && (
            <Link
              to="/admin/customers"
              className={`flex items-center px-4 py-3 transition-colors ${location.pathname.startsWith('/admin/customers') ? 'bg-gray-800 text-yellow-400 border-r-4 border-yellow-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <FaUsers className="w-5 h-5 shrink-0" />
              <span className={`ml-3 font-medium whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Data Pelanggan</span>
            </Link>
          )}

          {/* Report */}
          {canAccessReports && (
            <Link
              to="/admin/reports"
              className={`flex items-center px-4 py-3 transition-colors ${location.pathname.startsWith('/admin/reports') ? 'bg-gray-800 text-yellow-400 border-r-4 border-yellow-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <FaChartLine className="w-5 h-5 shrink-0" />
              <span className={`ml-3 font-medium whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Laporan Penjualan</span>
            </Link>
          )}

          {/* Pengaturan Toko */}
          {isOwner && (
            <Link
              to="/admin/settings"
              className={`flex items-center px-4 py-3 transition-colors ${location.pathname.startsWith('/admin/settings') ? 'bg-gray-800 text-yellow-400 border-r-4 border-yellow-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <FaStore className="w-5 h-5 shrink-0" />
              <span className={`ml-3 font-medium whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Pengaturan Toko</span>
            </Link>
          )}

          {canAccessChat && (
            <Link
              to="/admin/chat"
              className={`flex items-center px-4 py-3 border-t-2 transition-colors ${
                location.pathname.startsWith('/admin/chat') ? 'bg-gray-800 text-yellow-400 border-r-4 border-yellow-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <FaComments className="w-5 h-5 shrink-0" />
              <span className={`ml-3 font-medium whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Live Chat</span>
              {/* Opsional: Badge Notifikasi (Bisa dikembangkan nanti) */}
              {/* <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">New</span> */}
            </Link>
          )}
        </nav>
      </aside>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-15 bg-cream shadow-sm flex items-center justify-between px-6 z-10">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-gray-100 text-gray-600 cursor-pointer transition-all duration-100 active:scale-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <div className="flex items-center gap-4">
            <div className="relative text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800">{user?.username || 'Admin'}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <Menu as="div" className="relative inline-block">
              <MenuButton className="btn-icon">
                <img src={getAvatarUrl(user?.profile_pic)} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-gray-200" />
              </MenuButton>
              <MenuItems
                transition
                className="absolute right-0 z-20 mt-2 w-56 origin-top-right divide-y divide-gray-300 rounded-md bg-cream-2 shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
                <div className="py-1">
                  <MenuItem>
                    <Link to="/" className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden active:scale-95">
                      Halaman Web
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden active:scale-95">
                      Profile
                    </Link>
                  </MenuItem>
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
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-linear-to-r from-blue-300 to-[#fffefa] p-5">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
