import React, { useEffect, useState } from 'react';
import api from '../config/api';
import ProductCard from './ProductCard';

const SimilarProductsByID = ({ currentProductId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!currentProductId) return;
      setLoading(true);
      try {
        const response = await api.get(`/api/products/${currentProductId}/similar`);
        if (response.data && Array.isArray(response.data.recommendations)) {
          setRecommendations(response.data.recommendations);
        }
      } catch (error) {
        console.error('Gagal memuat produk serupa', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentProductId]);

  if (loading) return null;
  if (recommendations.length === 0) return null;

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-6 border-l-4 border-primary pl-4">Produk Serupa Pilihan Kami</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {recommendations.slice(0, 5).map((item) => {
          const productData = item.product ? item.product : item;
          // if (String(productData.product_id) === String(currentProductId)) return null;
          if (!productData || !productData.product_id) return null;

          return <ProductCard key={productData.product_id || index} product={productData} label="Mirip" labelColor="bg-purple-500" />;
        })}
      </div>
    </div>
  );
};

export default SimilarProductsByID;
