import React, { useEffect } from 'react';
import HeroBanner from '../components/sections/HeroBanner';

const HomePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Homemates | Property & Home Services Marketplace';
  }, []);
  
  return (
    <div className="h-[calc(97.1vh-112px)] flex flex-col"> {/* home image banner height */}
      <HeroBanner />
    </div>
  );
};

export default HomePage;