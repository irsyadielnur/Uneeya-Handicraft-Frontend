import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import api from '../../config/api';
import axios from 'axios';
import { FaHeadset, FaPaperPlane, FaSmile, FaImage, FaTrash, FaEllipsisV } from 'react-icons/fa';
import { FaRegCircleXmark } from 'react-icons/fa6';
import { getImageUrl } from '../../utils/imageHelper';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

import notifSound from '../../assets/sounds/mixkit-positive-notification-951.wav';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CustomerServiceChat = () => {
  const { token, user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [roomId, setRoomId] = useState(null);
  const [socket, setSocket] = useState(null);

  const [showEmoji, setShowEmoji] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Inisialisasi Socket & Fetch History
  useEffect(() => {
    if (token && user) {
      const newSocket = io(BASE_URL);

      newSocket.on('connect', () => {
        newSocket.emit('user_connected', user.user_id);
      });

      setSocket(newSocket);
      const fetchRoomData = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/api/chat-realtime/my-room`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const { room, messages } = response.data;
          setRoomId(room.chatroom_id);
          setMessages(messages);
          setUnreadCount(room.unread_count_user || 0);
          newSocket.emit('join_room', room.chatroom_id);
        } catch (error) {
          console.error('Gagal memuat chat admin:', error);
        }
      };

      fetchRoomData();
      return () => newSocket.disconnect();
    }
  }, [token]);

  // Listener Pesan Masuk (Realtime)
  useEffect(() => {
    if (!socket) return;
    const handleReceiveMessage = (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      if (newMessage.sender_role === 'admin') {
        playNotificationSound();
        if (!isOpen) {
          setUnreadCount((prev) => prev + 1);
          toast.success('Pesan baru dari Admin Support!', {
            duration: 4000,
            position: 'top-right',
            icon: '💬',
            style: {
              background: '#ffc343',
              color: '#2b2b2b',
              fontWeight: 500,
            },
          });
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
  }, [socket, isOpen]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio(notifSound);
      audio.play().catch((err) => console.log(err));
    } catch (err) {
      console.error('Gagal memutar audio:', err);
    }
  };

  // Auto Scroll ke Bawah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const toggleChat = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState) {
      setUnreadCount(0);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setInput((prev) => prev + emojiObject.emoji);
    setShowEmoji(false); // Tutup picker setelah pilih
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/chat-realtime/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = res.data.url;
      const messageData = {
        room_id: roomId,
        sender_role: 'user',
        message: imageUrl,
        type: 'image',
      };

      socket.emit('send_message', messageData);
      setMessages((prev) => [...prev, { ...messageData, createdAt: new Date().toISOString() }]);
    } catch (error) {
      console.error('Gagal upload gambar:', error);
      alert('Gagal mengirim gambar.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Kirim Pesan
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !socket || !roomId) return;

    const messageData = {
      room_id: roomId,
      sender_role: 'user',
      message: input,
      type: 'text',
    };

    socket.emit('send_message', messageData);
    setInput('');
    setShowEmoji(false);
  };

  // Hapus pesan satu
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
              roomId: roomId,
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

  // hapus pesan semua
  const handleClearChat = async () => {
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
          await api.delete(`/api/chat-realtime/room/${roomId}`);
          setMessages([]);
          if (socket) socket.emit('clear_chat_event', roomId);
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  if (!token) return null;
  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setIsOpen(false)}></div>}
      <button
        onClick={toggleChat}
        className={`group fixed bottom-27 md:bottom-24 right-5 z-50 flex items-center gap-2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#8ecae6] border border-[#2b2b2b] shadow-[0_4px_10px_rgba(0,0,0,0.2)] justify-center cursor-pointer transition-all duration-300 ease-in-out hover:scale-110 active:scale-90 ${
          isOpen ? 'rotate-90 bg-[#ff6b6b] border-none' : 'rotate-0'
        }`}
      >
        {isOpen ? <FaRegCircleXmark size={24} /> : <FaHeadset size={24} />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {!isOpen && (
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded shadow-sm text-xs font-bold whitespace-nowrap border border-[#8b8b8b] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Ingin diskusi dengan admin disini....
            <span className="absolute top-1/2 -right-2 -translate-y-1/2 w-3 h-3 bg-gray-800 border-t border-r border-gray-200 rotate-45 transform"></span>
          </span>
        )}
      </button>

      {/* JENDELA CHAT */}
      <div
        className={`fixed bottom-0 md:bottom-4 right-0 md:right-24 z-998 w-full h-full md:w-100 md:h-11/12 bg-white md:rounded-2xl shadow-2xl border border-gray-300 flex flex-col overflow-hidden font-poppins transition-all duration-300 ease-out origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-[#6cbbe0] text-gray-800 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm">Admin Support</h3>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleClearChat} className="text-xs bg-red-400 hover:bg-red-600 hover:font-semibold px-2 py-1 rounded cursor-pointer active:scale-95">
              Bersihkan
            </button>
            <button onClick={() => setIsOpen(false)} className="cursor-pointer active:scale-95">
              <FaRegCircleXmark size={20} />
            </button>
          </div>
        </div>

        {/* Area Pesan */}
        <div className="flex-1 p-3 overflow-y-auto bg-gray-50 flex flex-col gap-2 realtive">
          {messages.length === 0 && <p className="text-center text-xs text-gray-400 mt-4">Belum ada percakapan. Sapa Admin sekarang!</p>}

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
                <div key={idx} className={`flex ${msg.sender_role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                  <div className="bg-cream border border-orange-200 rounded-lg shadow-md p-3 max-w-70">
                    <div className="text-xs font-bold text-orange-600 mb-2 uppercase tracking-wide border-b pb-1">Pesanan Khusus</div>

                    <div className="flex gap-3 mb-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                        {/* Pastikan BASE_URL sesuai environment Anda */}
                        <img src={getImageUrl(productData.image)} className="w-full h-full object-cover" alt="Product" onError={(e) => (e.target.src = 'https://via.assets.so/img.jpg?w=100&h=100&bg=fce7f3&f=png')} />
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
              <div key={idx} className={`flex group ${msg.sender_role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                {msg.sender_role === 'user' && (
                  <button onClick={() => handleDeleteMessage(msg.chat_realtime_id)} className="text-gray-300 hover:text-red-500 mr-2 opacity-0 group-hover:opacity-100 transition cursor-pointer active:scale-95" title="Hapus pesan">
                    <FaTrash size={12} />
                  </button>
                )}
                <div
                  key={idx}
                  className={`max-w-[80%] p-2 rounded-lg group text-sm ${msg.sender_role === 'user' ? 'bg-[#8ecae6] self-end text-black rounded-br-none' : 'bg-white border border-gray-200 self-start text-black rounded-bl-none'}`}
                >
                  {msg.type === 'image' ? (
                    <img src={getImageUrl(msg.message)} alt="sent" className="rounded-md max-w-50 h-auto cursor-pointer" onClick={() => window.open(getImageUrl(msg.message), '_blank')} />
                  ) : (
                    <p className="wrap-break-words">{msg.message}</p>
                  )}
                  <span className="text-[10px] opacity-50 block text-right mt-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
          {showEmoji && (
            <div className="absolute bottom-0 left-0 z-10">
              <EmojiPicker onEmojiClick={onEmojiClick} width="100%" height={300} previewConfig={{ showPreview: false }} />
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="pb-8 md:pb-2 p-2 border-t bg-white flex gap-3">
          <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="text-gray-500 hover:text-yellow-500 cursor-pointer active:scale-95">
            <FaSmile size={20} />
          </button>

          <button type="button" onClick={() => fileInputRef.current.click()} className="text-gray-500 hover:text-blue-500 cursor-pointer active:scale-95" disabled={isUploading}>
            <FaImage size={20} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setShowEmoji(false)}
            placeholder="Tulis pesan..."
            className="flex-1 border rounded-full px-3 py-1.5 text-sm outline-none focus:border-[#8ecae6]"
          />
          <button type="submit" disabled={!input.trim()} className="bg-[#2b2b2b] text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-black disabled:bg-gray-300">
            <FaPaperPlane size={14} />
          </button>
        </form>
      </div>
    </>
  );
};

export default CustomerServiceChat;
