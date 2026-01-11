import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/reviews/recent`);
        setReviews(response.data);
      } catch (error) {
        console.error('Gagal mengambil review:', error);
      }
    };

    fetchReviews();
  }, [BASE_URL]);

  const getAvatarUrl = (path) => {
    if (!path) return 'https://via.assets.so/img.jpg?w=100&h=100&bg=e5e7eb&f=png';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BASE_URL}/${cleanPath}`;
  };

  if (reviews.length === 0) return null;

  const ReviewCard = ({ review }) => (
    <div className="w-70 md:w-85 shrink-0 bg-cream-2 p-3 rounded-xl border border-gray-400 shadow-md mx-4 relative hover:-translate-y-3 hover:shadow-lg transition-all duration-200">
      <FaQuoteLeft className="absolute top-4 right-4 text-gray-200 text-2xl md:text-4xl" />

      {/* Header: User Info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-gray-200 border border-primary/20">
          <img src={getAvatarUrl(review.User?.profile_pic) || `https://ui-avatars.com/api/?name=${review.User?.username || 'User'}`} alt={review.User?.username} className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="font-bold text-gray-800 text-xs md:text-sm">{review.User?.username || 'Pelanggan'}</h4>
          <div className="flex gap-1 text-yellow-500 text-xs md:text-sm">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={i < review.rating ? 'fill-current' : 'text-gray-200'} />
            ))}
          </div>
        </div>
      </div>

      <p className="text-gray-800 text-xs md:text-sm italic line-clamp-3 mb-1 min-h-10 md:min-h-16">"{review.comment || 'Tidak ada komentar.'}"</p>

      <div className="pt-1 md:pt-3 border-t border-gray-200">
        <p className="text-[10px] md:text-xs text-gray-600 font-medium uppercase tracking-wide">Produk yang dibeli:</p>
        <p className="text-primary font-semibold text-xs md:text-sm truncate">{review.Product?.name}</p>
      </div>
    </div>
  );

  return (
    <div className="pt-6 md:pt-12 pb-1 bg-cream overflow-hidden">
      <div className="container mx-auto px-4 mb-8 text-center">
        <h2 className="text-xl md:text-3xl font-bold text-gray-800">Apa Kata Mereka?</h2>
        <p className="text-xs md:text-lg text-gray-500 mt-2">Pengalaman belanja asli dari pelanggan setia Uneeya.</p>
      </div>

      <div className="relative w-full">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-linear-to-r from-gray-50 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-gray-50 to-transparent z-10"></div>

        {/* Track Animasi */}
        <div className="flex w-max animate-marquee mb-6 hover:[animation-play-state:paused]">
          {reviews.map((review) => (
            <ReviewCard key={`track1-original-${review.review_id}`} review={review} />
          ))}
          {reviews.map((review) => (
            <ReviewCard key={`track1-duplicate-${review.review_id}`} review={review} />
          ))}
        </div>

        <div className="flex w-max animate-marquee-reverse hover:[animation-play-state:paused]">
          {[...reviews].reverse().map((review) => (
            <ReviewCard key={`track2-original-${review.review_id}`} review={review} />
          ))}
          {[...reviews].reverse().map((review) => (
            <ReviewCard key={`track2-duplicate-${review.review_id}`} review={review} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }

        @keyframes marquee-reverse {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }  
        }

        .animate-marquee {
            animation: marquee 15s linear infinite; 
        }

        .animate-marquee-reverse {
            animation: marquee-reverse 15s linear infinite;
        }

        .animate-marquee:hover,
        .animate-marquee-reverse:hover {
            animation-play-state: paused;
         }
      `}</style>
    </div>
  );
};

export default CustomerReviews;
