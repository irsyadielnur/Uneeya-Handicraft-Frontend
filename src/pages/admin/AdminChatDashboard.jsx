import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import api from '../../config/api';
import axios from 'axios';
import AdminLayout from '../../components/layouts/AdminLayout';

import { FaUserCircle, FaPaperPlane, FaSearch, FaSmile, FaImage, FaPlusCircle, FaTimes, FaTrash, FaEllipsisV } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import defaultAvatar from '../../assets/icons/user.png';
import EmojiPicker from 'emoji-picker-react';
import notifSound from '../../assets/sounds/mixkit-positive-notification-951.wav';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminChatDashboard = () => {
  const { token, user } = useSelector((state) => state.auth);
  const [socket, setSocket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const [showEmoji, setShowEmoji] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const messagesEndRef = useRef(null);
  const selectedRoomRef = useRef(null);

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customProductData, setCustomProductData] = useState({
    name: 'Pesanan Custom',
    price: '',
    weight: 1000,
    description: 'Pesanan khusus sesuai kesepakatan chat.',
  });
  const [customImage, setCustomImage] = useState(null);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  // Setup Socket
  useEffect(() => {
    const newSocket = io(BASE_URL);
    setSocket(newSocket);
    newSocket.on('get_online_users', (usersList) => {
      setOnlineUserIds(usersList.map(String));
    });

    newSocket.on('user_status_update', ({ userId, isOnline }) => {
      setOnlineUserIds((prev) => {
        const idStr = String(userId);
        if (isOnline) {
          return [...new Set([...prev, idStr])];
        } else {
          return prev.filter((id) => id !== idStr);
        }
      });
    });

    return () => newSocket.disconnect();
  }, [token]);

  // Fetch Rooms & Listen Update
  useEffect(() => {
    if (!socket) return;
    fetchRooms();
    const handleUpdateRoomList = () => {
      fetchRooms();
    };
    socket.on('update_room_list', handleUpdateRoomList);
    return () => {
      socket.off('update_room_list', handleUpdateRoomList);
    };
  }, [socket]);

  // Logika Fetch Rooms
  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/chat-realtime/admin/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sanitizedRooms = res.data.map((room) => {
        if (selectedRoomRef.current && room.chatroom_id === selectedRoomRef.current.chatroom_id) {
          return { ...room, unread_count_admin: 0 };
        }
        return room;
      });
      setRooms(sanitizedRooms);
    } catch (err) {
      console.error('Gagal load rooms:', err);
    }
  };

  // Listener Pesan Masuk
  useEffect(() => {
    if (!socket) return;
    const handleReceiveMessage = async (newMessage) => {
      const isCurrentRoom = selectedRoomRef.current && newMessage.room_id === selectedRoomRef.current.chatroom_id;

      if (isCurrentRoom) {
        setMessages((prev) => [...prev, newMessage]);
        scrollToBottom();

        if (newMessage.sender_role === 'user') {
          const audio = new Audio(notifSound);
          audio.play().catch((e) => console.log(e));
          try {
            await axios.get(`${BASE_URL}/api/chat-realtime/admin/rooms/${newMessage.room_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (error) {
            console.error('Gagal mark read realtime', error);
          }
        }
      }
    };

    socket.on('message_deleted', (deletedId) => {
      setMessages((prev) => prev.filter((m) => m.realtime_message_id !== deletedId));
    });

    socket.on('chat_cleared', () => {
      setMessages([]);
    });

    socket.on('receive_message', handleReceiveMessage);
    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_deleted');
      socket.off('chat_cleared');
    };
  }, [socket]);

  // Saat Admin memilih salah satu chat
  const handleSelectRoom = async (room) => {
    setSelectedRoom(room);
    if (socket) {
      socket.emit('join_room', room.chatroom_id);
    }
    setRooms((prev) => prev.map((r) => (r.chatroom_id === room.chatroom_id ? { ...r, unread_count_admin: 0 } : r)));
    try {
      const res = await axios.get(`${BASE_URL}/api/chat-realtime/admin/rooms/${room.chatroom_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data.messages);
    } catch (err) {
      console.error('Gagal load pesan:', err);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setInput((prev) => prev + emojiObject.emoji);
    setShowEmoji(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedRoom) return;

    const formData = new FormData();
    formData.append('image', file);
    setIsUploading(true);

    try {
      const res = await axios.post(`${BASE_URL}/api/chat-realtime/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });

      const msgData = {
        room_id: selectedRoom.chatroom_id,
        sender_role: 'admin',
        message: res.data.url,
        type: 'image',
      };

      socket.emit('send_message', msgData);
      setMessages((prev) => [...prev, { ...msgData, createdAt: new Date().toISOString() }]);
    } catch (error) {
      alert('Gagal upload gambar');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Kirim Pesan Balasan
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedRoom) return;

    const msgData = {
      room_id: selectedRoom.chatroom_id,
      sender_role: 'admin',
      message: input,
      type: 'text',
    };

    socket.emit('send_message', msgData);
    setInput('');
    setShowEmoji(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedRoom]);

  const handleCustomInputChange = (e) => {
    setCustomProductData({ ...customProductData, [e.target.name]: e.target.value });
  };

  const handleCustomImageChange = (e) => {
    if (e.target.files[0]) setCustomImage(e.target.files[0]);
  };

  const handleCreateCustomOrder = async (e) => {
    e.preventDefault();
    if (!selectedRoom) return;

    setIsCreatingCustom(true);
    try {
      const formData = new FormData();
      formData.append('name', customProductData.name);
      formData.append('price', customProductData.price);
      formData.append('weight', customProductData.weight);
      formData.append('description', customProductData.description);
      formData.append('category', 'Pesanan Kustom');
      formData.append('capital', 0);
      formData.append('is_custom', true);
      formData.append('is_active', false);
      formData.append('assigned_user_id', selectedRoom.user.user_id);

      formData.append('size', JSON.stringify({ length: 0, width: 0, height: 0 }));
      formData.append('colors', JSON.stringify([{ name: 'Custom', stock: 1 }]));

      if (customImage) {
        formData.append('images', customImage);
      }

      const res = await api.post('/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newProductId = res.data.product_id;
      const serverImage = res.data.image_url || 'https://via.assets.so/img.jpg?w=100&h=100&bg=fce7f3&f=png';

      const customPayload = {
        id: newProductId,
        name: customProductData.name,
        price: customProductData.price,
        image: serverImage,
      };

      const msgData = {
        room_id: selectedRoom.chatroom_id,
        sender_role: 'admin',
        message: JSON.stringify(customPayload),
        type: 'custom_product',
      };
      socket.emit('send_message', msgData);
      setMessages((prev) => [...prev, { ...msgData, createdAt: new Date().toISOString() }]);

      // 3. Reset & Tutup Modal
      setShowCustomModal(false);
      setCustomProductData({ name: 'Pesanan Custom', price: '', weight: 1000, description: 'Pesanan khusus sesuai kesepakatan chat.' });
      setCustomImage(null);
      toast.success('Link custom order berhasil dikirim!');
    } catch (error) {
      console.error(error);
      toast.error('Gagal membuat pesanan custom.');
    } finally {
      setIsCreatingCustom(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!msgId) {
      toast.error('Pesan baru belum bisa dihapus (refresh halaman dulu)');
      return;
    }

    Swal.fire({
      title: 'Hapus pesan ini?',
      text: 'Pesan yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#2186b5',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/api/chat-realtime/message/${msgId}`);
          setMessages((prev) => prev.filter((m) => m.chat_realtime_id !== msgId));
          if (socket) {
            socket.emit('delete_message_event', {
              roomId: selectedRoom.chatroom_id,
              messageId: msgId,
            });
          }
        } catch (err) {
          console.error('Gagal hapus', err);
          toast.error('Gagal menghapus pesan');
        }
      }
    });
  };

  const handleClearChat = async () => {
    if (!selectedRoom) return;
    Swal.fire({
      title: 'Hapus riwayat pesan ini?',
      text: 'Semua pesan yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#2186b5',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/api/chat-realtime/room/${selectedRoom.chatroom_id}`);
          setMessages([]);
          if (socket) socket.emit('clear_chat_event', selectedRoom.chatroom_id);
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const filteredRooms = rooms.filter((room) => room.user?.username.toLowerCase().includes(searchTerm.toLowerCase()));
  const isSelectedUserOnline = selectedRoom && onlineUserIds.includes(String(selectedRoom.user?.user_id));

  return (
    <AdminLayout title="Live Chat Customer">
      <div className="flex h-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Sidebar: List Chat*/}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            <h2 className="font-bold text-gray-700 mb-2">Pesan Masuk ({rooms.length})</h2>
            <div className="relative">
              <input type="text" placeholder="Cari customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md outline-none focus:border-blue-400" />
              <FaSearch className="absolute left-2.5 top-2 text-gray-400 text-xs" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredRooms.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">Tidak ada chat ditemukan.</div>
            ) : (
              filteredRooms.map((room) => {
                const isUserOnline = onlineUserIds.includes(String(room.user?.user_id));
                return (
                  <div
                    key={room.chatroom_id}
                    onClick={() => handleSelectRoom(room)}
                    className={`relative p-3 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-blue-50 ${isUserOnline ? 'bg-blue-50 border-l-4 border-l-blue-600 pl-2.5' : 'border-l-4 border-l-transparent'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={room.user?.profile_pic ? `${BASE_URL}${room.user?.profile_pic}` : defaultAvatar}
                          alt="User"
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.src = defaultAvatar;
                          }}
                        />
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${isSelectedUserOnline ? 'bg-green-600' : 'bg-gray-500'}`}></span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h4 className={`text-sm truncate pr-2 ${isUserOnline || room.unread_count_admin > 0 ? 'font-bold text-gray-800' : 'font-medium text-gray-700'}`}>{room.user?.username || 'Customer'}</h4>

                          {/* Waktu */}
                          <span className={`text-[10px] whitespace-nowrap ${room.unread_count_admin > 0 && !isUserOnline ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                            {new Date(room.updatedAt).toLocaleDateString() === new Date().toLocaleDateString()
                              ? new Date(room.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : new Date(room.updatedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <p className={`text-xs truncate w-3/4 ${isUserOnline ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>{room.last_message}</p>

                          {!isUserOnline && room.unread_count_admin > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold h-5 min-w-5 px-1 flex items-center justify-center rounded-full shadow-sm">{room.unread_count_admin > 99 ? '99+' : room.unread_count_admin}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bagian Tampilan Chat */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedRoom ? (
            <>
              {/* Header Chat */}
              <div className="px-4 py-2 bg-white border-b border-gray-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedRoom.user?.profile_pic ? `${BASE_URL}${selectedRoom.user?.profile_pic}` : defaultAvatar}
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    onError={(e) => {
                      e.target.src = defaultAvatar;
                    }}
                  />
                  <div>
                    <h3 className="font-bold text-gray-800">{selectedRoom.user?.username}</h3>
                    <p className={`text-xs flex items-center gap-1 ${isSelectedUserOnline ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelectedUserOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      {isSelectedUserOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowCustomModal(true)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-2 rounded-md flex items-center gap-2 transition shadow-sm cursor-pointer active:scale-95">
                    <FaPlusCircle /> Buat Pesanan Custom
                  </button>
                  <button
                    onClick={handleClearChat}
                    className="flex items-center gap-2 text-red-500 hover:bg-red-50 border border-red-200 px-3 py-2 rounded-md text-xs cursor-pointer active:scale-95"
                    title="Hapus semua pesan dengan user ini"
                  >
                    <FaTrash /> Hapus Chat
                  </button>
                </div>
              </div>
              {/* Messages List */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 relative" onClick={() => setShowEmoji(false)}>
                {messages.map((msg, idx) => {
                  let isCustomProduct = false;
                  let productData = null;
                  if (msg.type === 'custom_product' || (msg.type === 'text' && msg.message.startsWith('{"id":'))) {
                    try {
                      productData = JSON.parse(msg.message);
                      if (productData && productData.id && productData.price) {
                        isCustomProduct = true;
                      }
                    } catch (e) {
                      isCustomProduct = false;
                    }
                  }

                  if (isCustomProduct) {
                    return (
                      <div key={idx} className={`flex ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'} mb-4`}>
                        <div className="bg-cream border border-orange-200 rounded-lg shadow-md p-3 max-w-70">
                          <div className="text-xs font-bold text-orange-600 mb-2 uppercase tracking-wide border-b pb-1">Pesanan Khusus</div>

                          <div className="flex gap-3 mb-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                              <img
                                src={`${BASE_URL}${productData.image}`}
                                className="w-full h-full object-cover"
                                alt="Product"
                                onError={(e) => (e.target.src = 'https://via.assets.so/img.jpg?w=100&h=100&bg=fce7f3&f=png')} // Fallback image
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-gray-800 line-clamp-2 leading-tight mb-1">{productData.name}</h4>
                              <p className="text-sm font-semibold text-orange-600">Rp {parseInt(productData.price).toLocaleString('id-ID')}</p>
                            </div>
                          </div>

                          <a href={`/product/${productData.id}`} className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded transition shadow-sm">
                            Lihat & Checkout
                          </a>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className={`flex group ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      {msg.sender_role === 'admin' && (
                        <button onClick={() => handleDeleteMessage(msg.chat_realtime_id)} className="text-gray-300 hover:text-red-500 mr-2 opacity-0 group-hover:opacity-100 cursor-pointer active:scale-95">
                          <FaTrash size={12} />
                        </button>
                      )}
                      <div className={`max-w-[70%] px-3 py-1 rounded-lg text-sm shadow-sm ${msg.sender_role === 'admin' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                        {msg.type === 'image' ? (
                          <img src={`${BASE_URL}${msg.message}`} alt="sent" className="rounded-md max-w-full h-auto cursor-pointer border border-white/20" onClick={() => window.open(`${BASE_URL}${msg.message}`, '_blank')} />
                        ) : (
                          <p>{msg.message}</p>
                        )}
                        <span className={`text-[10px] block text-right mt-1 ${msg.sender_role === 'admin' ? 'text-blue-100' : 'text-gray-400'}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />

                {showEmoji && (
                  <div className="absolute bottom-2 left-4 z-20 shadow-xl" onClick={(e) => e.stopPropagation()}>
                    <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={350} previewConfig={{ showPreview: false }} />
                  </div>
                )}
              </div>
              {/* Input Area */}
              <form onSubmit={handleSend} className="px-4 py-2 bg-white border-t border-gray-200 flex gap-3 items-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEmoji(!showEmoji);
                  }}
                  className="text-gray-400 hover:text-yellow-500 transition cursor-pointer active:scale-95"
                >
                  <FaSmile size={20} />
                </button>
                <button type="button" onClick={() => fileInputRef.current.click()} className="text-gray-400 hover:text-blue-500 transition cursor-pointer active:scale-95" disabled={isUploading}>
                  <FaImage size={20} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ketik balasan..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button type="submit" disabled={!input.trim()} className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 transition shadow-md disabled:bg-gray-300 active:scale-95">
                  <FaPaperPlane className="ml-0.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <FaUserCircle className="text-6xl mb-4 opacity-20" />
              <p>Pilih chat untuk mulai membalas pesan.</p>
            </div>
          )}
        </div>
        {/* --- Modal Pop Up Buat Custom Order --- */}
        {showCustomModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-fade-in-up">
              <button onClick={() => setShowCustomModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer active:scale-95">
                <FaTimes />
              </button>

              <h3 className="text-lg font-bold text-gray-800 mb-4">Buat Pesanan Custom</h3>

              <form onSubmit={handleCreateCustomOrder} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Nama Produk</label>
                  <input type="text" name="name" value={customProductData.name} onChange={handleCustomInputChange} className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 outline-none" required />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-600">Harga (Rp)</label>
                    <input type="number" name="price" value={customProductData.price} onChange={handleCustomInputChange} className="w-full border rounded px-3 py-2 text-sm outline-none" placeholder="Contoh: 150000" required />
                  </div>
                  <div className="w-1/3">
                    <label className="text-xs font-semibold text-gray-600">Berat (gr)</label>
                    <input type="number" name="weight" value={customProductData.weight} onChange={handleCustomInputChange} className="w-full border rounded px-3 py-2 text-sm outline-none" required />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600">Deskripsi Singkat</label>
                  <textarea name="description" rows="2" value={customProductData.description} onChange={handleCustomInputChange} className="w-full border rounded px-3 py-2 text-sm outline-none"></textarea>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600">Foto Referensi/Sketsa (Opsional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomImageChange}
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 mt-1"
                  />
                </div>

                <button type="submit" disabled={isCreatingCustom} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded mt-4 transition disabled:bg-gray-300 cursor-pointer active:scale-95">
                  {isCreatingCustom ? 'Memproses...' : 'Buat & Kirim Link'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminChatDashboard;
