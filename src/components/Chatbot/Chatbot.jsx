import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { getImageUrl } from '../../utils/imageHelper';

import Swal from 'sweetalert2';
import sendIcon from '../../assets/icons/right.png';
import uneeyaIcon from '../../assets/icons/uneeya.png';
import { FaRegCircleXmark, FaRegTrashCan } from 'react-icons/fa6';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const defaultMessage = {
    id: 1,
    text: 'Halo Kak! Aku Cimot 🤖, asisten virtual Uneeya. Ada yang bisa aku bantu hari ini?',
    sender: 'bot',
    recommendations: [],
  };

  const [messages, setMessages] = useState([defaultMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  // Helper: Parse JSON rekomendasi
  const safeParseRecommendations = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && token) {
      fetchHistory();
    }
  }, [isOpen, token]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/chatbot/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.length > 0) {
        const historyFormatted = response.data.map((msg) => ({
          id: msg.id,
          text: msg.message,
          sender: msg.sender,
          recommendations: safeParseRecommendations(msg.recommendations),
        }));
        setMessages(historyFormatted);
      }
    } catch (error) {
      console.error('Gagal memuat riwayat chat:', error);
    }
  };

  const handleClearHistory = async () => {
    if (!token) return;

    Swal.fire({
      title: 'Hapus pesan ini?',
      text: 'Apakah Kakak yakin ingin menghapus semua riwayat percakapan dengan Cimot?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#2186b5',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${BASE_URL}/api/chatbot/history`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMessages([defaultMessage]);
        } catch (error) {
          console.error('Gagal menghapus history:', error);
          alert('Maaf, gagal menghapus riwayat percakapan.');
        }
      }
    });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(`${BASE_URL}/api/chatbot/send`, { message: userMessage.text }, { headers });
      const botReply = response.data;
      const botMessage = {
        id: Date.now() + 1,
        text: botReply.reply,
        sender: 'bot',
        recommendations: safeParseRecommendations(botReply.recommendations),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: 'Maaf, Cimot sedang gangguan sinyal. Coba lagi nanti ya! 😓',
          sender: 'bot',
          recommendations: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setIsOpen(false)}></div>}

      {/* TOGGLE BUTTON (Floating) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group fixed bottom-10 md:bottom-5 right-5 z-51 flex items-center gap-2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#8ecae6] border border-[#2b2b2b] shadow-[0_4px_10px_rgba(0,0,0,0.2)] justify-center cursor-pointer transition-all duration-300 ease-in-out hover:scale-110 active:scale-90 ${
          isOpen ? 'rotate-90 bg-[#ff6b6b] border-none' : 'rotate-0'
        }
        `}
      >
        {isOpen ? <FaRegCircleXmark size={24} /> : <img src={uneeyaIcon} alt="Chat" className="w-8 h-8" />}
        {!isOpen && (
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded shadow-sm border border-[#8b8b8b] text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-start">
            Mau nanya-nanya? <br />
            Cimot disini siap membantu
            <span className="absolute top-1/2 -right-2 -translate-y-1/2 w-3 h-3 bg-gray-800 border-t border-r border-gray-200 rotate-45 transform"></span>
          </span>
        )}
      </button>

      {/* CHAT WINDOW CONTAINER */}
      <div
        className={`
          fixed bottom-0 right-0 md:bottom-4 md:right-24 z-999 font-poppins
          flex flex-col overflow-hidden
          w-full h-full md:w-xl md:h-11/12
          bg-[#fffefa] md:rounded-2xl border border-[#a3a6d6] shadow-2xl
          transition-all duration-300 ease-out origin-bottom-right
          ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10 pointer-events-none'}
        `}
      >
        {/* Header */}
        <div className="bg-[#8ecae6] text-[#2b2b2b] px-4 py-2 flex items-center justify-between border-b border-[#2b2b2b]">
          <div className="flex items-center gap-3">
            <img src={uneeyaIcon} alt="Logo" className="w-9 h-9 rounded-full bg-white p-0.5" />
            <div className="leading-tight">
              <h4 className="m-0 text-sm font-bold">Cimot - Uneeya Assistant</h4>
              <p className="text-xs opacity-80">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {token && (
              <button onClick={handleClearHistory} title="Hapus Riwayat Chat" className="text-lg text-[#2b2b2b] hover:text-red-600 transition-colors duration-200 cursor-pointer active:scale-95">
                <FaRegTrashCan />
              </button>
            )}
            <button className="text-2xl leading-none text-[#2b2b2b] transition-all duration-100 cursor-pointer active:scale-95" onClick={() => setIsOpen(false)}>
              <FaRegCircleXmark />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-[#fffefa] flex flex-col gap-3">
          {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
              {/* Bubble Chat */}
              <div
                className={`
                  px-4 py-1.5 rounded-2xl text-sm leading-relaxed shadow-sm relative wrap-break-words
                  ${msg.sender === 'user' ? 'bg-[#ffc343] text-[#2b2b2b] rounded-br-sm' : 'bg-[#fbfbfb] text-[#2b2b2b] border border-gray-200 rounded-bl-sm'}
                `}
              >
                {msg.sender === 'bot' ? (
                  <div
                    className="
                    [&>p]:mb-2 [&>p:last-child]:mb-0 
                    [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-2
                    [&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:mb-2
                    [&>li]:mb-1
                    [&>strong]:font-bold [&>strong]:text-[#6d4c41]
                  "
                  >
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>

              {/* Rekomendasi Produk */}
              {msg.sender === 'bot' && Array.isArray(msg.recommendations) && msg.recommendations.length > 0 && (
                <div className="mt-2 w-full flex flex-col gap-2 pl-1">
                  {msg.recommendations.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleProductClick(prod.id)}
                      className="group relative flex items-start gap-3 w-full bg-white border border-gray-200 rounded-xl p-2 cursor-pointer shadow-sm hover:shadow-md hover:border-[#6d4c41] transition-all duration-300"
                    >
                      <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                        <img
                          src={getImageUrl(prod.image)}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = 'https://via.assets.so/img.jpg?w=100&h=100&bg=fce7f3&f=png';
                          }}
                        />
                      </div>

                      <div className="flex flex-col flex-1 min-w-0 justify-between h-20">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-medium tracking-wide mb-0.5">{prod.category || 'Handicraft'}</p>
                          <h4 className="text-sm font-bold text-gray-800 leading-tight line-clamp-2 group-hover:text-[#6d4c41] transition-colors" title={prod.name}>
                            {prod.name}
                          </h4>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-sm font-bold text-[#6d4c41]">Rp{prod.price?.toLocaleString('id-ID')}</span>
                          <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded-md border border-yellow-100">
                            <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            <span className="text-[12px] font-bold text-yellow-700 pt-px">{prod.rating_avg ? Number(prod.rating_avg).toFixed(1) : '5.0'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && <div className="self-start bg-gray-100 text-gray-500 text-xs px-3 py-2 rounded-xl animate-pulse">Cimot sedang mengetik... ✍️</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="pb-8 md:pb-2 p-2 border-t border-gray-200 bg-white flex items-center gap-2">
          <input
            type="text"
            placeholder="Ketik pesan..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="
              flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm outline-none focus:border-[#8ecae6] focus:ring-1 focus:ring-[#8ecae6] transition-all
            "
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center 
              transition-all duration-200 shadow-md
              ${isLoading || !input.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#ffc343] hover:bg-[#ffd54f] active:scale-90 cursor-pointer'}
            `}
          >
            <img src={sendIcon} alt="Send" className="w-4 h-4 invert filter" />
          </button>
        </form>
      </div>
    </>
  );
};

export default Chatbot;
