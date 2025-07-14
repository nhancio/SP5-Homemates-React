import React, { useEffect } from 'react';
import HeroBanner from '../components/sections/HeroBanner';
import Footer from '../components/layout/Footer';
import FeaturedProperties from '../components/sections/FeaturedProperties';
import HomeCategories from '../components/sections/HomeCategories';
import HomeServices from '../components/sections/HomeServices';
import Testimonials from '../components/sections/Testimonials';

const HomePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Homemates | Property & Home Services Marketplace';
  }, []);
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <HeroBanner />
      <Footer />
    </div>
  );
};

export default HomePage;