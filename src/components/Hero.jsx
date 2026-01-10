import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Hero.css';

import arrowBtn from '../assets/icons/right.png';
import decorSatu from '../assets/images/benang-kotak.png';
import decorDua from '../assets/images/benang-bundar.png';
import decorTiga from '../assets/images/tamtam.png';
import decorEmpat from '../assets/images/lotso.png';
import decorLima from '../assets/images/labubu.png';
import decorEnam from '../assets/images/panda.png';

const Hero = () => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    if (window.innerWidth < 768) return;

    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const mouseX = clientX - centerX;
    const mouseY = clientY - centerY;
    const rotateY = (mouseX / width) * 50;
    const rotateX = (mouseY / height) * -50;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const imageStyle = {
    transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
    transition: 'transform 0.1s ease-out',
  };
  return (
    <div className="relative max-w-full flex flex-col md:flex-row items-center justify-center min-h-[40vh] md:min-h-[65vh] px-5 md:px-24 overflow-x-hidden" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className="flex flex-col items-center justify-center gap-4 w-full h-50 md:h-72 bg-hero border border-[#2b2b2b] rounded-4xl shadow-xl px-5 py-3">
        <div className="bg-none">
          <h2 className="bg-none text-lg md:text-3xl font-bold leading-tight text-center mb-2 md:mb-4">
            Karya Rajut Handmade <br className="hidden md:block" />
            Sentuhan Hangat Dari Uneeya Handicraft
          </h2>
          <p className="text-xs font-semibold md:text-lg text-gray-600 text-center">Temukan keindahan produk rajut berkualitas yang dibuat dengan cinta dan ketelitian.</p>
        </div>

        <Link
          to="/products"
          className="group flex items-center gap-2 text-xs md:text-lg rounded-full px-6 py-1 md:px-8 md:py-2 transition-transform hover:scale-105 hover:font-semibold active:scale-100 border btn-color border-black shadow-md"
        >
          Order Now
          <img src={arrowBtn} alt="Next" className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className="flow-bg absolute inset-0 pointer-events-none hidden md:block">
        <img src={decorSatu} alt="" style={imageStyle} />
        <img src={decorDua} alt="" style={imageStyle} />
        <img src={decorTiga} alt="" style={imageStyle} />
        <img src={decorEmpat} alt="" style={imageStyle} />
        <img src={decorLima} alt="" style={imageStyle} />
        <img src={decorEnam} alt="" style={imageStyle} />
      </div>
    </div>
  );
};

export default Hero;
