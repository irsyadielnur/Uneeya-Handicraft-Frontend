import React from 'react';
import Hero from '../components/Hero';
import LatestProducts from '../components/LatestProducts';
import CustomerReviews from '../components/CustomerReviews';
import MyRecommendations from '../components/MyRecommendations';

const Home = () => {
  return (
    <div>
      {/* Bagian Hero */}
      <Hero />

      {/* Bagian Produk Terbaru */}
      <section>
        <LatestProducts />
      </section>

      <div className="container mx-auto px-4 md:px-12 mt-8">
        <MyRecommendations />
      </div>

      <section className="mb-16">
        <CustomerReviews />
      </section>

      <hr className="my-10 border-gray-200 container mx-auto px-4 md:px-0" />
    </div>
  );
};

export default Home;
